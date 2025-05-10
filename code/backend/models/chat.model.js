const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "senderModel",
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["Doctor", "Patient"],
  },
  senderName: String,
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tags: {
    label: String,
    color: String,
    icon: String,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat.messages",
  },
});

const doctorMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  senderName: String,
  tags: {
    label: String,
    color: String,
    icon: String,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat.messages",
  },
});

const chatSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },
  messages: [messageSchema],
  doctorMessages: [doctorMessageSchema],
});

module.exports = mongoose.model("Chat", chatSchema);
