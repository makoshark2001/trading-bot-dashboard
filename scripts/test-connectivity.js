const axios = require('axios');

const services = {
    'trading-bot-core': 'http://localhost:3000',
    'trading-bot-ml': 'http://localhost:3001', 
    'trading-bot-backtest': 'http://localhost:3002',
    'trading-bot-dashboard': 'http://localhost:3005'
};

async function testServiceConnectivity() {
    console.log('🔍 Testing service connectivity...\n');
    
    for (const [name, url] of Object.entries(services)) {
        try {
            const response = await axios.get(`${url}/api/health`, { timeout: 5000 });
            console.log(`✅ ${name}: ${response.data.status} (${response.status})`);
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    console.log('\n📊 Testing dashboard API integration...');
    
    try {
        const overview = await axios.get('http://localhost:3005/api/dashboard/overview');
        console.log('✅ Dashboard overview API working');
        
        const performance = await axios.get('http://localhost:3005/api/dashboard/performance');
        console.log('✅ Dashboard performance API working');
        
        const servicesHealth = await axios.get('http://localhost:3005/api/dashboard/services');
        console.log('✅ Dashboard services API working');
        
    } catch (error) {
        console.log(`❌ Dashboard API: ${error.message}`);
    }
}

testServiceConnectivity().catch(console.error);