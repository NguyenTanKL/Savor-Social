require("dotenv").config();
const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const path = require("path");
const cookieParser = require("cookie-parser");

// Routes
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const user = require('./routes/user');
const tagRoutes = require("./routes/tagRoutes");
const notificationRouter = require("./routes/notificationRouter");
const router = require('./routes/index');
const route = require('./routes/user/index');

// Models & DB
require('./models/UserModel');
require('./models/chatModel');
require('./models/TagsModel');
const db = require('./config/db');
db.connect();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://savor-social-1.onrender.com',
  'https://savor-social-es5s.onrender.com'
];

// ✅ CORS middleware setup
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// API routes
app.use('/api/notifications', notificationRouter);
app.use('/api/user', user);
app.use('/api', postRoutes);
app.use('/api/userRoutes', userRoutes);
app.use('/api/tags', tagRoutes);

// Additional route mounts
route(app);
router(app);

// Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

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

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
