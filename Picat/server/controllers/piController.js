const PI = require('../models/PI');
const mammoth = require('mammoth');
const extractOdtText = require('../utils/odtParser');
const path = require('path');

// @desc    Upload a new PI
// @route   POST /api/pis
// @access  Private (Director)
const uploadPI = async (req, res) => {
    if (!req.file) {
        console.log('DEBUG: req.file is missing');
        return res.status(400).json({ message: 'DEBUG: No file received' });
    }

    const { studentName, studentId } = req.body;

    if (!studentName) {
        return res.status(400).json({ message: 'Student Name is required' });
    }

    try {
        let text = '';
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            text = result.value;
        } else if (ext === '.odt') {
            text = await extractOdtText(req.file.buffer);
        } else {
            // Fallback: Read as UTF-8 text for any other extension
            text = req.file.buffer.toString('utf8');
        }

        const pi = await PI.create({
            studentName,
            studentId,
            content: text,
            originalFileName: req.file.originalname,
            createdBy: req.user._id
        });

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('pi:updated', { type: 'create', pi });

        res.status(201).json(pi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing file' });
    }
};

// @desc    Get all PIs
// @route   GET /api/pis
// @access  Private (Director, Master)
const getPIs = async (req, res) => {
    try {
        const pis = await PI.find().sort({ createdAt: -1 });
        res.json(pis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a PI
// @route   DELETE /api/pis/:id
// @access  Private (Director)
const deletePI = async (req, res) => {
    try {
        const pi = await PI.findById(req.params.id);

        if (!pi) {
            return res.status(404).json({ message: 'PI not found' });
        }

        await pi.deleteOne();

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('pi:updated', { type: 'delete', id: req.params.id });

        res.json({ message: 'PI removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadPI,
    getPIs,
    deletePI
};
