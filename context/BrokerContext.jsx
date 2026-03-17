// src/context/BrokerContext.jsx
import { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';
export const BrokerContext = createContext();

const POLL_INTERVAL_MS = 60000; // 60 seconds — good balance (change to 30000 for 30s if needed)

export const BrokerProvider = ({ children }) => {
  const [brokerConnection, setBrokerConnection] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);

  const pollTimerRef = useRef(null); // to clean up interval

  // Load saved connection on mount
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

  // Polling logic: verify connection status periodically
  const checkConnectionStatus = async () => {
    if (!brokerConnection?.metaApiAccountId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No auth token');

      // ─── Use api.get() ───
      const response = await api.get('/api/appdata/account-info');

      const result = response.data;
      if (response.status >= 400) {
        if (response.status === 404) {
          await disconnectBroker();
          return;
        }
        throw new Error(result.error || 'Status check failed');
      }

      // Adapt based on your actual response shape
      if (result.success) {
        const info = result.data;
        // console.log("Polling account info...", info);

        setAccountInfo(info);
        await fetchPositions();
        await fetchOrders();
        setBrokerConnection((prev) => ({
          ...prev,
          lastChecked: new Date().toISOString(),
        }));

        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.warn('Connection status poll failed:', err.message);
      setError('Could not verify connection status');
    } finally {
      setLoading(false);
    }
  };

  // Start / manage polling when we have a connection
  useEffect(() => {
    if (!brokerConnection?.metaApiAccountId || !isConnected) {
      // No active connection → stop polling
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    // Initial check right after load/connect
    checkConnectionStatus();

    // Start polling
    pollTimerRef.current = setInterval(checkConnectionStatus, POLL_INTERVAL_MS);

    // Cleanup on unmount / disconnect / no longer connected
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [brokerConnection?.metaApiAccountId, isConnected]);

  const connectMT5 = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token');

      const payload = {
        server: formData.server.trim(),
        login: formData.login.trim(),
        password: formData.password,
        name: formData.name.trim() || `MT5-${formData.login.trim()}`,
        platform: 'mt5',
      };

      // ─── Use api.post() ───
      const response = await api.post('/api/appdata/connect', payload);

      const result = response.data;

      if (response.status >= 400) {
        throw new Error(result.error || 'Connection failed');
      }

      const connectionData = {
        metaApiAccountId: result.data.metaApiAccountId,
        alreadyConnected: result.data.alreadyConnected || false,
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

      console.log("AXIOS ERROR:", err.message);
      console.log("AXIOS CONFIG:", err.config?.url);
      console.log("AXIOS BASE:", err.config?.baseURL);
      console.log("AXIOS RESPONSE:", err.response);
      console.log("AXIOS REQUEST:", err.request);

      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
      } else {
        setPositions([]);
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
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.warn("Failed to load orders:", err.message);
      setOrders([]);
    }
  };

  const value = {
    isConnected,
    brokerConnection,
    accountInfo,
    positions,
    fetchPositions,
    orders,
    fetchOrders,
    connectMT5,
    disconnectBroker,
    loading,
    error,
    refreshStatus: checkConnectionStatus, // expose for manual refresh (e.g. pull-to-refresh)
  };

  return <BrokerContext.Provider value={value}>{children}</BrokerContext.Provider>;
};