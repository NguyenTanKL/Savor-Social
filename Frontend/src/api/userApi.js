import axios from "axios";

const API_URL = "http://localhost:5000/api/user";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
export const toggleFollow = async (targetUserId, isFollowing) => {
    
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
  