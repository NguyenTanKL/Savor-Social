const mongoose = require ('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
        taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        rating: { type: Number, min: 1, max: 5 }, // Điểm đánh giá từ 1 đến 5
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }    
    },
    { timestamps: true }
);
postSchema.index({ tags: 1 });
postSchema.index({ restaurantId: 1 });
const Post = mongoose.model("Post", postSchema);

module.exports = Post;