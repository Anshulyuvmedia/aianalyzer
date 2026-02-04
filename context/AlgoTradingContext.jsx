// src/context/AlgoTradingContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const AlgoTradingContext = createContext();

export const AlgoTradingProvider = ({ children }) => {
    const [algotradingData, setAlgotradingData] = useState(null);
    const [loadingAlgotrading, setLoadingAlgotrading] = useState(true);

    const fetchAlgoTradingData = useCallback(async () => {
        try {
            setLoadingAlgotrading(true);
            const savedUser = await AsyncStorage.getItem('userData');
            if (!savedUser) return;

            const { _id } = JSON.parse(savedUser);
            const response = await axios.get(
                `${API_BASE_URL}/api/appdata/algotrading-data?userid=${_id}`
            );

            setAlgotradingData(response.data);
            await AsyncStorage.setItem('algotradingCache', JSON.stringify(response.data));
        } catch (error) {
            console.log('AlgoTrading fetch failed:', error);
            const cache = await AsyncStorage.getItem('algotradingCache');
            if (cache) setAlgotradingData(JSON.parse(cache));
        } finally {
            setLoadingAlgotrading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlgoTradingData();
    }, [fetchAlgoTradingData]);

    return (
        <AlgoTradingContext.Provider
            value={{
                algotradingData,
                loadingAlgotrading,
                fetchAlgoTradingData,
            }}
        >
            {children}
        </AlgoTradingContext.Provider>
    );
};