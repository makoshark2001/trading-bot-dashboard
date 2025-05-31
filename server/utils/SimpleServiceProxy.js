const axios = require('axios');

class SimpleServiceProxy {
    constructor() {
        this.services = {
            core: process.env.CORE_SERVICE_URL || 'http://localhost:3000',
            ml: process.env.ML_SERVICE_URL || 'http://localhost:3001',
            backtest: process.env.BACKTEST_SERVICE_URL || 'http://localhost:3002'
        };
        this.timeout = 8000; // Increased timeout for better reliability
    }

    async checkHealth(serviceName) {
        try {
            const url = this.services[serviceName];
            const response = await axios.get(`${url}/api/health`, { timeout: this.timeout });
            return {
                service: serviceName,
                status: 'healthy',
                url: url,
                data: response.data
            };
        } catch (error) {
            return {
                service: serviceName,
                status: 'unhealthy',
                url: this.services[serviceName],
                error: error.message
            };
        }
    }

    async getAllHealth() {
        const results = await Promise.allSettled([
            this.checkHealth('core'),
            this.checkHealth('ml'),
            this.checkHealth('backtest')
        ]);

        return results.map(result => 
            result.status === 'fulfilled' ? result.value : {
                service: 'unknown',
                status: 'error',
                error: result.reason?.message || 'Unknown error'
            }
        );
    }

    // Enhanced core data fetching
    async getCoreData(pair = null) {
        try {
            const baseUrl = this.services.core;
            const endpoint = pair ? `/api/pair/${pair}` : '/api/data';
            
            console.log(`🔍 Fetching from core: ${baseUrl}${endpoint}`);
            
            const response = await axios.get(`${baseUrl}${endpoint}`, { 
                timeout: this.timeout,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'trading-bot-dashboard'
                }
            });
            
            console.log(`✅ Core response status: ${response.status}`);
            console.log(`📊 Core data type: ${typeof response.data}`);
            
            return response.data;
        } catch (error) {
            console.error(`❌ Core service error (${pair || 'all'}):`, error.message);
            throw error;
        }
    }

    // ML predictions
    async getMLPredictions(pair) {
        try {
            const baseUrl = this.services.ml;
            const endpoint = `/api/predictions/${pair}`;
            
            const response = await axios.get(`${baseUrl}${endpoint}`, { 
                timeout: this.timeout 
            });
            
            return response.data;
        } catch (error) {
            console.error(`ML service error for ${pair}:`, error.message);
            throw error;
        }
    }

    // Enhanced pairs fetching from backtest service
    async getAvailablePairs() {
        try {
            const baseUrl = this.services.backtest;
            const endpoint = '/api/pairs';
            
            console.log(`🔍 Fetching pairs from backtest: ${baseUrl}${endpoint}`);
            
            const response = await axios.get(`${baseUrl}${endpoint}`, { 
                timeout: this.timeout 
            });
            
            console.log(`✅ Backtest pairs response:`, response.data);
            
            return response.data;
        } catch (error) {
            console.error('Backtest pairs error:', error.message);
            throw error;
        }
    }

    // Backtest execution
    async runBacktest(pair, params = {}) {
        try {
            const baseUrl = this.services.backtest;
            const endpoint = pair === 'all' ? '/api/backtest/all' : `/api/backtest/${pair}`;
            
            const response = await axios.post(`${baseUrl}${endpoint}`, params, { 
                timeout: 30000  // Longer timeout for backtests
            });
            
            return response.data;
        } catch (error) {
            console.error(`Backtest error for ${pair}:`, error.message);
            throw error;
        }
    }

    // Test connectivity to all services
    async testConnectivity() {
        const results = {};
        
        for (const [serviceName, serviceUrl] of Object.entries(this.services)) {
            try {
                const response = await axios.get(`${serviceUrl}/api/health`, { 
                    timeout: this.timeout 
                });
                results[serviceName] = {
                    status: 'connected',
                    response: response.data,
                    url: serviceUrl
                };
            } catch (error) {
                results[serviceName] = {
                    status: 'disconnected',
                    error: error.message,
                    url: serviceUrl
                };
            }
        }
        
        return results;
    }
}

module.exports = SimpleServiceProxy;