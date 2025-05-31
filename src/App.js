import React, { useState, useEffect } from 'react';
import ServiceStatus from './components/ServiceStatus';
import DashboardOverview from './components/DashboardOverview';
import PerformanceMonitor from './components/PerformanceMonitor';
import BacktestRunner from './components/BacktestRunner';
import apiClient from './services/apiClient';

const LoadingSpinner = () => (
    <div style={{
        border: '4px solid #333',
        borderTop: '4px solid #00d4aa',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    }} />
);

function App() {
    const [overview, setOverview] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchData = async () => {
        try {
            setError(null);
            
            const [overviewData, performanceData, servicesData] = await Promise.allSettled([
                apiClient.getOverview(),
                apiClient.getPerformance(),
                apiClient.getServicesHealth()
            ]);

            if (overviewData.status === 'fulfilled') {
                setOverview(overviewData.value);
            }
            
            if (performanceData.status === 'fulfilled') {
                setPerformance(performanceData.value);
            }
            
            if (servicesData.status === 'fulfilled') {
                setServices(servicesData.value.services || []);
            }

            setLastUpdate(new Date());
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="dashboard-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column' 
            }}>
                <LoadingSpinner />
                <h2 style={{ marginTop: '20px' }}>Loading Dashboard...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column' 
            }}>
                <h2 style={{ color: '#ff4757', marginBottom: '20px' }}>🚨 Dashboard Error</h2>
                <p style={{ marginBottom: '20px', textAlign: 'center', maxWidth: '500px' }}>
                    {error}
                </p>
                <button 
                    className="btn btn-primary" 
                    onClick={fetchData}
                >
                    🔄 Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header style={{ 
                padding: '20px', 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(45deg, rgba(0,212,170,0.1), rgba(0,184,148,0.1))'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem',
                            background: 'linear-gradient(45deg, #00d4aa, #00b894)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            🤖 Trading Bot Dashboard
                        </h1>
                        <p style={{ 
                            opacity: 0.7,
                            marginTop: '5px',
                            margin: 0
                        }}>
                            Advanced Cryptocurrency Trading Analytics & ML Predictions
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button 
                            onClick={fetchData}
                            className="btn btn-primary"
                            style={{ marginBottom: '10px' }}
                        >
                            🔄 Refresh
                        </button>
                        <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                            Last Update: {lastUpdate.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Service Status Section */}
                <section style={{ padding: '20px' }}>
                    <ServiceStatus services={services} />
                </section>

                {/* Overview and Performance Row */}
                <section className="grid grid-2" style={{ padding: '0 20px' }}>
                    <DashboardOverview overview={overview} />
                    <PerformanceMonitor performance={performance} />
                </section>

                {/* Backtest Runner */}
                <section style={{ padding: '20px' }}>
                    <BacktestRunner />
                </section>
            </main>

            {/* Footer */}
            <footer style={{ 
                textAlign: 'center', 
                padding: '20px', 
                opacity: 0.5,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                marginTop: '40px'
            }}>
                <p>
                    🚀 Trading Bot Dashboard v1.0 | 
                    Services: {services.filter(s => s.status === 'healthy').length}/{services.length} Online |
                    Last Updated: {lastUpdate.toLocaleString()}
                </p>
            </footer>
        </div>
    );
}

export default App;