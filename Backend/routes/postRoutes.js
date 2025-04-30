// src/routes/postRouter.js
const express = require("express")
const {
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
  createPostWithVoucher,
  getPostById
} =  require("../controllers/postController.js");
const userAuth = require("../middlewares/authMiddleware.js")
// Cấu hình multer để xử lý file upload
const {upload} = require("../config/cloudinary/cloudinaryConfig.js")
const router = express.Router();
const Post = require('../models/PostModel'); // Model bài post của bạn
const User = require("../models/UserModel");
const mongoose = require("mongoose");
// API lấy tất cả bài post
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Lấy post mới nhất trước
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/user/:id/savedPosts", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("savedPosts");
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
        
        res.json({ savedPosts: user.savedPosts });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

router.post("/a", async (req, res) => {
    try {
        const { userId, content, images, videos, location, tags, rating } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
        }

        const newPost = new Post({
            userId,
            content,
            images,
            videos,
            location,
            tags,
            rating,
        });

        await newPost.save();
        res.status(201).json({ message: "Bài viết đã được lưus", post: newPost });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

router.post("/savePost", async (req, res) => {
    try {
        const { userId, postId } = req.body;
    
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        const isSaved = user.savedPosts.includes(postId);
        
        if (isSaved) {
            // Nếu đã lưu, thì xóa khỏi danh sách đã lưu
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
            await user.save();
            return res.json({ message: "Bỏ lưu bài viết", saved: false });
        } else {
            // Nếu chưa lưu, thì thêm vào danh sách đã lưu
            user.savedPosts.push(postId);
            await user.save();
            return res.json({ message: "Đã lưu bài viết", saved: true });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
router.post("/:postID/like", async (req, res) => {
    try {
        // const { userId } = req.body;
        // const post = await Post.findById(req.params.postID);
        // console.log("like:",userId )
        // if (!post) {
        //     return res.status(404).json({ message: "Post not found" });
        // }

        // if (post.likes.users.includes(userId)) {
        //     // Nếu user đã like => bỏ like
        //     post.likes.users = post.likes.users.filter(id => id !== userId);
        //     post.likes.count -= 1;
        // } else {
        //     // Nếu user chưa like => thêm vào danh sách
        //     post.likes.users.push(userId);
        //     post.likes.count += 1;
        // }

        // await post.save();
        // res.status(200).json({ success: true, likes: post.likes });
        console.log("Headers:", req.headers);
        console.log("Body nhận được:", req.body);
        if (!req.body) {
            return res.status(400).json({ error: "Body không có dữ liệu" });
        }
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Thiếu userId trong request body" });
        }

        const post = await Post.findById(req.params.postID);
        if (!post) {
            return res.status(404).json({ message: "Bài post không tồn tại" });
        }
       
        console.log("Bài post tìm thấy:", post);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        let liked = post.likes.users.includes(userId);
        if (liked) {
            post.likes.users = post.likes.users.filter(user => !user.equals(userObjectId));
            post.likes.count = Math.max(0, post.likes.count - 1);
            console.log("da xoa thanh cong");
        } else {
            post.likes.users.push(userId);
            post.likes.count += 1;
        }

        console.log("Cập nhật like:", post.likes);

        const updatedPost = await post.save();
        res.status(200).json({ success: true, likes: updatedPost.likes });
    } catch (err) {
        console.error("Lỗi trong server:", err); // Log lỗi cụ thể ra terminal
        res.status(500).json({ error: "Lỗi server", message: err.message });
    }

});


// Routes
// router.post("/", userAuth,uploadPost.single("image"), createPost); // Tạo bài viết
router.post("/", userAuth,upload.single("image"), createPost);
router.post("/createpost", userAuth,upload.single("image"), createPostWithVoucher); // Tạo bài viết
router.get("/", getPosts); // Lấy danh sách bài viết
router.get("/get/:postId", userAuth, getPostById); // Lấy bài viết theo ID
router.delete("/:postId", userAuth, deletePost); // Xóa bài viết
router.post("/like", userAuth, likePost); // Thích bài viết
router.post("/unlike", userAuth, unlikePost); // Bỏ thích bài viết
router.get("/:postId/comments", userAuth, getComments); // Lấy danh sách bình luận
router.post("/comments", userAuth, createComment); // Tạo bình luận
router.post("/comments/replies", userAuth,createReply);
router.post("/likeComment",userAuth, likeComment);
router.post("/unlikeComment",userAuth, unlikeComment);

module.exports =  router;
