// src/context/DashboardContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';
import { BrokerContext } from './BrokerContext';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [sentimentData, setSentimentData] = useState({});
    const [availableTabs, setAvailableTabs] = useState([]);
    const [loadingSentiment, setLoadingSentiment] = useState(false);
    const { isConnected: brokerConnected } = useContext(BrokerContext);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoadingDashboard(true);

            const response = await api.get('/api/appdata/getDashboard');

            if (response.data?.success) {
                const apiData = response.data.data;
                setDashboardData(apiData);
                setIsConnected(apiData?.isConnected || false);
                // Cache
                await AsyncStorage.setItem('dashboardData', JSON.stringify(apiData));
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.log('Dashboard fetch failed:', error);

            // Fallback to cache
            const cached = await AsyncStorage.getItem('dashboardData');
            if (cached) {
                const cachedData = JSON.parse(cached);
                setDashboardData(cachedData);
                setIsConnected(cachedData.isConnected || false);
            }
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    const refreshDashboard = useCallback(async () => {
        try {
            setLoadingDashboard(true);
            const response = await api.post('/api/appdata/refreshDashboard');

            if (response.data?.success) {
                const apiData = response.data.data;
                setDashboardData(apiData);
                setIsConnected(apiData?.isConnected || false);
                await AsyncStorage.setItem('dashboardData', JSON.stringify(apiData));
            }
            return response.data;
        } catch (error) {
            console.log('Dashboard refresh failed:', error);
            throw error;
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    // Fetch sentiment data
    const fetchSentimentData = useCallback(async () => {
        try {
            setLoadingSentiment(true);
            const response = await api.get('/api/appdata/sentiment');

            if (response.data?.success && response.data.marketSentiment) {
                const sentiments = response.data.marketSentiment;
                const formatted = {};
                const tabs = [];

                sentiments.forEach((item) => {
                    const symbol = item.symbol;
                    if (symbol) {
                        tabs.push(symbol);
                        formatted[symbol] = item;
                    }
                });
                // console.log('sentiments', sentiments);
                setSentimentData(formatted);
                setAvailableTabs(tabs);
                return { formatted, tabs };
            }
        } catch (error) {
            console.error('Failed to fetch sentiment data:', error);
            throw error;
        } finally {
            setLoadingSentiment(false);
        }
    }, []);

    // Refresh specific symbol sentiment
    const refreshSymbolSentiment = useCallback(async (symbol) => {
        try {
            const response = await api.post(`/api/appdata/sentiment/${symbol}/refresh`);

            if (response.data?.success) {
                const updatedSentiment = response.data.data;
                setSentimentData(prev => ({
                    ...prev,
                    [symbol]: updatedSentiment
                }));
                return updatedSentiment;
            }
        } catch (error) {
            console.error(`Failed to refresh sentiment for ${symbol}:`, error);
            throw error;
        }
    }, []);

    // Verify authentication
    const verifyAuth = useCallback(async () => {
        try {
            const response = await api.get('/api/appdata/verify-auth');
            console.log('Auth verification:', response.data);
            return response.data;
        } catch (error) {
            console.error('Auth verification failed:', error);
            throw error;
        }
    }, []);

    // Auto-refresh when connected to broker
    useEffect(() => {
        if (brokerConnected) {
            const interval = setInterval(() => {
                refreshDashboard();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [brokerConnected, refreshDashboard]);

    // Initial load
    useEffect(() => {
        fetchDashboardData();
        fetchSentimentData();
    }, [fetchDashboardData, fetchSentimentData]);

    return (
        <DashboardContext.Provider
            value={{
                dashboardData,
                loadingDashboard,
                fetchDashboardData,
                refreshDashboard,
                isConnected,
                // Sentiment data
                sentimentData,
                availableTabs,
                loadingSentiment,
                fetchSentimentData,
                refreshSymbolSentiment,
                verifyAuth,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};