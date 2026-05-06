const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Debug: Check if environment variables are loaded
console.log('===== ENVIRONMENT VARIABLES CHECK =====');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', process.env.MONGODB_URI ? 'YES' : 'NO');
console.log('MONGODB_URI value (first 50 chars):', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) : 'UNDEFINED');
console.log('JWT_SECRET exists:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('========================================');

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:3000', 'https://*.onrender.com', 'https://*.netlify.app'],
    credentials: true
}));
app.use(express.json());

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voting-system';

console.log('Attempting to connect to MongoDB...');

// Connection options for better reliability
const mongooseOptions = {
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};

// Simplified connection without deprecated options
mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
})
.catch((err) => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('Please check:');
    console.log('1. IP whitelist in MongoDB Atlas (add 0.0.0.0/0 or Render IPs)');
    console.log('2. Connection string is correct');
    console.log('3. Database user has proper permissions');
});

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/candidates', candidateRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
        message: 'Voting System API is running!', 
        status: 'active',
        mongodb: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Test endpoint to check env variables
app.get('/api/debug/env', (req, res) => {
    res.json({
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        mongodb_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) : null,
        port: process.env.PORT,
        node_env: process.env.NODE_ENV,
        mongodb_status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Test endpoint to check database connection
app.get('/api/debug/db', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusText = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }[dbStatus];
        
        res.json({
            connection_status: statusText,
            ready_state: dbStatus,
            database_name: mongoose.connection.db ? mongoose.connection.db.databaseName : null
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// For Render deployment - use the port assigned by Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
