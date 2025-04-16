// src/pages/createPost/CreatePage.js
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { createPostAsync } from '../../redux/Reducer/postSlice';
const CreatePost = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { loading, error } = useSelector((state) => state.posts);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    mode: "onChange",
  });

  // Hủy URL tạm khi component unmount hoặc ảnh thay đổi
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setImage(previewUrl);
      setStep(2);
      e.target.value = null; // Reset input file
    }
  };

  const handleBack = () => {
    setStep(1);
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setFile(null);
    setValue("content", ""); // Reset content
  };

  const handleCancelImage = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setFile(null);
    setStep(1);
  };

  const onSubmit = async (data) => {
    if (!user?._id) {
      alert("User not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('userId', user._id);

    if (file) {
        const renamedFile = new File([file], `image_${Date.now()}.${file.name.split('.').pop()}`, { type: file.type });
        formData.append("image", renamedFile);
    }

    // Log form data để kiểm tra
    console.log("FormData values:", [...formData.entries()]);

    try {
        console.log("File in FormData:", formData.get("image"));

        await dispatch(createPostAsync(formData)).unwrap();
        setValue("content", "");
        setImage(null);
        setFile(null);
        setStep(1);
        onClose();
    } catch (err) {
        console.error("Error creating post:", err);
        alert("Failed to create post. Please try again.");
    }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
            </Box>
          </DialogContent>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={handleBack} disabled={loading}>
              <ArrowBackIcon />
            </IconButton>
            <Typography>Create new post</Typography>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Sharing..." : "Share"}
            </Button>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', p: 0 }}>
            <Box sx={{ flex: 2, p: 2, position: 'relative' }}>
              {image && <img src={image} alt="Selected" style={{ width: '100%', height: 'auto' }} />}
              {image && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancelImage}
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                  disabled={loading}
                >
                  Cancel Image
                </Button>
              )}
            </Box>
            <Box sx={{ flex: 1, p: 2 }}>
              <Typography variant="subtitle1">
                {user?.firstName} {user?.lastName}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write a content..."
                {...register("content", { required: "content is required" })}
                error={!!errors.content}
                helperText={errors.content?.message}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <Button variant="text" color="primary" disabled={loading}>
                Add location
              </Button>
              <Button variant="text" color="primary" disabled={loading}>
                Add collaborators
              </Button>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Share to</Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={`${user?.firstName} - Threads - Public`}
                  disabled={loading}
                />
                <FormControlLabel control={<Switch />} label="Huy Thái" disabled={loading} />
                <FormControlLabel control={<Switch />} label="Facebook - Public" disabled={loading} />
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