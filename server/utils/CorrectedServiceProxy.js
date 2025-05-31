const axios = require('axios');

class CorrectedServiceProxy {
    constructor() {
        this.services = {
            core: process.env.CORE_SERVICE_URL || 'http://localhost:3000',
            ml: process.env.ML_SERVICE_URL || 'http://localhost:3001',
            backtest: process.env.BACKTEST_SERVICE_URL || 'http://localhost:3002'
        };
        this.timeout = 10000;
    }

    async checkHealth(serviceName) {
        try {
            const url = this.services[serviceName];
            console.log(`🔍 Health check for ${serviceName} at ${url}/api/health`);
            const response = await axios.get(`${url}/api/health`, { timeout: this.timeout });
            console.log(`✅ ${serviceName} health check successful`);
            return {
                service: serviceName,
                status: 'healthy',
                url: url,
                data: response.data
            };
        } catch (error) {
            console.log(`❌ ${serviceName} health check failed: ${error.message}`);
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

    // Core service data fetch - matches your ExpressApp.js structure
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
            
            console.log(`✅ Core response received:`, {
                status: response.status,
                dataType: typeof response.data,
                hasData: !!response.data
            });

            // Based on your ExpressApp.js, the response structure should be:
            // {
            //   uptime: "...",
            //   pairs: ["XMR", "RVN", ...],
            //   history: { "XMR": {...}, "RVN": {...} },
            //   strategyResults: { "XMR": {...}, "RVN": {...} },
            //   stats: {...},
            //   status: "running",
            //   lastUpdate: "..."
            // }

            if (response.data) {
                console.log(`📊 Core data structure:`, {
                    hasPairs: !!response.data.pairs,
                    pairsLength: response.data.pairs ? response.data.pairs.length : 0,
                    hasHistory: !!response.data.history,
                    hasStrategyResults: !!response.data.strategyResults,
                    keys: Object.keys(response.data)
                });
            }
            
            return response.data;
        } catch (error) {
            console.error(`❌ Core service error:`, error.message);
            throw error;
        }
    }

    // Extract pairs from core data structure
    extractPairsFromCoreData(coreData) {
        if (!coreData) {
            console.log('❌ No core data provided');
            return [];
        }

        // Based on your ExpressApp.js, pairs should be in coreData.pairs array
        if (coreData.pairs && Array.isArray(coreData.pairs)) {
            console.log(`✅ Found ${coreData.pairs.length} pairs in coreData.pairs:`, coreData.pairs);
            return coreData.pairs;
        }

        // Fallback: extract from history object keys
        if (coreData.history && typeof coreData.history === 'object') {
            const historyPairs = Object.keys(coreData.history);
            console.log(`✅ Found ${historyPairs.length} pairs in coreData.history:`, historyPairs);
            return historyPairs;
        }

        // Fallback: extract from strategyResults object keys
        if (coreData.strategyResults && typeof coreData.strategyResults === 'object') {
            const strategyPairs = Object.keys(coreData.strategyResults);
            console.log(`✅ Found ${strategyPairs.length} pairs in coreData.strategyResults:`, strategyPairs);
            return strategyPairs;
        }

        console.log('❌ No pairs found in core data structure');
        return [];
    }

