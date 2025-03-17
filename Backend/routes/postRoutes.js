const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Model bài post của bạn
const User = require("../models/User");
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

module.exports = router;
