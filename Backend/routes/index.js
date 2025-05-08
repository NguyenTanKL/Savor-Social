// routes/index.js
const express = require("express");
const authRouter = require("../routes/authRoutes.js");
const userRouter = require("../routes/userRoutes.js");
const chatRouter = require("../routes/user/chatRouter.js");
const voucherRouter = require("../routes/user/voucherRouter.js");
const uploadRouter = require("../routes/helper/uploadRouter.js");
const postRouter = require("../routes/postRoutes.js");
const tagRouter = require("../routes/tagRoutes.js");
const notificationRouter = require("../routes/notificationRouter.js");
function route(app){
    app.use('/api/auth/', authRouter);
    app.use('/api/user/', userRouter);
    app.use('/api/chats/', chatRouter);
    app.use('/api/vouchers/', voucherRouter);
    app.use('/api/posts/',postRouter);
    app.use('api/tags/',tagRouter);
    app.use('api/notifications/',notificationRouter);
}

module.exports = route
