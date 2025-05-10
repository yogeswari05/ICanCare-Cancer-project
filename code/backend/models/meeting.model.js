const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
   },
   summary: String,
   description: String,
   startTime: Date,
   endTime: Date,
   meetLink: String,
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
      default: Date.now,
   },
});

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;
