const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    message: {
        type: String
        // required: true
    },
    fileUrl: { 
        type: String 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Chat = mongoose.model('chats', chatSchema);
module.exports = Chat;
