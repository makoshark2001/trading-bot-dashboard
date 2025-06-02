const express = require('express');
const cors = require('cors');
require('dotenv').config();

const CorrectedServiceProxy = require('./utils/CorrectedServiceProxy');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize service proxy
const serviceProxy = new CorrectedServiceProxy();

// Add this debug logging:
console.log('🚀 Dashboard startup - using ServiceProxy methods:');
console.log('  - createPerformanceDataFromCore:', typeof serviceProxy.createPerformanceDataFromCore);
console.log('  - extractPairsFromCoreData:', typeof serviceProxy.extractPairsFromCoreData);

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

// Enhanced overview endpoint - fetch real data from core service
// Corrected overview endpoint
app.get('/api/dashboard/overview', async (req, res) => {
    try {
        console.log('📊 Fetching overview data...');
        
        // Get service health
        const services = await serviceProxy.getAllHealth();
        console.log('🔧 Services health:', services.map(s => `${s.service}: ${s.status}`));
        
        // Initialize overview data
        let overviewData = {
            timestamp: new Date().toISOString(),
            services: services,
            totalPairs: 0,
            actualPairs: 0,
            activePairs: 0,
            systemStatus: services.every(s => s.status === 'healthy') ? 'healthy' : 'degraded',
            lastUpdate: null,
            dataSource: 'fallback'
        };

        // Get real data from core service
        const coreService = services.find(s => s.service === 'core');
        if (coreService && coreService.status === 'healthy') {
            try {
                console.log('🔍 Fetching data from core service...');
                const coreData = await serviceProxy.getCoreData();
                
                if (coreData) {
                    const pairs = serviceProxy.extractPairsFromCoreData(coreData);
                    overviewData.totalPairs = pairs.length;
                    overviewData.actualPairs = pairs.length;
                    overviewData.activePairs = pairs.length; // Assume all pairs are active
                    overviewData.lastUpdate = coreData.lastUpdate;
                    overviewData.dataSource = 'core';
                    
                    console.log(`✅ Found ${pairs.length} pairs from core service`);
                }
            } catch (coreError) {
                console.warn('⚠️ Failed to fetch from core service:', coreError.message);
                overviewData.dataSource = 'fallback-core-error';
            }
        }

        console.log('✅ Final overview data:', {
            totalPairs: overviewData.totalPairs,
            actualPairs: overviewData.actualPairs,
            activePairs: overviewData.activePairs,
            dataSource: overviewData.dataSource
        });

        res.json(overviewData);
    } catch (error) {
        console.error('❌ Overview endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch overview data',
            message: error.message
        });
    }
});

// Performance endpoint - FIXED VERSION
app.get('/api/dashboard/performance', async (req, res) => {
    try {
        console.log('⚡ Fetching performance data...');
        
        // Get core data once and process it
        const coreData = await serviceProxy.getCoreData();
        
        if (!coreData) {
            return res.status(500).json({
                error: 'No data from core service',
                message: 'Core service returned empty data'
            });
        }
        
        // Use the CorrectedServiceProxy method to process the data
        const performanceData = serviceProxy.createPerformanceDataFromCore(coreData);
        
        if (performanceData.length === 0) {
            console.warn('⚠️ No performance data generated from core data');
        }
        
        // Try to enhance with ML predictions
        for (const item of performanceData) {
            try {
                const mlResult = await serviceProxy.getMLPredictions(item.pair);
                if (mlResult && mlResult.prediction !== undefined) {
                    item.mlPrediction = mlResult.prediction.probability;
                    item.mlConfidence = (mlResult.prediction.confidence || 0) * 100;
                }
            } catch (mlError) {
                console.log(`⚠️ ML data unavailable for ${item.pair}`);
            }
        }

        const summary = {
            totalPairs: performanceData.length,
            bullishSignals: performanceData.filter(p => p.technicalSignal === 'BUY').length,
            bearishSignals: performanceData.filter(p => p.technicalSignal === 'SELL').length,
            averageConfidence: performanceData.length > 0 
                ? performanceData.reduce((sum, p) => sum + p.technicalConfidence, 0) / performanceData.length 
                : 0
        };

        console.log('⚡ Performance summary:', summary);

        res.json({
            timestamp: new Date().toISOString(),
            pairs: performanceData,
            summary: summary
        });
    } catch (error) {
        console.error('❌ Performance endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch performance data',
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
    console.log(`🚀 Trading Bot Dashboard running on port ${PORT}`);
    console.log('🔗 Service URLs:', {
        core: serviceProxy.services.core,
        ml: serviceProxy.services.ml,
        backtest: serviceProxy.services.backtest
    });
    console.log('🌐 Access dashboard at: http://localhost:3010');
});

module.exports = app;