// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const authRoutes = require("./Routes/authRoutes");

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb+srv://nguyentankl2003:Historytwo1@cluster0.n6mpv.mongodb.net/Savor_Social?retryWrites=true&w=majority");

// app.use("/api/auth", authRoutes);

// app.listen(5000, () => console.log("Server is running on port 5000"));

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://nguyentankl2003:Historytwo1@cluster0.n6mpv.mongodb.net/Savor_Social?retryWrites=true&w=majority";
const route = require('./Routes/index.js')
// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// Kết nối MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
  
route(app);
  // app.use("/api", routes);
// Route thử nghiệm
app.get("/", (req, res) => {
  res.send("Backend server is running! 🚀");
});

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT});`)});
