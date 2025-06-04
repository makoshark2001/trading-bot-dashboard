// scripts/test-ml-service.js
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:3001';

async function testMLService() {
    console.log('🔍 Testing ML Service...');
    console.log('URL:', ML_SERVICE_URL);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 5000 });
        console.log('✅ Health Response:', healthResponse.data);
        
        // Test if there's a predictions endpoint structure
        console.log('\n2. Testing prediction endpoints...');
        const testPairs = ['RVN', 'XMR', 'BEL', 'DOGE', 'KAS', 'SAL'];
        
        for (const pair of testPairs) {
            try {
                console.log(`\n   Testing ${pair}...`);
                
                // Try different possible endpoint formats
                const endpoints = [
                    `/api/predictions/${pair}`,
                    `/api/prediction/${pair}`,
                    `/api/ml/${pair}`,
                    `/api/predict/${pair}`
                ];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await axios.get(`${ML_SERVICE_URL}${endpoint}`, { timeout: 3000 });
                        console.log(`   ✅ ${endpoint} works:`, response.data);
                        break; // If one works, move to next pair
                    } catch (endpointError) {
                        console.log(`   ❌ ${endpoint} failed: ${endpointError.response?.status || endpointError.message}`);
                    }
                }
                
            } catch (pairError) {
                console.log(`   ⚠️ No working endpoint found for ${pair}`);
            }
        }
        
        // Test root endpoints to see what's available
        console.log('\n3. Testing root endpoints...');
        try {
            const rootResponse = await axios.get(`${ML_SERVICE_URL}/api`, { timeout: 3000 });
            console.log('✅ Root API response:', rootResponse.data);
        } catch (rootError) {
            console.log('❌ Root API not available:', rootError.message);
        }
        
    } catch (error) {
        console.error('❌ ML Service test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 ML Service appears to be offline. Is it running on port 3001?');
            console.log('   Try: curl http://localhost:3001/api/health');
        }
    }
}

// Run the test
testMLService().catch(console.error);