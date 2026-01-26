const multer = require('multer');
const path = require('path');

// Set storage engine (Memory storage for immediate processing or Disk for persistence)
// For this task, we want to extract text immediately, but maybe keep file too. 
// Let's use memory storage to pass buffer to mammoth.
const storage = multer.memoryStorage();

// checkFileType removed


const upload = multer({
    storage: storage
});

module.exports = upload;
