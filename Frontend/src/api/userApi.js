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
          console.log("response.data.user",response.data.user);
          
          return response.data.user;
          
      
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
  