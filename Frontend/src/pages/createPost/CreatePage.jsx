import React, { useState, useEffect, useCallback } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Avatar,
  Stack,
  Popover,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useForm, Controller } from 'react-hook-form';
import { createPostAsync, getPostsAsync } from '../../redux/Reducer/postSlice';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MentionsInput, Mention } from 'react-mentions';
import { getTags } from '../../api';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const mentionStyle = {
  control: {
    fontSize: '1rem',
    fontWeight: 'normal',
    lineHeight: '1.5',
    minHeight: '100px',
  },
  highlighter: {
    padding: '9px 12px',
    boxSizing: 'border-box',
  },
  input: {
    padding: '9px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      maxHeight: '150px',
      overflowY: 'auto',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    item: {
      padding: '5px 10px',
      borderBottom: '1px solid #eee',
      '&focused': {
        backgroundColor: '#f0f0f0',
      },
    },
  },
};

const CreatePost = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [crop, setCrop] = useState({ aspect: 1, unit: '%', width: 100, height: 100 });
  const [croppedImages, setCroppedImages] = useState([]);
  const [croppedFiles, setCroppedFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageRef, setImageRef] = useState(null);
  const [rating, setRating] = useState(0);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [adsEnabled, setAdsEnabled] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { loading, error } = useSelector((state) => state.posts);

  const following = Array.isArray(user?.following) ? user.following : [];
  const followers = Array.isArray(user?.followers) ? user.followers : [];
  const friends = [...new Set([...following, ...followers].map(f => JSON.stringify(f)))].map(f => JSON.parse(f));

  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const GOONG_PLACES_API_KEY = 'bI22G8oebQwHbOmJ6CGZLpBqhFWTow7pXwpyrOXT';

  const mentionUsers = friends
    .filter(friend => friend && friend._id && friend.username)
    .map(friend => ({
      id: friend._id,
      display: friend.username,
    }));

  const [availableTags, setAvailableTags] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getTags();
        setAvailableTags(res.data.map(tag => ({
          id: tag,
          display: tag,
        })));
      } catch (err) {
        console.error('Failed to load tags:', err);
        setAvailableTags([]);
      }
    };
    fetchTags();
  }, []);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    mode: 'onChange',
  });

  const updateTaggedUsersFromContent = (content) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentionedIds = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const id = match[2];
      mentionedIds.push(id);
    }

    const updatedTaggedUsers = friends.filter(friend =>
      mentionedIds.includes(friend._id)
    );
    setTaggedUsers(updatedTaggedUsers);

    const restaurantCount = updatedTaggedUsers.filter(user => user.userType === 'restaurant').length;
    if (restaurantCount > 1) {
      setErrorMessage('You can only tag at most one restaurant in a post.');
    } else {
      setErrorMessage('');
    }
  };

  useEffect(() => {
    return () => {
      // Chỉ revoke khi component unmount hoặc khi reset hoàn toàn
      if (step === 1) {
        images.forEach(img => URL.revokeObjectURL(img));
        croppedImages.forEach(img => URL.revokeObjectURL(img));
      }
    };
  }, [images, croppedImages, step]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImages(previewUrls);
      setCroppedImages([]); // Reset cropped images
      setCroppedFiles([]); // Reset cropped files
      setCurrentImageIndex(0); // Reset index
      setStep(2);
      e.target.value = null;
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const fileName = `cropped_${Date.now()}.jpg`;
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
        const croppedUrl = URL.createObjectURL(blob);
        resolve({ croppedFile, croppedUrl });
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      const { croppedFile, croppedUrl } = await getCroppedImg(imageRef, crop);

      // Cập nhật mảng croppedFiles và croppedImages
      setCroppedFiles(prev => {
        const newCroppedFiles = [...prev];
        newCroppedFiles[currentImageIndex] = croppedFile;
        return newCroppedFiles;
      });

      setCroppedImages(prev => {
        const newCroppedImages = [...prev];
        newCroppedImages[currentImageIndex] = croppedUrl;
        return newCroppedImages;
      });

      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setCrop({ aspect: 1, unit: '%', width: 100, height: 100 }); // Reset crop cho ảnh tiếp theo
      } else {
        // Đảm bảo mảng croppedImages và croppedFiles có đủ phần tử
        setCroppedImages(prev => prev.filter(Boolean)); // Loại bỏ các phần tử undefined/null
        setCroppedFiles(prev => prev.filter(Boolean));
        setCurrentImageIndex(0); // Reset index khi chuyển sang step 3
        setStep(3);
      }
    }
  };

  const onImageLoaded = (img) => {
    setImageRef(img);
  };

  const handleBackFromCrop = () => {
    setStep(1);
    images.forEach(img => URL.revokeObjectURL(img));
    setImages([]);
    setFiles([]);
    setCroppedImages([]);
    setCroppedFiles([]);
    setCurrentImageIndex(0);
  };

  const handleBackFromContent = () => {
    setStep(2);
    croppedImages.forEach(img => URL.revokeObjectURL(img));
    setCroppedImages([]);
    setCroppedFiles([]);
    setValue('content', '');
    setCurrentImageIndex(0);
    setErrorMessage('');
    setAddress('');
    setLocation(null);
    setShowLocationInput(false);
    setLocationSuggestions([]);
  };

  const handleCancelImage = () => {
    images.forEach(img => URL.revokeObjectURL(img));
    croppedImages.forEach(img => URL.revokeObjectURL(img));
    setImages([]);
    setFiles([]);
    setCroppedImages([]);
    setCroppedFiles([]);
    setRating(0);
    setTaggedUsers([]);
    setStep(1);
    setCurrentImageIndex(0);
    setErrorMessage('');
    setAddress('');
    setLocation(null);
    setShowLocationInput(false);
    setLocationSuggestions([]);
  };

  const fetchLocationSuggestions = useCallback(async (input) => {
    if (!input) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setLocationSuggestions(data.predictions.map(prediction => ({
          description: prediction.description,
          structured_formatting: prediction.structured_formatting,
          place_id: prediction.place_id,
        })));
      } else {
        setLocationSuggestions([]);
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm gợi ý địa điểm:', error);
      setLocationSuggestions([]);
    }
  }, [GOONG_PLACES_API_KEY]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLocationSuggestions(address);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [address, fetchLocationSuggestions]);

  const handleSelectLocation = (suggestion) => {
    setLocation({
      address: suggestion.description,
      coordinates: null,
    });
    setAddress(suggestion.description);
    setLocationSuggestions([]);

    fetchPlaceDetails(suggestion.place_id);
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.result.geometry.location) {
        setLocation(prev => ({
          ...prev,
          coordinates: {
            lat: data.result.geometry.location.lat,
            lng: data.result.geometry.location.lng,
          },
        }));
      }
    } catch (error) {
      console.error('Lỗi lấy chi tiết địa điểm:', error);
    }
  };

  const onSubmit = async (data) => {
    const restaurantCount = taggedUsers.filter(user => user.userType === 'restaurant').length;
    if (restaurantCount > 1) {
      setErrorMessage('You can only tag at most one restaurant in a post.');
      return;
    }

    if (!user?._id) {
      alert('User not found. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('userId', user._id);
    if (adsEnabled) {
      formData.append('is_ad', true);
    }
    if (rating > 0) {
      formData.append('rating', rating);
    }

    if (location && location.coordinates) {
      formData.append('location', JSON.stringify(location));
    }

    formData.append('taggedUsers', JSON.stringify(taggedUsers.map(u => ({ id: u._id, username: u.username }))));

    croppedFiles.forEach((file, index) => {
      const renamedFile = new File(
        [file],
        `image_${Date.now()}_${index}.${file.name.split('.').pop()}`,
        { type: file.type }
      );
      formData.append('images', renamedFile);
    });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000);
      });
      await Promise.race([
        dispatch(createPostAsync(formData)).unwrap(),
        timeoutPromise,
      ]);
      await dispatch(getPostsAsync()).unwrap();
      setValue('content', '');
      setImages([]);
      setFiles([]);
      setCroppedImages([]);
      setCroppedFiles([]);
      setRating(0);
      setTaggedUsers([]);
      setStep(1);
      setCurrentImageIndex(0);
      setErrorMessage('');
      setAddress('');
      setLocation(null);
      setShowLocationInput(false);
      setLocationSuggestions([]);
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleAddMention = (id, display) => {
    const selectedUser = friends.find(friend => friend._id === id);
    if (selectedUser && !taggedUsers.some(u => u._id === id)) {
      const newTaggedUsers = [...taggedUsers, selectedUser];
      setTaggedUsers(newTaggedUsers);

      const restaurantCount = newTaggedUsers.filter(user => user.userType === 'restaurant').length;
      if (restaurantCount > 1) {
        setErrorMessage('You can only tag at most one restaurant in a post.');
      } else {
        setErrorMessage('');
      }
    }
  };

  const handleOpenEmojiPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji, field) => {
    setValue('content', field.value + emoji.native);
    updateTaggedUsersFromContent(field.value + emoji.native);
    handleCloseEmojiPicker();
  };

  const openEmojiPicker = Boolean(anchorEl);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '900px',
          height: '600px',
          borderRadius: '10px',
        },
      }}
    >
      {step === 1 ? (
        <>
          <DialogTitle sx={{ textAlign: 'center' }}>Create new post</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box>
              <CloudUploadIcon sx={{ fontSize: 100, color: 'gray', marginBottom: 2 }} />
              <Typography variant="body1" gutterBottom>
                Drag photos and videos here
              </Typography>
              <Button variant="contained" component="label" disabled={loading}>
                Select from computer
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
          </DialogContent>
        </>
      ) : step === 2 ? (
        <>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={handleBackFromCrop} disabled={loading}>
              <ArrowBackIcon />
            </IconButton>
            <Typography>Crop image {currentImageIndex + 1} of {images.length}</Typography>
            <Button onClick={handleCropComplete} color="primary" disabled={loading}>
              {currentImageIndex < images.length - 1 ? 'Next Image' : 'Finish Cropping'}
            </Button>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 0 }}>
            <Box sx={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {images[currentImageIndex] && (
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  aspect={1}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={`Crop ${currentImageIndex}`}
                    onLoad={(e) => onImageLoaded(e.currentTarget)}
                  />
                </ReactCrop>
              )}
            </Box>
          </DialogContent>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={handleBackFromContent} disabled={loading}>
              <ArrowBackIcon />
            </IconButton>
            <Typography>Create new post</Typography>
            <Button type="submit" color="primary" disabled={loading || errorMessage}>
              {loading ? 'Sharing...' : 'Share'}
            </Button>
          </DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              p: 0,
              height: 'calc(100% - 64px)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                flex: 1,
                p: 0,
                position: 'relative',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                {croppedImages.length > 0 && (
                  <>
                    <img
                      src={croppedImages[currentImageIndex]}
                      alt={`Cropped ${currentImageIndex}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    {croppedImages.length > 1 && (
                      <>
                        <IconButton
                          onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : croppedImages.length - 1))}
                          sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'white' }}
                          disabled={loading}
                        >
                          ◀
                        </IconButton>
                        <IconButton
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % croppedImages.length)}
                          sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'white' }}
                          disabled={loading}
                        >
                          ▶
                        </IconButton>
                      </>
                    )}
                  </>
                )}
                {croppedImages.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelImage}
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                    disabled={loading}
                  >
                    Cancel Images
                  </Button>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={user?.avatar} alt={user?.username} />
                  <Typography variant="subtitle1">{user?.username}</Typography>
                </Stack>
                <Controller
                  name="content"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Content is required' }}
                  render={({ field }) => (
                    <>
                      <MentionsInput
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateTaggedUsersFromContent(e.target.value);
                        }}
                        style={mentionStyle}
                        placeholder="Write a caption..."
                        disabled={loading}
                        className="mentions-input"
                      >
                        <Mention
                          trigger="@"
                          data={mentionUsers}
                          onAdd={handleAddMention}
                          markup="@[__display__](__id__)"
                          displayTransform={(id, display) => `@${display}`}
                          style={{ backgroundColor: '#d1eaff' }}
                        />
                        <Mention
                          trigger="#"
                          data={availableTags}
                          markup="#[__display__](__id__)"
                          displayTransform={(id, display) => `#${display}`}
                          style={{ backgroundColor: '#d1eaff' }}
                        />
                      </MentionsInput>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton onClick={handleOpenEmojiPicker} sx={{ color: 'grey.500' }}>
                          <EmojiEmotionsOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>
                      <Popover
                        open={openEmojiPicker}
                        anchorEl={anchorEl}
                        onClose={handleCloseEmojiPicker}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <Picker data={data} onEmojiSelect={(emoji) => handleEmojiSelect(emoji, field)} />
                      </Popover>
                    </>
                  )}
                />
                {errors.content && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errors.content.message}
                  </Typography>
                )}
                {errorMessage && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Rate this post</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        sx={{ p: 0, mr: 1 }}
                      >
                        {rating >= star ? (
                          <StarIcon sx={{ color: '#f5c518' }} />
                        ) : (
                          <StarBorderIcon sx={{ color: '#f5c518' }} />
                        )}
                      </IconButton>
                    ))}
                    <Typography sx={{ ml: 1 }}>{rating}/5</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Button
                    variant="text"
                    color="primary"
                    disabled={loading}
                    onClick={() => setShowLocationInput(!showLocationInput)}
                  >
                    Add location
                  </Button>
                  {showLocationInput && (
                    <Box sx={{ mt: 1, width: '100%' }}>
                      <TextField
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ..."
                        size="small"
                        sx={{ flex: 1, mb: 1 }}
                        autoFocus
                      />
                      {locationSuggestions.length > 0 && (
                        <List sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #ccc' }}>
                          {locationSuggestions.map((suggestion, index) => (
                            <ListItem
                              button
                              key={index}
                              onClick={() => handleSelectLocation(suggestion)}
                            >
                              <ListItemText
                                primary={suggestion.description}
                                secondary={suggestion.structured_formatting.main_text}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                  {location && location.coordinates && (
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Đã chọn: {location.address} (lat: {location.coordinates.lat}, lng: {location.coordinates.lng})
                    </Typography>
                  )}
                  <Button variant="text" color="primary" disabled={loading}>
                    Add collaborators
                  </Button>
                  <Button variant="text" color="primary" disabled={loading}>
                    Share to
                  </Button>
                  {user.usertype === 'restaurant' && (
                    <FormControlLabel
                      control={<Switch checked={adsEnabled} onChange={(e) => setAdsEnabled(e.target.checked)} />}
                      label="Turn on ads"
                    />
                  )}
                </Box>
              </Box>
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error.message || 'An error occurred'}
                </Typography>
              )}
            </Box>
          </DialogContent>
        </form>
      )}
    </Dialog>
  );
};

export default CreatePost;