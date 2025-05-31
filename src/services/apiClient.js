const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            mode: 'cors', // Enable CORS
            ...options
        };

        try {
            console.log(`🔍 API Request: ${config.method} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response: ${endpoint}`, data);
            return data;
        } catch (error) {
            console.error(`❌ API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Dashboard endpoints
    async getOverview() {
        return await this.request('/api/dashboard/overview');
    }

    async getPerformance() {
        return await this.request('/api/dashboard/performance');
    }

    async getBacktests() {
        return await this.request('/api/dashboard/backtests');
    }

    async getServicesHealth() {
        return await this.request('/api/dashboard/services');
    }

    // Backtest endpoints
    async runBacktest(pair, params = {}) {
        return await this.request(`/api/dashboard/backtest/${pair}`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    // Health check
    async checkHealth() {
        return await this.request('/api/health');
    }
}

const apiClient = new ApiClient();
export default apiClient;