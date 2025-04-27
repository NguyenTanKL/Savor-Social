const express = require("express")

const {createNotification, getNotificationsByUser,markAsRead } = require("../controllers/notificationController.js")

const router = express.Router();
router.post("/create", createNotification);
router.get("/:receiverId", getNotificationsByUser);
router.put("/read/:id", markAsRead);
module.exports =  router;