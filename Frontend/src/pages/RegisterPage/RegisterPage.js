import React, { useState } from "react";
import { BACKENDURL } from "../../utils/const";
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
      const response = await axios.post(`${BACKENDURL}/api/auth/register`, dataToSend);
      
      const { token, user , message} = response.data; // Nhận user đầy đủ từ API
      alert(message || "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.");
      // Chuyển hướng đến trang verify-email, truyền email qua state
    navigate('/verify-email', { state: { email: registerData.email } });
      // Lưu vào localStorage
      // localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(user));
    
      // Cập nhật Redux
      // dispatch(login(user));
    
      // // Chuyển đến trang setup
      // navigate("/setup");
    
    } catch (error) {
      console.error("Đăng ký thất bại:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "white",
          border: "1px solid #dbdbdb",
          borderRadius: "8px",
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <InstagramIcon sx={{ fontSize: 60, color: "#e1306c", mb: 2 }} />
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 3, fontFamily: "cursive" }}
        >
          Savor Social
        </Typography>

        <TextField
          fullWidth
          label="Email"
          name="email"
          value={registerData.email}
          onChange={handleChange}
          sx={{ mb: 2, bgcolor: "#fafafa", borderRadius: "4px" }}
          variant="outlined"
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          name="password"
          value={registerData.password}
          onChange={handleChange}
          sx={{ mb: 2, bgcolor: "#fafafa", borderRadius: "4px" }}
          variant="outlined"
        />
        <TextField
          fullWidth
          label={registerData.usertype === "normal" ? "Username" : "Tên nhà hàng"}
          name="username"
          value={registerData.username}
          onChange={handleChange}
          sx={{ mb: 3, bgcolor: "#fafafa", borderRadius: "4px" }}
          variant="outlined"
        />
        <Select
          fullWidth
          name="usertype"
          value={registerData.usertype}
          onChange={handleChange}
          sx={{ mb: 2, bgcolor: "#fafafa", borderRadius: "4px" }}
          variant="outlined"
        >
          <MenuItem value="normal">User Normal</MenuItem>
          <MenuItem value="restaurant">Restaurant</MenuItem>
        </Select>

        

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            mb: 2,
            bgcolor: "#0095f6",
            color: "white",
            textTransform: "none",
            padding: "10px 0",
            "&:hover": { bgcolor: "#0077c0" },
          }}
          onClick={handleRegister}
        >
          Register
        </Button>
      </Box>

      <Box
        sx={{
          width: "100%",
          bgcolor: "white",
          border: "1px solid #dbdbdb",
          borderRadius: "8px",
          p: 2,
          mt: 2,
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="body2">
        Already have an account?{" "}
          <span
            style={{ color: "#0095f6", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => navigate("/LoginPage")}
          >
            Log in
          </span>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;