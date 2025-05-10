const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();
const { body } = require("express-validator");
const doctorController = require("../controllers/doctor.controller");

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management API
 */

/**
 * @swagger
 * /api/doctor/signup:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctors]
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
 *
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Validation errors or registration failed
 */
router.post(
  "/signup",
  [
    body("name").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),

    body("specialization").not().isEmpty().trim().escape(),
  ],
  doctorController.signupDoctor
);

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Login an existing doctor
 *     tags: [Doctors]
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
 *         description: Doctor logged in successfully
 *       400:
 *         description: Validation errors or login failed
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  doctorController.loginDoctor
);

/**
 * @swagger
 * /api/doctor/google-login:
 *   post:
 *     summary: Login an existing doctor using Google
 *     tags: [Doctors]
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
 *         description: Doctor logged in successfully
 *       400:
 *         description: Validation errors or login failed
 */
router.post("/google-login", doctorController.googleLoginDoctor);

/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateToken, doctorController.getDoctorProfile);

/**
 * @swagger
 * /api/doctor/all:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 */
router.get("/all", doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctor/specializations:
 *   get:
 *     summary: Get list of approved specializations
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of specializations
 */
router.get("/specializations", doctorController.getSpecializations);

router.get("/pending", doctorController.getPendingDoctors);
router.get("/approved", doctorController.getApprovedDoctors);
router.get("/:doctorId/reviews", doctorController.getDoctorReviews);
router.put("/approve/:id", doctorController.approveDoctor);
router.post(
  "/complete-profile",
  authenticateToken,
  doctorController.completeProfile
);

router.post(
  "/logout-all-devices",
  authenticateToken,
  doctorController.logoutAllDevices
);

router.delete(
  "/delete-account",
  authenticateToken,
  doctorController.deleteAccount
);

module.exports = router;
