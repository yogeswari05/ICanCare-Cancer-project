const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    content: { type: String, required: true },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);
