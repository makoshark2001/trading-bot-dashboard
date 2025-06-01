import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../services/WebSocketClient';
import { useNotifications } from '../components/NotificationSystem';
import apiClient from '../services/apiClient';

export const useRealTimeData = () => {
    const [data, setData] = useState({
        overview: null,
        performance: null,
        services: [],
        prices: {},
        signals: {},
        lastUpdate: null
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMode, setUpdateMode] = useState('polling'); // 'polling' or 'websocket'
    
    const { client: wsClient, isConnected: wsConnected } = useWebSocket();
    const { addNotification, alertTradingSignal } = useNotifications();
    
    const pollIntervalRef = useRef(null);
    const lastUpdateRef = useRef(null);
    const priceBufferRef = useRef(new Map());
    
    // Track notification state to prevent spam
    const notificationStateRef = useRef({
        hasShownWebSocketUnavailable: false,
        hasShownPollingMode: false,
        hasShownRealTimeEnabled: false,
        lastWebSocketAttempt: null
    });

    // Fetch initial data via REST API
    const fetchInitialData = useCallback(async () => {
        try {
            setError(null);
            
            const [overviewData, performanceData, servicesData] = await Promise.allSettled([
                apiClient.getOverview(),
                apiClient.getPerformance(),
                apiClient.getServicesHealth()
            ]);

            const newData = {
                overview: overviewData.status === 'fulfilled' ? overviewData.value : null,
                performance: performanceData.status === 'fulfilled' ? performanceData.value : null,
                services: servicesData.status === 'fulfilled' ? servicesData.value.services || [] : [],
                lastUpdate: Date.now()
            };

            setData(prevData => ({
                ...prevData,
                ...newData
            }));

            lastUpdateRef.current = Date.now();
            setLoading(false);
            
            return newData;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    // WebSocket event handlers
    const handlePriceUpdate = useCallback((priceData) => {
        const { pair, price, timestamp } = priceData;
        
        // Buffer price updates to avoid too frequent re-renders
        priceBufferRef.current.set(pair, { price, timestamp });
        
        // Update prices in batches every 1 second
        if (!priceBufferRef.current.flushTimer) {
            priceBufferRef.current.flushTimer = setTimeout(() => {
                const updates = {};
                priceBufferRef.current.forEach((data, pair) => {
                    updates[pair] = data;
                });
                
                setData(prevData => ({
                    ...prevData,
                    prices: { ...prevData.prices, ...updates },
                    lastUpdate: Date.now()
                }));
                
                priceBufferRef.current.clear();
                delete priceBufferRef.current.flushTimer;
            }, 1000);
        }
    }, []);

    const handleSignalUpdate = useCallback((signalData) => {
        const { pair, signal, confidence, indicators } = signalData;
        
        setData(prevData => ({
            ...prevData,
            signals: {
                ...prevData.signals,
                [pair]: { signal, confidence, indicators, timestamp: Date.now() }
            },
            lastUpdate: Date.now()
        }));

        // Alert for high-confidence signals
        if (confidence > 0.8 && signal !== 'HOLD') {
            alertTradingSignal(pair, signal, confidence);
        }
    }, [alertTradingSignal]);

    const handleServiceStatus = useCallback((statusData) => {
        const { service, status, details } = statusData;
        
        setData(prevData => ({
            ...prevData,
            services: prevData.services.map(s => 
                s.service === service ? { ...s, status, ...details } : s
            ),
            lastUpdate: Date.now()
        }));
    }, []);

    const handleSystemAlert = useCallback((alertData) => {
        const { type, message, priority } = alertData;
        addNotification(message, type, priority === 'high' ? 8000 : 5000);
    }, [addNotification]);

    // Set up WebSocket listeners with smart notification logic
    useEffect(() => {
        if (!wsClient) return;

        const unsubscribers = [
            wsClient.on('price_update', handlePriceUpdate),
            wsClient.on('signal_update', handleSignalUpdate),
            wsClient.on('service_status', handleServiceStatus),
            wsClient.on('system_alert', handleSystemAlert),
            
            wsClient.on('connected', () => {
                setUpdateMode('websocket');
                
                // Only show real-time notification if we previously showed polling mode
                if (notificationStateRef.current.hasShownPollingMode && 
                    !notificationStateRef.current.hasShownRealTimeEnabled) {
                    addNotification('Real-time updates enabled', 'success', 3000);
                    notificationStateRef.current.hasShownRealTimeEnabled = true;
                }
            }),
            
            wsClient.on('disconnected', () => {
                setUpdateMode('polling');
                
                // Only show polling notification once per session
                if (!notificationStateRef.current.hasShownPollingMode) {
                    // Check if we ever had a real WebSocket connection attempt
                    const now = Date.now();
                    if (!notificationStateRef.current.lastWebSocketAttempt) {
                        notificationStateRef.current.lastWebSocketAttempt = now;
                    }
                    
                    // Only show the notification if it's been more than 5 seconds since first attempt
                    // This prevents the notification from showing immediately on page load
                    if (now - notificationStateRef.current.lastWebSocketAttempt > 5000) {
                        addNotification('WebSocket unavailable, using polling mode', 'info', 4000);
                        notificationStateRef.current.hasShownPollingMode = true;
                    }
                }
            }),
            
            wsClient.on('error', (error) => {
                // Only show WebSocket error notification once
                if (!notificationStateRef.current.hasShownWebSocketUnavailable) {
                    console.log('WebSocket connection failed, falling back to polling mode');
                    notificationStateRef.current.hasShownWebSocketUnavailable = true;
                }
            })
        ];

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [wsClient, handlePriceUpdate, handleSignalUpdate, handleServiceStatus, handleSystemAlert, addNotification]);

    // Polling fallback
    useEffect(() => {
        if (updateMode === 'polling') {
            const pollData = async () => {
                try {
                    await fetchInitialData();
                } catch (err) {
                    console.error('Polling error:', err);
                }
            };

            // Initial fetch
            if (!lastUpdateRef.current) {
                pollData();
            }

            // Set up polling interval
            pollIntervalRef.current = setInterval(pollData, 30000);

            return () => {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            };
        }
    }, [updateMode, fetchInitialData]);

    // Manual refresh function
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            await fetchInitialData();
            addNotification('Data refreshed successfully', 'success', 2000);
        } catch (err) {
            addNotification(`Refresh failed: ${err.message}`, 'error', 5000);
        } finally {
            setLoading(false);
        }
    }, [fetchInitialData, addNotification]);

    // Get enhanced data with real-time updates
    const getEnhancedData = useCallback(() => {
        const { overview, performance, services, prices, signals } = data;
        
        // Merge real-time price updates with performance data
        const enhancedPerformance = performance ? {
            ...performance,
            pairs: performance.pairs?.map(pair => {
                const priceUpdate = prices[pair.pair];
                const signalUpdate = signals[pair.pair];
                
                return {
                    ...pair,
                    price: priceUpdate ? priceUpdate.price : pair.price,
                    technicalSignal: signalUpdate ? signalUpdate.signal : pair.technicalSignal,
                    technicalConfidence: signalUpdate ? signalUpdate.confidence * 100 : pair.technicalConfidence,
                    isRealTime: !!(priceUpdate || signalUpdate)
                };
            })
        } : null;

        return {
            overview,
            performance: enhancedPerformance,
            services,
            lastUpdate: data.lastUpdate,
            updateMode,
            wsConnected,
            realTimeData: {
                prices,
                signals,
                priceCount: Object.keys(prices).length,
                signalCount: Object.keys(signals).length
            }
        };
    }, [data, updateMode, wsConnected]);

    // Connection status
    const connectionStatus = {
        mode: updateMode,
        websocket: wsConnected,
        lastUpdate: data.lastUpdate,
        isHealthy: wsConnected || (!wsConnected && updateMode === 'polling')
    };

    return {
        data: getEnhancedData(),
        loading,
        error,
        refresh,
        connectionStatus
    };
};

// Hook for subscribing to specific pair updates
export const usePairData = (pair) => {
    const [pairData, setPairData] = useState(null);
    const { client: wsClient } = useWebSocket();

    useEffect(() => {
        if (!wsClient || !pair) return;

        const handlePairUpdate = (data) => {
            if (data.pair === pair) {
                setPairData(prevData => ({
                    ...prevData,
                    ...data,
                    timestamp: Date.now()
                }));
            }
        };

        const unsubscribers = [
            wsClient.on('price_update', handlePairUpdate),
            wsClient.on('signal_update', handlePairUpdate)
        ];

        // Subscribe to specific pair
        wsClient.send('subscribe_pair', { pair });

        return () => {
            unsubscribers.forEach(unsub => unsub());
            wsClient.send('unsubscribe_pair', { pair });
        };
    }, [wsClient, pair]);

    return pairData;
};

export default useRealTimeData;