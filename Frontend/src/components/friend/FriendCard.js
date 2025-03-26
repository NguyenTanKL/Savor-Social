import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import "./FriendCard.css";

const FriendCard = ({ friendInfo, onFollow, isFollowed, onUserClick }) => {
  const [isFollowing, setIsFollowing] = useState(isFollowed);

  useEffect(() => {
    setIsFollowing(isFollowed); // Cập nhật trạng thái khi prop thay đổi
  }, [isFollowed]);

  const handleFollowClick = async (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan tỏa lên thẻ cha (friend-card)
    const success = await onFollow();
    if (success) {
      setIsFollowing((prev) => !prev);
    }
  };

  const handleCardClick = () => {
    if (onUserClick) {
      onUserClick(friendInfo._id); // Gọi onUserClick với userId
    }
  };

  return (
    <div className="friend-card" onClick={handleCardClick}>
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
      {onFollow && (
        <button
          className={`follow-button ${isFollowing ? "following" : "follow"}`}
          onClick={handleFollowClick}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

export default FriendCard;