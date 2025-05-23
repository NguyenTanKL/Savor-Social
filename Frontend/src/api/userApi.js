import axios from "axios";
import { BACKENDURL } from "../utils/const";
const API_URL = `${BACKENDURL}/api/user`;
const api = axios.create({
  baseURL: `${BACKENDURL}/api/user`, // Base URL cho các API user
});
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const toggleFollow = async (targetUserId, isFollowing) => {
  const userFromStorage = localStorage.getItem("user");
    let user_
    let userId_
    if (userFromStorage) {
        user_ = JSON.parse(userFromStorage); // Chuyển từ JSON string thành object
        userId_ = user_._id; // Lấy id từ object
    } else {
        console.log("Không tìm thấy user trong localStorage");
    }
  
  const url = `${API_URL}/${isFollowing ? "unfollow" : "follow"}/${targetUserId}`;
  try {
    const response = await axios({
      method: isFollowing ? "DELETE" : "POST",
      url,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;


  } catch (error) {
    console.error("Lỗi khi cập nhật follow status:", error);
    return isFollowing; // Giữ nguyên trạng thái nếu lỗi xảy ra
  }
};
  export const removeFollower = async (followerId) => {
    const url = `${API_URL}/remove-follower/${followerId}`;
    try {
      const response = await axios({
        method: "DELETE",
        url,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return {
        followers: response.data.followers,
        followerCount: response.data.followerCount,
      };
    } catch (error) {
      console.error("Lỗi khi xóa follower:", error);
      throw error;
    }
  };
  export const checkFollow = async (targetUserId) => {
    const url = `${API_URL}/check-follow/${targetUserId}`;
    try {
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data.isFollowing;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái follow:", error);
      throw error;
    }
  };
  export const getFriends = () => api.get("/friends");
  export const updatePreferences = (preferences) => api.put('/preferences', { preferences });
  
  