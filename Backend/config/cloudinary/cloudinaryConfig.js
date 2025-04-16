const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

const voucherStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "vouchers", // Folder name in Cloudinary
        format: async (req, file) => "png", // Convert all images to PNG
        public_id: (req, file) => file.originalname.split(".")[0],
    },
});
const postStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "posts", // Folder cho bài viết
        format: async (req, file) => "png", // Convert all images to PNG
        public_id: (req, file) => `post_${Date.now()}_${file.originalname.split(".")[0]}`, // Đặt public_id để tránh trùng lặp
    },
});
const uploadVoucher = multer({ storage: voucherStorage });
const uploadPost = multer({storage:postStorage})
module.exports = { cloudinary, uploadPost, uploadVoucher };