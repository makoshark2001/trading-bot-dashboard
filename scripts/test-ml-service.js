// scripts/test-ml-service.js
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:3001';

async function testMLService() {
    console.log('🔍 Testing ML Service after changes...');
    console.log('URL:', ML_SERVICE_URL);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 5000 });
        console.log('✅ Health Response:', JSON.stringify(healthResponse.data, null, 2));
        
        // Test prediction endpoints with detailed structure analysis
        console.log('\n2. Testing prediction endpoints...');
        const testPairs = ['RVN', 'XMR', 'BEL'];
        
        for (const pair of testPairs) {
            try {
                console.log(`\n   Testing ${pair}...`);
                const response = await axios.get(`${ML_SERVICE_URL}/api/predictions/${pair}`, { timeout: 3000 });
                
                console.log(`   ✅ ${pair} FULL RESPONSE:`, JSON.stringify(response.data, null, 2));
                
                // Analyze the structure in detail
                const data = response.data;
                console.log(`   📊 ${pair} STRUCTURE ANALYSIS:`);
                console.log(`      - Top level keys:`, Object.keys(data));
                
                if (data.prediction) {
                    console.log(`      - prediction keys:`, Object.keys(data.prediction));
                    console.log(`      - prediction.prediction:`, data.prediction.prediction);
                    console.log(`      - prediction.confidence:`, data.prediction.confidence);
                    console.log(`      - prediction.direction:`, data.prediction.direction);
                    console.log(`      - prediction.signal:`, data.prediction.signal);
                    
                    // Check if structure changed
                    if (data.prediction.prediction) {
                        console.log(`      - prediction.prediction type:`, typeof data.prediction.prediction);
                        console.log(`      - prediction.prediction value:`, data.prediction.prediction);
                        
                        if (typeof data.prediction.prediction === 'object') {
                            console.log(`      - prediction.prediction keys:`, Object.keys(data.prediction.prediction));
                            console.log(`      - prediction.prediction['0']:`, data.prediction.prediction['0']);
                        }
                    }
                }
                
            } catch (pairError) {
                console.log(`   ❌ ${pair} failed:`, pairError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ ML Service test failed:', error.message);
    }
}

// Run the test
testMLService().catch(console.error);