const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
   patientId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
   },
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
      required: false,
   },
   age: {
      type: Number,
      required: false,
   },
   gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
   },
   contact: {
      type: String,
      required: false,
   },
   address: {
      type: String,
   },
   bloodType: {
      type: String,
      default: ''
   },
   height: {
      type: Number,
      default: null
   },
   weight: {
      type: Number,
      default: null
   },
   allergies: {
      type: String,
      default: ''
   },
   medicalHistory: {
      type: String,
      default: ''
   },
   meetings: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Meeting",
      },
   ],
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model("Patient", patientSchema);
