import React, { useEffect, useRef, useState } from 'react';

const PriceChart = ({ pair, priceData, strategies }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [chartPeriod, setChartPeriod] = useState('50'); // Default to 50 points like old dashboard
    const [showIndicators, setShowIndicators] = useState({
        ma: true,
        bollinger: false,
        volume: false
    });

    useEffect(() => {
        if (!priceData || !priceData.closes || priceData.closes.length === 0) {
            return;
        }

        // Import Chart.js dynamically or ensure it's loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Prepare data - take last N points based on selected period
        const dataPoints = parseInt(chartPeriod);
        const closes = priceData.closes.slice(-dataPoints);
        const timestamps = priceData.timestamps ? priceData.timestamps.slice(-dataPoints) : [];
        const volumes = priceData.volumes ? priceData.volumes.slice(-dataPoints) : [];
        const highs = priceData.highs ? priceData.highs.slice(-dataPoints) : [];
        const lows = priceData.lows ? priceData.lows.slice(-dataPoints) : [];

        // Create labels from timestamps
        const labels = timestamps.map((ts, index) => {
            if (timestamps.length > 0) {
                const date = new Date(ts);
                if (dataPoints <= 50) {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }
            }
            return `Point ${index + 1}`;
        });

        // Base datasets
        const datasets = [
            {
                label: `${pair} Price`,
                data: closes,
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                yAxisID: 'price'
            }
        ];

        // Add moving average if enabled and available
        if (showIndicators.ma && strategies?.ma) {
            const maData = calculateMovingAverage(closes, 10); // 10-period MA
            datasets.push({
                label: 'MA(10)',
                data: maData,
                borderColor: '#ffa502',
                backgroundColor: 'transparent',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                yAxisID: 'price'
            });
        }

        // Add Bollinger Bands if enabled and available
        if (showIndicators.bollinger && strategies?.bollinger) {
            const { upperBand, lowerBand, middleBand } = strategies.bollinger;
            
            // Create arrays for Bollinger bands (simplified - using current values)
            const upperData = new Array(closes.length).fill(upperBand);
            const lowerData = new Array(closes.length).fill(lowerBand);
            const middleData = new Array(closes.length).fill(middleBand);

            datasets.push(
                {
                    label: 'BB Upper',
                    data: upperData,
                    borderColor: 'rgba(255, 165, 2, 0.6)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    yAxisID: 'price'
                },
                {
                    label: 'BB Lower',
                    data: lowerData,
                    borderColor: 'rgba(255, 165, 2, 0.6)',
                    backgroundColor: 'rgba(255, 165, 2, 0.1)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: '-1', // Fill between upper and lower
                    pointRadius: 0,
                    yAxisID: 'price'
                },
                {
                    label: 'BB Middle',
                    data: middleData,
                    borderColor: 'rgba(255, 165, 2, 0.8)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0,
                    yAxisID: 'price'
                }
            );
        }

        // Add volume if enabled and available
        if (showIndicators.volume && volumes.length > 0) {
            datasets.push({
                label: 'Volume',
                data: volumes,
                backgroundColor: 'rgba(0, 212, 170, 0.3)',
                borderColor: '#00d4aa',
                borderWidth: 1,
                type: 'bar',
                yAxisID: 'volume'
            });
        }

        // Chart configuration
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${pair}/USDT Price Chart (${dataPoints} points)`,
                        color: '#f0f6fc',
                        font: {
                            size: 14
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#8b949e',
                            font: {
                                size: 11
                            },
                            filter: function(item, chart) {
                                return item.text !== 'BB Lower'; // Hide duplicate BB Lower label
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#f0f6fc',
                        bodyColor: '#f0f6fc',
                        borderColor: '#58a6ff',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label === `${pair} Price` || label.includes('BB') || label.includes('MA')) {
                                    return `${label}: $${context.parsed.y.toFixed(6)}`;
                                } else if (label === 'Volume') {
                                    return `${label}: ${context.parsed.y.toFixed(2)}`;
                                }
                                return `${label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8b949e',
                            maxTicksLimit: 10
                        }
                    },
                    price: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8b949e',
                            callback: function(value) {
                                return '$' + value.toFixed(6);
                            }
                        }
                    },
                    volume: {
                        type: 'linear',
                        display: showIndicators.volume,
                        position: 'right',
                        beginAtZero: true,
                        max: Math.max(...volumes) * 2, // Scale volume appropriately
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#8b949e',
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    },
                    line: {
                        borderWidth: 2
                    }
                }
            }
        };

        // Create chart
        chartInstanceRef.current = new Chart(ctx, config);

    }, [priceData, chartPeriod, showIndicators, strategies, pair]);

    // Helper function to calculate moving average
    const calculateMovingAverage = (data, period) => {
        const ma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                ma.push(null); // Not enough data points
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                ma.push(sum / period);
            }
        }
        return ma;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    if (!priceData || !priceData.closes || priceData.closes.length === 0) {
        return (
            <div className="card">
                <div className="card-header" style={{
                    background: '#21262d',
                    borderBottom: '1px solid #30363d',
                    padding: '12px 16px'
                }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📈 Price Chart - {pair}</h4>
                </div>
                <div className="card-body" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: '#8b949e' }}>
                        No price data available for charting
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{
                background: '#21262d',
                borderBottom: '1px solid #30363d',
                padding: '12px 16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📈 Price Chart - {pair}</h4>
                    
                    {/* Chart Controls */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Time Period Selector */}
                        <select
                            value={chartPeriod}
                            onChange={(e) => setChartPeriod(e.target.value)}
                            style={{
                                background: '#0d1117',
                                border: '1px solid #30363d',
                                color: '#f0f6fc',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                            }}
                        >
                            <option value="20">20 points</option>
                            <option value="50">50 points</option>
                            <option value="100">100 points</option>
                            <option value="200">200 points</option>
                        </select>
                        
                        {/* Indicator Toggles */}
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => setShowIndicators(prev => ({ ...prev, ma: !prev.ma }))}
                                style={{
                                    background: showIndicators.ma ? '#58a6ff' : 'transparent',
                                    border: '1px solid #58a6ff',
                                    color: showIndicators.ma ? '#0d1117' : '#58a6ff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                MA
                            </button>
                            <button
                                onClick={() => setShowIndicators(prev => ({ ...prev, bollinger: !prev.bollinger }))}
                                style={{
                                    background: showIndicators.bollinger ? '#ffa502' : 'transparent',
                                    border: '1px solid #ffa502',
                                    color: showIndicators.bollinger ? '#0d1117' : '#ffa502',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                BB
                            </button>
                            <button
                                onClick={() => setShowIndicators(prev => ({ ...prev, volume: !prev.volume }))}
                                style={{
                                    background: showIndicators.volume ? '#00d4aa' : 'transparent',
                                    border: '1px solid #00d4aa',
                                    color: showIndicators.volume ? '#0d1117' : '#00d4aa',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                VOL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card-body" style={{ padding: '16px' }}>
                {/* Chart Container */}
                <div style={{ 
                    height: '300px', 
                    width: '100%',
                    position: 'relative'
                }}>
                    <canvas 
                        ref={chartRef}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                        }}
                    />
                </div>
                
                {/* Chart Info */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#8b949e'
                }}>
                    <div>
                        Latest: <span style={{ color: '#f0f6fc', fontWeight: 'bold' }}>
                            ${priceData.closes[priceData.closes.length - 1]?.toFixed(6)}
                        </span>
                    </div>
                    <div>
                        24h High: <span style={{ color: '#00d4aa' }}>
                            ${Math.max(...priceData.highs.slice(-24))?.toFixed(6)}
                        </span>
                    </div>
                    <div>
                        24h Low: <span style={{ color: '#ff4757' }}>
                            ${Math.min(...priceData.lows.slice(-24))?.toFixed(6)}
                        </span>
                    </div>
                    <div>
                        Points: {priceData.closes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;