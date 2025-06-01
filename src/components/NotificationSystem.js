import React, { useState, useEffect, useContext, createContext } from 'react';

// Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState({
        soundEnabled: false,
        pushEnabled: true,
        confidenceThreshold: 0.7,
        alertVolume: 0.5
    });

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('dashboardSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(prev => ({
                ...prev,
                soundEnabled: parsed.soundAlerts || false,
                pushEnabled: parsed.pushNotifications || true,
                confidenceThreshold: parsed.confidenceThreshold || 0.7,
                alertVolume: parsed.alertVolume || 0.5
            }));
        }
    }, []);

    // Audio context for sound alerts
    const playAlertSound = (type) => {
        if (!settings.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different alert types
            const frequencies = {
                success: [523.25, 659.25, 783.99], // C5, E5, G5 - Major chord
                warning: [440, 554.37], // A4, C#5
                error: [329.63, 392], // E4, G4
                info: [440, 523.25] // A4, C5
            };

            const freq = frequencies[type] || frequencies.info;
            
            // Play chord
            freq.forEach((f, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(f, audioContext.currentTime);
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0, audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(settings.alertVolume * 0.1, audioContext.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + (i * 0.1));
                
                osc.start(audioContext.currentTime + (i * 0.1));
                osc.stop(audioContext.currentTime + 0.4 + (i * 0.1));
            });
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    };

    // Add notification function
    const addNotification = (message, type = 'info', duration = 5000, options = {}) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            timestamp: Date.now(),
            duration,
            ...options
        };

        setNotifications(prev => [...prev, notification]);

        // Play sound alert
        playAlertSound(type);

        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        // Browser notification for high priority alerts
        if (settings.pushEnabled && (type === 'error' || type === 'warning')) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Trading Bot Alert', {
                    body: message,
                    icon: '/favicon.ico',
                    tag: `trading-bot-${type}`,
                    requireInteraction: type === 'error'
                });
            }
        }

        return id;
    };

    // Remove notification function
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // Alert for trading signals
    const alertTradingSignal = (pair, signal, confidence) => {
        if (confidence < settings.confidenceThreshold) return;

        const confidencePercent = (confidence * 100).toFixed(1);
        const message = `${pair}: Strong ${signal} signal detected (${confidencePercent}% confidence)`;
        
        const type = signal === 'BUY' ? 'success' : signal === 'SELL' ? 'warning' : 'info';
        
        addNotification(message, type, 8000, {
            pair,
            signal,
            confidence,
            priority: 'high'
        });
    };

    // Alert for system status changes
    const alertSystemStatus = (status, details) => {
        const type = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'error';
        const message = `System Status: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`;
        
        addNotification(message, type, 6000, {
            category: 'system',
            priority: status === 'down' ? 'critical' : 'medium'
        });
    };

    // Alert for service connectivity
    const alertServiceStatus = (serviceName, isOnline) => {
        const type = isOnline ? 'success' : 'error';
        const message = `${serviceName} service is now ${isOnline ? 'online' : 'offline'}`;
        
        addNotification(message, type, 5000, {
            category: 'service',
            serviceName,
            priority: isOnline ? 'low' : 'high'
        });
    };

    const contextValue = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        alertTradingSignal,
        alertSystemStatus,
        alertServiceStatus,
        settings,
        updateSettings: setSettings
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

// Notification Container Component
const NotificationContainer = () => {
    const { notifications, removeNotification } = useContext(NotificationContext);

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            pointerEvents: 'none'
        }}>
            {notifications.map(notification => (
                <NotificationToast 
                    key={notification.id} 
                    notification={notification} 
                    onRemove={removeNotification}
                />
            ))}
        </div>
    );
};

// Individual Notification Toast Component
const NotificationToast = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(notification.id), 300);
    };

    const getNotificationStyle = (type) => {
        const baseStyle = {
            background: 'rgba(22, 27, 34, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '8px',
            minWidth: '320px',
            maxWidth: '400px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
            opacity: isVisible && !isExiting ? 1 : 0,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        };

        const typeStyles = {
            success: {
                borderColor: '#00d4aa',
                background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(22, 27, 34, 0.95))'
            },
            warning: {
                borderColor: '#ffa502',
                background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.1), rgba(22, 27, 34, 0.95))'
            },
            error: {
                borderColor: '#ff4757',
                background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(22, 27, 34, 0.95))'
            },
            info: {
                borderColor: '#58a6ff',
                background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(22, 27, 34, 0.95))'
            }
        };

        return { ...baseStyle, ...typeStyles[type] };
    };

    const getIcon = (type) => {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div 
            style={getNotificationStyle(notification.type)}
            onClick={handleRemove}
        >
            {/* Progress bar for auto-dismiss */}
            {notification.duration > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2px',
                    background: notification.type === 'success' ? '#00d4aa' :
                                notification.type === 'warning' ? '#ffa502' :
                                notification.type === 'error' ? '#ff4757' : '#58a6ff',
                    animation: `shrink ${notification.duration}ms linear`,
                    transformOrigin: 'left'
                }} />
            )}

            {/* Content */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>
                    {getIcon(notification.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                        color: '#f0f6fc', 
                        fontSize: '0.9rem', 
                        fontWeight: '500',
                        lineHeight: '1.4',
                        marginBottom: '4px'
                    }}>
                        {notification.message}
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: '#8b949e'
                    }}>
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {notification.pair && (
                            <span style={{
                                background: 'rgba(88, 166, 255, 0.2)',
                                color: '#58a6ff',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '0.7rem'
                            }}>
                                {notification.pair}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8b949e',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.color = '#f0f6fc';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#8b949e';
                    }}
                >
                    ×
                </button>
            </div>

            {/* CSS for progress bar animation */}
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

// Hook to use notifications
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Request notification permission helper
export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
};

export default NotificationContainer;