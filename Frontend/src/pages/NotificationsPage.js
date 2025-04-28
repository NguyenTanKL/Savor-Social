// import React from "react";
// import NotificationItem from "../components/NotificationItem.js";
// import "./NotificationsPage.css";

// const notifications = [
//   { id: 1, user: "_dangnguyen", action: "liked your post.", time: "6d", type: "like", avatar: "https://via.placeholder.com/40" },
//   { id: 2, user: "_danghjl", action: "liked your post.", time: "6d", type: "like", avatar: "https://via.placeholder.com/40" },
//   { id: 3, user: "_rincoi", action: "started following you.", time: "2w", type: "follow", avatar: "https://via.placeholder.com/40", following: false },
//   { id: 4, user: "_huy", action: "started following you.", time: "2w", type: "follow", avatar: "https://via.placeholder.com/40", following: true },
// ];

// function NotificationsPage() {
//   return (
//     <div className="notification__tab">
//       <div className="tab__header">
//         <span>Notifications</span>
//       </div>
//       <div className="notification__content">
//         <div className="time__notification">
//           <span>This month</span>
//         </div>
//         {notifications.map((notification) => (
//           <NotificationItem key={notification.id} {...notification} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default NotificationsPage;


// import React, { useEffect, useState } from "react";
// import NotificationItem from "../components/NotificationItem";
// import axios from "axios";
// import "./NotificationsPage.css";
// import { isToday, isThisWeek, isThisMonth } from "date-fns";

// function NotificationsPage() {
//   const [notifications, setNotifications] = useState([]);
//   const userFromStorage = localStorage.getItem("user");
//   let user_
//   let userId_
//   if (userFromStorage) {
//     user_ = JSON.parse(userFromStorage); // Chuyển từ JSON string thành object
//     userId_ = user_._id; // Lấy id từ object
//     console.log("User ID:", userId_);
//   } else {
//     console.log("Không tìm thấy user trong localStorage");
//   }
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/notifications/${userId_}`);
//         console.log("Thông báo:", res.data);
//         setNotifications(res.data);
//       } catch (error) {
//         console.error("Lỗi khi lấy thông báo:", error);
//       }
//     };
//     fetchNotifications();
//   }, []);



//   const groupNotificationsByTime = (notifications) => {
//     const groups = {
//       Today: [],
//       "This Week": [],
//       "This Month": [],
//       Earlier: [],
//     };

//     notifications.forEach((notification) => {
//       const createdAt = new Date(notification.createdAt);

//       if (isToday(createdAt)) {
//         groups["Today"].push(notification);
//       } else if (isThisWeek(createdAt)) {
//         groups["This Week"].push(notification);
//       } else if (isThisMonth(createdAt)) {
//         groups["This Month"].push(notification);
//       } else {
//         groups["Earlier"].push(notification);
//       }
//     });

//     return groups;
//   };

//   const grouped = groupNotificationsByTime(notifications);

//   return (
//     <div className="notification__tab">
//       <div className="tab__header">
//         <span>Notifications</span>
//       </div>
//       <div className="notification__content">
//         {Object.entries(grouped).map(([label, items]) =>
//           items.length > 0 ? (
//             <div key={label} className="notification__group">
//               <div className="time__notification">
//                 <span>{label}</span>
//               </div>
//               {items.map((notification) => (
//                 <NotificationItem
//                   key={notification._id}
//                   username={notification.senderId?.username}
//                   avatar={notification.senderId?.avatar}
//                   type={notification.type}
//                   time={notification.createdAt}
//                   postImage={notification.postId?.images?.[0]}
//                   isRead={notification.isRead}
//                   following={false}
//                 />
//               ))}
//             </div>
//           ) : null
//         )}
//       </div>
//     </div>
//   );
// }

// export default NotificationsPage;


import React, { useEffect, useState } from "react";
import NotificationItem from "../components/NotificationItem";
import axios from "axios";
import "./NotificationsPage.css";
import { isToday, isThisWeek, isThisMonth } from "date-fns";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userFromStorage = localStorage.getItem("user");
  const user = userFromStorage ? JSON.parse(userFromStorage) : null;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/notifications/${user?._id}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  const groupNotificationsByTime = () => {
    const groups = {
      Today: [],
      "This Week": [],
      "This Month": [],
      Earlier: [],
    };

    notifications.forEach((notification) => {
      const createdAt = new Date(notification.createdAt);
      if (isToday(createdAt)) groups["Today"].push(notification);
      else if (isThisWeek(createdAt)) groups["This Week"].push(notification);
      else if (isThisMonth(createdAt)) groups["This Month"].push(notification);
      else groups["Earlier"].push(notification);
    });

    return groups;
  };

  const grouped = groupNotificationsByTime();

  return (
    <div className="notification__tab">
      <div className="tab__header">
        <h2>Notifications</h2>
      </div>
      <div className="notification__content">
        {Object.entries(grouped).map(([label, group]) => (
          group.length > 0 && (
            <div key={label} className="notification__group">
              <h4 className="group__label">{label}</h4>
              {group.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  id={notification._id}
                  username={notification.senderId?.username}
                  avatar={notification.senderId?.avatar}
                  type={notification.type}
                  time={notification.createdAt}
                  postImage={notification.postId?.images?.[0]}
                  isRead={notification.isRead}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
