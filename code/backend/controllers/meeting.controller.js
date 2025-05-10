const Case = require("../models/case.model");
const { google } = require("googleapis");
const Meeting = require("../models/meeting.model");
const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");

exports.getAllMeetings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.query.role;
    let meetings = [];

    console.log(`User ID: ${userId}, Role: ${role}`);

    if (role === "doctor") {
      console.log("Fetching doctor");
      const doctor = await Doctor.findById(userId).populate({
        path: "meetings",
        model: "Meeting",
      });

      if (doctor) {
        console.log("Doctor found:", doctor);
        console.log("Fetching meetings for doctor");
        console.log("Doctor meetings: ", doctor.meetings);
        meetings = meetings.concat(doctor.meetings);
      } else {
        console.log("Doctor not found for userId:", userId);
      }
    } else if (role === "patient") {
      console.log("Fetching patient");
      const patient = await Patient.findById(userId).populate({
        path: "meetings",
        model: "Meeting",
      });

      if (patient) {
        console.log("Patient found:", patient);
        console.log("Fetching meetings for patient");
        console.log("Patient meetings: ", patient.meetings);
        meetings = meetings.concat(patient.meetings);
      } else {
        console.log("Patient not found for userId:", userId);
      }
    } else {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    res.json(meetings);
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res
      .status(500)
      .json({ message: "Error fetching meetings", error: err.message });
  }
};
