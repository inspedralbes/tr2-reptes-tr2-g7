const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI.includes('[PASSWORD_ENV]')) {
            console.error('ERROR: Placeholder [PASSWORD_ENV] still in MONGODB_URI. Please update .env file.');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
