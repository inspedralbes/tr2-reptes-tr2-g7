const mongoose = require('mongoose');

const piSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentId: { // Optional internal ID or similar
        type: String,
        required: false
    },
    content: { // Extracted text from DOCX
        type: String,
        required: true
    },
    originalFileName: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PI', piSchema);
