const mongoose = require ('mongoose');
const replySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    from: { type: String, required: true },
    replyAt: { type: String },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [{ type: String, default: [] }],
  },
);
const commentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        comment: { type: String, required: true },
        from: { type: String, required: true },
        replies: [replySchema],
        likes: [{ type: String }],
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;