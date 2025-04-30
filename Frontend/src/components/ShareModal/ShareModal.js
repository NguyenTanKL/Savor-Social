import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import "./ShareModal.css";
import {  useSelector } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

const CHAT_API_URL = "http://localhost:5000/api/chats";

const ShareModal = ({ open, onClose, postId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user.user);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async (sender, receiver) => {
      if (!window.confirm("Are you sure you want to share this post?")) return;
      setNewMessage("http://localhost:3000/post/" + postId);
      if (!newMessage.trim()) return;

      try {
          const formData = new FormData();
          formData.append("sender", sender);
          formData.append("receiver", receiver);
          formData.append("message", newMessage);

          // Emit to socket (you can send a separate socket event or wait for server response)
          socket.emit("sendMessage", {
              sender,
              receiver: receiver,
              message: newMessage,
          });

          const response = await axios.post(`${CHAT_API_URL}/send`, formData, {
              headers: {
                  "Content-Type": "multipart/form-data"
              }
          });

          if (response.data.success) {
              alert("Đã chia sẻ bài viết thành công!");
              setNewMessage(""); // Clear input after sending
          }
      } catch (error) {
          console.error("Error sending message:", error);
      }
  };

  // Gọi API để lấy danh sách người dùng đang follow khi modal mở
  useEffect(() => {
    if (open) {
      const fetchFollowingUsers = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem("token"); // Giả định token được lưu trong localStorage
          if (!token) {
            throw new Error("Token không tồn tại");
          }

          const response = await fetch(`http://localhost:5000/api/user/following/${currentUser._id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Lỗi khi lấy danh sách following");
          }

          const data = await response.json();
          setFollowingUsers(data); // Dữ liệu từ API (mảng các user với _id, username, avatar)
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchFollowingUsers();
    }
  }, [open]);

  // Lọc danh sách người dùng theo tìm kiếm
  const filteredUsers = followingUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="share-modal">
        <Box className="share-modal-header">
          <Typography variant="h6" component="h2">
            Share
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <InputBase
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="share-modal-search"
        />

        <Box className="share-modal-users">
          {loading && <Typography variant="body2">Đang tải...</Typography>}
          {error && <Typography variant="body2" color="error">{error}</Typography>}
          {!loading && !error && filteredUsers.length === 0 && (
            <Typography variant="body2">Không có người dùng nào.</Typography>
          )}
          {!loading &&
            !error &&
            filteredUsers.map((user) => (
              <Box key={user._id} className="share-modal-user">
                <Avatar 
                  onClick={() => handleSendMessage(currentUser._id, user._id)} 
                  src={user.avatar} 
                  className="share-modal-avatar"
                  style={{ cursor: "pointer" }}
                />
                <Typography variant="caption">{user.username}</Typography>
              </Box>
            ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default ShareModal;