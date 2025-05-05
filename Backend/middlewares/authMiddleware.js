const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load biến môi trường ngay lập tức

const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication failed: Missing or invalid token format" });
  }
  const token = authHeader.split(" ")[1];
  if (!process.env.SECRET_KEY) {
    return res.status(500).json({ message: "Server error: Missing secret key" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id: decoded.userId }; // Gán thông tin user vào req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = userAuth;
