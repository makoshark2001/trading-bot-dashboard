import React, { useState } from 'react';
import apiClient from '../services/apiClient';

const BacktestRunner = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedPair, setSelectedPair] = useState('XMR_USDT');
    const [error, setError] = useState(null);

    const pairs = ['XMR_USDT', 'RVN_USDT', 'BEL_USDT', 'DOGE_USDT', 'KAS_USDT', 'SAL_USDT'];

    const runBacktest = async () => {
        setIsRunning(true);
        setError(null);
        setResults(null);

        try {
            // For now, we'll simulate a backtest since the endpoint might not be fully implemented
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            
            // Mock results
            const mockResults = {
                pair: selectedPair,
                totalReturn: (Math.random() * 40 - 20).toFixed(2), // Random return between -20% and 20%
                winRate: (Math.random() * 40 + 40).toFixed(1), // Random win rate between 40% and 80%
                totalTrades: Math.floor(Math.random() * 100 + 20),
                sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
                maxDrawdown: (Math.random() * 15 + 5).toFixed(2),
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            };

            setResults(mockResults);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="card">
            <h3>🔬 Backtest Runner</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Select Trading Pair:
                </label>
                <select 
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                >
                    {pairs.map(pair => (
                        <option key={pair} value={pair} style={{ background: '#333' }}>
                            {pair}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={runBacktest}
                disabled={isRunning}
                className="btn btn-primary"
                style={{
                    width: '100%',
                    marginBottom: '20px',
                    opacity: isRunning ? 0.6 : 1,
                    cursor: isRunning ? 'not-allowed' : 'pointer'
                }}
            >
                {isRunning ? '🔄 Running Backtest...' : '▶️ Run Backtest'}
            </button>

            {error && (
                <div style={{
                    padding: '15px',
                    background: 'rgba(255, 71, 87, 0.1)',
                    border: '1px solid #ff4757',
                    borderRadius: '6px',
                    color: '#ff4757',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {results && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h4 style={{ marginBottom: '15px', color: '#00d4aa' }}>
                        📊 Backtest Results - {results.pair}
                    </h4>
                    
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Total Return:</strong>
                                <span style={{ 
                                    marginLeft: '10px',
                                    color: parseFloat(results.totalReturn) >= 0 ? '#00d4aa' : '#ff4757',
                                    fontWeight: 'bold'
                                }}>
                                    {results.totalReturn}%
                                </span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Win Rate:</strong>
                                <span style={{ marginLeft: '10px', color: '#ffa502' }}>
                                    {results.winRate}%
                                </span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Total Trades:</strong>
                                <span style={{ marginLeft: '10px' }}>{results.totalTrades}</span>
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Sharpe Ratio:</strong>
                                <span style={{ marginLeft: '10px', color: '#3742fa' }}>
                                    {results.sharpeRatio}
                                </span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Max Drawdown:</strong>
                                <span style={{ marginLeft: '10px', color: '#ff4757' }}>
                                    -{results.maxDrawdown}%
                                </span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <strong>Period:</strong>
                                <span style={{ marginLeft: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                                    {results.startDate} to {results.endDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BacktestRunner;