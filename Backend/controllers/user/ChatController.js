const Chat = require('../../models/chatModel');
const User = require('../../models/UserModel');
const cloudinary = require("../../config/cloudinary/cloudinaryConfig").cloudinary;

class ChatController{

    // GET /messages?sender=USER_ID&receiver=USER_ID
    async getMessage(req, res) {
        try {
            const { sender, receiver } = req.query;
    
            if (!sender || !receiver) {
                return res.status(400).json({ error: "Sender and receiver are required" });
            }
    
            // Find chats where sender and receiver match in either order
            const chats = await Chat.find({
                $or: [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, receiver: sender }
                ]
            }).populate('sender', 'username') // Populate sender details
              .populate('receiver', 'username') // Populate receiver details
              .sort({ createdAt: 1 }); // Sort by oldest to newest messages
    
            res.json(chats);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "Failed to fetch messages" });
        }
    };

    // POST /:chatId
    async sendMessage(req, res) {   
        const { sender, receiver, message, file } = req.body;
        
        // Check if sender, receiver, and message are provided
        if (!sender || !receiver || (!message && !file)) {
            return res.status(400).json({ error: "Sender, receiver, and message are required" });
        }

        const imageUrl = req.file ? req.file.path : null;

        try {
            const chat = new Chat({ 
                sender, 
                receiver, 
                message: message || "",
                fileUrl: imageUrl || null,
                isRead: false,
            });
            await chat.save();
    
            res.json({ success: true, chat });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Message could not be sent" });
        }
    }

    // GET /unread/:senderId
    async unRead(req, res) {
        try {
            const userId = req.params.userId;

            const user = await User.findById(userId).populate("following", "_id username avatar");

            if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            const followedWithUnread = await Promise.all(
            user.following.map(async (followedUser) => {
                const unreadCount = await Chat.countDocuments({
                sender: followedUser._id,
                receiver: userId,
                isRead: false,
                });

                return {
                _id: followedUser._id,
                username: followedUser.username,
                img: followedUser.avatar,
                unreadCount,
                };
            })
            );

            res.json({ following: followedWithUnread });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách follow:", error);
            res.status(500).json({ message: "Lỗi server nội bộ" });
        }
    }

    // GPUT /mark-read
    async isRead(req, res) {
        const { sender, receiver } = req.body;

        try {
            await Chat.updateMany(
            { sender, receiver, isRead: false },
            { $set: { isRead: true } }
            );

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Failed to update messages" });
        }
    }
    
    // DELETE /delete/:id
    async deleteMessage(req, res) {
        try {
            const id  = req.params.chatId;
    
            // Find message by name
            const message = await Chat.findById(id);
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
    
            // Delete images from Cloudinary
            if (message.fileUrl) {
                const publicId = message.fileUrl.split('/').pop().split('.')[0]; // Extract public_id
                await cloudinary.uploader.destroy(`chats/${publicId}`);
            }
    
            // Delete message from the database
            await Chat.findByIdAndDelete(id);
    
            res.status(200).json({ message: "Message deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new ChatController