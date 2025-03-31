const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Chat = mongoose.model('chats', chatSchema);
module.exports = Chat;
