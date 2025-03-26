// routes/index.js
const express = require("express");
const authRouter = require("../routes/authRoutes.js");
const userRouter = require("../routes/userRoutes.js");
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

}

module.exports = route
