const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const User = require("../models/UserModel");
const Tag = require("../models/TagsModel");
const cloudinary = require("../config/cloudinary/cloudinaryConfig");
const createPost = async (req, res) => {
  try {
    const { userId, content, rating, is_ad } = req.body;
    let images = [];

    // Nếu có nhiều file ảnh được gửi lên, lấy URL từ req.files
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path); // Lấy secure_url từ Cloudinary
    }

    // Thay thế #[hashtag](id) thành #hashtag trong content
    let modifiedContent = content;
    const hashtagFormatRegex = /#\[([^\]]+)\]\(([^)]+)\)/g;
    modifiedContent = modifiedContent.replace(hashtagFormatRegex, (match, hashtag) => `#${hashtag}`);

    // Phân tích nội dung để lấy hashtag và mention
    const hashtags = [];
    const taggedUserIds = [];
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const hashtagRegex = /#[^\s#]+/g;
    let match;

    // Tìm tất cả các hashtag từ modifiedContent
    while ((match = hashtagRegex.exec(modifiedContent)) !== null) {
      const tag = match[0].slice(1).toLowerCase();
      if (!hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    }

    // Tìm tất cả các mention và lấy id
    while ((match = mentionRegex.exec(modifiedContent)) !== null) {
      const userId = match[2];
      if (!taggedUserIds.includes(userId)) {
        taggedUserIds.push(userId);
      }
    }

    // Kiểm tra danh sách taggedUsers để đảm bảo chỉ có tối đa 1 tài khoản restaurant
    const taggedUsersData = await User.find({ _id: { $in: taggedUserIds } });
    const restaurant = taggedUsersData.filter(user => user.usertype === 'restaurant');
    const restaurantCount = restaurant.length;
    if (restaurantCount > 1) {
      return res.status(400).json({ message: "Cannot tag more than one restaurant in a post." });
    }

    // Tạo bài post mới
    const newPost = new Post({
      userId,
      content: modifiedContent,
      images,
      restaurantId: restaurant?.[0]?._id,
      is_ad: is_ad,
      tags: hashtags,
      taggedUsers: taggedUserIds,
      rating: rating ? Number(rating) : null,
      timestamp: new Date().toISOString(),
    });
    await newPost.save();

    // Thêm các tag mới vào model Tag
    for (const tag of hashtags) {
      const existingTag = await Tag.findOne({ name: tag });
      if (!existingTag) {
        const newTag = new Tag({ name: tag });
        await newTag.save();
      }
    }

    // Nếu bài post có tag tài khoản restaurant và có rating, cập nhật điểm trung bình của nhà hàng
    if (taggedUsersData.length > 0 && rating) {
      const restaurantUser = taggedUsersData.find(user => user.usertype === 'restaurant');
      if (restaurantUser) {
        const posts = await Post.find({
          taggedUsers: restaurantUser._id,
          rating: { $exists: true },
        });
        const totalRating = posts.reduce((sum, post) => sum + post.rating, 0);
        const averageRating = totalRating / posts.length;
        await User.findByIdAndUpdate(restaurantUser._id, {
          $set: { avgRating: Number(averageRating.toFixed(1)) },
        });
      }
    }

    // Lấy tất cả bài post và populate thông tin người dùng
    const posts = await Post.find()
      .populate({
        path: "userId",
        select: "username profileUrl -password",
      })
      .populate({
        path: "taggedUsers",
        select: "username profileUrl -password",
      })
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: "Create Post Failed", error: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body; // Chỉ lấy nội dung để chỉnh sửa
    const userId = req.user.id; // Giả sử bạn có middleware để lấy user từ token

    // Tìm bài viết và kiểm tra quyền chỉnh sửa
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài viết này" });
    }

    // Cập nhật nội dung và giữ nguyên các trường khác
    post.content = content;

    // Phân tích lại hashtag và mention nếu cần
    const hashtagRegex = /#[^\s#]+/g;
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const hashtags = [];
    const taggedUserIds = [];
    let match;

    // Tìm hashtag
    while ((match = hashtagRegex.exec(content)) !== null) {
      const tag = match[0].slice(1).toLowerCase();
      if (!hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    }

    // Tìm mention
    while ((match = mentionRegex.exec(content)) !== null) {
      const userId = match[2];
      if (!taggedUserIds.includes(userId)) {
        taggedUserIds.push(userId);
      }
    }

    // Cập nhật tags và taggedUsers
    post.tags = hashtags;
    post.taggedUsers = taggedUserIds;

    await post.save();

    // Thêm các tag mới vào model Tag
    for (const tag of hashtags) {
      const existingTag = await Tag.findOne({ name: tag });
      if (!existingTag) {
        const newTag = new Tag({ name: tag });
        await newTag.save();
      }
    }

    // Trả về bài viết đã cập nhật
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "userId",
        select: "username profileUrl -password",
      })
      .populate({
        path: "taggedUsers",
        select: "username profileUrl -password",
      });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Lỗi cập nhật bài viết:", error);
    res.status(500).json({ message: "Cập nhật bài viết thất bại", error: error.message });
  }
};

