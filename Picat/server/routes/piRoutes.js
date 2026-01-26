const express = require('express');
const router = express.Router();
const { uploadPI, getPIs, deletePI } = require('../controllers/piController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Director can upload (create) and delete
// Master can read (get)
// Admin has NO access to PIs (Privacy)

router.route('/')
    .get(protect, authorize('director', 'master'), getPIs)
    .post(protect, authorize('director'), upload.single('file'), uploadPI);

router.route('/:id')
    .delete(protect, authorize('director'), deletePI);

module.exports = router;
