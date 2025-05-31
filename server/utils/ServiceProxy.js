const axios = require('axios');
const logger = require('./logger');

class ServiceProxy {
    constructor(serviceUrls) {
        this.services = {
            core: serviceUrls.coreUrl,
            ml: serviceUrls.mlUrl,
            backtest: serviceUrls.backtestUrl
        };
        
        // Configure axios defaults
        this.timeout = 10000;
    }

    async checkServiceHealth(serviceName) {
        try {
            const url = this.services[serviceName];
            if (!url) {
                throw new Error(`Unknown service: ${serviceName}`);
            }

            const response = await axios.get(`${url}/api/health`, {
                timeout: this.timeout
            });
            
            return {
                service: serviceName,
                status: 'healthy',
                url: url,
                response: response.data,
                responseTime: Date.now()
            };
        } catch (error) {
            logger.error(`Health check failed for ${serviceName}:`, error.message);
            return {
                service: serviceName,
                status: 'unhealthy',
                url: this.services[serviceName],
                error: error.message,
                responseTime: Date.now()
            };
        }
    }

    async getAllServicesHealth() {
        const healthChecks = await Promise.allSettled([
            this.checkServiceHealth('core'),
            this.checkServiceHealth('ml'),
            this.checkServiceHealth('backtest')
        ]);

        return healthChecks.map(result => 
            result.status === 'fulfilled' ? result.value : {
                service: 'unknown',
                status: 'error',
                error: result.reason?.message || 'Unknown error'
            }
        );
    }

    async proxyRequest(service, endpoint, method = 'GET', data = null) {
        try {
            const baseUrl = this.services[service];
            if (!baseUrl) {
                throw new Error(`Unknown service: ${service}`);
            }

            const config = {
                method,
                url: `${baseUrl}${endpoint}`,
                timeout: this.timeout
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            logger.error(`Proxy request failed for ${service}${endpoint}:`, error.message);
            throw error;
        }
    }

    // Specific service methods
    async getCoreData(pair = null) {
        const endpoint = pair ? `/api/pair/${pair}` : '/api/data';
        return await this.proxyRequest('core', endpoint);
    }

    async getMLPredictions(pair) {
        return await this.proxyRequest('ml', `/api/predictions/${pair}`);
    }

    async runBacktest(pair, params = {}) {
        const endpoint = pair === 'all' ? '/api/backtest/all' : `/api/backtest/${pair}`;
        return await this.proxyRequest('backtest', endpoint, 'POST', params);
    }

    async getAvailablePairs() {
        return await this.proxyRequest('backtest', '/api/pairs');
    }
}

module.exports = ServiceProxy;