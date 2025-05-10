const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();
const { body } = require("express-validator");
const patientController = require("../controllers/patient.controller");

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management API
 */

/**
 * @swagger
 * /api/patient/signup:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation errors or registration failed
 */
router.post(
  "/signup",
  [
    body("name").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("age").isNumeric(),
    body("gender").isIn(["Male", "Female", "Other"]),
    body("contact").not().isEmpty(),
  ],
  patientController.signupPatient
);

/**
 * @swagger
 * /api/patient/login:
 *   post:
 *     summary: Login an existing patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient logged in successfully
 *       400:
 *         description: Validation errors or login failed
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  patientController.loginPatient
);

/**
 * @swagger
 * /api/patient/google-login:
 *   post:
 *     summary: Login an existing patient using Google
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient logged in successfully
 *       400:
 *         description: Validation errors or login failed
 */
router.post("/google-login", patientController.googleLoginPatient);

/**
 * @swagger
 * /api/patient/profile:
 *   get:
 *     summary: Get patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateToken, patientController.getPatientProfile);

router.post(
  "/complete-profile",
  authenticateToken,
  patientController.completeProfile
);

router.post(
  "/logout-all-devices",
  authenticateToken,
  patientController.logoutAllDevices
);

router.delete(
  "/delete-account",
  authenticateToken,
  patientController.deleteAccount
);

module.exports = router;
