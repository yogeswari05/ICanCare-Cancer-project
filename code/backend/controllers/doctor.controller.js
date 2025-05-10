const doctorModel = require("../models/doctor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Feedback = require("../models/feedback.model");

module.exports.signupDoctor = async (req, res) => {
  const { name, email, password, specialization, location } = req.body;
  try {
    console.log("Signup request received:", req.body);

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      console.log("Doctor already exists:", email);
      return res.status(400).json({ message: "Doctor already exists." });
    }
    console.log("No existing doctor found, proceeding with signup.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully.");

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      specialization,
      location,
      approvalStatus: "pending",
    });

    await newDoctor.save();
    console.log("Doctor signed up successfully:", newDoctor._id);

    return res.status(201).json({
      message:
        "Doctor signed up successfully. Your request is pending approval.",
    });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "Error in signup", error: err.message });
  }
};

module.exports.loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      console.log("Doctor not found, logindoc");
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.approvalStatus === "pending") {
      const timeElapsed =
        (Date.now() - new Date(doctor.registeredAt)) / (1000 * 60 * 60 * 24); 

      if (timeElapsed > 2) {
        return res.status(403).json({
          message:
            "Admin has not approved your request within 2 days. Please contact support.",
        });
      }

      return res.status(403).json({
        message: "Your registration is pending approval. Please wait.",
      });
    }

    if (doctor.approvalStatus === "Denied") {
      return res
        .status(403)
        .json({ message: "Your registration request was denied." });
    }

    const isValidPassword = await bcrypt.compare(password, doctor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: doctor._id,
        role: "doctor",
        name: doctor.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      approvalStatus: doctor.approvalStatus,
      token,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Error in login", error: err.message });
  }
};

module.exports.getPendingDoctors = async (req, res) => {
  try {
    console.log("Fetching pending doctors...");
    const pendingDoctors = await doctorModel.find(
      { approvalStatus: "pending" },
      "-password"
    );
    console.log("Pending doctors found:", pendingDoctors.length);

    res.json(pendingDoctors);
  } catch (err) {
    console.error("Error fetching pending doctors:", err);
    res
      .status(500)
      .json({ message: "Error fetching pending doctors", error: err.message });
  }
};

module.exports.getApprovedDoctors = async (req, res) => {
  try {
    console.log("Fetching approved doctors...");
    const approvedDoctors = await doctorModel.find(
      { approvalStatus: "approved" },
      "-password"
    );
    console.log("Approved doctors found:", approvedDoctors.length);
    res.json(approvedDoctors);
  } catch (err) {
    console.error("Error fetching approved doctors:", err);
    res
      .status(500)
      .json({ message: "Error fetching approved doctors", error: err.message });
  }
};

module.exports.approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    let newStatus = req.body.approvalStatus;

    if (!newStatus || typeof newStatus !== "string") {
      return res
      .status(400)
      .json({ message: "Valid approval status is required" });
    }
    
    console.log("New status:", newStatus);

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.approvalStatus = newStatus;
    await doctor.save();
    console.log("Doctor approval status updated successfully");
    res
      .status(200)
      .json({ message: "Doctor approval status updated successfully" });
  } catch (error) {
    console.error("Error updating doctor approval status:", error);
    res
      .status(500)
      .json({ message: "Error updating doctor approval status", error });
  }
};

module.exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.user.userId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const profileData = {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      dob: doctor.dob,
      specialization: doctor.specialization,
      experience: doctor.experience,
      education: doctor.education,
      hospitalAffiliation: doctor.hospitalAffiliation,
      bio: doctor.bio,
      isAdmin: doctor.isAdmin,
      createdAt: doctor.createdAt,
    };

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}, "-password");
    res.json(doctors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

module.exports.googleLoginDoctor = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    let doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      const defaultPassword = "google-login-placeholder";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      doctor = new doctorModel({
        name,
        email,
        password: hashedPassword,
        approvalStatus: "pending",
      });
      await doctor.save();
    }

    if (doctor.approvalStatus === "pending") {
      const timeElapsed =
        (Date.now() - new Date(doctor.registeredAt)) / (1000 * 60 * 60 * 24);

      if (timeElapsed > 2) {
        return res.status(403).json({
          message:
            "Admin has not approved your request within 2 days. Please contact support.",
        });
      }

      return res.status(403).json({
        message: "Your registration is pending approval. Please wait.",
      });
    }

    if (doctor.approvalStatus === "Rejected") {
      return res
        .status(403)
        .json({ message: "Your registration request was denied." });
    }

    const token = jwt.sign(
      { userId: doctor._id, role: "doctor", name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      message: "Login successful. Please complete your profile.",
      profileIncomplete: !doctor.specialization,
    });
  } catch (err) {
    console.log("Error in Google login:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};
module.exports.completeProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.user.userId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (req.body.name) doctor.name = req.body.name;
    if (req.body.phone) doctor.phone = req.body.phone;
    if (req.body.dob) doctor.dob = req.body.dob;

    if (req.body.specialization !== undefined)
      doctor.specialization = req.body.specialization;

    if (req.body.experience !== undefined)
      doctor.experience = req.body.experience;

    if (req.body.education !== undefined) doctor.education = req.body.education;

    if (req.body.hospitalAffiliation !== undefined)
      doctor.hospitalAffiliation = req.body.hospitalAffiliation;

    if (req.body.bio !== undefined) doctor.bio = req.body.bio;

    await doctor.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating doctor profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Feedback.find({ doctorId }).populate(
      "patientId",
      "name"
    );
    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      patientName: review.patientId.name,
    }));
    res.json(formattedReviews);
  } catch (err) {
    console.error("Error fetching doctor reviews:", err);
    res
      .status(500)
      .json({ message: "Error fetching doctor reviews", error: err.message });
  }
};

module.exports.logoutAllDevices = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.user.userId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(doctor.password, salt);
    doctor.password = hashedPassword;
    await doctor.save();

    res.status(200).json({ message: "Logged out of all devices successfully" });
  } catch (err) {
    console.error("Error logging out of all devices:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.user.userId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }


    await doctorModel.findByIdAndDelete(req.user.userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports.getSpecializations = async (req, res) => {
  try {
    const specializations = [
      "Medical Oncology",
      "Surgical Oncology",
      "Radiation Oncology",
      "Hematology Oncology",
      "Gynecologic Oncology",
      "Pediatric Oncology",
      "Neuro-Oncology",
      "Breast Cancer Specialist",
      "Lung Cancer Specialist",
      "Gastrointestinal Oncology",
      "Genitourinary Oncology",
    ];
    res.status(200).json({ specializations });
  } catch (err) {
    console.error("Error fetching specializations:", err);
    res.status(500).json({ message: "Error fetching specializations" });
  }
};
