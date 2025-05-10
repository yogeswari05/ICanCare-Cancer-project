const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, feedbackController.submitFeedback);

module.exports = router;
