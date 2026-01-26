const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now (dev mode)
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Make io accessible in routes
app.set('io', io);

// Serve frontend
const path = require('path');
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        // Exclude API routes from wildcard catch
        if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API Route not found' });
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    // Basic Route for dev
    app.get('/', (req, res) => {
        res.send('Picat API is running... (Dev Mode)');
    });
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pis', require('./routes/piRoutes'));
app.use('/api/chat', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
