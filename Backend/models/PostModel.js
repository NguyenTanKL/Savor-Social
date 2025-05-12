const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    location: {
      address: { type: String, required: false },
      coordinates: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
      },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    restaurantId:{ type: mongoose.Schema.Types.ObjectId, ref: "User",default:null },
    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      default: null,
    },
    ad_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ad',
      default: null,
    },
    is_ad: {
      type: Boolean,
      default: false,
    },
    is_voucher: {
      type: Boolean,
      default: false,
    },
    tags: { type: [String], default: [] },
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, min: 1, max: 5 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

postSchema.index({ tags: 1 });
const Post = mongoose.model("Post", postSchema);

module.exports = Post;