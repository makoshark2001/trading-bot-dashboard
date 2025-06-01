import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose, onSettingsChange }) => {
    const [settings, setSettings] = useState({
        updateFrequency: 30000, // 30 seconds default
        soundAlerts: true,
        pushNotifications: true,
        confidenceThreshold: 0.7, // 70%
        theme: 'dark',
        chartAnimations: true,
        autoRefresh: true,
        showDebugInfo: false
    });

    const [activeTab, setActiveTab] = useState('general');

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('dashboardSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.warn('Failed to parse saved settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage whenever they change
    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        // Save to localStorage
        localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
        
        // Notify parent component
        if (onSettingsChange) {
            onSettingsChange(newSettings);
        }
    };

    const resetToDefaults = () => {
        const defaultSettings = {
            updateFrequency: 30000,
            soundAlerts: true,
            pushNotifications: true,
            confidenceThreshold: 0.7,
            theme: 'dark',
            chartAnimations: true,
            autoRefresh: true,
            showDebugInfo: false
        };
        setSettings(defaultSettings);
        localStorage.setItem('dashboardSettings', JSON.stringify(defaultSettings));
        if (onSettingsChange) {
            onSettingsChange(defaultSettings);
        }
    };

    const exportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dashboard-settings.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const importSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    setSettings(imported);
                    localStorage.setItem('dashboardSettings', JSON.stringify(imported));
                    if (onSettingsChange) {
                        onSettingsChange(imported);
                    }
                } catch (error) {
                    alert('Invalid settings file');
                }
            };
            reader.readAsText(file);
        }
    };

    if (!isOpen) return null;

    const themeOptions = [
        { value: 'dark', label: '🌙 Dark (Default)', preview: 'linear-gradient(135deg, #0d1117, #21262d)' },
        { value: 'light', label: '☀️ Light', preview: 'linear-gradient(135deg, #ffffff, #f6f8fa)' },
        { value: 'blue', label: '🌊 Ocean Blue', preview: 'linear-gradient(135deg, #0f172a, #1e40af)' },
        { value: 'matrix', label: '🟢 Matrix Green', preview: 'linear-gradient(135deg, #001100, #003300)' },
        { value: 'sunset', label: '🌅 Sunset', preview: 'linear-gradient(135deg, #1a0f1a, #4a1a2a)' }
    ];

    const updateFrequencyOptions = [
        { value: 10000, label: '10 seconds', description: 'Very fast updates' },
        { value: 30000, label: '30 seconds', description: 'Recommended' },
        { value: 60000, label: '1 minute', description: 'Balanced performance' },
        { value: 300000, label: '5 minutes', description: 'Battery friendly' }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    background: '#21262d',
                    borderBottom: '1px solid #30363d',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#f0f6fc', fontSize: '1.5rem' }}>
                        ⚙️ Dashboard Settings
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8b949e',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
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
                        ✕
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    background: '#0d1117',
                    borderBottom: '1px solid #30363d'
                }}>
                    {[
                        { id: 'general', label: '🔧 General', icon: '🔧' },
                        { id: 'appearance', label: '🎨 Appearance', icon: '🎨' },
                        { id: 'alerts', label: '🔔 Alerts', icon: '🔔' },
                        { id: 'advanced', label: '⚡ Advanced', icon: '⚡' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                border: 'none',
                                background: activeTab === tab.id ? '#21262d' : 'transparent',
                                color: activeTab === tab.id ? '#58a6ff' : '#8b949e',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                borderBottom: activeTab === tab.id ? '2px solid #58a6ff' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    padding: '24px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    color: '#f0f6fc'
                }}>
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div>
                            <h3 style={{ marginTop: 0, color: '#58a6ff' }}>⚡ Performance Settings</h3>
                            
                            {/* Update Frequency */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    🔄 Update Frequency
                                </label>
                                <select
                                    value={settings.updateFrequency}
                                    onChange={(e) => updateSetting('updateFrequency', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: '#0d1117',
                                        border: '1px solid #30363d',
                                        borderRadius: '6px',
                                        color: '#f0f6fc',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {updateFrequencyOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label} - {option.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Auto Refresh Toggle */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoRefresh}
                                        onChange={(e) => updateSetting('autoRefresh', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>🔄 Auto Refresh Data</span>
                                </label>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Automatically update trading data at the specified interval
                                </div>
                            </div>

                            {/* Chart Animations */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.chartAnimations}
                                        onChange={(e) => updateSetting('chartAnimations', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>📊 Chart Animations</span>
                                </label>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Enable smooth animations for price charts
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div>
                            <h3 style={{ marginTop: 0, color: '#58a6ff' }}>🎨 Visual Preferences</h3>
                            
                            {/* Theme Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                                    🌈 Dashboard Theme
                                </label>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {themeOptions.map(theme => (
                                        <label
                                            key={theme.value}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                background: settings.theme === theme.value ? 'rgba(88, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                border: settings.theme === theme.value ? '2px solid #58a6ff' : '1px solid #30363d',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="theme"
                                                value={theme.value}
                                                checked={settings.theme === theme.value}
                                                onChange={(e) => updateSetting('theme', e.target.value)}
                                                style={{ marginRight: '12px' }}
                                            />
                                            <div
                                                style={{
                                                    width: '30px',
                                                    height: '20px',
                                                    background: theme.preview,
                                                    borderRadius: '4px',
                                                    marginRight: '12px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                                }}
                                            />
                                            <span>{theme.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div>
                            <h3 style={{ marginTop: 0, color: '#58a6ff' }}>🔔 Alert Preferences</h3>
                            
                            {/* Sound Alerts */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.soundAlerts}
                                        onChange={(e) => updateSetting('soundAlerts', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>🔊 Sound Alerts</span>
                                </label>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Play sound notifications for strong trading signals
                                </div>
                            </div>

                            {/* Push Notifications */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.pushNotifications}
                                        onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>📱 Push Notifications</span>
                                </label>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Browser notifications for trading alerts
                                </div>
                            </div>

                            {/* Confidence Threshold */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    🎯 Alert Confidence Threshold
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={settings.confidenceThreshold}
                                    onChange={(e) => updateSetting('confidenceThreshold', parseFloat(e.target.value))}
                                    style={{
                                        width: '100%',
                                        marginBottom: '8px'
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.8rem',
                                    color: '#8b949e'
                                }}>
                                    <span>10% (All signals)</span>
                                    <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>
                                        {(settings.confidenceThreshold * 100).toFixed(0)}% (Current)
                                    </span>
                                    <span>100% (Only strongest)</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Only trigger alerts for signals above this confidence level
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <div>
                            <h3 style={{ marginTop: 0, color: '#58a6ff' }}>⚡ Advanced Options</h3>
                            
                            {/* Debug Info */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showDebugInfo}
                                        onChange={(e) => updateSetting('showDebugInfo', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>🐛 Show Debug Information</span>
                                </label>
                                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                                    Display technical debugging information (developers only)
                                </div>
                            </div>

                            {/* Settings Management */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#ffa502', marginBottom: '12px' }}>📁 Settings Management</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={exportSettings}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#238636',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        💾 Export Settings
                                    </button>
                                    
                                    <label style={{
                                        padding: '8px 16px',
                                        background: '#0969da',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}>
                                        📁 Import Settings
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={importSettings}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    
                                    <button
                                        onClick={resetToDefaults}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#da3633',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        🔄 Reset to Defaults
                                    </button>
                                </div>
                            </div>

                            {/* Current Settings Preview */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid #30363d',
                                borderRadius: '6px',
                                padding: '12px'
                            }}>
                                <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#8b949e' }}>📋 Current Settings</h4>
                                <pre style={{
                                    fontSize: '0.8rem',
                                    color: '#8b949e',
                                    margin: 0,
                                    overflow: 'auto',
                                    maxHeight: '150px'
                                }}>
                                    {JSON.stringify(settings, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#21262d',
                    borderTop: '1px solid #30363d',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                        Settings are automatically saved
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 20px',
                            background: '#238636',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ✅ Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;