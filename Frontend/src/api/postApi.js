// src/api/postApi.js
import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'https://savor-social-es5s.onrender.com/api',
});

// Interceptor để thêm token vào header (sẽ được áp dụng cho tất cả API)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi (ví dụ: token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

// Các API liên quan đến bài viết
export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPosts = () => api.get('/posts');
export const updatePost = (postId, data) =>
  api.put(`/posts/${postId}`, data);
export const deletePost = (postId, userId) =>
  api.request({
    method: "DELETE",
    url: `/posts/${postId}`,
    data: { userId },
  });

export const likePost = (postId, userId) =>
  api.post('/posts/like', { postId, userId });

export const unlikePost = (postId, userId) =>
  api.post('/posts/unlike', { postId, userId });

export const getComments = (postId) => api.get(`/posts/${postId}/comments`);

export const createComment = (commentData) =>
  api.post('/posts/comments', commentData);
export const createReply = (replyData) =>
  api.post('/posts/comments/replies', replyData);
export const likeComment = (data) => 
  api.post('/posts/likeComment', data);
export const unlikeComment = (data) => 
  api.post('/posts/unlikeComment', data);
export const getPostById = (postId) =>
  api.get(`/posts/info/${postId}`);
export const getRecommendedPosts = (config) => 
  api.get('/posts/recommended', config);