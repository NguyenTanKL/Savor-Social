const Chat = require('../../models/chatModel');
const User = require('../../models/UserModel');

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
        const { sender, receiver, message } = req.body;
        
        if (!sender || !receiver || !message) {
            return res.status(400).json({ error: "Sender, receiver, and message are required" });
        }
    
        try {
            const chat = new Chat({ sender, receiver, message });
            await chat.save();
    
            res.json({ success: true, chat });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Message could not be sent" });
        }
    }
    
}

module.exports = new ChatController