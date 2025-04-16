const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "vouchers", // Folder name in Cloudinary
        format: async (req, file) => "png", // Convert all images to PNG
        public_id: (req, file) => file.originalname.split(".")[0],
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
