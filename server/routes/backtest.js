const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Run backtest for specific pair
router.post('/run/:pair', async (req, res) => {
    try {
        const { pair } = req.params;
        const params = req.body;
        const serviceProxy = req.app.locals.serviceProxy;
        
        logger.info(`Running backtest for ${pair} with params:`, params);
        
        const result = await serviceProxy.runBacktest(pair, params);
        res.json(result);
    } catch (error) {
        logger.error('Backtest proxy error:', error);
        res.status(500).json({
            error: 'Failed to run backtest',
            message: error.message
        });
    }
});

// Run backtest for all pairs
router.post('/run/all', async (req, res) => {
    try {
        const params = req.body;
        const serviceProxy = req.app.locals.serviceProxy;
        
        logger.info(`Running backtest for all pairs with params:`, params);
        
        const result = await serviceProxy.runBacktest('all', params);
        res.json(result);
    } catch (error) {
        logger.error('Backtest all pairs proxy error:', error);
        res.status(500).json({
            error: 'Failed to run backtest for all pairs',
            message: error.message
        });
    }
});

// Get available pairs
router.get('/pairs', async (req, res) => {
    try {
        const serviceProxy = req.app.locals.serviceProxy;
        const pairs = await serviceProxy.getAvailablePairs();
        res.json({ pairs });
    } catch (error) {
        logger.error('Get pairs error:', error);
        res.status(500).json({
            error: 'Failed to get available pairs',
            message: error.message
        });
    }
});

module.exports = router;