// Tạo bài viết khi tạo voucher
const createPostWithVoucher = async (req, res) => {
  try {
      const { userId, content, is_voucher, voucher_id } = req.body;

      // Nếu có file ảnh được gửi lên, lấy URL từ req.file.path
      const images = req.file ? req.file.path : null;

      // Tạo bài viết mới
      const newPost = await Post.create({
          userId,
          content: content,
          images,
          voucher_id: voucher_id,
          is_voucher: is_voucher,
      });
      // Lấy danh sách bài viết mới nhất
      const posts = await Post.find()
          .populate({
              path: "userId",
              select: "username profileUrl -password",
          })
          .sort({ createdAt: -1 });

      res.status(200).json(posts);
  } catch (err) {
      console.error("Error in createPost:", err);
      res.status(500).json({ message: "Create Post Failed", error: err.message });
  }
};

// Xóa bài viết
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
      const {userId } = req.body;
      const post = await Post.findOne({ _id: postId, userId });
      if (!post) {
          return res.status(400).json({ message: "You can't delete this post" });
      }

      // Xóa ảnh trên Cloudinary nếu có
      if (post.imageUrl) {        
        const parts = post.imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // Lấy tên file từ URL
        const publicId = publicIdWithExtension.split('.')[0]; // Lấy publicId    
        try {
            const result = await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
        }
    }

      // Xóa bài viết
      await Post.findByIdAndDelete(postId);
      res.status(200).json({ message: "Delete post successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Delete Post Failed", error: err.message });
  }
};
  // Lấy danh sách bài viết
const getPosts = async (req, res) => {
    try {
      const posts = await Post.find()
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Get Posts Failed", error: err.message });
    }
  };

// Lấy danh sách bài viết theo id bài viết
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    // Tìm bài viết theo ID và populate các trường liên quan
    const post = await Post.findById(postId)
      // .populate({
      //   path: "userId",
      //   select: "username profileUrl -password",
      // })
      // .populate({
      //   path: "taggedUsers",
      //   select: "username profileUrl -password",
      // });

    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Lỗi lấy bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
  
  // Thích bài viết
  const likePost = async (req, res) => {
    try {
      const { postId, userId } = req.body;
      const likedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      )
      if (!likedPost) {
        return res.status(400).json({ message: "You can't like this post" });
      }
      res.status(200).json(likedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Like Post Failed", error: err.message });
    }
  };
  
  const unlikePost = async (req, res) => {
    try {
      const { postId, userId } = req.body;
      const unlikedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      );
      if (!unlikedPost) {
        return res.status(400).json({ message: "You can't unlike this post" });
      }
      res.status(200).json(unlikedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Unlike Post Failed", error: err.message });
    }
  };
  // Tạo bình luận
const createComment = async (req, res) => {
    try {
      const { postId, userId, comment, from } = req.body;
  
      const newComment = await Comment.create({
        from,
        postId,
        userId,
        comment,
      });
  
      // Thêm comment vào bài viết
      const post = await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true }
      );
  
      if (!post) {
        return res.status(400).json({ message: "You can't create comments" });
      }
  
      // Populate thông tin user cho comment
      const populatedComment = await Comment.findById(newComment._id).populate({
        path: "userId",
        select: "profileUrl username -password",
      });
  
      res.status(200).json(populatedComment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Create Comment Failed", error: err.message });
    }
  };
 // Tạo reply
