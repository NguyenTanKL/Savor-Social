import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useForm, Controller } from 'react-hook-form';
import { createPostAsync, getPostsAsync } from '../../redux/Reducer/postSlice';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MentionsInput, Mention } from 'react-mentions';

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
  const [errorMessage, setErrorMessage] = useState(''); // Thêm state để hiển thị lỗi
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { loading, error } = useSelector((state) => state.posts);

  const following = Array.isArray(user?.following) ? user.following : [];
  const followers = Array.isArray(user?.followers) ? user.followers : [];
  const friends = [...new Set([...following, ...followers].map(f => JSON.stringify(f)))].map(f => JSON.parse(f));

  const mentionUsers = friends
    .filter(friend => friend && friend._id && friend.username)
    .map(friend => ({
      id: friend._id,
      display: friend.username,
    }));

  const suggestedTags = [
    'donhat',
    'monan',
    'pho',
    'banhmi',
    'anvat',
    'doauong',
    'monchay',
    'haisan',
  ];

  const mentionTags = suggestedTags.map(tag => ({
    id: tag,
    display: tag,
  }));

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    mode: "onChange",
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

    // Kiểm tra số lượng tài khoản restaurant trong taggedUsers
    const restaurantCount = updatedTaggedUsers.filter(user => user.userType === 'restaurant').length;
    if (restaurantCount > 1) {
      setErrorMessage('You can only tag at most one restaurant in a post.');
    } else {
      setErrorMessage('');
    }
  };

  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img));
      croppedImages.forEach(img => URL.revokeObjectURL(img));
    };
  }, [images, croppedImages]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImages(previewUrls);
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
      const newCroppedFiles = [...croppedFiles];
      const newCroppedImages = [...croppedImages];

      newCroppedFiles[currentImageIndex] = croppedFile;
      newCroppedImages[currentImageIndex] = croppedUrl;

      setCroppedFiles(newCroppedFiles);
      setCroppedImages(newCroppedImages);

      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
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
    setCurrentImageIndex(0);
  };

  const handleBackFromContent = () => {
    setStep(2);
    croppedImages.forEach(img => URL.revokeObjectURL(img));
    setCroppedImages([]);
    setCroppedFiles([]);
    setValue("content", "");
    setCurrentImageIndex(0);
    setErrorMessage(''); // Xóa thông báo lỗi khi quay lại
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
    setErrorMessage(''); // Xóa thông báo lỗi khi hủy
  };

  const onSubmit = async (data) => {
    // Kiểm tra lại taggedUsers trước khi gửi
    const restaurantCount = taggedUsers.filter(user => user.userType === 'restaurant').length;
    if (restaurantCount > 1) {
      setErrorMessage('You can only tag at most one restaurant in a post.');
      return;
    }

    if (!user?._id) {
      alert("User not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('userId', user._id);
    if (rating > 0) {
      formData.append('rating', rating);
    }

    formData.append('taggedUsers', JSON.stringify(taggedUsers.map(u => ({ id: u._id, username: u.username }))));

    croppedFiles.forEach((file, index) => {
      const renamedFile = new File(
        [file],
        `image_${Date.now()}_${index}.${file.name.split('.').pop()}`,
        { type: file.type }
      );
      formData.append("images", renamedFile);
    });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 30000);
      });
      await Promise.race([
        dispatch(createPostAsync(formData)).unwrap(),
        timeoutPromise,
      ]);
      await dispatch(getPostsAsync()).unwrap();
      setValue("content", "");
      setImages([]);
      setFiles([]);
      setCroppedImages([]);
      setCroppedFiles([]);
      setRating(0);
      setTaggedUsers([]);
      setStep(1);
      setCurrentImageIndex(0);
      setErrorMessage('');
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
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

      // Kiểm tra sau khi thêm
      const restaurantCount = newTaggedUsers.filter(user => user.userType === 'restaurant').length;
      if (restaurantCount > 1) {
        setErrorMessage('You can only tag at most one restaurant in a post.');
      } else {
        setErrorMessage('');
      }
    }
  };

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
              <CloudUploadIcon sx={{ fontSize: 100, color: "gray", marginBottom: 2 }} />
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
              {loading ? "Sharing..." : "Share"}
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
              {croppedImages.length > 0 && (
                <img
                  src={croppedImages[0]}
                  alt="Cropped"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
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
                  <Avatar />
                  <Typography variant="subtitle1">
                    {user?.username}
                  </Typography>
                </Stack>
                <Controller
                  name="content"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Content is required" }}
                  render={({ field }) => (
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
                        data={mentionTags}
                        markup="#[__display__](__id__)"
                        displayTransform={(id, display) => `#${display}`}
                        style={{ backgroundColor: '#d1eaff' }}
                      />
                    </MentionsInput>
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
                <Box sx={{ display: 'flex', flexDirection: "column" }}>
                  <Button variant="text" color="primary" disabled={loading}>
                    Add location
                  </Button>
                  <Button variant="text" color="primary" disabled={loading}>
                    Add collaborators
                  </Button>
                  <Button variant="text" color="primary" disabled={loading}>
                    Share to
                  </Button>
                </Box>
              </Box>
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error.message || "An error occurred"}
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