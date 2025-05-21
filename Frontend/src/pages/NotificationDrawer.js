import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, Button } from "@mui/material";
import NotificationItem from "../components/NotificationItem";
import axios from "axios";
import { isToday, isThisWeek, isThisMonth, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import "./NotificationDrawer.css";
import { BACKENDURL } from "../utils/const";

function NotificationDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]); // Thông báo hiển thị
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn thông báo để tải thêm không
  const userFromStorage = localStorage.getItem("user");
  const user = userFromStorage ? JSON.parse(userFromStorage) : null;
  const navigate = useNavigate();
  const observer = useRef(); // Dùng để infinite scroll

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
        const sortedNotifications = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sortedNotifications);
        // Hiển thị 10 thông báo đầu tiên ban đầu
        setDisplayedNotifications(sortedNotifications.slice(0, 10));
        setHasMore(sortedNotifications.length > 10);
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
      setDisplayedNotifications((prev) =>
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

    // Ưu tiên thông báo chưa đọc
    const sortedDisplayed = [...displayedNotifications].sort((a, b) => {
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return 0;
    });

    sortedDisplayed.forEach((notification) => {
      const createdAt = new Date(notification.createdAt);
      if (isToday(createdAt)) groups["Today"].push(notification);
      else if (isThisWeek(createdAt)) groups["This Week"].push(notification);
      else if (isThisMonth(createdAt)) groups["This Month"].push(notification);
      else groups["Earlier"].push(notification);
    });

    // Áp dụng giới hạn cho từng nhóm
    groups["Today"] = groups["Today"].slice(0, 10);
    groups["This Week"] = groups["This Week"].slice(0, 10);
    groups["This Month"] = groups["This Month"].slice(0, 10);
    groups["Earlier"] = groups["Earlier"].slice(0, 10);

    return groups;
  };

  // Tải thêm thông báo khi cuộn đến cuối
  const loadMoreNotifications = () => {
    const currentLength = displayedNotifications.length;
    const moreNotifications = notifications.slice(currentLength, currentLength + 10);
    setDisplayedNotifications([...displayedNotifications, ...moreNotifications]);
    setHasMore(currentLength + moreNotifications.length < notifications.length);
  };

  // Infinite scroll
  const lastNotificationElementRef = useRef();
  useEffect(() => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreNotifications();
      }
    });

    if (lastNotificationElementRef.current) {
      observer.current.observe(lastNotificationElementRef.current);
    }
  }, [displayedNotifications, loading, hasMore]);

  const grouped = groupNotificationsByTime();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          left: "16.67%",
          width: "460px",
          top: 0,
          height: "100vh",
        },
      }}
      ModalProps={{
        BackdropProps: {
          style: { backgroundColor: "transparent" },
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
                  {label === "Today" ? "Today" : label === "This Week" ? "This Week" : label === "This Month" ? "This Month" : "Earlier"}
                </h4>
                {group.map((notification, index) => {
                  const isPostRelated = ["like", "comment", "tag", "reply"].includes(notification.type);
                  const isLastElement = index === group.length - 1;
                  return (
                    <div
                      key={notification._id}
                      ref={isLastElement ? lastNotificationElementRef : null}
                    >
                      <NotificationItem
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
                    </div>
                  );
                })}
                {group.length === (label === "Today" || label === "Earlier" ? 10 : 5) && (
                  <p className="more-notifications">
                    Và {notifications.filter(n => {
                      const createdAt = new Date(n.createdAt);
                      return (isToday(createdAt) && label === "Today") ||
                             (isThisWeek(createdAt) && label === "This Week") ||
                             (isThisMonth(createdAt) && label === "This Month") ||
                             (!isToday(createdAt) && !isThisWeek(createdAt) && !isThisMonth(createdAt) && label === "Earlier");
                    }).length - (label === "Today" || label === "Earlier" ? 10 : 5)} thông báo khác...
                  </p>
                )}
              </div>
            )
          )}
          {hasMore && !loading && (
            <div className="load-more">
              <Button onClick={loadMoreNotifications}>See more</Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default NotificationDrawer;