# trading-bot-dashboard - Development Guide

**Repository**: https://github.com/makoshark2001/trading-bot-dashboard  
**Port**: 3005 (server) / 3010 (frontend)  
**Priority**: 6 (Final Integration - Depends on all other services)

## 🎯 Service Purpose

Unified monitoring and visualization service providing a comprehensive web interface for monitoring and controlling the entire trading bot ecosystem. Integrates with all other services to deliver real-time data visualization and system administration tools.

## 💬 Chat Instructions for Claude

```
I'm building the unified dashboard that provides a web interface for monitoring and controlling the entire trading bot ecosystem. All other services are running and I need to create a comprehensive monitoring and control interface.

Key requirements:
- React frontend with real-time data visualization
- Express backend aggregating data from all services
- Service health monitoring and status display
- Interactive backtesting interface
- Real-time performance monitoring
- System administration tools
- Modern, responsive design with dark theme

Services already running:
- Core service (port 3000) - Market data and technical analysis
- ML service (port 3001) - Machine learning predictions
- Backtest service (port 3002) - Strategy testing
- Risk service (port 3003) - Risk management
- Execution service (port 3004) - Trade execution

I need to build a dashboard that brings it all together.
```

## 📋 Implementation To-Do List

### ✅ Phase 6A: Backend Server Setup

- [ ] **Project Infrastructure**
  - [ ] Initialize Node.js project: `npm init -y`
  - [ ] Install backend dependencies:
    ```bash
    npm install express axios cors winston dotenv lodash
    npm install --save-dev nodemon jest
    ```
  - [ ] Create folder structure:
    ```
    server/
    ├── main.js
    ├── routes/
    ├── utils/
    └── services/
    src/                    # React frontend
    ├── components/
    ├── services/
    └── utils/
    public/
    config/
    logs/
    ```

- [ ] **Service Proxy Layer**
  - [ ] File: `server/utils/ServiceProxy.js` - Multi-service integration
  - [ ] Health monitoring for all 5 services
  - [ ] Data aggregation from multiple endpoints
  - [ ] Error handling and fallback mechanisms
  - [ ] Request caching and optimization

- [ ] **Dashboard API Server**
  - [ ] File: `server/main.js` - Express server on port 3005
  - [ ] CORS configuration for React frontend
  - [ ] Service proxy endpoints
  - [ ] Health check aggregation
  - [ ] Error handling middleware

### ✅ Phase 6B: React Frontend Setup

- [ ] **React Project Setup**
  - [ ] Initialize React app: `npx create-react-app . --template typescript`
  - [ ] Install frontend dependencies:
    ```bash
    npm install axios recharts lucide-react
    npm install --save-dev @types/node
    ```
  - [ ] Configure React to run on port 3010
  - [ ] Set up proxy to backend server (port 3005)

- [ ] **Core Components Structure**
  - [ ] File: `src/App.js` - Main application container
  - [ ] File: `src/components/ServiceStatus.js` - Service health display
  - [ ] File: `src/components/DashboardOverview.js` - System metrics
  - [ ] File: `src/components/PerformanceMonitor.js` - Trading performance
  - [ ] File: `src/components/BacktestRunner.js` - Interactive backtesting
  - [ ] File: `src/services/apiClient.js` - API communication layer

### ✅ Phase 6C: Service Integration Dashboard

- [ ] **Service Status Monitor**
  - [ ] Real-time health checks for all 5 services
  - [ ] Color-coded status indicators (green/red)
  - [ ] Service uptime and connectivity display
  - [ ] Error message display for failed services
  - [ ] Auto-refresh every 30 seconds

- [ ] **System Overview**
  - [ ] Total trading pairs display
  - [ ] Active pairs count
  - [ ] Services online ratio
  - [ ] Last update timestamp
  - [ ] System status summary

### ✅ Phase 6D: Performance Monitoring

- [ ] **Real-time Trading Data**
  - [ ] File: `src/components/PerformanceMonitor.js` - Live performance display
  - [ ] Current prices for all trading pairs
  - [ ] Technical analysis signals display
  - [ ] ML predictions with confidence scores
  - [ ] Signal agreement/disagreement indicators
  - [ ] Buy/sell signal counters

