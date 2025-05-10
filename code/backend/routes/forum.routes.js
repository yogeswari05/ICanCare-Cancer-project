const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forum.controller");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/posts", authenticateToken, forumController.getPosts);
router.get("/posts/:postId", authenticateToken, forumController.getPostById);
router.post("/posts", authenticateToken, forumController.createPost);
router.post(
  "/posts/:postId/replies",
  authenticateToken,
  forumController.createReply
);

module.exports = router;
