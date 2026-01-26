const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// Only Master can chat (Teacher role)
router.post('/', protect, authorize('master'), chatWithAI);

module.exports = router;
