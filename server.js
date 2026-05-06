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

// MongoDB connection - WITHOUT deprecated options
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voting-system';

console.log('Attempting to connect to MongoDB...');
console.log('Using URI:', MONGODB_URI ? MONGODB_URI.substring(0, 60) + '...' : 'NO URI PROVIDED');

// Simplified connection without deprecated options
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
})
.catch((err) => {
    console.log('❌ MongoDB connection error:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/candidates', candidateRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Voting System API is running!', 
        status: 'active',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Test endpoint to check env variables
app.get('/api/debug/env', (req, res) => {
    res.json({
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        mongodb_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) : null,
        port: process.env.PORT,
        node_env: process.env.NODE_ENV
    });
});

// For Render deployment - use the port assigned by Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
