// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const Post = require("../models/Post");
// const mongoose = require("mongoose");
// // API để thêm hoặc xóa post khỏi danh sách đã lưu
// // router.put("/:userId/savePost/:postId", async (req, res) => {
// //     try {
// //         const { userId, postId } = req.params;
// //         const user = await User.findById(userId);
// //         if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

// //         const post = await Post.findById(postId);
// //         if (!post) return res.status(404).json({ message: "Bài post không tồn tại" });

// //         // Kiểm tra xem bài post đã được lưu chưa
// //         const isSaved = user.savedPosts.includes(postId);

// //         if (isSaved) {
// //             // Nếu đã lưu => Xóa khỏi danh sách savedPosts
// //             user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
// //             await user.save();
// //             return res.json({ message: "Đã xóa bài post khỏi danh sách đã lưu" });
// //         } else {
// //             // Nếu chưa lưu => Thêm vào danh sách savedPosts
// //             user.savedPosts.push(postId);
// //             await user.save();
// //             return res.json({ message: "Đã lưu bài post" });
// //         }
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ message: "Lỗi server" });
// //     }
// // });

// router.get("/:userId", async (req, res) => {
//     try {
//         console.log("hello");
//         if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
//             return res.status(400).json({ message: "ID người dùng không hợp lệ" });
//         }
//         if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
//             return res.status(400).json({ message: "ID không hợp lệ" });
//         }
//         const user = await User.findById(req.params.userId);
//         if (!user) {
//             return res.status(404).json({ message: "Người dùng không tồn tại" });
//         }
//         res.json(user);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Lỗi server" });
//     }
// });


// module.exports = router;


const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Model User

// API lấy thông tin user theo ID
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu user:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;
