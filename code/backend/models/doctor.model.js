const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    specialization: {
      type: String,
      default: "",
    },
    experience: {
      type: Number,
      default: 0,
    },
    education: {
      type: String,
      default: "",
    },
    hospitalAffiliation: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
