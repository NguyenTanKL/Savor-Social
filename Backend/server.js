const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const nodemon = require('nodemon');
const cors = require('cors');
const route = require('./routes/user/index')
const authRoutes = require("./routes/authRoutes");
require('./models/UserModel'); 
require('./models/chatModel');
const cookieParser = require("cookie-parser");


const app = express();

app.use(cookieParser());

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db  = require('./config/db');

db.connect();

// Create a middleware to allow CORS to create voucher
app.use(cors({
    origin: ["http://localhost:3000", 'http://localhost:3000/VouchersPage'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Chat
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:3000", 'http://localhost:3000/MessagesPage'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendMessage", (message) => {
        io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});


route(app);
app.use("/api/auth", authRoutes);

server.listen(5000, () => {
    console.log('Server running on port 5000');
});