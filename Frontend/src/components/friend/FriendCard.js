import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import "./FriendCard.css"; // Import CSS

const FriendCard = ({ friendInfo, onFollow, isFollowed }) => {
  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed); // Cập nhật trạng thái khi prop thay đổi
  }, [isFollowed]);

  const handleFollowClick = async (e) => {
    e.preventDefault(); // Ngăn chặn Link bị click khi bấm vào nút
    const success = await onFollow();
    if (success) {
      setIsFollowing((prev) => !prev);
    }
  };

  return (
    <Link to={`/profile/${friendInfo._id}`} className="friend-card">
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

      
    </Link>
  );
};

export default FriendCard;
