import axios from 'axios';
import { BACKENDURL } from '../utils/const';
// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: `${BACKENDURL}/api/tags`,
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
  export const addTag = (name) => api.post('/', { name });
  export const getTags = () => api.get('/');