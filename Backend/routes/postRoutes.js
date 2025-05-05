// src/routes/postRouter.js
const express = require("express")
const {
    createPost,
    updatePost,
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
    getPostById,
    getAverageRating,
    getByTag,
    getRecommendedPosts,
} =  require("../controllers/postController.js");
const userAuth = require("../middlewares/authMiddleware.js")
// Cấu hình multer để xử lý file upload
const {uploadPost, uploadVouPost} = require("../config/cloudinary/cloudinaryConfig.js")
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



// Routes
// router.post("/", userAuth,uploadPost.single("image"), createPost); // Tạo bài viết
router.post("/createpost", userAuth, uploadVouPost.single("image"), createPostWithVoucher); // Tạo bài viết
router.post("/", userAuth,uploadPost, createPost);
router.put('/:postId', userAuth, updatePost);
router.get("/", getPosts); // Lấy danh sách bài viết
router.get("/info/:postId", userAuth, getPostById); // Lấy bài viết theo ID
router.delete("/:postId", userAuth, deletePost); // Xóa bài viết
router.post("/like", userAuth, likePost); // Thích bài viết
router.post("/unlike", userAuth, unlikePost); // Bỏ thích bài viết
router.get("/:postId/comments", userAuth, getComments); // Lấy danh sách bình luận
router.post("/comments", userAuth, createComment); // Tạo bình luận
router.post("/comments/replies", userAuth,createReply);
router.post("/likeComment",userAuth, likeComment);
router.post("/unlikeComment",userAuth, unlikeComment);
router.get("/:postId/rating/average", userAuth, getAverageRating);
// router.get("/:postId/rating/user/:userId", userAuth, getUserRatingPost);
// router.post("/:postId/rating",userAuth, userRatingPost);

router.get("/getPostBytag",userAuth,getByTag);
router.get('/recommended', userAuth,getRecommendedPosts);
module.exports =  router;
