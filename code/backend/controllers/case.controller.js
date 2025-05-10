const Case = require("../models/case.model");
const Meeting = require("../models/meeting.model");
const doctorModel = require("../models/doctor.model");
const patientModel = require("../models/patient.model");
const Chat = require("../models/chat.model");
const Notification = require("../models/notification.model");
const { createGoogleMeet } = require("../utils/googleMeet");
const { sendEmail } = require("../utils/email");
const Feedback = require("../models/feedback.model");
const Doctor = require("../models/doctor.model");

exports.getAllCasesForPatient = async (req, res) => {
  console.log("Fetching cases for patientId:", req.user.userId);
  try {
    const cases = await Case.find({ patientId: req.user.userId })
      .populate("doctors.doctorId", "name specialization")
      .populate("primaryDoctor", "name specialization");
    console.log("Cases: ", cases);
    res.json(cases);
  } catch (err) {
    console.log("Error fetching cases:", err);
    res
      .status(500)
      .json({ message: "Error fetching cases", error: err.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    console.log(req.user);
    const newCase = new Case({
      patientId: req.user.userId,
      doctors: [],
    });
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating case", error: err.message });
  }
};

exports.getCaseDetails = async (req, res) => {
  try {
    console.log(`Fetching details for caseId=${req.params.caseId}`);

    const caseDetails = await Case.findById(req.params.caseId)
      .populate("doctors.doctorId", "name specialization")
      .populate("primaryDoctor", "name specialization")
      .populate("patientId", "name age gender contact address");  

    if (!caseDetails) {
      console.log("Case not found");
      return res.status(404).json({ message: "Case not found" });
    }

    console.log("Case details fetched successfully");
    res.json(caseDetails);
  } catch (err) {
    console.error("Error fetching case details:", err);
    res
      .status(500)
      .json({ message: "Error fetching case details", error: err.message });
  }
};

exports.addDoctorToCase = async (req, res) => {
  const { caseId, doctorId } = req.body;
  try {
    console.log(
      `Adding doctor to case: caseId=${caseId}, doctorId=${doctorId}`
    );

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      console.log("Case not found");
      return res.status(404).json({ message: "Case not found" });
    }

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      console.log("Doctor not found, adddoctor to case");
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorExists = caseData.doctors.find(
      (doc) => doc.doctorId.toString() === doctorId
    );
    if (doctorExists) {
      console.log("Doctor is already part of this case");
      return res
        .status(400)
        .json({ message: "Doctor is already part of this case" });
    }

    caseData.doctors.push({ doctorId, status: "pending" });
    if (!caseData.primaryDoctor) {
      caseData.primaryDoctor = doctorId;
    }
    await caseData.save();

    console.log("Doctor added to case successfully");
    res.status(200).json({ message: "Doctor added to case successfully" });
  } catch (err) {
    console.error("Error adding doctor to case:", err);
    res
      .status(500)
      .json({ message: "Error adding doctor to case", error: err.message });
  }
};

exports.updatePrimaryDoctor = async (req, res) => {
  const { caseId, doctorId } = req.body;
  try {
    console.log(
      `Updating primary doctor: caseId=${caseId}, doctorId=${doctorId}`
    );

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      console.log("Case not found");
      return res.status(404).json({ message: "Case not found" });
    }

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      console.log("Doctor not found, updateprimarydoc");
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorExists = caseData.doctors.find(
      (doc) => doc.doctorId.toString() === doctorId
    );
    if (!doctorExists) {
      console.log("Doctor is not part of this case");
      return res
        .status(400)
        .json({ message: "Doctor is not part of this case" });
    }

    caseData.primaryDoctor = doctorId;
    await caseData.save();

    const updatedCaseData = await Case.findById(caseId)
      .populate("doctors.doctorId", "name specialization")
      .populate("primaryDoctor", "name specialization");

    console.log("Primary doctor updated successfully");
    res.status(200).json({
      message: "Primary doctor updated successfully",
      caseData: updatedCaseData,
    });
  } catch (err) {
    console.error("Error updating primary doctor:", err);
    res
      .status(500)
      .json({ message: "Error updating primary doctor", error: err.message });
  }
};

