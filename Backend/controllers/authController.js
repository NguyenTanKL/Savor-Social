// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const dotenv = require("dotenv");
dotenv.config();

const registerUser = async (req, res) => {
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

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới với các giá trị mặc định
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      usertype: usertype || "normal", // Nếu usertype không có, đặt mặc định là "normal"
      darkmode: false, // Mặc định là false
      preferences: [], // Danh sách sở thích rỗng
      foodTypes: [], // Danh sách loại đồ ăn rỗng
    });

    const savedUser = await newUser.save();

    // Tạo JWT Token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.SECRET_KEY || "my_secret_key",
      { expiresIn: "1h" }
    );

    // **Trả về thông tin user đầy đủ**
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
      },
      message: "Đăng ký thành công",
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log("Dữ liệu đăng nhập nhận từ client:", req.body);
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
      { expiresIn: "1h" }
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

module.exports = { registerUser, loginUser, logoutUser };
