import React, { useState } from 'react';
import PriceChart from './PriceChart';
import EnsembleSignal from './EnsembleSignal';

// Enhanced Technical Indicators Component
const TechnicalIndicators = ({ pair, strategies }) => {
    const [activeTab, setActiveTab] = useState('trend');

    if (!strategies) {
        return (
            <div className="card">
                <div className="card-header" style={{
                    background: '#21262d',
                    borderBottom: '1px solid #30363d',
                    padding: '12px 16px'
                }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📈 Technical Indicators - {pair}</h4>
                </div>
                <div className="card-body" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: '#8b949e' }}>Loading indicator data...</div>
                </div>
            </div>
        );
    }

    // Group indicators by category
    const indicatorGroups = {
        trend: ['rsi', 'macd', 'ma', 'adx', 'parabolicSAR', 'ichimoku'],
        momentum: ['stochastic', 'williamsR', 'cci', 'bollinger'],
        volume: ['volume']
    };

    const indicatorNames = {
        rsi: 'RSI',
        macd: 'MACD',
        bollinger: 'Bollinger Bands',
        ma: 'Moving Average',
        volume: 'Volume Analysis',
        stochastic: 'Stochastic',
        williamsR: 'Williams %R',
        ichimoku: 'Ichimoku Cloud',
        adx: 'ADX',
        cci: 'CCI',
        parabolicSAR: 'Parabolic SAR'
    };

    // Function to get display value for each indicator
    const getIndicatorValue = (indicator, data) => {
        if (!data || data.error) return 'Error';
        
        switch(indicator) {
            case 'rsi':
                return `RSI: ${(data.value || 0).toFixed(1)}`;
            case 'macd':
                return `Histogram: ${(data.histogram || 0).toFixed(4)}`;
            case 'bollinger':
                return `%B: ${(data.percentB || 0).toFixed(3)}`;
            case 'ma':
                return `Spread: ${(data.spreadPercent || 0).toFixed(2)}%`;
            case 'volume':
                return `Ratio: ${(data.volumeRatio || 0).toFixed(1)}x`;
            case 'stochastic':
                return `%K: ${(data.k || 0).toFixed(1)}, %D: ${(data.d || 0).toFixed(1)}`;
            case 'williamsR':
                return `%R: ${(data.value || 0).toFixed(1)}%`;
            case 'ichimoku':
                return `Cloud: ${data.cloudColor || 'neutral'}`;
            case 'adx':
                return `ADX: ${(data.adx || 0).toFixed(1)} (${data.metadata?.trendStrength || 'Unknown'})`;
            case 'cci':
                return `CCI: ${(data.cci || 0).toFixed(1)}`;
            case 'parabolicSAR':
                return `SAR: ${(data.sar || 0).toFixed(6)} (${data.trend || 'unknown'})`;
            default:
                return 'N/A';
        }
    };

    // Enhanced Indicator Card Component
    const IndicatorCard = ({ indicator, data }) => {
        if (!data) {
            return (
                <div className="indicator-card" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{indicatorNames[indicator]}</strong>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            background: 'rgba(108, 117, 125, 0.3)',
                            color: '#6c757d'
                        }}>
                            NO DATA
                        </span>
                    </div>
                </div>
            );
        }

        if (data.error) {
            return (
                <div className="indicator-card" style={{
                    background: 'rgba(255, 71, 87, 0.1)',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{indicatorNames[indicator]}</strong>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            background: 'rgba(255, 71, 87, 0.3)',
                            color: '#ff4757'
                        }}>
                            ERROR
                        </span>
                    </div>
                </div>
            );
        }

        const confidence = (data.confidence || 0) * 100;
        const suggestion = data.suggestion || 'hold';
        
        // Get badge color based on suggestion
        const getBadgeStyle = (suggestion) => {
            switch(suggestion.toLowerCase()) {
                case 'buy':
                    return {
                        background: 'linear-gradient(135deg, #238636, #2ea043)',
                        color: 'white'
                    };
                case 'sell':
                    return {
                        background: 'linear-gradient(135deg, #da3633, #f85149)',
                        color: 'white'
                    };
                default:
                    return {
                        background: 'linear-gradient(135deg, #9a6700, #bf8700)',
                        color: 'white'
                    };
            }
        };

        // Get confidence bar color
        const getConfidenceBarStyle = (confidence) => {
            if (confidence > 70) return { background: 'linear-gradient(90deg, #238636, #2ea043)' };
            if (confidence > 40) return { background: 'linear-gradient(90deg, #bf8700, #d29922)' };
            return { background: 'linear-gradient(90deg, #6e7681, #8b949e)' };
        };

        return (
            <div className="indicator-card" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}>
                
                {/* Header with name and signal badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{indicatorNames[indicator]}</strong>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        ...getBadgeStyle(suggestion)
                    }}>
                        {suggestion.toUpperCase()}
                    </span>
                </div>
                
                {/* Indicator value and confidence */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                        {getIndicatorValue(indicator, data)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#58a6ff' }}>
                        {confidence.toFixed(1)}%
                    </span>
                </div>
                
                {/* Confidence bar */}
                <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${confidence}%`,
                        height: '100%',
                        transition: 'width 0.3s ease',
                        ...getConfidenceBarStyle(confidence)
                    }} />
                </div>
                
                {/* Interpretation text */}
                {data.metadata?.interpretation && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6e7681',
                        marginTop: '6px',
                        fontStyle: 'italic'
                    }}>
                        {data.metadata.interpretation}
                    </div>
                )}
            </div>
        );
    };

    // Render indicators for active tab
    const renderTabContent = (tabName) => {
        const indicators = indicatorGroups[tabName] || [];
        
        if (indicators.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6e7681' }}>
                    No indicators available for this category
                </div>
            );
        }

        return (
            <div>
                {indicators.map(indicator => (
                    <IndicatorCard 
                        key={indicator} 
                        indicator={indicator} 
                        data={strategies[indicator]} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{
                background: '#21262d',
                borderBottom: '1px solid #30363d',
                padding: '12px 16px'
            }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📈 Technical Indicators - {pair}</h4>
            </div>
            
            <div className="card-body" style={{ padding: '0' }}>
                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #30363d',
                    background: '#161b22'
                }}>
                    {Object.keys(indicatorGroups).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                border: 'none',
                                background: activeTab === tab ? '#0d1117' : 'transparent',
                                color: activeTab === tab ? '#58a6ff' : '#8b949e',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                borderBottom: activeTab === tab ? '2px solid #58a6ff' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab) {
                                    e.target.style.color = '#f0f6fc';
                                    e.target.style.background = 'rgba(88, 166, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab) {
                                    e.target.style.color = '#8b949e';
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span style={{
                                marginLeft: '6px',
                                fontSize: '0.8rem',
                                opacity: 0.7
                            }}>
                                ({indicatorGroups[tab].length})
                            </span>
                        </button>
                    ))}
                </div>
                
                {/* Tab Content */}
                <div style={{ padding: '16px' }}>
                    {renderTabContent(activeTab)}
                </div>
            </div>
        </div>
    );
};

// Updated Performance Monitor Component
const PerformanceMonitor = ({ performance }) => {
    const [selectedPair, setSelectedPair] = useState(null);
    const [showIndicators, setShowIndicators] = useState(false);
    const [showChart, setShowChart] = useState(false);

    if (!performance) {
        return (
            <div className="card">
                <h3>⚡ Performance Monitor</h3>
                <p>Loading performance data...</p>
            </div>
        );
    }

    const { pairs, summary } = performance;

    const handlePairClick = (pair) => {
        setSelectedPair(pair);
        setShowIndicators(false);
        setShowChart(false);
    };

    const handleShowIndicators = () => {
        setShowIndicators(true);
        setShowChart(false);
    };

    const handleShowChart = () => {
        setShowChart(true);
        setShowIndicators(false);
    };

    const handleBackToSummary = () => {
        setShowIndicators(false);
        setShowChart(false);
        setSelectedPair(null);
    };

    return (
        <div>
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
                {pairs && pairs.length > 0 ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0 }}>
                                Trading Pairs ({pairs.length} active)
                            </h4>
                            {(showIndicators || showChart || selectedPair) && (
                                <button
                                    onClick={handleBackToSummary}
                                    style={{
                                        background: 'rgba(88, 166, 255, 0.2)',
                                        border: '1px solid #58a6ff',
                                        color: '#58a6ff',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    ← Back to Summary
                                </button>
                            )}
                        </div>
                        {pairs.map((pair, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                margin: '8px 0',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => handlePairClick(pair)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(88, 166, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                                    {pair.mlPrediction !== null && pair.mlPrediction !== undefined && pair.mlSignal ? (
                                        // ✅ ML data available - Enhanced display
                                        <>
                                            <div style={{
                                                color: pair.mlSignal === 'BUY' ? '#00d4aa' : 
                                                      pair.mlSignal === 'SELL' ? '#ff4757' : '#ffa502',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>
                                                ML: {pair.mlSignal}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#3742fa', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                {pair.mlDirection && (
                                                    <span style={{ 
                                                        color: pair.mlDirection === 'up' ? '#00d4aa' : 
                                                              pair.mlDirection === 'down' ? '#ff4757' : '#8b949e'
                                                    }}>
                                                        {pair.mlDirection === 'up' ? '↗️' : pair.mlDirection === 'down' ? '↘️' : '➡️'}
                                                    </span>
                                                )}
                                                <span>
                                                    {(pair.mlPrediction * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                {pair.mlConfidence.toFixed(1)}% confidence
                                            </div>
                                        </>
                                    ) : (
                                        // ❌ ML data not available
                                        <>
                                            <div style={{ fontSize: '0.9rem', color: '#8b949e', opacity: 0.6 }}>
                                                ML: N/A
                                            </div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                                Service offline
                                            </div>
                                        </>
                                    )}
                                    <div style={{ fontSize: '0.8rem', color: '#58a6ff', marginTop: '4px' }}>
                                        Click for details →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px', 
                        opacity: 0.6,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                        <div style={{ marginBottom: '10px' }}>No performance data available</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            Make sure the core service is running and has trading pairs configured.
                        </div>
                    </div>
                )}

                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && performance && (
                    <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        opacity: 0.7 
                    }}>
                        <strong>Debug:</strong> {pairs.length} pairs loaded, {summary.totalPairs} in summary
                    </div>
                )}
            </div>

            {/* Ensemble Signal Display - Show prominently when pair is selected */}
            {selectedPair && !showIndicators && !showChart && (
                <EnsembleSignal 
                    pair={selectedPair.pair} 
                    strategies={selectedPair.strategies}
                />
            )}

            {/* Detailed View Controls */}
            {selectedPair && !showIndicators && !showChart && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <div className="card-header" style={{
                        background: '#21262d',
                        borderBottom: '1px solid #30363d',
                        padding: '12px 16px'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📊 {selectedPair.pair} Analysis Options</h4>
                    </div>
                    <div className="card-body" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={handleShowIndicators}
                                style={{
                                    background: 'linear-gradient(135deg, #58a6ff, #4a90e2)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(88, 166, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                📈 View Technical Indicators
                            </button>
                            
                            <button
                                onClick={handleShowChart}
                                style={{
                                    background: 'linear-gradient(135deg, #00d4aa, #00b894)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 212, 170, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                📊 View Price Chart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Indicators Display */}
            {showIndicators && selectedPair && selectedPair.strategies && (
                <TechnicalIndicators 
                    pair={selectedPair.pair} 
                    strategies={selectedPair.strategies} 
                />
            )}

            {/* Price Chart Display */}
            {showChart && selectedPair && selectedPair.priceData && (
                <PriceChart 
                    pair={selectedPair.pair} 
                    priceData={selectedPair.priceData}
                    strategies={selectedPair.strategies}
                />
            )}
        </div>
    );
};

export default PerformanceMonitor;