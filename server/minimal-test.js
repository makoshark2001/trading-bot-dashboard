const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'trading-bot-dashboard',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Dashboard API is working',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Minimal Dashboard server running on port ${PORT}`);
});