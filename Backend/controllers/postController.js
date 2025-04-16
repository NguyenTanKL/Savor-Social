const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const cloudinary = require("../config/cloudinary/cloudinaryConfig");
  // Tạo bài viết
const createPost = async (req, res) => {
  try {
      const { userId, content } = req.body;
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
        .populate({
          path: "userId",
          select: "username profileUrl -password",
        })
        .sort({ createdAt: -1 });
      console.log("post:",posts )
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Get Posts Failed", error: err.message });
    }
  };
  
  // Thích bài viết
const likePost = async (req, res) => {
    try {
      const { postId, userId } = req.body;
  
      const likedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } }, // Sử dụng $addToSet để tránh trùng lặp
        { new: true }
      ).populate({
        path: "userId",
        select: "username profileUrl -password",
      });
  
      if (!likedPost) {
        return res.status(400).json({ message: "You can't like this post" });
      }
  
      res.status(200).json(likedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Like Post Failed", error: err.message });
    }
  };
  
  // Bỏ thích bài viết
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
  // Hàm phụ để thêm reply vào cây replies
// const addReplyToPath = (replies, path, newReply) => {
//   if (path.length === 0) {
//     replies.push(newReply);
//     return;
//   }

//   const [index, ...rest] = path;
//   if (!replies[index]) {
//     throw new Error('Invalid reply path');
//   }

//   addReplyToPath(replies[index].replies, rest, newReply);
// };
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
  module.exports ={
    createPost,
    getPosts,
    deletePost,
    likePost,
    unlikePost,
    getComments,
    createComment,
    createReply,
    likeComment,
    unlikeComment,
  }