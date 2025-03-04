import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/Reducer/userSlice"; // Action từ Redux
import { Box, Button, Container, TextField, Typography, Alert } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage () {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Chỉ chuyển hướng ngay khi component mount nếu đã đăng nhập
  if (isAuthenticated) {
    navigate("/HomePage");
    return null; // Không render gì nếu đã đăng nhập
  }

  const handleChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", loginData);
      dispatch(login(response.data.user)); // Dispatch trước
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/HomePage");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "white",
          border: "1px solid #dbdbdb",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mb: 2,
        }}
      >
        <InstagramIcon sx={{ fontSize: 50, color: "#e1306c" }} />
        <Typography variant="h5" sx={{ fontWeight: "bold", my: 2, fontFamily: "cursive" }}>
        Savor Social
        </Typography>

        {/* Hiển thị lỗi nếu có */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <form
          onSubmit={(e) => {
            e.preventDefault(); // Ngăn reload trang
            handleLogin();
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            label="Email hoặc số điện thoại"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            sx={{ bgcolor: "#fafafa" }}
          />

          <TextField
            fullWidth
            variant="outlined"
            margin="dense"
            type="password"
            label="Mật khẩu"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            sx={{ bgcolor: "#fafafa" }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "#0095f6",
              color: "white",
              textTransform: "none",
              "&:hover": { bgcolor: "#0077c0" },
            }}
          >
            Đăng nhập
          </Button>
        </form>

        <Typography sx={{ my: 2, color: "#8e8e8e" }}>HOẶC</Typography>

        <Button sx={{ textTransform: "none", color: "#385185" }}>
          Đăng nhập bằng Facebook
        </Button>

        <Typography sx={{ fontSize: "12px", color: "#00376b", mt: 1 }}>
          Quên mật khẩu?
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          bgcolor: "white",
          border: "1px solid #dbdbdb",
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          Chưa có tài khoản?{" "}
          <span
            style={{ color: "#0095f6", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </span>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
