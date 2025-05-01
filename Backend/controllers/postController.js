const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const User = require("../models/UserModel")
const cloudinary = require("../config/cloudinary/cloudinaryConfig");
const createPost = async (req, res) => {
  try {
    const { userId, content, rating } = req.body;
    let images = [];

    // Nếu có nhiều file ảnh được gửi lên, lấy URL từ req.files
    if (req.files && req.files.length > 0) {
      console.log("Files uploaded to Cloudinary:", req.files);
      images = req.files.map((file) => file.path); // Lấy secure_url từ Cloudinary
    }

    // Thay thế #[hashtag](id) thành #hashtag trong content
    let modifiedContent = content;
    const hashtagFormatRegex = /#\[([^\]]+)\]\(([^)]+)\)/g;
    modifiedContent = modifiedContent.replace(hashtagFormatRegex, (match, hashtag) => `#${hashtag}`);

    // Phân tích nội dung để lấy hashtag và mention
    const hashtags = [];
    const taggedUserIds = [];
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g; // Regex cho mention: @[username](id)
    const hashtagRegex = /#[^\s#]+/g; // Regex cho hashtag: #tag
    let match;

    // Tìm tất cả các hashtag từ modifiedContent
    while ((match = hashtagRegex.exec(modifiedContent)) !== null) {
      const tag = match[0].slice(1).toLowerCase(); // Bỏ dấu # và chuyển thành chữ thường
      if (!hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    }

    // Tìm tất cả các mention và lấy id
    while ((match = mentionRegex.exec(modifiedContent)) !== null) {
      const userId = match[2]; // ID của người dùng được mention
      if (!taggedUserIds.includes(userId)) {
        taggedUserIds.push(userId);
      }
    }

    // Kiểm tra danh sách taggedUsers để đảm bảo chỉ có tối đa 1 tài khoản restaurant
    const taggedUsersData = await User.find({ _id: { $in: taggedUserIds } });
    const restaurantCount = taggedUsersData.filter(user => user.userType === 'restaurant').length;

    if (restaurantCount > 1) {
      return res.status(400).json({ message: "Cannot tag more than one restaurant in a post." });
    }

    // Tạo bài post mới
    const newPost = new Post({
      userId,
      content: modifiedContent,
      images,
      tags: hashtags,
      taggedUsers: taggedUserIds,
      rating: rating ? Number(rating) : null,
      timestamp: new Date().toISOString(),
    });

    await newPost.save();

    // Nếu bài post có tag tài khoản restaurant và có rating, cập nhật điểm trung bình của nhà hàng
    if (taggedUsersData.length > 0 && rating) {
      const restaurantUser = taggedUsersData.find(user => user.usertype === 'restaurant');
      console.log("restaurant:",restaurantUser);
      if (restaurantUser) {
        // Lấy tất cả bài post có tag tài khoản restaurant này và có rating
        const posts = await Post.find({
          taggedUsers: restaurantUser._id,
          rating: { $exists: true },
        });

        const totalRating = posts.reduce((sum, post) => sum + post.rating, 0);
        const averageRating = totalRating / posts.length;
        console.log("averageRating",averageRating);
        // Cập nhật avgRating của tài khoản restaurant
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

// Tạo bài viết khi tạo voucher
const createPostWithVoucher = async (req, res) => {
  try {
      const { userId, content, is_voucher, voucher_id } = req.body;
      let imageUrl = "";

      // Nếu có file ảnh được gửi lên, lấy URL từ req.file.path
      if (req.file) {
          console.log("File uploaded to Cloudinary:", req.file);
          imageUrl = req.file.path; // req.file.path chính là secure_url từ Cloudinary
      }

      // Tạo bài viết mới
      const newPost = await Post.create({
          userId,
          content: content,
          imageUrl,
          voucher_id: voucher_id,
          is_voucher: is_voucher,
      });
      console.log("New Post Created:", newPost);

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
      console.log("postId:", postId, "userId:", userId);
      const post = await Post.findOne({ _id: postId, userId });
      console.log("postController:",post);
      if (!post) {
          return res.status(400).json({ message: "You can't delete this post" });
      }

      // Xóa ảnh trên Cloudinary nếu có
      if (post.imageUrl) {
        console.log("post.imageUrl:", post.imageUrl);
        
        const parts = post.imageUrl.split('/');
        const publicIdWithExtension = parts[parts.length - 1]; // Lấy tên file từ URL
        const publicId = publicIdWithExtension.split('.')[0]; // Lấy publicId
    
        console.log("publicId:", publicId); // Debug
    
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Image deleted:", result);
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
      console.log("post:",posts )
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Get Posts Failed", error: err.message });
    }
  };

// Lấy danh sách bài viết theo id bài viết
const getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ message: "Get Post Failed", error: error.message });
  }  
}
  
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
      console.log("likedPost:", likedPost);
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
    console.log("comment:", req.params.postId)
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
// const userRatingPost = async (req, res) => {
//   try {
//     const { rating } = req.body;
//     const userId = req.user.id; // Giả sử bạn có middleware để lấy user từ token
//     console.log("ratingpost");
//     const post = await Post.findById(req.params.postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     // Kiểm tra xem user đã rating chưa
//     const existingRatingIndex = post.ratings.findIndex(
//       (r) => r.user.toString() === userId
//     );

//     if (existingRatingIndex !== -1) {
//       // Cập nhật rating nếu đã tồn tại
//       post.ratings[existingRatingIndex].rating = rating;
//     } else {
//       // Thêm rating mới
//       post.ratings.push({ user: userId, rating });
//     }

//     await post.save();
//     return res.json({ message: "Rating submitted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error submitting rating", error });
//   }
// }
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
  module.exports ={
    createPost,
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
  }