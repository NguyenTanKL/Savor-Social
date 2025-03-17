const express = require("express");
const UploadController = require("../../controllers/helper/UploadController");

const router = express.Router();

// Route for file uploads
router.post("/file", UploadController.uploadFile);

module.exports = router;
