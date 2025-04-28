const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String }, // like, comment, follow, etc.
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: false },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);