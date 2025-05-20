import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import "./FriendCard.css"; // Import CSS

const FriendCard = ({ friendInfo, onUserClick }) => {
  const [isFollowing, setIsFollowing] = useState(false);
console.log("friendcard:",friendInfo);
  const handleClick = (e) => {
    e.preventDefault(); // Ngăn điều hướng mặc định
    if (onUserClick) {
      onUserClick(friendInfo._id); // Gọi onUserClick với userId
    }
  };

  return (
    <div className="friend-card" onClick={handleClick}>
      <div className="friend-left">
        <Avatar
          src={friendInfo.avatar}
          alt="Avatar"
          className="friend-avatar"
        >
          {friendInfo.username?.charAt(0).toUpperCase()}
        </Avatar>

        <div className="friend-info">
          <span className="friend-username">{friendInfo.username}</span>
          <span className="friend-nickname">{friendInfo.nickname}</span>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;