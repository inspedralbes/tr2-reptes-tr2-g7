const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');
connectDB();

const seedAdmin = async () => {
    try {
        const userExists = await User.findOne({ username: 'Daniel' });

        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const adminUser = new User({
            username: 'Daniel',
            password: '123456', // Will be hashed by pre-save middleware
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
