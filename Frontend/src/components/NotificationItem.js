// import React from "react";
// import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
// import "./NotificationItem.css";

// function NotificationItem({ user, action, time, type, avatar, following }) {
//   const renderActionButton = () => {
//     if (type === "follow") {
//       return following ? (
//         <Button variant="outlined" size="small" className="follow-btn">
//           Following
//         </Button>
//       ) : (
//         <Button variant="contained" size="small" className="follow-btn">
//           Follow
//         </Button>
//       );
//     }
//     return null;
//   };

//   return (
//     <ListItem className="notification-item">
//       <ListItemAvatar>
//         <Avatar src={avatar} />
//       </ListItemAvatar>
//       <ListItemText
//         primary={`${user} ${action}`}
//         secondary={time}
//       />
//       {renderActionButton()}
//     </ListItem>
//   );
// }

// export default NotificationItem;


// import React from "react";
// import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
// import "./NotificationItem.css";

// function NotificationItem({
//   key,
//   username,
//   avatar,
//   type,
//   time,
//   posstImage,
//   isRead
// }) {
//   // Format time
//   const formattedTime = new Date(createdAt).toLocaleString();

//   // Render action based on notification type
//   const renderActionText = () => {
//     switch (type) {
//       case "like":
//         return "liked your post";
//       case "comment":
//         return "commented on your post";
//       case "follow":
//         return "started following you";
//       default:
//         return "";
//     }
//   };

//   const renderActionButton = () => {
//     if (type === "follow") {
//       return (
//         <Button variant="outlined" size="small" className="follow-btn">
//           Following
//         </Button>
//       );
//     }
//     return null;
//   };

//   return (
//     <ListItem className="notification-item">
//       <ListItemAvatar>
//         <Avatar src={avatarSender} />
//       </ListItemAvatar>
//       <ListItemText
//         primary={`${senderId.username} ${renderActionText()}`}
//         secondary={formattedTime}
//       />
//       {type === "like" && imgPost && (
//         <img
//           src={imgPost}
//           alt="Post image"
//           style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
//         />
//       )}
//       {renderActionButton()}
//     </ListItem>
//   );
// }

// export default NotificationItem;


// import React from "react";
// import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
// import "./NotificationItem.css";

// function NotificationItem({
//   username,
//   avatar,
//   type,
//   time,
//   postImage,
//   isRead,
//   following
// }) {
//   // Format time
//   const formattedTime = new Date(time).toLocaleString();

//   // Render action text
//   const renderActionText = () => {
//     switch (type) {
//       case "like":
//         return "liked your post";
//       case "comment":
//         return "commented on your post";
//       case "follow":
//         return "started following you";
//       default:
//         return "did something";
//     }
//   };

//   // Optional follow button
//   const renderActionButton = () => {
//     if (type === "follow") {
//       return following ? (
//         <Button variant="outlined" size="small" className="follow-btn">
//           Following
//         </Button>
//       ) : (
//         <Button variant="contained" size="small" className="follow-btn">
//           Follow
//         </Button>
//       );
//     }
//     return null;
//   };

//   return (
//     <ListItem className={`notification-item ${isRead ? "read" : "unread"}`}>
//       <ListItemAvatar>
//         <Avatar src={avatar} />
//       </ListItemAvatar>
//       <ListItemText
//         primary={`${username} ${renderActionText()}`}
//         secondary={formattedTime}
//       />
//       {type === "like" && postImage && (
//         <img
//           src={postImage}
//           alt="Post"
//           style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
//         />
//       )}
//       {renderActionButton()}
//     </ListItem>
//   );
// }

// export default NotificationItem;


import React from "react";
import { ListItem, ListItemAvatar, Avatar, ListItemText, Button } from "@mui/material";
import "./NotificationItem.css";

function NotificationItem({
  id,
  username,
  avatar,
  type,
  time,
  postImage,
  isRead,
  onMarkAsRead,
}) {
  const formattedTime = new Date(time).toLocaleString();

  const renderActionText = () => {
    switch (type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "mention": return "mentioned you in a comment";
      case "follow": return "started following you";
      default: return "did something";
    }
  };

  return (
    <ListItem className={`notification-item ${isRead ? "read" : "unread"}`}>
      <ListItemAvatar>
        <Avatar src={avatar} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <span className={isRead ? "read-text" : "unread-text"}>
            <strong>{username}</strong> {renderActionText()}
          </span>
        }
        secondary={formattedTime}
      />
      {type === "like" && postImage && (
        <img
          src={postImage}
          alt="Post"
          className="notification-image"
        />
      )}
      {!isRead && (
        <Button
          variant="text"
          size="small"
          className="mark-read-btn"
          onClick={() => onMarkAsRead(id)}
        >
          Mark as Read
        </Button>
      )}
    </ListItem>
  );
}

export default NotificationItem;
