import React from 'react';

const PerformanceMonitor = ({ performance }) => {
    if (!performance) {
        return (
            <div className="card">
                <h3>⚡ Performance Monitor</h3>
                <p>Loading performance data...</p>
            </div>
        );
    }

    const { pairs, summary } = performance;

    return (
        <div className="card">
            <h3>⚡ Performance Monitor</h3>
            
            {/* Summary Stats */}
            <div style={{ marginBottom: '20px' }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '6px' }}>
                        <div style={{ color: '#00d4aa', fontWeight: 'bold', fontSize: '1.5rem' }}>
                            {summary.bullishSignals}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>BUY Signals</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '6px' }}>
                        <div style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '1.5rem' }}>
                            {summary.bearishSignals}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>SELL Signals</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                        <div style={{ color: '#ffa502', fontWeight: 'bold', fontSize: '1.5rem' }}>
                            {summary.averageConfidence.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Avg Confidence</div>
                    </div>
                </div>
            </div>

            {/* Pairs List */}
            {pairs.length > 0 ? (
                <div>
                    <h4 style={{ marginBottom: '15px' }}>Trading Pairs</h4>
                    {pairs.map((pair, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            margin: '8px 0',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div>
                                <strong>{pair.pair}</strong>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    ${pair.price?.toFixed(4) || 'N/A'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    color: pair.technicalSignal === 'BUY' ? '#00d4aa' : 
                                          pair.technicalSignal === 'SELL' ? '#ff4757' : '#ffa502',
                                    fontWeight: 'bold'
                                }}>
                                    {pair.technicalSignal}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {pair.technicalConfidence.toFixed(1)}% confidence
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {pair.mlPrediction && (
                                    <>
                                        <div style={{ fontSize: '0.9rem', color: '#3742fa' }}>
                                            ML: {pair.mlPrediction > 0 ? '+' : ''}{(pair.mlPrediction * 100).toFixed(2)}%
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                            {pair.mlConfidence.toFixed(1)}% conf
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                    No performance data available
                </div>
            )}
        </div>
    );
};

export default PerformanceMonitor;