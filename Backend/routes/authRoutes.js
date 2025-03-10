const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const router = express.Router();

// API đăng ký
router.post("/register", async (req, res) => {
  try {

    console.log("Dữ liệu đăng ký từ client:", req.body);
    const { email, username, password, usertype } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Hash mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Tạo user mới
    const newUser = new User({
      email,
  username,
  password: hashedPassword, // mật khẩu đã được hash
  usertype,
    });
    const savedUser = await newUser.save();
    // (Tùy chọn) Tạo JWT Token để tự động đăng nhập sau khi đăng ký thành công
    const token = jwt.sign({ id: newUser._id }, "my_secret_key", { expiresIn: "1h" });
    
    res.status(201).json({ token, userId: newUser._id, message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

    // Tạo JWT Token
    const token = jwt.sign({ id: user._id }, "my_secret_key", { expiresIn: "1h" });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
  // API đăng xuất
  router.post("/logout",(req,res) => {
    res.clearCookie("token");
    res.status(200).json({message:"Log out success"});
  });
  router.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
  });
// recommend restaurant
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await User.find({ usertype: 'restaurant' });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
});
router.get('/normal-users', async (req, res) => {
  try {
    const normalUsers = await User.find({  usertype: 'normal' });
    res.json(normalUsers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
});
module.exports = router;
