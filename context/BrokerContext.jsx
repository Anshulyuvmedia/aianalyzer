// src/context/BrokerContext.jsx
import { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';

export const BrokerContext = createContext();

const POLL_INTERVAL_MS = 60000;

export const BrokerProvider = ({ children }) => {
    const [brokerConnection, setBrokerConnection] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [positions, setPositions] = useState([]);
    const [orders, setOrders] = useState([]);

    // New states for server search
    const [serverSuggestions, setServerSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const pollTimerRef = useRef(null);

    // Load saved connection
    useEffect(() => {
        const loadSavedConnection = async () => {
            try {
                const saved = await AsyncStorage.getItem('brokerConnection');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setBrokerConnection(parsed);
                    setIsConnected(!!parsed?.metaApiAccountId && parsed?.connection_status === true);
                }
            } catch (err) {
                console.warn('Failed to load broker connection:', err);
            }
        };
        loadSavedConnection();
    }, []);

    // ==================== SERVER SEARCH ====================
    const searchMT5Servers = async (query) => {
        if (!query || query.trim().length < 2) {
            setServerSuggestions([]);
            return [];
        }

        setSearchLoading(true);
        try {
            const response = await api.get(`/api/appdata/meta-servers/mt5/search?query=${encodeURIComponent(query.trim())}`);

            if (response.data?.success) {
                const suggestions = response.data.suggestions || [];
                setServerSuggestions(suggestions);
                return suggestions;
            }
            return [];
        } catch (err) {
            console.warn('Failed to search MT5 servers:', err.message);
            setServerSuggestions([]);
            return [];
        } finally {
            setSearchLoading(false);
        }
    };

    // ==================== CONNECTION STATUS ====================
    const checkConnectionStatus = async () => {
        if (!brokerConnection?.metaApiAccountId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/api/appdata/account-info');
            const result = response.data;

            if (result.success) {
                setAccountInfo(result.data);
                await fetchPositions();
                await fetchOrders();

                setBrokerConnection(prev => ({
                    ...prev,
                    lastChecked: new Date().toISOString(),
                }));
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (err) {
            console.warn('Connection status check failed:', err.message);
            setError('Could not verify connection status');
        } finally {
            setLoading(false);
        }
    };

    // Polling effect
    useEffect(() => {
        if (!brokerConnection?.metaApiAccountId || !isConnected) {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }

        checkConnectionStatus();
        pollTimerRef.current = setInterval(checkConnectionStatus, POLL_INTERVAL_MS);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [brokerConnection?.metaApiAccountId, isConnected]);

    // ==================== CONNECT MT5 ====================
    const connectMT5 = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                server: formData.server.trim(),
                login: formData.login.trim(),
                password: formData.password,
                name: formData.name.trim() || `MT5-${formData.login.trim()}`,
                platform: 'mt5',
            };

            const response = await api.post('/api/appdata/connect', payload);
            const result = response.data;

            if (response.status >= 400 || !result.success) {
                throw new Error(result.error || 'Connection failed');
            }

            const connectionData = {
                metaApiAccountId: result.data.metaApiAccountId,
                name: payload.name,
                server: payload.server,
                login: payload.login,
                connection_status: true,
                connectedAt: new Date().toISOString(),
                lastChecked: new Date().toISOString(),
            };

            await AsyncStorage.setItem('brokerConnection', JSON.stringify(connectionData));
            setBrokerConnection(connectionData);
            setIsConnected(true);

            await checkConnectionStatus();
            await fetchPositions();
            await fetchOrders();

            return connectionData;
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ==================== DISCONNECT ====================
    const disconnectBroker = async () => {
        try {
            await AsyncStorage.removeItem('brokerConnection');
            setBrokerConnection(null);
            setAccountInfo(null);
            setPositions([]);
            setIsConnected(false);
            setError(null);
        } catch (err) {
            console.error('Disconnect failed:', err);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await api.get("/api/appdata/positions");
            if (response.data?.success) {
                setPositions(response.data.data || []);
            }
        } catch (err) {
            console.warn("Failed to load positions:", err.message);
            setPositions([]);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get("/api/appdata/orders");
            if (response.data?.success) {
                setOrders(response.data.data || []);
            }
        } catch (err) {
            console.warn("Failed to load orders:", err.message);
            setOrders([]);
        }
    };

    const value = {
        // Connection states
        isConnected,
        brokerConnection,
        accountInfo,
        positions,
        orders,
        loading,
        error,

        // Actions
        connectMT5,
        disconnectBroker,
        refreshStatus: checkConnectionStatus,
        fetchPositions,
        fetchOrders,

        // Server Search
        serverSuggestions,
        searchLoading,
        searchMT5Servers,
    };

    return <BrokerContext.Provider value={value}>{children}</BrokerContext.Provider>;
};