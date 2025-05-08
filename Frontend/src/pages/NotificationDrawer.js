import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import NotificationItem from "../components/NotificationItem";
import axios from "axios";
import { isToday, isThisWeek, isThisMonth, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import "./NotificationDrawer.css";
import { BACKENDURL } from "../utils/const";

function NotificationDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userFromStorage = localStorage.getItem("user");
  const user = userFromStorage ? JSON.parse(userFromStorage) : null;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) {
        setError("Vui lòng đăng nhập để xem thông báo");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${BACKENDURL}/api/notifications/${user._id}`);
        setNotifications(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
        setError("Không thể tải thông báo. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user?._id]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${BACKENDURL}/api/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.postId?._id) {
      navigate(`/post/${notification.postId._id}`);
    }
    onClose();
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
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          left: "16.67%", // Tương ứng với md={2} trong Grid (2/12 = 16.67%)
          width: "460px",
          top: 0,
          height: "100vh",
        },
      }}
      ModalProps={{
        BackdropProps: {
          style: { backgroundColor: "transparent" }, // Tắt màu mờ của backdrop
        },
        
      }}
    >
      <div className="notification-drawer">
        <div className="drawer-header">
          <h2>Notifications</h2>
        </div>
        <div className="notification-content">
          {loading && <div className="loading">Đang tải thông báo...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && notifications.length === 0 && (
            <p className="no-notifications">Không có thông báo nào</p>
          )}
          {!loading && !error && Object.entries(grouped).map(([label, group]) =>
            group.length > 0 && (
              <div key={label} className="notification-group">
                <h4 className="group-label">
                  {label === "Today" ? "Hôm nay" : label === "This Week" ? "Tuần này" : label === "This Month" ? "Tháng này" : "Cũ hơn"}
                </h4>
                {group.map((notification) => {
                  const isPostRelated = ["like", "comment", "tag", "reply"].includes(notification.type);
                  return (
                    <NotificationItem
                      key={notification._id}
                      id={notification._id}
                      message={notification.message}
                      avatar={notification.senderId?.avatar}
                      username={notification.senderId?.username}
                      senderId={notification.senderId?._id}
                      type={notification.type}
                      time={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                      postImage={isPostRelated && notification.postId?.images?.length > 0 ? notification.postId.images[0] : null}
                      isRead={notification.isRead}
                      hasPost={isPostRelated && !!notification.postId?._id}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={markAsRead}
                    />
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default NotificationDrawer;