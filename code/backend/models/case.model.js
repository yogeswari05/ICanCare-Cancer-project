const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctors: [
    {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  ],
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  meetings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
  ],
  lymphLogs: [
    {
      size: { type: Number, required: true },
      date: { type: Date, required: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
    }
  ],
  p2Logs: [
    {
      size: { type: Number, required: true },
      date: { type: Date, required: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
    }
  ],

  name: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

caseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Case = mongoose.model("Case", caseSchema);
module.exports = Case;
