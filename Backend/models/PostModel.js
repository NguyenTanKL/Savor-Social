const mongoose = require ('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        imageUrl: { type: String, default: "" },
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
        likes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
        tags: { type: [String], default: [] },
        rating: { type: Number, min: 1, max: 10, default: 5 },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }    
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;