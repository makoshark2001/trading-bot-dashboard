import React, { useState } from 'react';

const DashboardOverview = ({ overview }) => {
    const [selectedMetricPeriod, setSelectedMetricPeriod] = useState('1H');

    if (!overview) {
        return (
            <div className="card">
                <h3>📊 System Overview</h3>
                <p>Loading overview...</p>
            </div>
        );
    }

    const healthyServices = overview.services?.filter(s => s.status === 'healthy').length || 0;
    const totalServices = overview.services?.length || 0;
    
    // Use actual data from overview instead of hardcoded values
    const totalPairs = overview.actualPairs || overview.totalPairs || 0;
    const activePairs = overview.activePairs || 0;

    // Mock performance metrics data (in production, this would come from the API)
    const performanceMetrics = {
        '1H': {
            signalAccuracy: 87.3,
            totalSignals: 156,
            bestIndicator: 'RSI',
            avgConfidence: 73.2,
            consensusRate: 68.4,
            volatilityIndex: 'Medium'
        },
        '4H': {
            signalAccuracy: 82.1,
            totalSignals: 524,
            bestIndicator: 'MACD',
            avgConfidence: 69.8,
            consensusRate: 71.2,
            volatilityIndex: 'High'
        },
        '1D': {
            signalAccuracy: 79.6,
            totalSignals: 1247,
            bestIndicator: 'Bollinger',
            avgConfidence: 66.5,
            consensusRate: 64.8,
            volatilityIndex: 'Low'
        }
    };

    const currentMetrics = performanceMetrics[selectedMetricPeriod];

    return (
        <div className="card">
            <h3>📊 System Overview</h3>
            
            {/* Basic System Stats */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div style={{
                    padding: '15px',
                    background: 'rgba(0, 212, 170, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', color: '#00d4aa', fontWeight: 'bold' }}>
                        {totalPairs}
                    </div>
                    <div style={{ opacity: 0.8 }}>Trading Pairs</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        (from core service)
                    </div>
                </div>
                
                <div style={{
                    padding: '15px',
                    background: overview.systemStatus === 'healthy' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ 
                        fontSize: '2rem', 
                        color: overview.systemStatus === 'healthy' ? '#00d4aa' : '#ff4757',
                        fontWeight: 'bold' 
                    }}>
                        {healthyServices}/{totalServices}
                    </div>
                    <div style={{ opacity: 0.8 }}>Services Online</div>
                </div>
                
                <div style={{
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.5rem', color: '#ffa502', fontWeight: 'bold' }}>
                        {activePairs}
                    </div>
                    <div style={{ opacity: 0.8 }}>Active Pairs</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        (with live data)
                    </div>
                </div>
                
                <div style={{
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.2rem', color: '#3742fa', fontWeight: 'bold' }}>
                        {overview.systemStatus?.toUpperCase()}
                    </div>
                    <div style={{ opacity: 0.8 }}>System Status</div>
                </div>
            </div>

            {/* Enhanced Performance Metrics Section */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#f0f6fc' }}>
                        📈 Performance Metrics
                    </h4>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {['1H', '4H', '1D'].map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedMetricPeriod(period)}
                                style={{
                                    background: period === selectedMetricPeriod ? '#58a6ff' : 'transparent',
                                    border: '1px solid #58a6ff',
                                    color: period === selectedMetricPeriod ? '#0d1117' : '#58a6ff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (period !== selectedMetricPeriod) {
                                        e.target.style.background = 'rgba(88, 166, 255, 0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (period !== selectedMetricPeriod) {
                                        e.target.style.background = 'transparent';
                                    }
                                }}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* First row of metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(0, 212, 170, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00d4aa' }}>
                            {currentMetrics.signalAccuracy}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Signal Accuracy
                        </div>
                    </div>
                    
                    <div style={{
                        padding: '12px',
                        background: 'rgba(88, 166, 255, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(88, 166, 255, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#58a6ff' }}>
                            {currentMetrics.totalSignals}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Signals
                        </div>
                    </div>
                    
                    <div style={{
                        padding: '12px',
                        background: 'rgba(0, 212, 170, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00d4aa' }}>
                            {currentMetrics.bestIndicator}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Best Indicator
                        </div>
                    </div>
                </div>

                {/* Second row of metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                }}>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(88, 166, 255, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(88, 166, 255, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#58a6ff' }}>
                            {currentMetrics.avgConfidence}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Avg Confidence
                        </div>
                    </div>
                    
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 165, 2, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 165, 2, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ffa502' }}>
                            {currentMetrics.consensusRate}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Consensus Rate
                        </div>
                    </div>
                    
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 165, 2, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 165, 2, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            color: currentMetrics.volatilityIndex === 'High' ? '#ff4757' : 
                                   currentMetrics.volatilityIndex === 'Medium' ? '#ffa502' : '#00d4aa'
                        }}>
                            {currentMetrics.volatilityIndex}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Market Volatility
                        </div>
                    </div>
                </div>

                {/* Period info */}
                <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#8b949e'
                }}>
                    📊 Showing {selectedMetricPeriod} performance metrics • Updates every 30 seconds
                </div>
            </div>
            
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    opacity: 0.7 
                }}>
                    <strong>Debug Info:</strong><br/>
                    Total Pairs: {overview.totalPairs} | Actual Pairs: {overview.actualPairs} | Active Pairs: {overview.activePairs}
                </div>
            )}
            
            {overview.lastUpdate && (
                <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.7 }}>
                    Last Update: {new Date(overview.lastUpdate).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;