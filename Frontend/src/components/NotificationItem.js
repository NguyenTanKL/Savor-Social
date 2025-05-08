import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
import { FaHeart, FaComment, FaUserPlus, FaTag, FaReply } from "react-icons/fa";
import { checkFollow, toggleFollow } from "../api/userApi";
import { updateUser } from "../redux/Reducer/userSlice";
import "./NotificationItem.css";

function NotificationItem({
  id,
  message,
  avatar,
  username,
  senderId,
  type,
  time,
  postImage,
  isRead,
  hasPost,
  onClick,
  onMarkAsRead,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    if (type === "follow" && senderId) {
      const fetchFollowStatus = async () => {
        const status = await checkFollow(senderId);
        setIsFollowing(status);
      };
      fetchFollowStatus();
    }
  }, [type, senderId]);

  const getIcon = () => {
    switch (type) {
      case "follow":
        return <FaUserPlus className="notification__icon" />;
      case "tag":
        return <FaTag className="notification__icon" />;
      case "like":
        return <FaHeart className="notification__icon" />;
      case "comment":
        return <FaComment className="notification__icon" />;
      case "reply":
        return <FaReply className="notification__icon" />;
      default:
        return null;
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (senderId) {
      navigate(`/profile/${senderId}`);
      if (!isRead) {
        onMarkAsRead(id);
      }
    }
  };

  const handleItemClick = (e) => {
    if (hasPost && onClick) {
      if (!isRead) {
        onMarkAsRead(id);
      }
      onClick(e);
    }
  };

  const handleToggleFollow = async (e) => {
    e.stopPropagation();
    if (senderId) {
      setLoadingFollow(true);
      try {
        await toggleFollow(senderId, isFollowing);
        setIsFollowing(!isFollowing);
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedFollowing = isFollowing
          ? user.following.filter((id) => id !== senderId)
          : [...user.following, senderId];
        dispatch(updateUser({ ...user, following: updatedFollowing }));
        localStorage.setItem("user", JSON.stringify({ ...user, following: updatedFollowing }));
      } catch (error) {
        console.error("Lỗi khi toggle follow:", error);
      } finally {
        setLoadingFollow(false);
      }
    }
  };

  return (
    <ListItem
      className={`notification-item ${isRead ? "read" : "unread"} ${hasPost ? "clickable" : ""}`}
      onClick={handleItemClick}
      sx={{ padding: "10px", borderRadius: "8px" }}
    >
      <ListItemAvatar>
        <Avatar
          src={avatar}
          alt="Avatar"
          sx={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={handleProfileClick}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <div className="notification__header">
            {getIcon()}
            <span
              className="notification__username"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            >
              {username || "Người dùng"}
            </span>
            <span className={isRead ? "read-text" : "unread-text"} style={{fontSize:"14px"}}> {message}</span>
          </div>
        }
        secondary={time}
        sx={{ marginRight: postImage || type === "follow" ? "60px" : "0" }}
      />
      {postImage && (
        <img src={postImage} alt="Post" className="notification-image" />
      )}
      {type === "follow" && (
        <Button
          variant={isFollowing ? "outlined" : "contained"}
          size="small"
          className="follow-btn"
          onClick={handleToggleFollow}
          disabled={loadingFollow}
          sx={{ position: "absolute", right: "10px" }}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </ListItem>
  );
}

export default NotificationItem;