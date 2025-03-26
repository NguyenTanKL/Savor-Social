const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: false },
    images: { type: [String], default: [] },
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
    tags: { type: [String], default: [] },
    likes: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    rating: { type: Number, min: 1, max: 10, default: 5 },
    comments:{
        type: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                text: { type: String, required: false },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        default: undefined // Cho phép không có comments
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
