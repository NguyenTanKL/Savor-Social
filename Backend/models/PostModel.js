const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        images: { type: String, default: "" },
        videos: { type: [String], default: [] },
        location: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Chủ sở hữu nhà hàng
            name: { type: String, required: false }, // Tên nhà hàng
            address: { type: String, required: false }, // Địa chỉ nhà hàng
            coordinates: {
                lat: { type: Number, required: false },
                lng: { type: Number, required: false }
            }
        },
        likes: {
            count: {
              type: Number,
              default: 0,
            },
            users: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // hoặc tên model người dùng bạn đã định nghĩa
              }
            ]
          },
        voucher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voucher', // tên model Voucher (nếu có)
            default: null
        },
        ad_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ad', // tên model Voucher (nếu có)
            default: null
        },
        is_ad: {
            type: Boolean,
            default: false
        },
        is_voucher: {
            type: Boolean,
            default: false
        },
        tags: { type: [String], default: [] },
        rating: { type: Number, min: 1, max: 10, default: 5 },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;