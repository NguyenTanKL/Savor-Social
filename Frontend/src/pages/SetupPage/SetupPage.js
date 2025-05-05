import React, { useState, useEffect } from 'react';
import { BACKENDURL } from '../../utils/const';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/Reducer/userSlice';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getTags, addTag, updatePreferences } from '../../api';

const foodOptions = ['Vegetarian', 'Sweet', 'Coffee', 'Japanese', 'Korean', 'Monan', 'Banhmi'];
const foodTypesOptions = ['Pizza', 'Sushi', 'Burger', 'BBQ', 'Vegan'];

function SetupPage() {
  const user = useSelector((state) => state.user.user);
  console.log("Redux user:", user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user.address || '');
  const [preferences, setPreferences] = useState(user.preferences?.map(p => p.toLowerCase().trim()) || []);
  const [foodTypes, setFoodTypes] = useState(user.foodTypes?.map(p => p.toLowerCase().trim()) || []);
  const [error, setError] = useState(false);
  const [availableTags, setAvailableTags] = useState(foodOptions.map(t => t.toLowerCase().trim()));
  const [foodTypesAvailable, setFoodTypesAvailable] = useState(foodTypesOptions.map(t => t.toLowerCase().trim()));
  const [newTagInput, setNewTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const res = await getTags();
        setAvailableTags(res.data.map(tag => tag.toLowerCase().trim()));
      } catch (err) {
        console.error('Failed to load tags:', err);
        setAvailableTags(foodOptions.map(t => t.toLowerCase().trim()));
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Thêm tag tạm thời vào danh sách khi nhấn Enter hoặc nút Add (không gửi lên server ngay)
  const handleAddNewTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const normalizedTag = newTagInput.toLowerCase().trim();
      if (normalizedTag && (user.usertype === "normal" ? !preferences.includes(normalizedTag) : !foodTypes.includes(normalizedTag))) {
        if (user.usertype === "normal") {
          setPreferences(prev => [...prev, normalizedTag]);
        } else {
          setFoodTypes(prev => [...prev, normalizedTag]);
        }
        setNewTagInput('');
      }
    }
  };

  const handlePreferenceChange = (event, newValue) => {
    const normalizedValue = newValue.map(tag => tag.toLowerCase().trim());
    setPreferences(normalizedValue);
  };

  const handleFoodTypesChange = (event, newValue) => {
    const normalizedValue = newValue.map(tag => tag.toLowerCase().trim());
    setFoodTypes(normalizedValue);
  };

  const handleSubmit = async () => {
    if (!address) {
      setError(true);
      return;
    }
    setError(false);

    const updatedUser = {
      ...user,
      address,
      usertype: user.usertype,
      ...(user.usertype === "restaurant" ? { foodTypes } : { preferences }),
    };

    dispatch(updateUser(updatedUser));

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log("Token từ localStorage:", token);

      // Lấy các tag mới chưa có trong availableTags/foodTypesAvailable
      const newTags = (user.usertype === "normal"
        ? preferences.filter(tag => !availableTags.includes(tag))
        : foodTypes.filter(tag => !foodTypesAvailable.includes(tag))
      );

      // Thêm các tag mới vào database
      for (const tag of newTags) {
        await addTag(tag);
      }

      // Cập nhật preferences/foodTypes lên server
      await fetch(`${BACKENDURL}/api/user/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          ...(user.usertype === "restaurant" ? { foodTypes } : { preferences }),
        }),
      });

      navigate('/recommendations');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        {user.usertype === "normal" && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#666' }}>Sở Thích Ăn Uống</Typography>
            <Autocomplete
              multiple
              options={availableTags}
              value={preferences}
              onChange={handlePreferenceChange}
              freeSolo={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Chọn sở thích"
                  placeholder="Chọn sở thích"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                label="Thêm sở thích mới"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={handleAddNewTag}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddNewTag} edge="end" color="primary">
                      <AddIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {preferences.map((tag, index) => (
                <Chip key={index} label={tag} onDelete={() => setPreferences(preferences.filter(t => t !== tag))} />
              ))}
            </Box>
          </>
        )}

        {user.usertype === "restaurant" && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#666' }}>Loại Món Ăn Nhà Hàng Cung Cấp</Typography>
            <Autocomplete
              multiple
              options={foodTypesAvailable}
              value={foodTypes}
              onChange={handleFoodTypesChange}
              freeSolo={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Chọn loại món ăn"
                  placeholder="Chọn loại món ăn"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                label="Thêm loại món ăn mới"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={handleAddNewTag}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddNewTag} edge="end" color="primary">
                      <AddIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {foodTypes.map((tag, index) => (
                <Chip key={index} label={tag} onDelete={() => setFoodTypes(foodTypes.filter(t => t !== tag))} />
              ))}
            </Box>
          </>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, backgroundColor: '#0095f6', '&:hover': { backgroundColor: '#0077c0' } }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu và Tiếp Tục'}
        </Button>
      </Paper>
    </Container>
  );
}

export default SetupPage;