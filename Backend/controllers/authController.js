// controllers/authController.js
const bcrypt = require("bcryptjs");
const crypto = require('crypto'); // Thêm dòng này để import crypto
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const { followUser } = require("./userController");
const { sendVerificationEmail } = require('../utils/sendEmail');
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { email, username, password, usertype } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    // Tạo mã xác thực ngẫu nhiên
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // Ví dụ: "A1B2C3"
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới với các giá trị mặc định chung
    const newUserData = {
      email,
      username,
      password: hashedPassword,
      usertype: usertype || "normal", // Nếu usertype không có, đặt mặc định là "normal"
      darkmode: false,
      phone: "",
      bio: "",
      website: "",
      gender: "",
      avatar: "",
      address: "",
      foodTypes: [],
      following: [],
      followers: [],
      verificationCode,
      verificationCodeExpires,
    };

    // Thêm các thuộc tính riêng biệt tùy theo usertype
    if (usertype === "normal") {
      newUserData.point = 0;
    } else {
      newUserData.avgRating = 0;
      newUserData.openHour = "";
      newUserData.closeHour = "";
    }

    // Tạo và lưu user
    const newUser = new User(newUserData);
    const savedUser = await newUser.save();
    // Gửi email xác thực
    await sendVerificationEmail(email, verificationCode);
    // Tạo JWT Token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.SECRET_KEY || "my_secret_key",
      { expiresIn: "24h" }
    );

    // Trả về thông tin user đầy đủ
    res.status(201).json({
      token,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username,
        usertype: savedUser.usertype,
        darkmode: savedUser.darkmode,
        preferences: savedUser.preferences,
        foodTypes: savedUser.foodTypes,
        isVerified: savedUser.isVerified,
      },
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }

    if (Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Tạo token mới sau khi xác thực
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY || "my_secret_key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: 'Xác thực email thành công',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        usertype: user.usertype,
        foodTypes: user.foodTypes,
      },
    });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ message: 'Xác thực thất bại' });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

    // Tạo JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY || "my_secret_key",
      { expiresIn: "10h" }
    );
    res.json({ token, userId: user._id, user });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const logoutUser = (req, res) => {
  // Ví dụ: xóa cookie hoặc thực hiện hành động cần thiết để logout
  res.clearCookie("token");
  res.status(200).json({ message: "Log out success" });
};

module.exports = { registerUser, loginUser, logoutUser, verifyEmail };
