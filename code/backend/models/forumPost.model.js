const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);
