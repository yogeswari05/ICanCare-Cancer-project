const Feedback = require("../models/feedback.model");
const Doctor = require("../models/doctor.model");

exports.submitFeedback = async (req, res) => {
  const { doctorId, rating, comment } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const feedback = new Feedback({
      doctorId,
      patientId: req.user.userId,
      rating,
      comment,
    });

    await feedback.save();

    const feedbacks = await Feedback.find({ doctorId });
    const totalRating = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    const averageRating = totalRating / feedbacks.length;

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
