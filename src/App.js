import React, { useState, useEffect } from 'react';
import ServiceStatus from './components/ServiceStatus';
import DashboardOverview from './components/DashboardOverview';
import PerformanceMonitor from './components/PerformanceMonitor';
import BacktestRunner from './components/BacktestRunner';
import SettingsModal from './components/SettingsModal';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import { useRealTimeData } from './hooks/useRealTimeData';

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

// Connection Status Indicator Component
const ConnectionStatusIndicator = ({ connectionStatus }) => {
    const getStatusColor = () => {
        if (connectionStatus.websocket) return '#00d4aa'; // Green for WebSocket
        if (connectionStatus.mode === 'polling') return '#ffa502'; // Orange for polling
        return '#ff4757'; // Red for disconnected
    };

    const getStatusText = () => {
        if (connectionStatus.websocket) return 'Real-time';
        if (connectionStatus.mode === 'polling') return 'Polling';
        return 'Disconnected';
    };

    const getStatusIcon = () => {
        if (connectionStatus.websocket) return '🟢';
        if (connectionStatus.mode === 'polling') return '🟡';
        return '🔴';
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: `1px solid ${getStatusColor()}`,
            fontSize: '0.8rem'
        }}>
            <span style={{ fontSize: '0.7rem' }}>{getStatusIcon()}</span>
            <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
                {getStatusText()}
            </span>
            {connectionStatus.lastUpdate && (
                <span style={{ opacity: 0.7 }}>
                    {new Date(connectionStatus.lastUpdate).toLocaleTimeString()}
                </span>
            )}
        </div>
    );
};

// Real-time Data Stats Component
const RealTimeStats = ({ realTimeData }) => {
    if (!realTimeData || (realTimeData.priceCount === 0 && realTimeData.signalCount === 0)) {
        return null;
    }

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '0.8rem',
            opacity: 0.7
        }}>
            {realTimeData.priceCount > 0 && (
                <span style={{ color: '#00d4aa' }}>
                    📈 {realTimeData.priceCount} live prices
                </span>
            )}
            {realTimeData.signalCount > 0 && (
                <span style={{ color: '#58a6ff' }}>
                    🎯 {realTimeData.signalCount} live signals
                </span>
            )}
        </div>
    );
};

// Main Dashboard Component (wrapped with notification context)
function DashboardContent() {
    const { addNotification } = useNotifications();
    const { 
        data, 
        loading, 
        error, 
        refresh,
        connectionStatus 
    } = useRealTimeData();

    const [showSettings, setShowSettings] = useState(false);

    const {
        overview,
        performance,
        services,
        lastUpdate,
        updateMode,
        wsConnected,
        realTimeData
    } = data;

    // Manual refresh function
    const handleRefresh = async () => {
        addNotification('Refreshing dashboard data...', 'info', 2000);
        await refresh();
    };

    // Test real-time notification
    const testRealTimeAlert = () => {
        addNotification('Real-time test: BTC/USDT Strong BUY signal (87.3% confidence)', 'success', 5000);
    };

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
                <p style={{ opacity: 0.7, marginTop: '10px' }}>
                    Connecting to trading bot services...
                </p>
                <ConnectionStatusIndicator connectionStatus={connectionStatus} />
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
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={refresh}
                    >
                        🔄 Retry Connection
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'transparent',
                            border: '1px solid #8b949e',
                            color: '#8b949e'
                        }}
                    >
                        🔃 Reload Page
                    </button>
                </div>
                <ConnectionStatusIndicator connectionStatus={connectionStatus} />
                <div style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.7 }}>
                    The system will automatically retry connection
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Enhanced Header with Real-time Status */}
            <header style={{ 
                padding: '20px', 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(45deg, rgba(0,212,170,0.1), rgba(0,184,148,0.1))'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <h1 style={{ 
                                fontSize: '2.5rem',
                                background: 'linear-gradient(45deg, #00d4aa, #00b894)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                🤖 Trading Bot Dashboard
                            </h1>
                            <ConnectionStatusIndicator connectionStatus={connectionStatus} />
                        </div>
                        <p style={{ 
                            opacity: 0.7,
                            margin: 0
                        }}>
                            Advanced Cryptocurrency Trading Analytics & ML Predictions
                        </p>
                        <RealTimeStats realTimeData={realTimeData} />
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button 
                                onClick={handleRefresh}
                                className="btn btn-primary"
                                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            >
                                🔄 Refresh
                            </button>
                            <button 
                                onClick={testRealTimeAlert}
                                className="btn btn-secondary"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #58a6ff',
                                    color: '#58a6ff',
                                    fontSize: '0.9rem',
                                    padding: '8px 16px'
                                }}
                                title="Test real-time alert system"
                            >
                                🔔 Test Alert
                            </button>
                            <button 
                                onClick={() => setShowSettings(true)}
                                className="btn btn-secondary"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #8b949e',
                                    color: '#8b949e',
                                    fontSize: '0.9rem',
                                    padding: '8px 16px'
                                }}
                            >
                                ⚙️ Settings
                            </button>
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                            Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                        </div>
                        
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '2px' }}>
                            <span style={{ 
                                color: services.filter(s => s.status === 'healthy').length === services.length ? '#00d4aa' : '#ffa502' 
                            }}>
                                ● {services.filter(s => s.status === 'healthy').length}/{services.length} Services Online
                            </span>
                            {wsConnected && (
                                <span style={{ color: '#00d4aa', marginLeft: '8px' }}>
                                    • Real-time Active
                                </span>
                            )}
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

            {/* Enhanced Footer with Real-time Information */}
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
                    Mode: {updateMode === 'websocket' ? '🟢 Real-time' : '🟡 Polling'} |
                    Last Updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'} |
                    {' '}
                    <span style={{ 
                        color: overview?.systemStatus === 'healthy' ? '#00d4aa' : '#ffa502' 
                    }}>
                        System: {overview?.systemStatus?.toUpperCase() || 'UNKNOWN'}
                    </span>
                </p>
                <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {wsConnected ? (
                        <span style={{ color: '#00d4aa' }}>
                            ✅ Real-time monitoring with WebSocket • Automated alerts and notifications
                        </span>
                    ) : (
                        <span style={{ color: '#ffa502' }}>
                            ⚠️ Polling mode active • Real-time features limited
                        </span>
                    )}
                    {realTimeData && (realTimeData.priceCount > 0 || realTimeData.signalCount > 0) && (
                        <span style={{ marginLeft: '10px', opacity: 0.7 }}>
                            • {realTimeData.priceCount + realTimeData.signalCount} live data streams
                        </span>
                    )}
                </div>
            </footer>

            {/* Settings Modal */}
            <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
            />

            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .btn {
                    transition: all 0.2s ease;
                }
                
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                
                .dashboard-container {
                    position: relative;
                }
                
                /* Real-time pulse animation for live data */
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .realtime-indicator {
                    animation: pulse 2s infinite;
                }
            `}</style>
        </div>
    );
}

// Main App Component with Notification Provider and Real-time Support
function App() {
    return (
        <NotificationProvider>
            <DashboardContent />
        </NotificationProvider>
    );
}

export default App;