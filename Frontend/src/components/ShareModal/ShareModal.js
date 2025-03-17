import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar
} from "@mui/material";
import {
  Close,
} from "@mui/icons-material";
import "./ShareModal.css";

const ShareModal = ({ open, onClose, followingUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for following users (replace with real data from your app)
  const mockFollowingUsers = [
    { id: "1", username: "NN", avatar: "https://via.placeholder.com/40" },
    { id: "2", username: "iza_**_e9", avatar: "https://via.placeholder.com/40" },
    { id: "3", username: "Uyen Phuong", avatar: "https://via.placeholder.com/40" },
    { id: "4", username: "Hieu Lam", avatar: "https://via.placeholder.com/40" },
    { id: "5", username: "User 5", avatar: "https://via.placeholder.com/40" },
    { id: "6", username: "User 6", avatar: "https://via.placeholder.com/40" },
    { id: "7", username: "User 7", avatar: "https://via.placeholder.com/40" },
    { id: "8", username: "User 8", avatar: "https://via.placeholder.com/40" },
  ];

  const users = followingUsers || mockFollowingUsers;

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
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
          {filteredUsers.map((user, index) => (
            <Box key={user.id} className="share-modal-user">
              <Avatar src={user.avatar} className="share-modal-avatar" />
              <Typography variant="caption">{user.username}</Typography>
            </Box>
          ))}
        </Box>

      
       
      </Box>
    </Modal>
  );
};

export default ShareModal;