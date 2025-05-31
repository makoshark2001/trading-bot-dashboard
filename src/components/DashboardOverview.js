import React from 'react';

const DashboardOverview = ({ overview }) => {
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

    return (
        <div className="card">
            <h3>📊 System Overview</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div style={{
                    padding: '15px',
                    background: 'rgba(0, 212, 170, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', color: '#00d4aa', fontWeight: 'bold' }}>
                        {overview.totalPairs}
                    </div>
                    <div style={{ opacity: 0.8 }}>Trading Pairs</div>
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
                        {overview.activePairs}
                    </div>
                    <div style={{ opacity: 0.8 }}>Active Pairs</div>
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
            
            {overview.lastUpdate && (
                <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.7 }}>
                    Last Update: {new Date(overview.lastUpdate).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;