// src/context/DashboardContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoadingDashboard(true);
            const response = await axios.get(`${API_BASE_URL}/api/appdata/dashboard-data`);

            setDashboardData(response.data);

            // Cache
            await AsyncStorage.setItem('dashboardData', JSON.stringify(response.data));
        } catch (error) {
            console.log('Dashboard fetch failed:', error);

            // Fallback to cache
            const cached = await AsyncStorage.getItem('dashboardData');
            if (cached) {
                setDashboardData(JSON.parse(cached));
            }
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <DashboardContext.Provider
            value={{
                dashboardData,
                loadingDashboard,
                fetchDashboardData,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};