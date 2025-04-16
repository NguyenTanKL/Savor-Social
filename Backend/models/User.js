const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    darkmode: { type: Boolean, default: false },
    usertype: { type: String, enum: ["normal", "admin", "restaurant"], default: "normal" },
    avatar: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    foodTypes: [{ type: String }],
    preferences: [{ type: String }],
    newsfeed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }] // Thêm danh sách bài post đã lưu
});

module.exports = mongoose.model("User", UserSchema);
