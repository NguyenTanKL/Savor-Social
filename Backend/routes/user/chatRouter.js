const express = require("express");
const router = express.Router();
const chatController = require('../../controllers/user/chatController');

router.get('/messages', chatController.getMessage)

router.post('/send', chatController.sendMessage)

module.exports = router;
