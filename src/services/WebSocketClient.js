import React from 'react';

class WebSocketClient {
    constructor(url = 'ws://localhost:3006') {
        this.url = url;
        this.ws = null;
        this.listeners = new Map();
        this.reconnectInterval = 5000;
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.heartbeatInterval = null;
        this.lastHeartbeat = null;
        this.messageQueue = [];
        
        // Auto-connect
        this.connect();
    }

    connect() {
        try {
            console.log(`🔌 Attempting WebSocket connection to ${this.url}`);
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }

    handleOpen() {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Send queued messages
        this.flushMessageQueue();
        
        // Emit connected event
        this.emit('connected', { timestamp: Date.now() });
        
        // Subscribe to data streams
        this.subscribeToStreams();
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            // Handle heartbeat responses
            if (data.type === 'pong') {
                this.lastHeartbeat = Date.now();
                return;
            }
            
            // Emit the message to listeners
            this.emit(data.type, data.payload);
            
        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error, event.data);
        }
    }

    handleClose(event) {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Emit disconnected event
        this.emit('disconnected', { 
            code: event.code, 
            reason: event.reason,
            timestamp: Date.now()
        });
        
        // Schedule reconnection if not a clean close
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    handleError(error) {
        console.error('❌ WebSocket error:', error);
        this.emit('error', { error: error.message, timestamp: Date.now() });
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.emit('max_reconnect_attempts', { attempts: this.reconnectAttempts });
            return;
        }
        
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);
        
        console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
                this.send('ping', { timestamp: Date.now() });
                
                // Check if we received a recent heartbeat response
                if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > 30000) {
                    console.warn('⚠️ Heartbeat timeout, closing connection');
                    this.ws.close();
                }
            }
        }, 15000); // Send ping every 15 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    subscribeToStreams() {
        // Subscribe to price updates
        this.send('subscribe', {
            streams: [
                'price_updates',
                'signal_updates',
                'service_status',
                'system_alerts'
            ]
        });
    }

    send(type, payload) {
        const message = JSON.stringify({ type, payload });
        
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            // Queue message for later sending
            this.messageQueue.push({ type, payload });
            console.log('📦 Message queued (connection not ready):', type);
        }
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { type, payload } = this.messageQueue.shift();
            this.send(type, payload);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Listener error for event '${event}':`, error);
                }
            });
        }
    }

    disconnect() {
        console.log('🔌 Manually disconnecting WebSocket');
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
        }
        
        this.isConnected = false;
        this.messageQueue = [];
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            lastHeartbeat: this.lastHeartbeat
        };
    }
}

// React Hook for WebSocket
export const useWebSocket = (url) => {
    const [client, setClient] = React.useState(null);
    const [isConnected, setIsConnected] = React.useState(false);
    const [connectionStatus, setConnectionStatus] = React.useState('disconnected');

    React.useEffect(() => {
        const wsClient = new WebSocketClient(url);
        
        // Set up event listeners
        const unsubscribeConnected = wsClient.on('connected', () => {
            setIsConnected(true);
            setConnectionStatus('connected');
        });

        const unsubscribeDisconnected = wsClient.on('disconnected', () => {
            setIsConnected(false);
            setConnectionStatus('disconnected');
        });

        const unsubscribeError = wsClient.on('error', (error) => {
            setConnectionStatus('error');
            console.error('WebSocket error:', error);
        });

        setClient(wsClient);

        // Cleanup on unmount
        return () => {
            unsubscribeConnected();
            unsubscribeDisconnected();
            unsubscribeError();
            wsClient.disconnect();
        };
    }, [url]);

    return {
        client,
        isConnected,
        connectionStatus,
        send: client ? client.send.bind(client) : () => {},
        on: client ? client.on.bind(client) : () => () => {},
        off: client ? client.off.bind(client) : () => {}
    };
};

export default WebSocketClient;