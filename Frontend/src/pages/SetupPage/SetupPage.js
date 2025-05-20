import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const GOONG_PLACES_API_KEY = "bI22G8oebQwHbOmJ6CGZLpBqhFWTow7pXwpyrOXT";

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

function SetupPage() {
  const user = useSelector((state) => state.user.user);
  console.log("Redux user:", user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [city, setCity] = useState(user.address?.split(', ')[0] || '');
  const [district, setDistrict] = useState(user.address?.split(', ')[1] || '');
  const [ward, setWard] = useState(user.address?.split(', ')[2] || '');
  const [street, setStreet] = useState(user.address?.split(', ')[3] || '');
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [streetOptions, setStreetOptions] = useState([]);
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

  // Hàm gọi API Goong Maps Autocomplete
  const fetchAddressSuggestions = async (query, level, parent = '') => {
    if (!query) return [];
    try {
      let url = `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(query)}&api_key=${GOONG_PLACES_API_KEY}`;
      if (parent) {
        url += `&location=${encodeURIComponent(parent)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      console.log(`Gợi ý thô cho ${level}:`, data.predictions);
      if (data.predictions) {
        const filteredSuggestions = data.predictions
          .filter((prediction) => {
            const { compound, structured_formatting } = prediction;
            const mainText = structured_formatting.main_text.toLowerCase();
            const secondaryText = structured_formatting.secondary_text.toLowerCase();
            const parentProvince = parent ? parent.split(', ')[0].toLowerCase() : null;

            if (level === 'city') {
              // Chỉ lấy cấp tỉnh/thành phố dựa trên compound.province
              const isProvince = compound && compound.province
              console.log(`Filter city - ${mainText} (compound: ${JSON.stringify(compound)}, secondaryText: ${secondaryText}): ${isProvince}`);
              return isProvince;
            } 
            if (level === 'district') {
              // Chỉ lấy cấp huyện/quận thuộc tỉnh/thành phố đã chọn
              const isDistrict = compound && compound.district
                               
              console.log(`Filter district - ${mainText} (compound: ${JSON.stringify(compound)}, secondaryText: ${secondaryText}): ${isDistrict}`);
              return isDistrict;
            } else if (level === 'ward') {
              // Chỉ lấy cấp xã/phường thuộc tỉnh/thành phố và huyện/quận đã chọn
            
              const isWard = compound && compound.commune
              console.log(`Filter ward - ${mainText} (compound: ${JSON.stringify(compound)}, secondaryText: ${secondaryText}): ${isWard}`);
              return isWard;
            } else if (level === 'street') {
              // Chỉ lấy cấp đường thuộc tỉnh/thành phố, huyện/quận, xã/phường đã chọn
              const isStreet = compound 
              console.log(`Filter street - ${mainText} (compound: ${JSON.stringify(compound)}, secondaryText: ${secondaryText}): ${isStreet}`);
              return isStreet;
            }
            return false;
          })
          .map((prediction) => ({
            ...prediction,
            description: prediction.structured_formatting.main_text, // Chỉ hiển thị main_text
          }));
        console.log(`Gợi ý sau lọc cho ${level}:`, filteredSuggestions);
        return filteredSuggestions;
      }
      return [];
    } catch (error) {
      console.error(`Lỗi gợi ý địa chỉ (${level}):`, error);
      return [];
    }
  };

  // Debounced search functions
  const debouncedCitySearch = useMemo(
    () => debounce((value) => handleCitySearch(value), 300),
    []
  );
  const debouncedDistrictSearch = useMemo(
    () => debounce((value) => handleDistrictSearch(value), 300),
    []
  );
  const debouncedWardSearch = useMemo(
    () => debounce((value) => handleWardSearch(value), 300),
    []
  );
  const debouncedStreetSearch = useMemo(
    () => debounce((value) => handleStreetSearch(value), 300),
    []
  );

  // Gợi ý tỉnh/thành phố
  const handleCitySearch = useCallback(async (value) => {
    const suggestions = await fetchAddressSuggestions(value, 'city');
    setCityOptions(suggestions);
  }, []);

  // Gợi ý huyện/quận dựa trên tỉnh đã chọn
  const handleDistrictSearch = useCallback(async (value) => {
    const suggestions = await fetchAddressSuggestions(value, 'district', city);
    setDistrictOptions(suggestions);
  }, [city]);

  // Gợi ý xã/phường dựa trên huyện đã chọn
  const handleWardSearch = useCallback(async (value) => {
    const suggestions = await fetchAddressSuggestions(value, 'ward', `${city}, ${district}`);
    setWardOptions(suggestions);
  }, [city, district]);

  // Gợi ý đường cụ thể dựa trên xã đã chọn
  const handleStreetSearch = useCallback(async (value) => {
    const suggestions = await fetchAddressSuggestions(value, 'street', `${city}, ${district}, ${ward}`);
    setStreetOptions(suggestions);
  }, [city, district, ward]);

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
    if (!city && !district && !ward && !street) {
      setError(true);
      return;
    }
    setError(false);

    const fullAddress = [city, district, ward, street].filter(Boolean).join(', ');
    const updatedUser = {
      ...user,
      address: fullAddress,
      usertype: user.usertype,
      ...(user.usertype === "restaurant" ? { foodTypes } : { preferences }),
    };

    dispatch(updateUser(updatedUser));

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log("Token từ localStorage:", token);

      const newTags = (user.usertype === "normal"
        ? preferences.filter(tag => !availableTags.includes(tag))
        : foodTypes.filter(tag => !foodTypesAvailable.includes(tag))
      );

      for (const tag of newTags) {
        await addTag(tag);
      }

      await fetch(`${BACKENDURL}/api/user/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: fullAddress,
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
        <Typography variant="subtitle1" sx={{ mb: 2, color: '#666' }}>Thông Tin Địa Chỉ</Typography>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Autocomplete
            freeSolo
            options={cityOptions}
            getOptionLabel={(option) => option.description || option}
            onInputChange={(event, value) => {
              setCity(value);
              debouncedCitySearch(value);
            }}
            onChange={(event, value) => {
              if (value) {
                setCity(value.description);
                setDistrict('');
                setWard('');
                setStreet('');
                setDistrictOptions([]);
                setWardOptions([]);
                setStreetOptions([]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tỉnh/Thành phố"
                value={city}
                error={error && !city && !district && !ward && !street}
                helperText={error && !city && !district && !ward && !street ? 'Vui lòng nhập ít nhất một trường địa chỉ' : ''}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            )}
          />
          <Autocomplete
            freeSolo
            options={districtOptions}
            getOptionLabel={(option) => option.description || option}
            onInputChange={(event, value) => {
              setDistrict(value);
              debouncedDistrictSearch(value);
            }}
            onChange={(event, value) => {
              if (value) {
                setDistrict(value.description);
                setWard('');
                setStreet('');
                setWardOptions([]);
                setStreetOptions([]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Huyện/Quận"
                value={district}
                error={error && !city && !district && !ward && !street}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            )}
            disabled={!city}
          />
          <Autocomplete
            freeSolo
            options={wardOptions}
            getOptionLabel={(option) => option.description || option}
            onInputChange={(event, value) => {
              setWard(value);
              debouncedWardSearch(value);
            }}
            onChange={(event, value) => {
              if (value) {
                setWard(value.description);
                setStreet('');
                setStreetOptions([]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Xã/Phường"
                value={ward}
                error={error && !city && !district && !ward && !street}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            )}
            disabled={!district}
          />
          <Autocomplete
            freeSolo
            options={streetOptions}
            getOptionLabel={(option) => option.description || option}
            onInputChange={(event, value) => {
              setStreet(value);
              debouncedStreetSearch(value);
            }}
            onChange={(event, value) => {
              if (value) {
                setStreet(value.description);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Đường cụ thể"
                value={street}
                error={error && !city && !district && !ward && !street}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            )}
            disabled={!ward}
          />
        </Box>
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