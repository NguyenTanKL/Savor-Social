import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/Reducer/userSlice'; // Giả định bạn có action login
import { BACKENDURL } from '../../utils/const';
const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy email từ state
  const location = useLocation();
  const { email } = location.state || {};

  const handleVerify = async () => {
    if (!email || !code) {
      setError('Vui lòng nhập mã xác thực!');
      return;
    }
  
    try {
      const response = await axios.post(`${BACKENDURL}/api/auth/verify-email`, {
        email,
        code,
      });
  
      const { token, user, message } = response.data; // Lấy token và user từ response
  
      setSuccess(message);
      setError('');
  
      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      // Cập nhật Redux
      dispatch(login(user));
  
      // Chuyển đến trang setup
      setTimeout(() => navigate('/setup'), 2000);
    } catch (err) {
      setError(err.response?.data.message || 'Xác thực thất bại');
      setSuccess('');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Xác thực email
      </Typography>
      <Typography variant="body1" gutterBottom>
        Một mã xác thực đã được gửi đến {email || 'email của bạn'}. Vui lòng nhập mã để xác thực.
      </Typography>
      <TextField
        label="Mã xác thực"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
        margin="normal"
      />
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" variant="body2">
          {success}
        </Typography>
      )}
      <Button variant="contained" onClick={handleVerify} sx={{ mt: 2 }}>
        Xác thực
      </Button>
    </Box>
  );
};

export default VerifyEmail;