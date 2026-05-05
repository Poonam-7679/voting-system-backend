const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// CORS configuration (important for frontend connection)
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:3000', 'https://*.onrender.com', 'https://*.netlify.app'],
    credentials: true
}));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voting-system';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/candidates', candidateRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Voting System API is running!', status: 'active' });
});

// For Render deployment - use the port assigned by Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;