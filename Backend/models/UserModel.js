const mongoose = require ('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, "Password is Required!"],
        minlength: [6, "Password length should be greater than 6 character"],
        select: true,
    },
    phone: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    darkmode: {
        type: Boolean,
        required: true,
        default:false
    },
    usertype: {
        type: String,
        required: true,
        enum:["normal","restaurant"]
    },
    avatar: {
        type: String,
        required: false
    },
    my_vouchers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vouchers',
        default: []
    }],
    address: {
        type: String,
        required: false
    },
    preferences: {
        type: [String],
        default: []
    },
    foodTypes: {
        type: [String],
        default: []
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách user mà người này follow
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách user follow người này
    followerCount: { type: Number, default: 0 }, // Thêm trường followerCount
    followingCount: { type: Number, default: 0 }, // Thêm trường followingCount
    likedPosts: [{ type: String, ref: 'Post' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Thêm danh sách bài post đã lưu
    point: {
        type: Number,
        default: 0, // Chỉ áp dụng cho userType: normal
      },
    avgRating: {
        type: Number,
        default: 0, // Chỉ áp dụng cho userType: restaurant
        min: 0,
        max: 5,
    },
    openHour: {
        type: String, // Ví dụ: "09:00"
        default: null, // Chỉ áp dụng cho userType: restaurant
    },
    closeHour: {
        type: String, // Ví dụ: "21:00"
        default: null, // Chỉ áp dụng cho userType: restaurant
    },
});

const UserModel = mongoose.model('User',UserSchema);

module.exports = UserModel;