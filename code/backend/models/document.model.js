const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    filesize: {
        type: Number,
        required: true
    },
    filetype: {
        type: String,
        required: true
    },
    fileData: {
        type: Buffer, 
        required: true
    },
    encryptionIV: {
        type: String,
        required: true
    },
    caseId: {
        type: String,
        ref: 'Case',
        required: true
    },
    uploadedBy: {
        type: String,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    summary: {
        type: String,
        default: ''
    },
    summaryType: {
        type: String,
        enum: ['basic', 'openai', 'unknown'],
        default: 'unknown'
    },
    lastSummarized: {
        type: Date,
        default: null
    }
}, { timestamps: true });


const Document = mongoose.model('Document', documentSchema);

module.exports = Document;