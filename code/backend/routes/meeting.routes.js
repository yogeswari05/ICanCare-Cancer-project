const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();
const meetingController = require("../controllers/meeting.controller");

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting management API
 */

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: Get all meetings for the authenticated user
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meetings for the authenticated user
 */
router.get("/", authenticateToken, meetingController.getAllMeetings);

module.exports = router;
