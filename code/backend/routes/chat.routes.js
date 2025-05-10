const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chat.controller");

router.get("/:caseId", authenticateToken, chatController.getChatMessages);
router.post("/:caseId/message", authenticateToken, chatController.addMessage);
router.get(
  "/doctor/:caseId",
  authenticateToken,
  chatController.getDoctorChatMessages
);
router.post(
  "/doctor/:caseId/message",
  authenticateToken,
  chatController.addDoctorMessage
);

router.post(
  "/:caseId/message/:messageId/tags",
  authenticateToken,
  chatController.updateMessageTags
);

module.exports = router;