    // Create performance data from core data structure
    createPerformanceDataFromCore(coreData) {
        const performanceData = [];
        
        if (!coreData) {
            console.log('❌ No core data for performance extraction');
            return performanceData;
        }

        const pairs = this.extractPairsFromCoreData(coreData);
        console.log(`🔍 Creating performance data for ${pairs.length} pairs`);

        for (const pair of pairs) {
            try {
                // Get price from history
                let price = 0;
                if (coreData.history && coreData.history[pair] && coreData.history[pair].closes) {
                    const closes = coreData.history[pair].closes;
                    price = closes[closes.length - 1] || 0;
                }

                // Get strategy results
                let technicalSignal = 'HOLD';
                let technicalConfidence = 0;
                
                if (coreData.strategyResults && coreData.strategyResults[pair]) {
                    const strategies = coreData.strategyResults[pair];
                    
                    // Look for ensemble signal or calculate from individual strategies
                    if (strategies.ensemble) {
                        technicalSignal = strategies.ensemble.suggestion?.toUpperCase() || 'HOLD';
                        technicalConfidence = (strategies.ensemble.confidence || 0) * 100;
                    } else {
                        // Calculate from individual strategies
                        const validStrategies = Object.values(strategies).filter(s => s && !s.error && s.suggestion);
                        if (validStrategies.length > 0) {
                            const buyCount = validStrategies.filter(s => s.suggestion === 'buy').length;
                            const sellCount = validStrategies.filter(s => s.suggestion === 'sell').length;
                            
                            if (buyCount > sellCount) {
                                technicalSignal = 'BUY';
                            } else if (sellCount > buyCount) {
                                technicalSignal = 'SELL';
                            }
                            
                            technicalConfidence = validStrategies.reduce((sum, s) => sum + (s.confidence || 0), 0) / validStrategies.length * 100;
                        }
                    }
                }

                const performanceItem = {
                    pair: pair,
                    price: price,
                    technicalSignal: technicalSignal,
                    technicalConfidence: technicalConfidence,
                    mlPrediction: null, // Will be filled by ML service if available
                    mlConfidence: 0,
                    timestamp: coreData.lastUpdate || new Date().toISOString(),
                    dataSource: 'core'
                };

                performanceData.push(performanceItem);
                console.log(`✅ Created performance data for ${pair}:`, {
                    signal: technicalSignal,
                    confidence: technicalConfidence.toFixed(1),
                    price: price
                });

            } catch (error) {
                console.warn(`⚠️ Failed to create performance data for ${pair}:`, error.message);
            }
        }

        return performanceData;
    }

    // ML predictions (may not be available)
    async getMLPredictions(pair) {
        try {
            const baseUrl = this.services.ml;
            const endpoint = `/api/predictions/${pair}`;
            
            const response = await axios.get(`${baseUrl}${endpoint}`, { timeout: this.timeout });
            return response.data;
        } catch (error) {
            console.warn(`ML service unavailable for ${pair}:`, error.message);
            return null;
        }
    }

    // Get available pairs - use core service as primary source
    async getAvailablePairs() {
        try {
            console.log('🔍 Getting available pairs from core service...');
            const coreData = await this.getCoreData();
            const pairs = this.extractPairsFromCoreData(coreData);
            
            if (pairs.length > 0) {
                console.log(`✅ Found ${pairs.length} pairs from core service`);
                return { pairs: pairs, source: 'core' };
            }
        } catch (error) {
            console.warn('⚠️ Failed to get pairs from core service:', error.message);
        }

        // Fallback to backtest service (probably won't work but try anyway)
        try {
            const baseUrl = this.services.backtest;
            const response = await axios.get(`${baseUrl}/api/pairs`, { timeout: this.timeout });
            return response.data;
        } catch (error) {
            console.warn('⚠️ Backtest service also unavailable:', error.message);
            throw new Error('No services available for pairs data');
        }
    }

    // Backtest execution (may not be implemented yet)
    async runBacktest(pair, params = {}) {
        try {
            const baseUrl = this.services.backtest;
            const endpoint = pair === 'all' ? '/api/backtest/all' : `/api/backtest/${pair}`;
            
            const response = await axios.post(`${baseUrl}${endpoint}`, params, { 
                timeout: 30000 
            });
            
            return response.data;
        } catch (error) {
            console.warn(`Backtest service unavailable for ${pair}:`, error.message);
            // Return mock data for now
            return {
                pair: pair,
                totalReturn: (Math.random() * 40 - 20).toFixed(2),
                winRate: (Math.random() * 40 + 40).toFixed(1),
                totalTrades: Math.floor(Math.random() * 100 + 20),
                sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
                maxDrawdown: (Math.random() * 15 + 5).toFixed(2),
                status: 'mock'
            };
        }
    }
}

module.exports = CorrectedServiceProxy;