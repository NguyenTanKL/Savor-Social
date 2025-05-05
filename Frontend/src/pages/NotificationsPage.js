import React, { useEffect, useState } from "react";
import NotificationItem from "../components/NotificationItem";
import axios from "axios";
import "./NotificationsPage.css";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { BACKENDURL } from "../utils/const";
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userFromStorage = localStorage.getItem("user");
  const user = userFromStorage ? JSON.parse(userFromStorage) : null;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BACKENDURL}/api/notifications/${user?._id}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${BACKENDURL}/api/notifications/read/${notificationId}`);
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
