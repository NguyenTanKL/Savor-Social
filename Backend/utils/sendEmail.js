const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_USER_PASSWORD ,
    },
});

// Hàm gửi email xác thực
const sendVerificationEmail = async (email, verificationCode) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?code=${verificationCode}`;
  
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Xác thực email của bạn',
    html: `
      <h2>Xác thực email</h2>
      <p>Cảm ơn bạn đã đăng ký! Vui lòng xác thực email của bạn bằng cách sử dụng mã sau:</p>
      <h3>${verificationCode}</h3>
      <p>Hoặc nhấp vào link sau để xác thực:</p>
      <a href="${verificationLink}">Xác thực ngay</a>
      <p>Mã này sẽ hết hạn sau 10 phút.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email xác thực');
  }
};

module.exports = { sendVerificationEmail };