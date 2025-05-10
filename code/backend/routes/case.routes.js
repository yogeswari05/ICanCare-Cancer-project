const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const caseController = require("../controllers/case.controller");
const { createGoogleMeet } = require("../utils/googleMeet");
const { sendEmail } = require("../utils/email");
const Case = require("../models/case.model");
const Chat = require("../models/chat.model");
const Notification = require("../models/notification.model");
const doctorsChatController = require("../controllers/doctorsChat.controller");

/**
 * @swagger
 * tags:
 *   name: Cases
 *   description: Case management API
 */

/**
 * @swagger
 * /patient-cases:
 *   get:
 *     summary: Get all cases for a patient
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cases for a patient
 */
router.get(
  "/patient-cases",
  authenticateToken,
  caseController.getAllCasesForPatient
);

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Case created successfully
 */
router.post("/create", authenticateToken, caseController.createCase);

/**
 * @swagger
 * /{caseId}:
 *   get:
 *     summary: Get details of a specific case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The case ID
 *     responses:
 *       200:
 *         description: Case details
 */
router.get("/:caseId", authenticateToken, caseController.getCaseDetails);

/**
 * @swagger
 * /{caseId}/add-doctor:
 *   post:
 *     summary: Add a doctor to a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The case ID
 *     responses:
 *       200:
 *         description: Doctor added to case
 */
router.post(
  "/:caseId/add-doctor",
  authenticateToken,
  caseController.addDoctorToCase
);

/**
 * @swagger
 * /doctor/pending:
 *   get:
 *     summary: Get pending cases for a doctor
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending cases for a doctor
 */
router.get(
  "/doctor/pending",
  authenticateToken,
  caseController.getDoctorPendingCases
);

/**
 * @swagger
 * /doctor/accepted:
 *   get:
 *     summary: Get accepted cases for a doctor
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accepted cases for a doctor
 */
router.get(
  "/doctor/accepted",
  authenticateToken,
  caseController.getDoctorAcceptedCases
);

/**
 * @swagger
 * /{caseId}/respond:
 *   post:
 *     summary: Respond to a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The case ID
 *     responses:
 *       200:
 *         description: Response recorded
 */
router.post(
  "/:caseId/respond",
  authenticateToken,
  caseController.respondToCase
);

router.post(
  "/:caseId/change-primary-doctor",
  authenticateToken,
  caseController.changePrimaryDoctor
);

router.get(
  "/:caseId/is-primary-doctor",
  authenticateToken,
  caseController.isPrimaryDoctor
);

router.post("/add-doctor", authenticateToken, caseController.addDoctorToCase);
router.put(
  "/updatePrimaryDoctor",
  authenticateToken,
  caseController.updatePrimaryDoctor
);

router.post(
  "/:caseId/create-meeting",
  authenticateToken,
  caseController.createMeeting
);

/**
 * @swagger
 * /{caseId}/rename:
 *   put:
 *     summary: Rename a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the case
 *     responses:
 *       200:
 *         description: Case renamed successfully
 */
router.put("/:caseId/rename", authenticateToken, caseController.renameCase);

router.post(
  "/:caseId/feedback",
  authenticateToken,
  caseController.submitFeedback
);

router.get(
  "/:caseId/feedback-status",
  authenticateToken,
  caseController.getFeedbackStatus
);

router.get(
  "/:caseId/doctor-access",
  authenticateToken,
  doctorsChatController.checkDoctorAccess
);

router.get(
  "/:caseId/doctors-chat/messages",
  authenticateToken,
  doctorsChatController.getMessages
);

router.post(
  "/:caseId/doctors-chat/send",
  authenticateToken,
  doctorsChatController.sendMessage
);

// Add lymph log
router.post(
  "/:caseId/lymph-log",
  authenticateToken,
  caseController.addLymphLog
);

// Get lymph logs
router.get(
  "/:caseId/lymph-logs",
  authenticateToken,
  caseController.getLymphLogs
);

// Add lymph log
router.post(
  "/:caseId/p2-log",
  authenticateToken,
  caseController.addp2Log
);

// Get lymph logs
router.get(
  "/:caseId/p2-logs",
  authenticateToken,
  caseController.getp2Logs
);

module.exports = router;
