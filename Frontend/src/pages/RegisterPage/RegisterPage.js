import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { login } from "../../redux/Reducer/userSlice"; // Action từ Redux 
const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    usertype: "normal",
    username: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password) {
      alert("Vui lòng nhập email và mật khẩu!");
      return;
    }

    const dataToSend = {
      email: registerData.email,
      password: registerData.password,
      usertype: registerData.usertype,
      username: registerData.username,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", dataToSend);
      const { token, userId } = response.data;

      // Tự động đăng nhập với Redux
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: registerData.email, id: userId }));
      dispatch(login({ email: registerData.email, id: userId }));
      navigate("/setup");

      // Hoặc chuyển về LoginPage
      // alert("Đăng ký thành công! Hãy đăng nhập.");
      // navigate("/LoginPage");
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
      <Box sx={{ width: "100%", bgcolor: "white", border: "1px solid #dbdbdb", p: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 2 }}>
        <InstagramIcon sx={{ fontSize: 50, color: "#e1306c" }} />
        <Typography variant="h5" sx={{ fontWeight: "bold", my: 2, fontFamily: "cursive" }}>
          Instagram
        </Typography>

        <TextField fullWidth label="Email" name="email" value={registerData.email} onChange={handleChange} sx={{ bgcolor: "#fafafa" }} />
        <TextField fullWidth type="password" label="Mật khẩu" name="password" value={registerData.password} onChange={handleChange} sx={{ bgcolor: "#fafafa" }} />

        <Select fullWidth name="usertype" value={registerData.usertype} onChange={handleChange} sx={{ mt: 2 }}>
          <MenuItem value="normal">Người dùng bình thường</MenuItem>
          <MenuItem value="restaurant">Nhà hàng</MenuItem>
        </Select>

        <TextField
          fullWidth
          label={registerData.usertype === "normal" ? "Username" : "Tên nhà hàng"}
          name="username"
          value={registerData.username}
          onChange={handleChange}
          sx={{ bgcolor: "#fafafa" }}
        />

        <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: "#0095f6", color: "white", textTransform: "none", "&:hover": { bgcolor: "#0077c0" } }} onClick={handleRegister}>
          Đăng ký
        </Button>
      </Box>

      <Box sx={{ width: "100%", bgcolor: "white", border: "1px solid #dbdbdb", p: 2, textAlign: "center" }}>
        <Typography variant="body2">
          Đã có tài khoản? <span style={{ color: "#0095f6", fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/LoginPage")}>Đăng nhập</span>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;