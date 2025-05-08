const Notification = require("../models/NotificationModel");

const createNotification = async (req, res) => {
  try {
    const { senderId, receiverId, type, postId, message } = req.body;

    // Kiểm tra thông báo trùng lặp
    const existingNotification = await Notification.findOne({
      senderId,
      receiverId,
      type,
      postId: postId || null,
      isRead: false,
    });

    if (existingNotification) {
      return res.status(200).json(existingNotification); // Trả về thông báo hiện có
    }

    // Tạo thông báo mới
    const notification = new Notification({
      senderId,
      receiverId,
      type,
      postId: postId || undefined,
      message,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Lỗi khi tạo thông báo:", err);
    res.status(500).json({ message: "Lỗi khi tạo thông báo" });
  }
};

const getNotificationsByUser = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const notifications = await Notification.find({ receiverId })
      .sort({ createdAt: -1 })
      .populate("senderId", "username avatar")
      .populate("postId", "images")
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
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markAsRead,
};