const createReply = async (req, res) => {
  try {
    const { commentId, userId, comment, from, replyAt } = req.body;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = {
      userId,
      from,
      replyAt,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
    };

    parentComment.replies.push(newReply);
    await parentComment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate({
        path: "userId",
        select: "profileUrl username -password",
      })
      .populate({
        path: "replies.userId",
        select: "profileUrl username -password",
      });

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create Reply Failed", error: err.message });
  }
};
   // Lấy danh sách bình luận
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "profileUrl username -password",
      })
      .populate({
        path: "replies.userId",
        select: "profileUrl username -password",
      });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Get Comments Failed", error: err.message });
  }
};
// Thích bình luận hoặc reply
const likeComment = async (req, res) => {
  try {
    const { commentId, replyId, userId } = req.body;

    let comment;
    if (replyId) {
      comment = await Comment.findOne({ "replies._id": replyId });
      if (!comment) {
        return res.status(404).json({ message: "Reply not found" });
      }

      const target = comment.replies.id(replyId);
      if (!target.likes.includes(userId)) {
        target.likes.push(userId);
      }
    } else {
      comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
      }
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate({
        path: "userId",
        select: "profileUrl username -password",
      })
      .populate({
        path: "replies.userId",
        select: "profileUrl username -password",
      });

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Like Comment Failed", error: err.message });
  }
};

// Bỏ thích bình luận hoặc reply
const unlikeComment = async (req, res) => {
  try {
    const { commentId, replyId, userId } = req.body;

    let comment;
    if (replyId) {
      comment = await Comment.findOne({ "replies._id": replyId });
      if (!comment) {
        return res.status(404).json({ message: "Reply not found" });
      }

      const target = comment.replies.id(replyId);
      target.likes = target.likes.filter((id) => id !== userId);
    } else {
      comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      comment.likes = comment.likes.filter((id) => id !== userId);
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate({
        path: "userId",
        select: "profileUrl username -password",
      })
      .populate({
        path: "replies.userId",
        select: "profileUrl username -password",
      });

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unlike Comment Failed", error: err.message });
  }
};
const getAverageRating = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const posts = await Post.find({ restaurantId, rating: { $exists: true } });

    if (posts.length === 0) {
      return res.json({ averageRating: null, totalReviews: 0 });
    }

    const totalRating = posts.reduce((sum, post) => sum + post.rating, 0);
    const averageRating = totalRating / posts.length;

    res.json({
      averageRating: Number(averageRating.toFixed(1)), // Làm tròn 1 chữ số thập phân
      totalReviews: posts.length,
    });
  } catch (error) {
    console.error("Error calculating restaurant rating:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const getByTag = async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) {
      const posts = await Post.find().populate("userId");
      return res.json(posts);
    }

    // Chuẩn hóa tag để tìm kiếm
    const normalizedTag = tag.startsWith('#') ? tag.slice(1).toLowerCase() : tag.toLowerCase();
    const posts = await Post.find({ tags: normalizedTag }).populate("userId");
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const getRecommendedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const preferences = user.preferences || [];
    const followingIds = user.following || [];

    // Lấy 100 bài post mới nhất từ tất cả bài post
    const allPosts = await Post.find()
      .populate({
        path: "userId",
        select: "username profileUrl -password",
      })
      .populate({
        path: "taggedUsers",
        select: "username profileUrl -password",
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Tính điểm cho mỗi bài viết
    const scoredPosts = allPosts.map(post => {
      let score = 0;
      const matchedTags = (post.tags || []).filter(tag => preferences.includes(tag));
      score += matchedTags.length * 3;
      if ((followingIds || []).map(id => id.toString()).includes(post.userId?._id.toString())) {
        score += 2;
      }
      score += Math.min((post.likes || []).length, 5);
      const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursAgo <= 24) {
        score += 1;
      }
      return { ...post, score };
    });

    // Sắp xếp theo điểm giảm dần
    scoredPosts.sort((a, b) => b.score - a.score);

    // Áp dụng phân trang
    const paginatedPosts = scoredPosts.slice(skip, skip + limit);

    res.status(200).json(paginatedPosts);
  } catch (error) {
    console.error("Error fetching recommended posts:", error);
    res.status(500).json({ message: "Get Recommended Posts Failed", error: error.message });
  }
};
  module.exports ={
    createPost,
    updatePost,
    createPostWithVoucher,
    getPosts,
    getPostById,
    deletePost,
    likePost,
    unlikePost,
    getComments,
    createComment,
    createReply,
    likeComment,
    unlikeComment,
    getAverageRating,
    getByTag,
    getRecommendedPosts,
  }