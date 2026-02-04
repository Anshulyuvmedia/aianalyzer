// src/context/CopyTradingContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const CopyTradingContext = createContext();

export const CopyTradingProvider = ({ children }) => {
    const [copytradingData, setCopytradingData] = useState(null);
    const [loadingCopytrading, setLoadingCopytrading] = useState(true);

    const fetchCopyTradingData = useCallback(async () => {
        try {
            setLoadingCopytrading(true);
            const savedUser = await AsyncStorage.getItem('userData');
            if (!savedUser) return;

            const { _id } = JSON.parse(savedUser);
            const response = await axios.get(
                `${API_BASE_URL}/api/appdata/copytrading-data?userid=${_id}`
            );

            setCopytradingData(response.data);
            await AsyncStorage.setItem('copytradingCache', JSON.stringify(response.data));
        } catch (error) {
            console.log('CopyTrading fetch failed:', error);
            const cache = await AsyncStorage.getItem('copytradingCache');
            if (cache) setCopytradingData(JSON.parse(cache));
        } finally {
            setLoadingCopytrading(false);
        }
    }, []);

    useEffect(() => {
        fetchCopyTradingData();
    }, [fetchCopyTradingData]);

    return (
        <CopyTradingContext.Provider
            value={{
                copytradingData,
                loadingCopytrading,
                fetchCopyTradingData,
            }}
        >
            {children}
        </CopyTradingContext.Provider>
    );
};