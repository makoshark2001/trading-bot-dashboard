const express = require('express');
const cors = require('cors');
require('dotenv').config();

const SimpleServiceProxy = require('./utils/SimpleServiceProxy');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize service proxy
const serviceProxy = new SimpleServiceProxy();

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'trading-bot-dashboard',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Services health endpoint
app.get('/api/dashboard/services', async (req, res) => {
    try {
        const services = await serviceProxy.getAllHealth();
        res.json({
            timestamp: new Date().toISOString(),
            services: services,
            overall: services.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to check services',
            message: error.message
        });
    }
});

// Overview endpoint
app.get('/api/dashboard/overview', async (req, res) => {
    try {
        const services = await serviceProxy.getAllHealth();
        res.json({
            timestamp: new Date().toISOString(),
            services: services,
            totalPairs: 6,
            activePairs: 6,
            systemStatus: services.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch overview',
            message: error.message
        });
    }
});

// Performance endpoint
app.get('/api/dashboard/performance', async (req, res) => {
    try {
        res.json({
            timestamp: new Date().toISOString(),
            pairs: [],
            summary: {
                totalPairs: 0,
                bullishSignals: 0,
                bearishSignals: 0,
                averageConfidence: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch performance',
            message: error.message
        });
    }
});

// Backtests endpoint
app.get('/api/dashboard/backtests', async (req, res) => {
    try {
        res.json({
            timestamp: new Date().toISOString(),
            recent: [],
            summary: {
                totalRuns: 0,
                averageReturn: 0,
                bestPerformer: null,
                worstPerformer: null
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch backtests',
            message: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const services = await serviceProxy.getAllHealth();
        res.json({
            message: 'Dashboard API is working',
            timestamp: new Date().toISOString(),
            services: services
        });
    } catch (error) {
        res.status(500).json({
            error: 'Test failed',
            message: error.message
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Dashboard Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Trading Bot Dashboard running on port ${PORT}`);
    console.log('Service URLs:', {
        core: serviceProxy.services.core,
        ml: serviceProxy.services.ml,
        backtest: serviceProxy.services.backtest
    });
});

module.exports = app;