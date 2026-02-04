// src/context/BrokerContext.jsx
import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BrokerContext = createContext();

export const BrokerProvider = ({ children }) => {
  const [brokerConnection, setBrokerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load saved broker connection when app starts
  useEffect(() => {
    const loadSavedConnection = async () => {
      try {
        const saved = await AsyncStorage.getItem('brokerConnection');
        if (saved) {
          const parsed = JSON.parse(saved);
          setBrokerConnection(parsed);
          setIsConnected(parsed?.connection_status === true);
        }
      } catch (err) {
        console.warn('Failed to load saved broker connection:', err);
      }
    };
    loadSavedConnection();
  }, []);

  // Helper to save and update connection
  const connectBroker = async (connectionData) => {
    try {
      await AsyncStorage.setItem('brokerConnection', JSON.stringify(connectionData));
      setBrokerConnection(connectionData);
      setIsConnected(connectionData.connection_status === true);
    } catch (err) {
      console.error('Failed to save broker connection:', err);
    }
  };

  // Helper to disconnect / clear
  const disconnectBroker = async () => {
    try {
      await AsyncStorage.removeItem('brokerConnection');
      setBrokerConnection(null);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to disconnect broker:', err);
    }
  };

  const value = {
    isConnected,
    brokerConnection,
    connectBroker,
    disconnectBroker,
    setIsConnected,           // still useful for quick local updates
  };

  return (
    <BrokerContext.Provider value={value}>
      {children}
    </BrokerContext.Provider>
  );
};