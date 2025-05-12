const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const User = require("../models/UserModel");
const FavouriteMap = require("../models/FavouriteMapModel");
const Notification = require("../models/NotificationModel");
const Tag = require("../models/TagsModel");
const cloudinary = require("../config/cloudinary/cloudinaryConfig");
const { spawn } = require('child_process');
const createPost = async (req, res) => {
  try {
    const { userId, content, rating, is_ad, location } = req.body;
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
    let parsedLocation = null;
    if (location) {
      try {
        parsedLocation = JSON.parse(location); // Parse chuỗi JSON thành object
        if (!parsedLocation.address || !parsedLocation.coordinates) {
          return res.status(400).json({ message: 'Invalid location format. Must include address and coordinates.' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid location format. Must be a valid JSON string.' });
      }
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
      location: parsedLocation || undefined,
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
 // Gửi thông báo cho các người dùng được tag
 const sender = await User.findById(userId);
 for (const taggedUserId of taggedUserIds) {
   if (taggedUserId !== userId) { // Không gửi thông báo cho chính người tạo post
     const existingNotification = await Notification.findOne({
       senderId: userId,
       receiverId: taggedUserId,
       type: "tag",
       postId: newPost._id,
       isRead: false,
     });
     if (!existingNotification) {
       const notification = new Notification({
         senderId: userId,
         receiverId: taggedUserId,
         type: "tag",
         postId: newPost._id,
         message: `đã tag bạn trong một bài viết`,
       });
       await notification.save();
       console.log(`Tạo thông báo tag: ${userId} -> ${taggedUserId}, post: ${newPost._id}`);
     }
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
      // Kiểm tra postId và userId hợp lệ
      if (!postId || !userId) {
        console.log('Missing postId or userId');
        return res.status(400).json({ message: 'Thiếu postId hoặc userId' });
      }
  
      // Cập nhật Post: thêm userId vào likes
      const likedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
  
      if (!likedPost) {
        console.log(`Post not found: ${postId}`);
        return res.status(404).json({ message: 'Bài viết không tồn tại' });
      }
  
      // Cập nhật User: thêm postId vào likedPosts
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { likedPosts: postId } },
        { new: true }
      );
  
      if (!updatedUser) {
        console.log(`User not found: ${userId}`);
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }
      // Gửi thông báo cho người tạo bài post
      if (likedPost.userId.toString() !== userId) {
        const sender = await User.findById(userId);
        const existingNotification = await Notification.findOne({
          senderId: userId,
          receiverId: likedPost.userId,
          type: "like",
          postId,
          isRead: false,
        });
        if (!existingNotification) {
          const notification = new Notification({
            senderId: userId,
            receiverId: likedPost.userId,
            type: "like",
            postId,
            message: `đã thích bài viết của bạn`,
          });
          await notification.save();
          console.log(`Tạo thông báo like: ${userId} -> ${likedPost.userId}, post: ${postId}`);
        }
      }
      console.log(`Post liked successfully: postId=${postId}, userId=${userId}`);
      res.status(200).json({
        message: 'Thích bài viết thành công',
        post: likedPost,
        user: updatedUser,
      });
    } catch (err) {
      console.error('Error in likePost:', err);
      res.status(500).json({ message: 'Thích bài viết thất bại', error: err.message });
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
      if (post.userId.toString() !== userId) {
        const sender = await User.findById(userId);
        const existingNotification = await Notification.findOne({
          senderId: userId,
          receiverId: post.userId,
          type: "comment",
          postId,
          isRead: false,
        });
        if (!existingNotification) {
          const notification = new Notification({
            senderId: userId,
            receiverId: post.userId,
            type: "comment",
            postId,
            message: `đã bình luận bài viết của bạn`,
          });
          await notification.save();
        }
      }
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
    // Gửi thông báo cho người tạo bình luận gốc
    if (parentComment.userId.toString() !== userId) {
      const sender = await User.findById(userId);
      const existingNotification = await Notification.findOne({
        senderId: userId,
        receiverId: parentComment.userId,
        type: "reply",
        postId: parentComment.postId,
        isRead: false,
      });
      if (!existingNotification) {
        const notification = new Notification({
          senderId: userId,
          receiverId: parentComment.userId,
          type: "reply",
          postId: parentComment.postId,
          message: `đã trả lời bình luận của bạn`,
        });
        await notification.save();
        console.log(`Tạo thông báo reply: ${userId} -> ${parentComment.userId}, comment: ${commentId}`);
      }
    }
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
    let receiverId;
    if (replyId) {
      comment = await Comment.findOne({ "replies._id": replyId });
      if (!comment) {
        return res.status(404).json({ message: "Reply not found" });
      }

      const target = comment.replies.id(replyId);
      if (!target.likes.includes(userId)) {
        target.likes.push(userId);
      }
      receiverId = target.userId;
    } else {
      comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
      }
      receiverId = comment.userId;
    }

    await comment.save();
    // Gửi thông báo cho người tạo bình luận hoặc reply
    if (receiverId.toString() !== userId) {
      const sender = await User.findById(userId);
      const existingNotification = await Notification.findOne({
        senderId: userId,
        receiverId,
        type: "like",
        postId: comment.postId,
        isRead: false,
      });
      if (!existingNotification) {
        const notification = new Notification({
          senderId: userId,
          receiverId,
          type: "like",
          postId: comment.postId,
          message: `đã thích bình luận của bạn`,
        });
        await notification.save();
        console.log(`Tạo thông báo like comment/reply: ${userId} -> ${receiverId}, comment: ${commentId}`);
      }
    }
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
// const getRecommendedPosts = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;

//     const user = await User.findById(userId).lean();
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const preferences = user.preferences || [];
//     const followingIds = user.following || [];

//     // Lấy 100 bài post mới nhất từ tất cả bài post
//     const allPosts = await Post.find()
//       .populate({
//         path: "userId",
//         select: "username profileUrl -password",
//       })
//       .populate({
//         path: "taggedUsers",
//         select: "username profileUrl -password",
//       })
//       .sort({ createdAt: -1 })
//       .limit(100)
//       .lean();

//     // Tính điểm cho mỗi bài viết
//     const scoredPosts = allPosts.map(post => {
//       let score = 0;
//       const matchedTags = (post.tags || []).filter(tag => preferences.includes(tag));
//       score += matchedTags.length * 3;
//       if ((followingIds || []).map(id => id.toString()).includes(post.userId?._id.toString())) {
//         score += 2;
//       }
//       score += Math.min((post.likes || []).length, 5);
//       const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
//       if (hoursAgo <= 24) {
//         score += 1;
//       }
//       return { ...post, score };
//     });

//     // Sắp xếp theo điểm giảm dần
//     scoredPosts.sort((a, b) => b.score - a.score);

//     // Áp dụng phân trang
//     const paginatedPosts = scoredPosts.slice(skip, skip + limit);

//     res.status(200).json(paginatedPosts);
//   } catch (error) {
//     console.error("Error fetching recommended posts:", error);
//     res.status(500).json({ message: "Get Recommended Posts Failed", error: error.message });
//   }
// };

// Lấy bài viết đề xuất
const getRecommendedPosts = async (req, res) => {
  try {
    console.log("Starting getRecommendedPosts, user:", req.user.id);
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    // Lấy bài viết trong 7 ngày qua
    const posts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    console.log(`Posts found: ${posts.length}`);
    if (!posts.length) {
      return res.status(200).json({ posts: [], page, hasMore: false });
    }

    // Lấy thông tin người dùng
    const user = await User.findById(userId).lean();
    const userType = user?.usertype || "normal";
    const likedPosts = user?.likedPosts || [];
    const savedPosts = user?.savedPosts || [];
    const preferences = userType === "normal" ? user?.preferences || [] : [];
    const foodTypes = userType === "restaurant" ? user?.foodTypes || [] : [];
    const following = user?.following || [];
    // Lấy bài viết do người dùng viết
    const userPosts = await Post.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    console.log(`User posts found: ${userPosts.length}`);

    // Hàm xử lý mentions, tags và xóa ID
    const parseContent = (text) => {
      if (!text || typeof text !== "string") return "";
      let result = text;
      // Xóa chuỗi ID (24 ký tự hex)
      result = result.replace(/\b[a-f0-9]{24}\b/g, "");
      // Xử lý tags: [tag][tag] -> tag
      result = result.replace(/\[([^\]\[]+)\]\[\1\]/g, "$1");
      // Loại bỏ các cặp dấu ngoặc không hợp lệ
      result = result.replace(/\[([^\]\[]+)\]\[([^\]\[]+)\]/g, "$1 $2");
      return result.trim();
    };

    // Làm sạch văn bản
    const cleanText = (text) => {
      if (!text) return "";
      const parsedText = parseContent(text);
      return Buffer.from(parsedText, 'utf8')
        .toString('utf8')
        .normalize("NFC")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Tạo user_document từ likedPosts, savedPosts và userPosts
    const processedPostIds = new Set();
    let user_document_parts = [];

    // Xử lý likedPosts và savedPosts
    [...likedPosts, ...savedPosts].forEach((postId) => {
      if (processedPostIds.has(postId)) return;
      const post = posts.find((p) => p._id.toString() === postId.toString());
      if (!post) return;
      const content = cleanText(post.content);
      const tags = cleanText(post.tags?.join(" ") || "");
      user_document_parts.push(`${content} ${tags}`.trim());
      processedPostIds.add(postId);
    });

    // Xử lý userPosts
    userPosts.forEach((post) => {
      if (processedPostIds.has(post._id.toString())) return;
      const content = cleanText(post.content);
      const tags = cleanText(post.tags?.join(" ") || "");
      user_document_parts.push(`${content} ${tags} `.repeat(2).trim());
      processedPostIds.add(post._id.toString());
    });

    // Thêm preferences (user normal) hoặc foodTypes (restaurant)
    const userTags = userType === "normal" ? preferences : foodTypes;
    if (userTags.length > 0) {
      const cleanedUserTags = cleanText(userTags.join(" "));
      user_document_parts.push(cleanedUserTags.repeat(4));
    }

    // Kết hợp thành user_document
    let user_document = user_document_parts.join(" ");

    // Nếu user_document rỗng, dùng top tags
    if (!user_document) {
      const allTags = posts.flatMap((post) => post.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => cleanText(tag));
      user_document = topTags.join(" ");
      console.log("Using default user_document from top tags:", user_document);
    }

    console.log(`User document: ${user_document.substring(0, 100)}...`);

    // Chuẩn bị dữ liệu cho recommendation.py
    const inputData = JSON.stringify({ posts, user_document, following }, (key, value) => {
      if (key === "content" || key === "user_document" || key === "tags") {
        return cleanText(Array.isArray(value) ? value.join(" ") : value);
      }
      return value;
    });

    // Gọi recommendation.py
    const pythonProcess = spawn("python", ["recommendation.py"], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let pythonOutput = "";
    let pythonError = "";

    pythonProcess.stdin.write(Buffer.from(inputData, 'utf8'));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString('utf8');
    });

    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString('utf8');
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      console.log("Python stdout:", pythonOutput);
      if (pythonError) {
        console.error("Python stderr:", pythonError);
      }

      if (code !== 0) {
        return res.status(500).json({ message: "Error running recommendation script" });
      }

      try {
        // Lọc pythonOutput để chỉ lấy JSON
        const jsonMatch = pythonOutput.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in Python output");
        }
        const recommendations = JSON.parse(jsonMatch[0]);
        console.log("Parsed recommendations:", recommendations);

        const recommendedPosts = recommendations
          .map((rec) => {
            const post = posts.find((p) => p._id.toString() === rec.postId);
            return post ? { ...post, similarity: rec.similarity } : null;
          })
          .filter(Boolean);

        // Phân trang
        const startIndex = (page - 1) * limit;
        const paginatedPosts = recommendedPosts.slice(startIndex, startIndex + limit);
        const hasMore = recommendedPosts.length > startIndex + limit;

        return res.status(200).json({
          posts: paginatedPosts,
          page,
          hasMore,
        });
      } catch (error) {
        console.error("Error parsing Python output:", error.message);
        return res.status(500).json({ message: "Error parsing recommendation results", error: error.message });
      }
    });
  } catch (error) {
    console.error("Error in getRecommendedPosts:", error);
    return res.status(500).json({ message: "Lỗi xử lý đề xuất", error: error.message });
  }
};
const getFavouriteLocations = async (req, res) =>{
  try {
    const userId = req.user.id;
    const favouriteLocations = await FavouriteMap.find({ userId });
    const savedLocations = favouriteLocations.map(location => ({
      name: location.name,
      address: location.address,
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
      postId: location.postId,
    }));

    res.status(200).json(savedLocations);
  } catch (err) {
    console.error('Error fetching favourite locations:', err);
    res.status(500).json({ message: 'Failed to fetch favourite locations', error: err.message });
  }
}
const updatePostSelection = async (req, res) =>{
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.location || !post.location.coordinates) {
      return res.status(400).json({ message: 'Post does not have location data' });
    }

    const existingFavourite = await FavouriteMap.findOne({ userId, postId });

    if (existingFavourite) {
      // Nếu đã có, xóa khỏi FavouriteMap (unselect)
      await FavouriteMap.deleteOne({ userId, postId });
      res.status(200).json({ message: 'Removed from favourite map' });
    } else {
      // Nếu chưa có, thêm vào FavouriteMap (select)
      const newFavourite = new FavouriteMap({
        userId,
        postId,
        name: post.location.address || `Địa điểm tại ${post.location.coordinates.lat}, ${post.location.coordinates.lng}`,
        address: post.location.address || 'Không có địa chỉ cụ thể',
        coordinates: {
          lat: post.location.coordinates.lat,
          lng: post.location.coordinates.lng,
        },
      });
      await newFavourite.save();
      res.status(200).json({ message: 'Added to favourite map' });
    }
  } catch (err) {
    console.error('Error updating post selection:', err);
    res.status(500).json({ message: 'Failed to update post selection', error: err.message });
  }
}
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
    getFavouriteLocations,
    updatePostSelection
  }