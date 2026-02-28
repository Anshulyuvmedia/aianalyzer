// contexts/ChartAnalysisContext.jsx

import { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@/config/api';

const AnalysisContext = createContext(undefined);

export function AnalysisProvider({ children }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [lastError, setLastError] = useState(null);

    const requestAnalysis = useCallback(async (params) => {
        setIsAnalyzing(true);
        setLastError(null);

        try {
            const saved = await AsyncStorage.getItem('userData');
            if (!saved) {
                throw new Error('No user data found. Please sign in again.');
            }

            const user = JSON.parse(saved);
            const userId = user._id;

            const response = await axios.post(
                `${API_BASE_URL}/api/appdata/chart-analysis`,
                {
                    ...params,
                    userId,
                },
                {
                    timeout: 60000, // 60 seconds
                }
            );

            const data = response.data;

            setLastAnalysis({
                overallAnalysis: data.overallAnalysis || null,
                requestedAt: new Date().toISOString(),
            });

            return true;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Could not complete chart analysis. Please try again later.';

            console.warn('[AnalysisProvider] request failed:', err);
            setLastError(message);
            Alert.alert('Analysis Error', message);

            return false;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const clearLastAnalysis = useCallback(() => {
        setLastAnalysis(null);
        setLastError(null);
    }, []);

    const value = {
        isAnalyzing,
        lastAnalysis,
        lastError,
        requestAnalysis,
        clearLastAnalysis,
    };

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const ctx = useContext(AnalysisContext);
    if (!ctx) {
        throw new Error('useAnalysis must be used inside <AnalysisProvider>');
    }
    return ctx;
}