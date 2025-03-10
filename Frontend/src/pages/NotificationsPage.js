import React from "react";
import NotificationItem from "../components/NotificationItem.js";
import "./NotificationsPage.css";

const notifications = [
  { id: 1, user: "_dangnguyen", action: "liked your post.", time: "6d", type: "like", avatar: "https://via.placeholder.com/40" },
  { id: 2, user: "_danghjl", action: "liked your post.", time: "6d", type: "like", avatar: "https://via.placeholder.com/40" },
  { id: 3, user: "_rincoi", action: "started following you.", time: "2w", type: "follow", avatar: "https://via.placeholder.com/40", following: false },
  { id: 4, user: "_huy", action: "started following you.", time: "2w", type: "follow", avatar: "https://via.placeholder.com/40", following: true },
];

function NotificationsPage() {
  return (
    <div className="notification__tab">
      <div className="tab__header">
        <span>Notifications</span>
      </div>
      <div className="notification__content">
        <div className="time__notification">
          <span>This month</span>
        </div>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} {...notification} />
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