exports.getDoctorPendingCases = async (req, res) => {
  try {
    const cases = await Case.find({
      doctors: {
        $elemMatch: {
          doctorId: req.user.userId,
          status: "pending",
        },
      },
    })
      .populate("patientId", "name age gender contact") 
      .populate("doctors.doctorId", "name specialization");

    res.json(cases);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching pending cases", error: err.message });
  }
};
exports.changePrimaryDoctor = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { doctorId } = req.body;

    const case_ = await Case.findById(caseId);

    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (case_.patientId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this case" });
    }

    const doctorExists = case_.doctors.find(
      (doc) => doc.doctorId.toString() === doctorId && doc.status === "approved"
    );

    if (!doctorExists) {
      return res.status(400).json({
        message: "Selected doctor is not an approved doctor for this case",
      });
    }

    case_.primaryDoctor = doctorId;
    await case_.save();

    res.json(case_);
  } catch (err) {
    res.status(500).json({
      message: "Error changing primary doctor",
      error: err.message,
    });
  }
};
exports.respondToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    const case_ = await Case.findOneAndUpdate(
      {
        _id: caseId,
        "doctors.doctorId": req.user.userId,
      },
      {
        $set: { "doctors.$.status": status },
      },
      { new: true }
    );

    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }
    if (status === "approved" && !case_.primaryDoctor) {
      case_.primaryDoctor = req.user.userId;
      await case_.save();
    }

    res.json(case_);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating case status", error: err.message });
  }
};

exports.getDoctorAcceptedCases = async (req, res) => {
  try {
    const cases = await Case.find({
      doctors: {
        $elemMatch: {
          doctorId: req.user.userId,
          status: "approved",
        },
      },
    })
      .populate("patientId", "name age gender contact")
      .populate("doctors.doctorId", "name specialization")
      .populate("primaryDoctor", "name specialization");

    res.json(cases);
  } catch (err) {
    console.log("Error fetching accepted cases:", err);
    res
      .status(500)
      .json({ message: "Error fetching accepted cases", error: err.message });
  }
};

exports.isPrimaryDoctor = async (req, res) => {
  try {
    const { caseId } = req.params;
    const case_ = await Case.findById(caseId);

    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isPrimary = case_.primaryDoctor?.toString() === req.user.userId;
    res.json({ isPrimaryDoctor: isPrimary });
  } catch (err) {
    res.status(500).json({
      message: "Error checking primary doctor status",
      error: err.message,
    });
  }
};

exports.createMeeting = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { summary, description, startTime, endTime } = req.body;
    console.log(
      "Creating meeting for case:",
      caseId,
      summary,
      startTime,
      endTime
    );
    const caseData = await Case.findById(caseId)
      .populate("patientId")
      .populate("doctors.doctorId");
    if (!caseData) {
      console.log("Case not found");
      return res.status(404).json({ message: "Case not found" });
    }

    if (caseData.primaryDoctor.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Only the primary doctor can create a meeting" });
    }

    const meetLink = await createGoogleMeet(
      summary,
      description,
      startTime,
      endTime
    );

    if (!meetLink) {
      return res.status(500).json({ message: "Error creating Google Meet" });
    }

    const meeting = new Meeting({
      userId: req.user.userId,
      caseId,
      summary,
      description,
      startTime,
      endTime,
      meetLink,
    });
    await meeting.save();

    caseData.meetings.push(meeting._id);
    await caseData.save();

    const doctor = await doctorModel.findById(req.user.userId);
    if (!doctor.meetings) {
      doctor.meetings = [];
    }
    doctor.meetings.push(meeting._id);
    await doctor.save();

    const patient = await patientModel.findById(caseData.patientId._id);
    if (!patient.meetings) {
      patient.meetings = [];
    }
    patient.meetings.push(meeting._id);
    await patient.save();

    const otherDoctors = caseData.doctors.filter(
      (doctor) => doctor.doctorId._id.toString() !== req.user.userId
    );
    for (const doc of otherDoctors) {
      const otherDoctor = await doctorModel.findById(doc.doctorId._id);
      if (!otherDoctor.meetings) {
        otherDoctor.meetings = [];
      }
      otherDoctor.meetings.push(meeting._id);
      await otherDoctor.save();
    }

    let chat = await Chat.findOne({ caseId });
    if (!chat) {
      chat = new Chat({ caseId, messages: [] });
    }

    const messageContent = `Google Meet link: ${meetLink}`;
    chat.messages.push({
      sender: req.user.userId,
      senderModel: "Doctor",
      senderName: req.user.name,
      content: messageContent,
    });

    await chat.save();

    const notifications = [];

    notifications.push({
      userId: caseData.patientId._id,
      message: `A new Google Meet has been scheduled: ${summary}. Link: ${meetLink}`,
    });

    caseData.doctors.forEach((doctor) => {
      if (doctor.doctorId._id.toString() !== req.user.userId) {
        notifications.push({
          userId: doctor.doctorId._id,
          message: `A new Google Meet has been scheduled: ${summary}. Link: ${meetLink}`,
        });
      }
    });

    await Notification.insertMany(notifications);

    const emailPromises = [];

    emailPromises.push(
      sendEmail(
        patient.email,
        "New Google Meet Scheduled",
        `
        <h1>New Google Meet Scheduled</h1>
        <p>Dear ${patient.name},</p>
        <p>A new Google Meet has been scheduled for your case.</p>
        <p><strong>Summary:</strong> ${summary}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Start Time:</strong> ${new Date(
          startTime
        ).toLocaleString()}</p>
        <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
        <p><strong>Link:</strong> <a href="${meetLink}">${meetLink}</a></p>
        <p>Best regards,<br>ICanCare</p>
        `
      )
    );

    caseData.doctors.forEach((doctor) => {
      if (doctor.doctorId._id.toString() !== req.user.userId) {
        emailPromises.push(
          sendEmail(
            doctor.doctorId.email,
            "New Google Meet Scheduled",
            `
            <h1>New Google Meet Scheduled</h1>
            <p>Dear Dr. ${doctor.doctorId.name},</p>
            <p>A new Google Meet has been scheduled for a case you are involved in.</p>
            <p><strong>Summary:</strong> ${summary}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Start Time:</strong> ${new Date(
              startTime
            ).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(
              endTime
            ).toLocaleString()}</p>
            <p><strong>Link:</strong> <a href="${meetLink}">${meetLink}</a></p>
            <p>Best regards,<br>Your Healthcare Team</p>
            `
          )
        );
      }
    });

    await Promise.all(emailPromises);

    res.json({ message: "Meeting created successfully", meetLink });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating meeting", error: error.message });
  }
};