- [ ] **Portfolio Dashboard** (if execution service available)
  - [ ] File: `src/components/PortfolioDashboard.js` - Portfolio overview
  - [ ] Current positions display
  - [ ] P&L tracking (realized/unrealized)
  - [ ] Portfolio value and allocation
  - [ ] Risk metrics visualization

### ✅ Phase 6E: Interactive Features

- [ ] **Backtest Runner Interface**
  - [ ] File: `src/components/BacktestRunner.js` - Interactive backtesting
  - [ ] Trading pair selection dropdown
  - [ ] Backtest parameter configuration
  - [ ] Progress tracking for running backtests
  - [ ] Results visualization with charts
  - [ ] Performance metrics display

- [ ] **Risk Monitoring** (if risk service available)
  - [ ] File: `src/components/RiskDashboard.js` - Risk overview
  - [ ] Portfolio risk metrics
  - [ ] Position sizing recommendations
  - [ ] Risk alerts and warnings
  - [ ] Correlation analysis visualization

### ✅ Phase 6F: Advanced Visualization & Polish

- [ ] **Charts and Visualizations**
  - [ ] Price charts with technical indicators
  - [ ] Performance equity curves
  - [ ] Correlation heatmaps
  - [ ] Real-time data updates with smooth animations

- [ ] **User Experience Enhancements**
  - [ ] Dark theme implementation
  - [ ] Responsive design for mobile devices
  - [ ] Loading states and error handling
  - [ ] Keyboard shortcuts for power users
  - [ ] Data export functionality

## 📊 Key API Endpoints to Implement

### Backend Server (Port 3005)

```javascript
// Dashboard server health
GET /api/health
Response: {
  status: "healthy",
  service: "trading-bot-dashboard",
  timestamp: 1704067200000,
  port: 3005
}

// All services health check
GET /api/dashboard/services
Response: {
  services: [
    {
      service: "core",
      status: "healthy",
      url: "http://localhost:3000",
      data: { status: "healthy", dataCollection: {...} }
    },
    {
      service: "ml", 
      status: "healthy",
      url: "http://localhost:3001",
      data: { status: "healthy", models: {...} }
    }
  ],
  overall: "healthy"
}

// System overview
GET /api/dashboard/overview
Response: {
  services: [{ service: "core", status: "healthy" }],
  totalPairs: 6,
  activePairs: 6,
  systemStatus: "healthy"
}

// Performance data aggregation
GET /api/dashboard/performance
Response: {
  pairs: [
    {
      pair: "RVN",
      price: 0.0234,
      technicalSignal: "BUY",
      technicalConfidence: 0.73,
      mlPrediction: 0.12,
      mlConfidence: 0.78
    }
  ],
  summary: {
    totalPairs: 6,
    bullishSignals: 2,
    bearishSignals: 1,
    averageConfidence: 0.69
  }
}

// Backtest execution proxy
POST /api/dashboard/backtest/:pair
Body: { initialBalance: 10000, useMLSignals: true }
Response: { /* Proxied from backtest service */ }

// Portfolio data (if execution service available)
GET /api/dashboard/portfolio
Response: { /* Proxied from execution service */ }

// Risk data (if risk service available)
GET /api/dashboard/risk
Response: { /* Proxied from risk service */ }
```

## 🎨 React Components Architecture

### Main Application Structure

```javascript
// src/App.js - Main application container
function App() {
  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      // Fetch from all dashboard endpoints
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="dashboard-container">
      <Header />
      <main className="grid grid-3">
        <ServiceStatus services={services} />
        <DashboardOverview overview={overview} />
        <PerformanceMonitor performance={performance} />
        <BacktestRunner />
        <RiskDashboard />
        <PortfolioDashboard />
      </main>
    </div>
  );
}
```

### Component Specifications

