import React from 'react';

const EnsembleSignal = ({ pair, ensembleData, strategies }) => {
    if (!ensembleData && !strategies) {
        return (
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header" style={{
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    border: '2px solid #58a6ff',
                    borderRadius: '8px 8px 0 0',
                    padding: '16px'
                }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#f0f6fc' }}>
                        🎯 Ensemble Signal - {pair}
                    </h4>
                </div>
                <div className="card-body" style={{ 
                    padding: '20px', 
                    textAlign: 'center',
                    border: '2px solid #58a6ff',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px'
                }}>
                    <div style={{ color: '#8b949e' }}>Loading ensemble analysis...</div>
                </div>
            </div>
        );
    }

    // Calculate ensemble signal from strategies if ensembleData not provided
    let calculatedEnsemble = ensembleData;
    
    if (!calculatedEnsemble && strategies) {
        calculatedEnsemble = calculateEnsembleFromStrategies(strategies);
    }

    const { signal, confidence, summary, breakdown } = calculatedEnsemble || {};
    
    // Get signal colors and styles
    const getSignalStyle = (signal) => {
        switch(signal?.toUpperCase()) {
            case 'BUY':
                return {
                    color: '#00d4aa',
                    background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 184, 148, 0.3))',
                    border: '2px solid #00d4aa',
                    icon: '📈'
                };
            case 'SELL':
                return {
                    color: '#ff4757',
                    background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(218, 54, 51, 0.3))',
                    border: '2px solid #ff4757',
                    icon: '📉'
                };
            default:
                return {
                    color: '#ffa502',
                    background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2), rgba(191, 135, 0, 0.3))',
                    border: '2px solid #ffa502',
                    icon: '⏸️'
                };
        }
    };

    const signalStyle = getSignalStyle(signal);
    const confidencePercent = ((confidence || 0) * 100).toFixed(1);

    // Get confidence level
    const getConfidenceLevel = (confidence) => {
        if (confidence > 0.8) return { level: 'Very High', color: '#00d4aa' };
        if (confidence > 0.6) return { level: 'High', color: '#58a6ff' };
        if (confidence > 0.4) return { level: 'Medium', color: '#ffa502' };
        return { level: 'Low', color: '#ff4757' };
    };

    const confidenceLevel = getConfidenceLevel(confidence || 0);

    return (
        <div className="card" style={{ 
            marginBottom: '20px',
            background: signalStyle.background,
            border: signalStyle.border,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Header */}
            <div className="card-header" style={{
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                borderBottom: `2px solid ${signalStyle.color}`,
                padding: '16px',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#f0f6fc' }}>
                        🎯 Ensemble Signal - {pair}
                    </h4>
                    <div style={{
                        padding: '6px 12px',
                        background: confidenceLevel.color,
                        color: '#0d1117',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {confidenceLevel.level} Confidence
                    </div>
                </div>
            </div>

            {/* Main Signal Display */}
            <div className="card-body" style={{ padding: '24px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    {/* Signal and Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                            fontSize: '3rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        }}>
                            {signalStyle.icon}
                        </div>
                        <div>
                            <div style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: 'bold', 
                                color: signalStyle.color,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                lineHeight: 1
                            }}>
                                {signal?.toUpperCase() || 'HOLD'}
                            </div>
                            <div style={{ 
                                fontSize: '1rem', 
                                color: '#f0f6fc',
                                opacity: 0.8,
                                marginTop: '4px'
                            }}>
                                Recommended Action
                            </div>
                        </div>
                    </div>

                    {/* Confidence Display */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold', 
                            color: confidenceLevel.color,
                            lineHeight: 1
                        }}>
                            {confidencePercent}%
                        </div>
                        <div style={{ 
                            fontSize: '0.9rem', 
                            color: '#f0f6fc',
                            opacity: 0.8,
                            marginTop: '4px'
                        }}>
                            Confidence Level
                        </div>
                    </div>
                </div>

                {/* Confidence Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${confidencePercent}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${confidenceLevel.color}, ${signalStyle.color})`,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                            position: 'relative'
                        }}>
                            {/* Animated glow effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                                animation: 'shimmer 2s infinite'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Summary and Breakdown */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    {/* Signal Breakdown */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold', 
                            color: '#f0f6fc',
                            marginBottom: '8px'
                        }}>
                            📊 Signal Breakdown
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                            {breakdown?.bullish || 0} Bullish • {breakdown?.bearish || 0} Bearish • {breakdown?.neutral || 0} Neutral
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                            from {breakdown?.total || 0} indicators
                        </div>
                    </div>

                    {/* Time Info */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold', 
                            color: '#f0f6fc',
                            marginBottom: '8px'
                        }}>
                            ⏰ Analysis Time
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                            {new Date().toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                            Updated every 30s
                        </div>
                    </div>
                </div>

                {/* Action Summary */}
                {summary && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.9rem',
                        color: '#f0f6fc',
                        fontStyle: 'italic'
                    }}>
                        💡 <strong>Summary:</strong> {summary}
                    </div>
                )}
            </div>

            {/* CSS for shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

// Helper function to calculate ensemble from strategies
const calculateEnsembleFromStrategies = (strategies) => {
    if (!strategies || typeof strategies !== 'object') {
        return {
            signal: 'HOLD',
            confidence: 0,
            summary: 'No strategy data available',
            breakdown: { bullish: 0, bearish: 0, neutral: 0, total: 0 }
        };
    }

    let bullish = 0, bearish = 0, neutral = 0, totalConfidence = 0, validCount = 0;

    Object.entries(strategies).forEach(([name, strategy]) => {
        if (strategy && !strategy.error && strategy.suggestion && strategy.confidence !== undefined) {
            validCount++;
            totalConfidence += strategy.confidence;

            const suggestion = strategy.suggestion.toLowerCase();
            if (suggestion === 'buy') bullish++;
            else if (suggestion === 'sell') bearish++;
            else neutral++;
        }
    });

    const avgConfidence = validCount > 0 ? totalConfidence / validCount : 0;
    
    let signal = 'HOLD';
    let summary = 'Insufficient data for analysis';

    if (validCount > 0) {
        if (bullish > bearish && bullish > neutral) {
            signal = 'BUY';
            summary = `Strong bullish consensus with ${bullish} buy signals vs ${bearish} sell signals`;
        } else if (bearish > bullish && bearish > neutral) {
            signal = 'SELL';
            summary = `Strong bearish consensus with ${bearish} sell signals vs ${bullish} buy signals`;
        } else {
            signal = 'HOLD';
            summary = `Mixed signals with ${bullish} buy, ${bearish} sell, ${neutral} neutral`;
        }

        if (avgConfidence > 0.7) {
            summary += '. High confidence in analysis.';
        } else if (avgConfidence > 0.5) {
            summary += '. Moderate confidence in analysis.';
        } else {
            summary += '. Low confidence - proceed with caution.';
        }
    }

    return {
        signal,
        confidence: avgConfidence,
        summary,
        breakdown: {
            bullish,
            bearish,
            neutral,
            total: validCount
        }
    };
};

export default EnsembleSignal;