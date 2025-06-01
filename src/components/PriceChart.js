import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper function to calculate moving average - MOVED TO TOP
const calculateMovingAverage = (data, period) => {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            ma.push(null);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            ma.push(sum / period);
        }
    }
    return ma;
};

const PriceChart = ({ pair, priceData, strategies }) => {
    const [chartPeriod, setChartPeriod] = useState('50');
    const [showIndicators, setShowIndicators] = useState({
        ma: false,
        bollinger: false,
        volume: false
    });

    // Memoize chart data to prevent unnecessary re-renders
    const chartData = useMemo(() => {
        if (!priceData || !priceData.closes || priceData.closes.length === 0) {
            return null;
        }

        const dataPoints = parseInt(chartPeriod);
        const closes = priceData.closes.slice(-dataPoints);
        const timestamps = priceData.timestamps ? priceData.timestamps.slice(-dataPoints) : [];

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

        // Base dataset
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
            }
        ];

        // Add moving average if enabled - NOW WORKS BECAUSE FUNCTION IS DEFINED ABOVE
        if (showIndicators.ma) {
            const maData = calculateMovingAverage(closes, 10);
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
            });
        }

        return {
            labels,
            datasets
        };
    }, [priceData, chartPeriod, showIndicators, pair]);

    // Chart options - memoized for performance
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: `${pair}/USDT Price Chart (${chartPeriod} points)`,
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
                        const label = context.dataset.label || '';
                        return `${label}: $${context.parsed.y.toFixed(6)}`;
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
            y: {
                display: true,
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
        },
        // Performance optimizations for Chart.js v4
        animation: {
            duration: 300
        }
    }), [pair, chartPeriod]);

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
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        </select>
                        
                        <button
                            onClick={() => setShowIndicators(prev => ({ ...prev, ma: !prev.ma }))}
                            style={{
                                background: showIndicators.ma ? '#ffa502' : 'transparent',
                                border: '1px solid #ffa502',
                                color: showIndicators.ma ? '#0d1117' : '#ffa502',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                            }}
                        >
                            MA
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="card-body" style={{ padding: '16px' }}>
                <div style={{ height: '300px', width: '100%' }}>
                    {chartData && (
                        <Line 
                            data={chartData} 
                            options={chartOptions}
                        />
                    )}
                </div>
                
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
                        Points: {priceData.closes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;