#### 1. **ServiceStatus Component**
```javascript
// src/components/ServiceStatus.js
const ServiceStatus = ({ services }) => {
  return (
    <div className="card">
      <h3>🔗 Service Status</h3>
      {services.map(service => (
        <div key={service.service} className="service-item">
          <div className={`status-indicator ${service.status}`} />
          <span>{service.service}</span>
          <span className="service-url">{service.url}</span>
        </div>
      ))}
    </div>
  );
};
```

#### 2. **PerformanceMonitor Component**
```javascript
// src/components/PerformanceMonitor.js
const PerformanceMonitor = ({ performance }) => {
  if (!performance) return <LoadingCard title="📈 Performance Monitor" />;
  
  return (
    <div className="card">
      <h3>📈 Performance Monitor</h3>
      <div className="performance-summary">
        <div className="metric">
          <span className="label">Total Pairs:</span>
          <span className="value">{performance.summary.totalPairs}</span>
        </div>
        <div className="metric">
          <span className="label">Bullish Signals:</span>
          <span className="value bullish">{performance.summary.bullishSignals}</span>
        </div>
        <div className="metric">
          <span className="label">Bearish Signals:</span>
          <span className="value bearish">{performance.summary.bearishSignals}</span>
        </div>
      </div>
      
      <div className="pairs-grid">
        {performance.pairs.map(pair => (
          <div key={pair.pair} className="pair-card">
            <div className="pair-header">
              <strong>{pair.pair}</strong>
              <span className="price">${pair.price}</span>
            </div>
            <div className="signals">
              <div className={`signal technical ${pair.technicalSignal.toLowerCase()}`}>
                {pair.technicalSignal} ({(pair.technicalConfidence * 100).toFixed(1)}%)
              </div>
              {pair.mlPrediction && (
                <div className={`signal ml ${pair.mlPrediction > 0 ? 'bullish' : 'bearish'}`}>
                  ML: {pair.mlPrediction > 0 ? 'UP' : 'DOWN'} ({(pair.mlConfidence * 100).toFixed(1)}%)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 3. **BacktestRunner Component**
```javascript
// src/components/BacktestRunner.js
const BacktestRunner = () => {
  const [selectedPair, setSelectedPair] = useState('RVN');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const runBacktest = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await apiClient.runBacktest(selectedPair, {
        initialBalance: 10000,
        useMLSignals: true
      });
      setResults(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="card">
      <h3>🔬 Backtest Runner</h3>
      
      <div className="backtest-controls">
        <select 
          value={selectedPair} 
          onChange={(e) => setSelectedPair(e.target.value)}
        >
          <option value="RVN">RVN</option>
          <option value="XMR">XMR</option>
          <option value="BEL">BEL</option>
          <option value="DOGE">DOGE</option>
          <option value="KAS">KAS</option>
          <option value="SAL">SAL</option>
        </select>
        
        <button 
          onClick={runBacktest} 
          disabled={isRunning}
          className="btn btn-primary"
        >
          {isRunning ? 'Running...' : 'Run Backtest'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {results && (
        <div className="backtest-results">
          <div className="results-grid">
            <div className="result-item">
              <span className="label">Total Return:</span>
              <span className="value positive">{results.totalReturnPercent?.toFixed(2)}%</span>
            </div>
            <div className="result-item">
              <span className="label">Win Rate:</span>
              <span className="value">{results.winRatePercent?.toFixed(1)}%</span>
            </div>
            <div className="result-item">
              <span className="label">Total Trades:</span>
              <span className="value">{results.totalTrades}</span>
            </div>
            <div className="result-item">
              <span className="label">Sharpe Ratio:</span>
              <span className="value">{results.sharpeRatio?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 4. **API Client Service**
```javascript
// src/services/apiClient.js
class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3005';
    this.timeout = 10000;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  
  // Dashboard endpoints
  async getOverview() {
    return this.request('/api/dashboard/overview');
  }
  
  async getPerformance() {
    return this.request('/api/dashboard/performance');
  }
  
  async getServicesHealth() {
    return this.request('/api/dashboard/services');
  }
  
  async runBacktest(pair, config) {
    return this.request(`/api/dashboard/backtest/${pair}`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }
  
  async getPortfolio() {
    return this.request('/api/dashboard/portfolio');
  }
  
  async getRiskData() {
    return this.request('/api/dashboard/risk');
  }
}

export default new ApiClient();
```

## 🎨 Styling and Design System

### CSS Architecture (src/index.css)
```css
/* Dark theme design system */
:root {
  --primary-color: #00d4aa;
  --secondary-color: #3742fa;
  --success-color: #00d4aa;
  --warning-color: #ffa502;
  --error-color: #ff4757;
  --background-primary: #0a0a0a;
  --background-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
  --card-background: rgba(255, 255, 255, 0.05);
}

/* Dashboard container */
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Card component */
.card {
  background: var(--card-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin: 10px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

/* Grid layouts */
.grid {
  display: grid;
  gap: 20px;
  padding: 20px;
}

.grid-2 { 
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
}

.grid-3 { 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
}

/* Status indicators */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.status-indicator.healthy {
  background-color: var(--success-color);
  box-shadow: 0 0 8px var(--success-color);
}

.status-indicator.unhealthy {
  background-color: var(--error-color);
  box-shadow: 0 0 8px var(--error-color);
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Signal indicators */
.signal {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin: 2px;
  display: inline-block;
}

.signal.buy, .signal.bullish {
  background: rgba(0, 212, 170, 0.2);
  color: var(--success-color);
}

.signal.sell, .signal.bearish {
  background: rgba(255, 71, 87, 0.2);
  color: var(--error-color);
}

.signal.hold {
  background: rgba(255, 165, 2, 0.2);
  color: var(--warning-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .grid { 
    padding: 10px; 
    gap: 10px;
  }
  
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
  
  .card { 
    margin: 5px; 
    padding: 15px; 
  }
}
```

## ⚙️ Configuration Requirements

### Environment Variables (.env)
```bash
# Server Configuration
PORT=3005
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3005

# Service URLs
CORE_SERVICE_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:3001
BACKTEST_SERVICE_URL=http://localhost:3002
RISK_SERVICE_URL=http://localhost:3003
EXECUTION_SERVICE_URL=http://localhost:3004

# Frontend Development
REACT_APP_PORT=3010
BROWSER=none

# Dashboard Configuration
UPDATE_INTERVAL=30000
MAX_CHART_POINTS=200
WEBSOCKET_PORT=3006
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server/main.js",
    "client": "BROWSER=none PORT=3010 react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "server-only": "node server/main.js",
    "client-only": "npm run client"
  }
}
```

## 🧪 Testing & Development

### Development Workflow
```bash
# 1. Ensure all services are running
curl http://localhost:3000/api/health  # Core
curl http://localhost:3001/api/health  # ML
curl http://localhost:3002/api/health  # Backtest
curl http://localhost:3003/api/health  # Risk
curl http://localhost:3004/api/health  # Execution

# 2. Start dashboard (both server and frontend)
npm start

# 3. Verify dashboard connectivity
curl http://localhost:3005/api/health
curl http://localhost:3005/api/dashboard/services
open http://localhost:3010

# 4. Test individual components
curl http://localhost:3005/api/dashboard/overview
curl http://localhost:3005/api/dashboard/performance
```

### Testing Commands
```bash
# Test backend server
npm run test:server

# Test React components
npm run test:client

# Test service integration
node scripts/test-connectivity.js

# Build for production
npm run build
```

## 📊 Performance Benchmarks

- **API Response Time**: <200ms for dashboard endpoints
- **Frontend Load Time**: <2 seconds initial load
- **Real-time Updates**: 30-second refresh intervals
- **Memory Usage**: ~100MB for React dev, ~50MB for server
- **Bundle Size**: <2MB gzipped production build
- **Service Integration**: <5 seconds for all service health checks

## 🔗 Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Core Service  │    │   ML Service    │    │ Backtest Service│
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ ┌────────────────────┼──────────────────────┼────────┐
          │ │              Service Proxy Layer                  │
          │ │                                                   │
          └─┼─► getData()        ─┼─► getPredictions()  ─┼─────► │
            │   getHealth()       │   getHealth()        │      │
            │                     │                      │      │
            └─────────────────────┼──────────────────────┼──────┘
                                  │                      │
            ┌─────────────────────┼──────────────────────┼──────┐
            │            Dashboard Server (Port 3005)          │
            │                                                  │
            │  /api/dashboard/overview    ← Core + ML + Risk   │
            │  /api/dashboard/performance ← Core + ML          │
            │  /api/dashboard/services    ← All Services       │
            └──────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────┼───────────────────────────────┐
            │         React Frontend (Port 3010)              │
            │                                                 │
            │  Auto-refresh every 30 seconds                  │
            │  Real-time service status monitoring            │
            │  Interactive backtesting and visualization      │
            └─────────────────────────────────────────────────┘
```

## ✅ Success Criteria

**Phase 6A Complete When:**
- Backend server successfully aggregates data from all services
- Service proxy handles failures gracefully
- API endpoints return properly formatted data

**Phase 6B Complete When:**
- React frontend loads and displays service status
- Auto-refresh functionality works correctly
- Error handling manages service outages

**Phase 6C Complete When:**
- Service status dashboard shows real-time health
- System overview provides meaningful metrics
- All service integrations work reliably

**Phase 6D Complete When:**
- Performance monitoring displays trading signals
- Portfolio dashboard (if available) shows positions
- Real-time data updates smoothly

**Phase 6E Complete When:**
- Interactive backtesting works end-to-end
- Risk monitoring displays portfolio metrics
- All interactive features function correctly

**Phase 6F Complete When:**
- Responsive design works on mobile devices
- Dark theme provides professional appearance
- Performance meets benchmarks
- User experience is polished and intuitive

## 🚨 Common Issues & Solutions

### 1. **Services Not Connecting**
```bash
# Check if all services are running
curl http://localhost:3000/api/health  # Core
curl http://localhost:3001/api/health  # ML
curl http://localhost:3002/api/health  # Backtest
curl http://localhost:3003/api/health  # Risk
curl http://localhost:3004/api/health  # Execution

# Check dashboard server logs
tail -f logs/dashboard-error.log

# Test service proxy
curl http://localhost:3005/api/dashboard/services | jq '.services[].status'
```

### 2. **React Frontend Issues**
```bash
# Check React dev server
curl http://localhost:3010

# Check for port conflicts
lsof -i :3010

# Clear cache and restart
rm -rf node_modules/.cache
npm start
```

### 3. **API Integration Problems**
```bash
# Test individual endpoints
curl http://localhost:3005/api/dashboard/overview
curl http://localhost:3005/api/dashboard/performance

# Check CORS configuration
curl -H "Origin: http://localhost:3010" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3005/api/dashboard/services
```

### 4. **Performance Issues**
```bash
# Monitor memory usage
top -p $(pgrep -f "trading-bot-dashboard")

# Check bundle size
npm run build
ls -lh build/static/js/*.js

# Profile React performance
# Use React DevTools Profiler in browser
```

## 🚀 Production Deployment

### Build and Deploy
```bash
# Build React for production
npm run build

# Start production server
NODE_ENV=production npm run server-only

# Serve static files with nginx
# Configure reverse proxy for API calls
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-dashboard-domain.com;
    
    # Serve React build
    location / {
        root /path/to/trading-bot-dashboard/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API to backend
    location /api/ {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

*Save this file as `DEVELOPMENT_GUIDE.md` in the trading-bot-dashboard repository root*

## 🎯 Final Integration Notes

This dashboard is the capstone of the entire trading bot ecosystem. It should:

1. **Gracefully handle service outages** - Show partial data when some services are down
2. **Provide meaningful insights** - Don't just display raw data, interpret it for users
3. **Be performance-oriented** - Fast loading, smooth interactions, efficient updates
4. **Look professional** - This is the face of your trading bot system
5. **Be extensible** - Easy to add new components as the system grows

The dashboard ties together months of development across all other services. Take time to make it polished and user-friendly!