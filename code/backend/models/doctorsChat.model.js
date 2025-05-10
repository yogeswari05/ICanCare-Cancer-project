const mongoose = require('mongoose');

const doctorsChatSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

doctorsChatSchema.index({ caseId: 1 });

const DoctorsChat = mongoose.model('DoctorsChat', doctorsChatSchema);
module.exports = DoctorsChat;