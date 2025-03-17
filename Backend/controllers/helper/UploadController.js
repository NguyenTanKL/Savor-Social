const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Multer instance
const upload = multer({ storage, fileFilter });

// Controller function for handling file uploads
class UploadController {
    async uploadFile(req, res) {
        upload.single("file")(req, res, (err) => {
          if (err) {
            return res.status(400).json({ success: false, message: err.message });
          }
          if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
          }
      
          // Return the file path or URL
          res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileUrl: `/uploads/${req.file.filename}`,
          });
        });
    };
}

module.exports = new UploadController;