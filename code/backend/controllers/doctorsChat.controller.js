const DoctorsChat = require('../models/doctorsChat.model');
const Case = require('../models/case.model');
const Doctor = require('../models/doctor.model');

exports.checkDoctorAccess = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;
    
    const caseData = await Case.findOne({
      _id: caseId,
      doctors: {
        $elemMatch: {
          doctorId: userId,
          status: "approved"
        }
      }
    });
    
    if (!caseData) {
      return res.status(403).json({ 
        isDoctor: false,
        message: 'You are not authorized to access this chat' 
      });
    }
    
    const doctor = await Doctor.findById(userId);
    
    res.json({
      isDoctor: true,
      user: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor'
      }
    });
  } catch (err) {
    console.error('Error checking doctor access:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;
    
    const caseData = await Case.findOne({
      _id: caseId,
      doctors: {
        $elemMatch: {
          doctorId: userId,
          status: "approved"
        }
      }
    });
    
    if (!caseData) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }
    
    let doctorsChat = await DoctorsChat.findOne({ caseId })
      .populate('messages.senderId', 'name email');
    
    if (!doctorsChat) {
      doctorsChat = new DoctorsChat({ caseId, messages: [] });
      await doctorsChat.save();
    }
    
    res.json(doctorsChat.messages);
  } catch (err) {
    console.error('Error fetching doctors chat messages:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const caseData = await Case.findOne({
      _id: caseId,
      doctors: {
        $elemMatch: {
          doctorId: userId,
          status: "approved"
        }
      }
    });
    
    if (!caseData) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    
    let doctorsChat = await DoctorsChat.findOne({ caseId });
    
    if (!doctorsChat) {
      doctorsChat = new DoctorsChat({ caseId, messages: [] });
    }
    
    const newMessage = {
      senderId: userId,
      content,
      timestamp: new Date()
    };
    
    doctorsChat.messages.push(newMessage);
    await doctorsChat.save();
    
    const doctor = await Doctor.findById(userId);
    
    const formattedMessage = {
      _id: doctorsChat.messages[doctorsChat.messages.length - 1]._id,
      senderId: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor'
      },
      content,
      timestamp: newMessage.timestamp
    };
    
    res.status(201).json(formattedMessage);
  } catch (err) {
    console.error('Error sending message to doctors chat:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
