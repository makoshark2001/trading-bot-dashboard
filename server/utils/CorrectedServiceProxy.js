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

    // Extract pairs from core data structure - FIXED FOR YOUR FORMAT
    extractPairsFromCoreData(coreData) {
        if (!coreData) {
            console.log('❌ No core data provided');
            return [];
        }

        // YOUR CORE SERVICE FORMAT: pairs are in coreData.pairs array
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

    // Create performance data from core data structure - FIXED FOR YOUR FORMAT
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
                // Get current price from history (latest close price)
                let price = 0;
                if (coreData.history && coreData.history[pair] && coreData.history[pair].closes) {
                    const closes = coreData.history[pair].closes;
                    price = closes[closes.length - 1] || 0;
                }

                // Get strategy results - YOUR FORMAT: coreData.strategyResults[pair]
                let technicalSignal = 'HOLD';
                let technicalConfidence = 0;
                
                if (coreData.strategyResults && coreData.strategyResults[pair]) {
                    const strategies = coreData.strategyResults[pair];
                    console.log(`🔍 Processing strategies for ${pair}:`, Object.keys(strategies));
                    
                    // Calculate ensemble signal from all strategies
                    const validStrategies = [];
                    let totalConfidence = 0;
                    let buySignals = 0;
                    let sellSignals = 0;
                    
                    // Process each strategy indicator
                    for (const [strategyName, strategyData] of Object.entries(strategies)) {
                        if (strategyData && strategyData.suggestion && strategyData.confidence !== undefined) {
                            validStrategies.push(strategyData);
                            totalConfidence += strategyData.confidence || 0;
                            
                            const suggestion = strategyData.suggestion.toLowerCase();
                            if (suggestion === 'buy') {
                                buySignals++;
                            } else if (suggestion === 'sell') {
                                sellSignals++;
                            }
                            
                            console.log(`  📈 ${strategyName}: ${strategyData.suggestion} (${(strategyData.confidence * 100).toFixed(1)}%)`);
                        }
                    }
                    
                    // Determine ensemble signal
                    if (validStrategies.length > 0) {
                        if (buySignals > sellSignals) {
                            technicalSignal = 'BUY';
                        } else if (sellSignals > buySignals) {
                            technicalSignal = 'SELL';
                        } else {
                            technicalSignal = 'HOLD';
                        }
                        
                        // Average confidence across all strategies
                        technicalConfidence = (totalConfidence / validStrategies.length) * 100;
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
                    dataSource: 'core',
                    strategies: coreData.strategyResults ? coreData.strategyResults[pair] : null,
                    priceData: priceData
                };

                performanceData.push(performanceItem);
                console.log(`✅ Created performance data for ${pair}:`, {
                    signal: technicalSignal,
                    confidence: technicalConfidence.toFixed(1) + '%',
                    price: price,
                    strategies: Object.keys(coreData.strategyResults[pair] || {}).length
                });

            } catch (error) {
                console.warn(`⚠️ Failed to create performance data for ${pair}:`, error.message);
            }
        }

        console.log(`📊 Performance summary: ${performanceData.length} pairs processed`);
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