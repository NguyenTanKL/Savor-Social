import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/Reducer/userSlice';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  Grid 
} from '@mui/material';

const foodOptions = ['Vegetarian', 'Sweet', 'Coffee', 'Japanese', 'Korean'];

function SetupPage() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user.address || '');
  const [preferences, setPreferences] = useState(user.preferences || []);
  const [error, setError] = useState(false);

  const handlePreferenceChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setPreferences([...preferences, value]);
    } else {
      setPreferences(preferences.filter((p) => p !== value));
    }
  };

  const handleSubmit = async () => {
    if (!address) {
      setError(true);
      return;
    }
    setError(false);
    const updatedUser = { ...user, address, preferences };
    dispatch(updateUser(updatedUser));

    try {
      await fetch('/api/update-user', {
        method: 'POST',
        body: JSON.stringify(updatedUser),
        headers: { 'Content-Type': 'application/json' },
      });
      navigate('/recommendations');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3, color: '#333' }}>Hoàn Thành Hồ Sơ Của Bạn</Typography>
        <TextField
          label="Địa chỉ"
          value={address}
          error={error && !address}
          helperText={error && !address ? 'Vui lòng nhập địa chỉ' : ''}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ mb: 3 }}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#666' }}>Sở Thích Ăn Uống</Typography>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {foodOptions.map((option) => (
            <Grid item xs={6} key={option}>
              <FormControlLabel
                control={<Checkbox checked={preferences.includes(option)} value={option} color="primary" sx={{ mt: 1 }} onChange={handlePreferenceChange} />}
                label={option}
                labelPlacement="end"
              />
            </Grid>
          ))}
        </Grid>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, backgroundColor: '#0095f6', '&:hover': { backgroundColor: '#0077c0' } }} onClick={handleSubmit}>
          Lưu và Tiếp Tục
        </Button>
      </Paper>
    </Container>
  );
}

export default SetupPage;