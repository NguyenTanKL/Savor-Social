require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');
// const postRoutes = require('./routes/postRoutes');
// const userRoutes = require('./routes/userRoutes');
const http = require('http');
const { Server } = require('socket.io');
const nodemon = require('nodemon');
const cors = require('cors');
const router = require('./routes/index')
const path = require("path");
// const authRoutes = require("./routes/authRoutes");
require('./models/UserModel'); 
require('./models/chatModel');
const cookieParser = require("cookie-parser");




const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });
// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router(app);

app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require("dotenv").config();



const db  = require('./config/db');

db.connect();

// Create a middleware to allow CORS to create voucher
app.use(cors({
    origin: ["http://localhost:3000", 'http://localhost:3000/vouchers'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Chat
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:3000", 'http://localhost:3000/messages'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendMessage", (message) => {
        console.log("New message received:", message);
        io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});




server.listen(5000, () => {
    console.log('Server running on port 5000');
});