exports.renameCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Case name is required" });
    }

    const case_ = await Case.findById(caseId);

    if (!case_) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (
      case_.patientId.toString() !== req.user.userId &&
      !case_.doctors.some((doc) => doc.doctorId.toString() === req.user.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to rename this case" });
    }

    case_.name = name;
    await case_.save();

    res.json({ message: "Case renamed successfully", case: case_ });
  } catch (err) {
    console.error("Error renaming case:", err);
    res
      .status(500)
      .json({ message: "Error renaming case", error: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  const { doctorId, rating, comment } = req.body;

  try {
    const existingFeedback = await Feedback.findOne({
      doctorId,
      patientId: req.user.userId,
      caseId: req.params.caseId,
    });

    if (existingFeedback) {
      existingFeedback.rating = rating;
      existingFeedback.comment = comment;
      await existingFeedback.save();
    } else {
      const feedback = new Feedback({
        doctorId,
        patientId: req.user.userId,
        caseId: req.params.caseId,
        rating,
        comment,
      });

      await feedback.save();
    }

    const feedbacks = await Feedback.find({ doctorId });
    const totalRating = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    const averageRating = totalRating / feedbacks.length;

    const doctor = await Doctor.findById(doctorId);
    doctor.averageRating = averageRating;
    await doctor.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res
      .status(500)
      .json({ message: "Error submitting feedback", error: err.message });
  }
};

exports.getFeedbackStatus = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      patientId: req.user.userId,
      caseId: req.params.caseId,
    });
    const feedbackGiven = feedbacks.reduce((acc, feedback) => {
      acc[feedback.doctorId] = true;
      return acc;
    }, {});
    res.json(feedbackGiven);
  } catch (err) {
    console.error("Error fetching feedback status:", err);
    res
      .status(500)
      .json({ message: "Error fetching feedback status", error: err.message });
  }
};

exports.addLymphLog = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { size, date } = req.body;
    if (!size || !date) {
      return res.status(400).json({ message: "Size and date are required" });
    }
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    // Only allow doctors to add
    const isDoctor = caseDoc.doctors.some(
      (doc) => doc.doctorId.toString() === req.user.userId && doc.status === "approved"
    );
    if (!isDoctor) return res.status(403).json({ message: "Not authorized" });

    caseDoc.lymphLogs.push({
      size,
      date,
      addedBy: req.user.userId
    });
    await caseDoc.save();
    res.status(201).json({ message: "Lymph log added", lymphLogs: caseDoc.lymphLogs });
  } catch (err) {
    res.status(500).json({ message: "Error adding lymph log", error: err.message });
  }
};

exports.getLymphLogs = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseDoc = await Case.findById(caseId).populate("lymphLogs.addedBy", "name");
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });
    res.json(caseDoc.lymphLogs || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lymph logs", error: err.message });
  }
};


exports.addp2Log = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { size, date } = req.body;
    if (!size || !date) {
      return res.status(400).json({ message: "Size and date are required" });
    }
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    // Only allow doctors to add
    const isDoctor = caseDoc.doctors.some(
      (doc) => doc.doctorId.toString() === req.user.userId && doc.status === "approved"
    );
    if (!isDoctor) return res.status(403).json({ message: "Not authorized" });

    caseDoc.p2Logs.push({
      size,
      date,
      addedBy: req.user.userId
    });
    await caseDoc.save();
    res.status(201).json({ message: "p2 log added", p2Logs: caseDoc.p2Logs });
  } catch (err) {
    res.status(500).json({ message: "Error adding p2 log", error: err.message });
  }
};

exports.getp2Logs = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseDoc = await Case.findById(caseId).populate("p2Logs.addedBy", "name");
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });
    res.json(caseDoc.p2Logs || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching p2 logs", error: err.message });
  }
};
