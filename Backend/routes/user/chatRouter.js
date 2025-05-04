const express = require("express");
const router = express.Router();
const chatController = require('../../controllers/user/ChatController');
const { uploadChat } = require("../../config/cloudinary/cloudinaryConfig.js");
const userAuth = require("../../middlewares/authMiddleware.js")

router.get('/messages', chatController.getMessage)

router.post('/send', uploadChat.single("image"), chatController.sendMessage)

router.delete('/delete/:chatId', chatController.deleteMessage)

router.get('/unread/:userId', chatController.unRead)

router.put('/mark-read', chatController.isRead)

module.exports = router;
