const Notification = require("../models/NotificationModel");

const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi tạo thông báo" });
    }
};

const getNotificationsByUser = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const notifications = await Notification.find({ receiverId })
            .sort({ createdAt: -1 }) // mới nhất trước
            .populate("senderId", "username avatar") // nếu muốn hiện thông tin người gửi
            .populate("postId", "images") // nếu muốn hiện nội dung post
            .exec();

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
        res.status(500).json({ message: "Lỗi khi lấy thông báo" });
    }
};

const markAsRead = async (req, res) => {
    try {
      const notificationId = req.params.id;
      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: "Notification not found" });
      }
  
      res.status(200).json(updated);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports = {
    createNotification,
    getNotificationsByUser,
    markAsRead 
};