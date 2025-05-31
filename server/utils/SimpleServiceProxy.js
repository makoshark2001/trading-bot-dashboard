const axios = require('axios');

class SimpleServiceProxy {
    constructor() {
        this.services = {
            core: process.env.CORE_SERVICE_URL || 'http://localhost:3000',
            ml: process.env.ML_SERVICE_URL || 'http://localhost:3001',
            backtest: process.env.BACKTEST_SERVICE_URL || 'http://localhost:3002'
        };
        this.timeout = 5000;
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
}

module.exports = SimpleServiceProxy;