const patientModel = require("../models/patient.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.signupPatient = async (req, res) => {
  const { name, email, password, age, gender, contact, address } = req.body;

  try {
    const existingPatient = await patientModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingPatient) {
      return res.status(400).json({
        message: "Patient already exists with this email or contact.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new patientModel({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      contact,
      address,
    });

    await newPatient.save();

    const token = jwt.sign(
      {
        userId: newPatient._id,
        role: "patient",
        name: newPatient.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Patient signed up successfully.",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error in signup", error: err.message });
  }
};

module.exports.loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await patientModel.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const isValidPassword = await bcrypt.compare(password, patient.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: patient._id,
        role: "patient",
        name: patient.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Error in login", error: err.message });
  }
};

module.exports.googleLoginPatient = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let patient = await patientModel.findOne({ email });
    if (!patient) {
      patient = new patientModel({
        name,
        email,
        password: "",
      });
      await patient.save();
    }

    const token = jwt.sign(
      { userId: patient._id, role: "patient", name: patient.name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      message: "Login successful. Please complete your profile.",
      profileIncomplete:
        !patient.contact || !patient.gender || !patient.address || !patient.age,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};

module.exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await patientModel.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    
    const responseData = {
      ...patient.toObject(),
      phone: patient.contact
    };
    
    res.json(responseData);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

module.exports.completeProfile = async (req, res) => {
  const {
    name,       // Add name field
    contact,
    gender,
    address,
    age,
    bloodType,
    height,
    weight,
    allergies,
    medicalHistory,
    dob,        // Add dob field
  } = req.body;

  try {
    const patient = await patientModel.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Validate fields
    if (age !== undefined && isNaN(age)) {
      return res.status(400).json({ message: "Age must be a number" });
    }
    if (gender !== undefined && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    // Update fields
    if (name !== undefined) patient.name = name;           // Add name handling
    if (contact !== undefined) patient.contact = contact;
    if (gender !== undefined) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (age !== undefined) patient.age = age;
    if (bloodType !== undefined) patient.bloodType = bloodType;
    if (height !== undefined) patient.height = height;
    if (weight !== undefined) patient.weight = weight;
    if (allergies !== undefined) patient.allergies = allergies;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
    if (dob !== undefined) patient.dob = dob;              // Add dob handling

    await patient.save();

    res.json({
      message: "Profile updated successfully",
      patient,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};

module.exports.logoutAllDevices = async (req, res) => {
  try {
    const patient = await patientModel.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(patient.password, salt);
    patient.password = hashedPassword;
    await patient.save();
    
    res.status(200).json({ message: "Logged out of all devices successfully" });
  } catch (err) {
    console.error("Error logging out of all devices:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const patient = await patientModel.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    await patientModel.findByIdAndDelete(req.user.userId);
    
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Server error" });
  }
};
