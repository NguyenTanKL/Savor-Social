import React from "react";
import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
import "./NotificationItem.css";

function NotificationItem({ user, action, time, type, avatar, following }) {
  const renderActionButton = () => {
    if (type === "follow") {
      return following ? (
        <Button variant="outlined" size="small" className="follow-btn">
          Following
        </Button>
      ) : (
        <Button variant="contained" size="small" className="follow-btn">
          Follow
        </Button>
      );
    }
    return null;
  };

  return (
    <ListItem className="notification-item">
      <ListItemAvatar>
        <Avatar src={avatar} />
      </ListItemAvatar>
      <ListItemText
        primary={`${user} ${action}`}
        secondary={time}
      />
      {renderActionButton()}
    </ListItem>
  );
}

export default NotificationItem;
