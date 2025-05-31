const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Overview endpoint - aggregates data from all services
router.get('/overview', async (req, res) => {
    try {
        const serviceProxy = req.app.locals.serviceProxy;
        
        // Get service health
        const servicesHealth = await serviceProxy.getAllServicesHealth();
        
        // Get core data for overview
        let coreData = [];
        let pairs = [];
        
        try {
            coreData = await serviceProxy.getCoreData();
            pairs = await serviceProxy.getAvailablePairs();
        } catch (serviceError) {
            logger.warn('Some services unavailable for overview:', serviceError.message);
        }

        // Calculate overview metrics
        const overview = {
            timestamp: new Date().toISOString(),
            services: servicesHealth,
            totalPairs: pairs.length || 0,
            activePairs: Array.isArray(coreData) ? coreData.length : 0,
            lastUpdate: Array.isArray(coreData) && coreData[0] ? coreData[0].timestamp : null,
            systemStatus: servicesHealth.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        };

        res.json(overview);
    } catch (error) {
        logger.error('Overview endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch overview data',
            message: error.message
        });
    }
});

// Performance endpoint - real-time strategy performance
router.get('/performance', async (req, res) => {
    try {
        const serviceProxy = req.app.locals.serviceProxy;
        
        let pairs = [];
        const performanceData = [];
        
        try {
            pairs = await serviceProxy.getAvailablePairs();
        } catch (serviceError) {
            logger.warn('Could not get pairs list:', serviceError.message);
            // Fallback to known pairs
            pairs = ['XMR_USDT', 'RVN_USDT', 'BEL_USDT', 'DOGE_USDT', 'KAS_USDT', 'SAL_USDT'];
        }
        
        // Get data for each pair (limit to first 6 for performance)
        const limitedPairs = pairs.slice(0, 6);
        
        for (const pair of limitedPairs) {
            try {
                const [coreData, mlPredictions] = await Promise.allSettled([
                    serviceProxy.getCoreData(pair),
                    serviceProxy.getMLPredictions(pair)
                ]);

                const coreResult = coreData.status === 'fulfilled' ? coreData.value : null;
                const mlResult = mlPredictions.status === 'fulfilled' ? mlPredictions.value : null;

                if (coreResult && coreResult.strategies) {
                    performanceData.push({
                        pair,
                        price: coreResult.price || 0,
                        technicalSignal: coreResult.strategies.ensemble?.signal || 'HOLD',
                        technicalConfidence: coreResult.strategies.ensemble?.confidence || 0,
                        mlPrediction: mlResult?.prediction || null,
                        mlConfidence: mlResult?.confidence || 0,
                        timestamp: coreResult.timestamp || new Date().toISOString()
                    });
                }
            } catch (pairError) {
                logger.warn(`Failed to get performance data for ${pair}:`, pairError.message);
            }
        }

        res.json({
            timestamp: new Date().toISOString(),
            pairs: performanceData,
            summary: {
                totalPairs: performanceData.length,
                bullishSignals: performanceData.filter(p => p.technicalSignal === 'BUY').length,
                bearishSignals: performanceData.filter(p => p.technicalSignal === 'SELL').length,
                averageConfidence: performanceData.length > 0 
                    ? performanceData.reduce((sum, p) => sum + p.technicalConfidence, 0) / performanceData.length 
                    : 0
            }
        });
    } catch (error) {
        logger.error('Performance endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch performance data',
            message: error.message
        });
    }
});

// Backtests endpoint - recent backtest results
router.get('/backtests', async (req, res) => {
    try {
        // For now, return placeholder data
        // In a full implementation, you'd store backtest results in a database
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
        logger.error('Backtests endpoint error:', error);
        res.status(500).json({
            error: 'Failed to fetch backtest data',
            message: error.message
        });
    }
});

// Services health endpoint
router.get('/services', async (req, res) => {
    try {
        const serviceProxy = req.app.locals.serviceProxy;
        const servicesHealth = await serviceProxy.getAllServicesHealth();
        
        res.json({
            timestamp: new Date().toISOString(),
            services: servicesHealth,
            overall: servicesHealth.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        });
    } catch (error) {
        logger.error('Services health endpoint error:', error);
        res.status(500).json({
            error: 'Failed to check services health',
            message: error.message
        });
    }
});

module.exports = router;