// routes/index.js
const express = require("express");
const authRouter = require("../routes/authRoutes.js");
const userRouter = require("../routes/userRoutes.js");
const chatRouter = require("../routes/user/chatRouter.js");
const voucherRouter = require("../routes/user/voucherRouter.js");
const uploadRouter = require("../routes/helper/uploadRouter.js");
// import postRouter from "./postRoutes.js";
// import chatRouter from "./chatRoutes.js";

// const router = express.Router();

// router.use("/auth", authRouter);
// router.use("/users", userRouter);
// // router.use("/posts", postRouter);
// // router.use("/chat", chatRouter);

// module.exports = router;

function route(app){
    app.use('/api/auth/', authRouter);
    app.use('/api/user/', userRouter);
    app.use('/api/chats/', chatRouter);
    app.use('/api/vouchers/', voucherRouter);
}

module.exports = route
