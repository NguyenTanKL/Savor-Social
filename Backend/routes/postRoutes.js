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
  unlikeComment
} =  require("../controllers/postController.js");
const userAuth = require("../middlewares/authMiddleware.js")
// Cấu hình multer để xử lý file upload
const {uploadPost} = require("../config/cloudinary/cloudinaryConfig.js")
const router = express.Router();
// Routes
router.post("/", userAuth,uploadPost.single("image"), createPost); // Tạo bài viết
router.get("/", getPosts); // Lấy danh sách bài viết
router.delete("/:postId", userAuth, deletePost); // Xóa bài viết
router.post("/like", userAuth, likePost); // Thích bài viết
router.post("/unlike", userAuth, unlikePost); // Bỏ thích bài viết
router.get("/:postId/comments", userAuth, getComments); // Lấy danh sách bình luận
router.post("/comments", userAuth, createComment); // Tạo bình luận
router.post("/comments/replies", userAuth,createReply);
router.post("/likeComment",userAuth, likeComment);
router.post("/unlikeComment",userAuth, unlikeComment);

module.exports =  router;
