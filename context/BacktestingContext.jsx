// contexts/BacktestingContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from "@/config/api";

const BacktestingContext = createContext();

export const BacktestingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [backtestResults, setBacktestResults] = useState(null);
    const [error, setError] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [strategyId, setStrategyId] = useState(null);
    const [currentStep, setCurrentStep] = useState(1); // 1: Strategy Creation, 2: Parameters

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Strategy Creation
        market: '',
        symbol: '',
        entryConditions: '',
        stopLossConditions: '',
        targetConditions: '',
        exitConditions: '',
        strategyImage: null,

        // Step 2: Backtest Parameters (can be auto-filled by AI)
        duration: '6',
        timeframe: '1h',
        sessions: 'All',
        lotSize: '0.01',
        capital: '10000',
        riskPerTrade: '2',
        direction: 'Both',
        maxTrades: '10',
        slippage: '0',
        days: {
            Monday: true,
            Tuesday: true,
            Wednesday: true,
            Thursday: true,
            Friday: true,
            Saturday: false,
            Sunday: false,
        },
    });

    const updateFormData = useCallback((key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateDays = useCallback((day, value) => {
        setFormData(prev => ({
            ...prev,
            days: { ...prev.days, [day]: value }
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            market: '',
            symbol: '',
            entryConditions: '',
            stopLossConditions: '',
            targetConditions: '',
            exitConditions: '',
            strategyImage: null,
            duration: '6',
            timeframe: '1h',
            sessions: 'All',
            lotSize: '0.01',
            capital: '10000',
            riskPerTrade: '2',
            direction: 'Both',
            maxTrades: '10',
            slippage: '0',
            days: {
                Monday: true,
                Tuesday: true,
                Wednesday: true,
                Thursday: true,
                Friday: true,
                Saturday: false,
                Sunday: false,
            },
        });
        setBacktestResults(null);
        setError(null);
        setAiSuggestion(null);
        setStrategyId(null);
        setCurrentStep(1);
    }, []);

    // Step 1: Create strategy using AI
    const createStrategy = useCallback(async () => {
        setAiLoading(true);
        setError(null);

        try {
            // Validation for Step 1
            if (!formData.market) {
                throw new Error("Please select a market");
            }
            if (!formData.symbol) {
                throw new Error("Please select a symbol");
            }
            if (!formData.entryConditions.trim()) {
                throw new Error("Please enter entry conditions");
            }
            if (!formData.stopLossConditions.trim()) {
                throw new Error("Please enter stop loss conditions");
            }
            if (!formData.targetConditions.trim()) {
                throw new Error("Please enter target conditions");
            }

            const savedUser = await AsyncStorage.getItem("userData");
            const userToken = await AsyncStorage.getItem("userToken");
            if (!savedUser) {
                throw new Error("User not found. Please log in again.");
            }

            const userData = JSON.parse(savedUser);
            const userId = userData._id || userData.id;
            const token = userToken;

            console.log('[createStrategy] User ID from storage:', userId);
            console.log('[createStrategy] Token exists:', !!token);
            console.log('[createStrategy] Token length:', token?.length);

            // If no token, try to get from AsyncStorage separately
            let authToken = token;
            if (!authToken) {
                // Try to get token from separate storage
                const storedToken = await AsyncStorage.getItem("authToken");
                if (storedToken) {
                    authToken = storedToken;
                    console.log('[createStrategy] Using token from authToken storage');
                }
            }

            if (!authToken) {
                throw new Error("Authentication token not found. Please log in again.");
            }

            // Convert text to array
            const entryArray = formData.entryConditions.split("\n").filter(line => line.trim() !== "");
            const stopLossArray = formData.stopLossConditions.split("\n").filter(line => line.trim() !== "");
            const targetArray = formData.targetConditions.split("\n").filter(line => line.trim() !== "");
            const exitArray = formData.exitConditions ? formData.exitConditions.split("\n").filter(line => line.trim() !== "") : [];

            // Create FormData for strategy creation
            const apiFormData = new FormData();
            apiFormData.append("userId", userId);
            apiFormData.append("market", formData.market);
            apiFormData.append("symbol", formData.symbol);
            apiFormData.append("entryConditions", JSON.stringify(entryArray));
            apiFormData.append("stopLossConditions", JSON.stringify(stopLossArray));
            apiFormData.append("targetConditions", JSON.stringify(targetArray));
            apiFormData.append("exitConditions", JSON.stringify(exitArray));

            if (formData.strategyImage) {
                apiFormData.append("strategyImage", {
                    uri: formData.strategyImage.uri,
                    type: formData.strategyImage.mimeType || "image/png",
                    name: formData.strategyImage.name || "strategy.png",
                });
            }

            console.log('[createStrategy] Sending request to backend...');
            console.log('[createStrategy] Auth token (first 20 chars):', authToken.substring(0, 20) + '...');

            const response = await axios.post(
                `${API_BASE_URL}/api/appdata/create-strategy`,
                apiFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${authToken}`
                    },
                    timeout: 30000
                }
            );

            console.log('[createStrategy] Response:', response.data);

            if (response.data?.success) {
                setStrategyId(response.data.data.strategyId);
                setAiSuggestion(response.data.data.aiSuggestions);

                // Auto-fill form data with AI suggestions if available
                if (response.data.data.aiSuggestions) {
                    const suggestions = response.data.data.aiSuggestions;
                    if (suggestions.duration) updateFormData('duration', suggestions.duration);
                    if (suggestions.timeframe) updateFormData('timeframe', suggestions.timeframe);
                    if (suggestions.sessions) updateFormData('sessions', suggestions.sessions);
                    if (suggestions.riskPerTrade) updateFormData('riskPerTrade', suggestions.riskPerTrade);
                    if (suggestions.direction) updateFormData('direction', suggestions.direction);
                    if (suggestions.maxTrades) updateFormData('maxTrades', suggestions.maxTrades);
                    if (suggestions.slippage) updateFormData('slippage', suggestions.slippage);
                    if (suggestions.days) updateFormData('days', suggestions.days);
                }

                setCurrentStep(2);
                return response.data.data;
            } else {
                throw new Error(response.data?.error || "Strategy creation failed");
            }
        } catch (err) {
            console.error('[createStrategy] Error:', err);
            console.error('[createStrategy] Response data:', err.response?.data);

            // Handle specific error cases
            if (err.response?.status === 401) {
                const message = "Session expired. Please log in again.";
                setError(message);
                // Optionally redirect to login
                // router.replace('/(auth)/login');
                throw new Error(message);
            }

            const message = err.response?.data?.error || err.message || "Strategy creation failed";
            setError(message);
            throw new Error(message);
        } finally {
            setAiLoading(false);
        }
    }, [formData, updateFormData]);

    // Step 2: Run backtest with parameters
    const runBacktest = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (!strategyId) {
                throw new Error("No strategy found. Please create a strategy first.");
            }

            const savedUser = await AsyncStorage.getItem("userData");
            const { _id } = JSON.parse(savedUser);

            const apiFormData = new FormData();
            apiFormData.append("userId", _id);
            apiFormData.append("strategyId", strategyId);
            apiFormData.append("duration", formData.duration);
            apiFormData.append("timeframe", formData.timeframe);
            apiFormData.append("sessions", formData.sessions);
            apiFormData.append("lotSize", formData.lotSize);
            apiFormData.append("capital", formData.capital);
            apiFormData.append("riskPerTrade", formData.riskPerTrade);
            apiFormData.append("direction", formData.direction);
            apiFormData.append("maxTrades", formData.maxTrades);
            apiFormData.append("slippage", formData.slippage);
            apiFormData.append("days", JSON.stringify(formData.days));

            const response = await axios.post(
                `${API_BASE_URL}/api/appdata/run-backtest`,
                apiFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 30000
                }
            );

            if (response.data?.success) {
                setBacktestResults(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data?.error || "Backtest failed");
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || "Backtest failed";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [formData, strategyId]);

    const goToStep = useCallback((step) => {
        if (step === 1 || step === 2) {
            setCurrentStep(step);
        }
    }, []);

    return (
        <BacktestingContext.Provider value={{
            formData,
            updateFormData,
            updateDays,
            loading,
            aiLoading,
            error,
            backtestResults,
            aiSuggestion,
            strategyId,
            currentStep,
            createStrategy,
            runBacktest,
            resetForm,
            goToStep,
        }}>
            {children}
        </BacktestingContext.Provider>
    );
};

export const useBacktesting = () => {
    const context = useContext(BacktestingContext);
    if (!context) {
        throw new Error('useBacktesting must be used within BacktestingProvider');
    }
    return context;
};