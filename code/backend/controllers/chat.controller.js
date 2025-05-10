const Chat = require("../models/chat.model");
const Case = require("../models/case.model");

const tagTypes = {
  important: { label: "Important", color: "#f44336", icon: "FlagIcon" },
  question: { label: "Question", color: "#2196f3", icon: "HelpIcon" },
  followup: { label: "Follow-up", color: "#ff9800", icon: "FollowUpIcon" },
};

const normalizeTag = (tag) => {
  if (!tag) return null;
  const normalizedTag = tag.toLowerCase().replace(/[^a-z]/g, "");
  return Object.values(tagTypes).find(
    (type) => type.label.toLowerCase().replace(/[^a-z]/g, "") === normalizedTag
  );
};

exports.getChatMessages = async (req, res) => {
  try {
    const { caseId } = req.params;

    let chat = await Chat.findOne({ caseId });
    if (!chat) {
      chat = new Chat({ caseId, messages: [] });
      await chat.save();
    }

    const messagesWithTags = chat.messages.map((message) => ({
      ...message.toObject(),
      tags: message.tags || null,
      senderModel: message.senderModel,
    }));

    res.json(messagesWithTags);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching chat messages", error: err.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content, tag, replyTo } = req.body;

    const case_ = await Case.findById(caseId);
    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isPatient = case_.patientId.toString() === req.user.userId;
    const isApprovedDoctor = case_.doctors.some(
      (doc) =>
        doc.doctorId.toString() === req.user.userId && doc.status === "approved"
    );

    if (!isPatient && !isApprovedDoctor) {
      return res
        .status(403)
        .json({ message: "Not authorized to chat in this case" });
    }

    let chat = await Chat.findOne({ caseId });
    if (!chat) {
      chat = new Chat({ caseId, messages: [] });
    }

    const formattedTag = normalizeTag(tag);

    chat.messages.push({
      sender: req.user.userId,
      senderModel: req.user.role === "patient" ? "Patient" : "Doctor",
      senderName: req.user.name,
      content,
      tags: formattedTag,
      replyTo,
    });

    await chat.save();
    res.json(chat.messages[chat.messages.length - 1]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding message", error: err.message });
  }
};

exports.getDoctorChatMessages = async (req, res) => {
  try {
    const { caseId } = req.params;

    let chat = await Chat.findOne({ caseId });
    if (!chat) {
      chat = new Chat({ caseId, doctorMessages: [] });
      await chat.save();
    }

    res.json(chat.doctorMessages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching chat messages", error: err.message });
  }
};

exports.addDoctorMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content } = req.body;

    const case_ = await Case.findById(caseId).populate("doctors.doctorId");

    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isPatient = case_.patientId.toString() === req.user.userId;
    const isApprovedDoctor = case_.doctors.some(
      (doc) =>
        doc.doctorId._id.toString() === req.user.userId &&
        doc.status === "approved"
    );

    if (!isPatient && !isApprovedDoctor) {
      return res
        .status(403)
        .json({ message: "Not authorized to chat in this case" });
    }

    let chat = await Chat.findOne({ caseId });
    if (!chat) {
      chat = new Chat({ caseId, messages: [], doctorMessages: [] });
    }

    chat.doctorMessages.push({
      sender: req.user.userId,
      content,
      senderName: req.user.name,
    });

    await chat.save();
    res.json(chat.doctorMessages[chat.doctorMessages.length - 1]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding message", error: err.message });
  }
};

exports.updateMessageTags = async (req, res) => {
  try {
    const { caseId, messageId } = req.params;
    const { tag } = req.body;

    const chat = await Chat.findOne({ caseId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (tag === null) {
      message.tags = null;
    } else {
      const formattedTag = normalizeTag(tag);
      if (!formattedTag) {
        return res.status(400).json({ message: "Invalid tag type" });
      }
      message.tags = formattedTag;
    }

    await chat.save();
    res.status(200).json({
      message:
        tag === null ? "Tag removed successfully" : "Tag updated successfully",
      tag: message.tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating tag", error: err.message });
  }
};
