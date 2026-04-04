// src/context/CopyStrategyContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';

export const CopyStrategyContext = createContext();

export const CopyStrategyProvider = ({ children }) => {
    const [strategies, setStrategies] = useState([]);
    const [backtests, setBacktests] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardMetrics, setDashboardMetrics] = useState(null);

    const fetchStrategies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/appdata/public-strategies');
            const data = response.data.data || [];

            setStrategies(data);
            // console.log('Context data', data);

            await AsyncStorage.setItem('copyStrategiesCache', JSON.stringify(data));
        } catch (err) {
            console.error('Failed to fetch public strategies:', err);

            let msg = 'Unable to load strategies';
            if (err.response) {
                if (err.response.status === 401) {
                    msg = 'Session expired. Please log in again.';
                    // Optional: trigger logout here
                } else if (err.response.status === 404) {
                    msg = 'Strategies endpoint not found. Check backend route.';
                } else if (err.message.includes('Network')) {
                    msg = 'Network error – check your connection';
                }
            }

            setError(msg);

            // Fallback to cache
            const cached = await AsyncStorage.getItem('copyStrategiesCache');
            if (cached) {
                setStrategies(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStrategyBacktest = useCallback(async (strategyId) => {
        if (!strategyId) return;

        // Already loading or loaded?
        if (backtests[strategyId] !== undefined) return;
        // console.log('strategyId: ', strategyId);
        try {
            // Mark as loading (optional – you can also use a separate loading map)
            setBacktests((prev) => ({ ...prev, [strategyId]: null })); // null = loading
            const res = await api.get(`/api/appdata/strategies/${strategyId}/backtest`);
            const backtestData = res.data?.data || res.data || null;

            setBacktests((prev) => ({
                ...prev,
                [strategyId]: backtestData,
            }));

            // Optional: also cache individually
            if (backtestData) {
                await AsyncStorage.setItem(
                    `backtest_${strategyId}`,
                    JSON.stringify(backtestData)
                );
            }
        } catch (err) {
            console.error(`Failed to fetch backtest for ${strategyId}:`, err);

            let msg = 'Failed to load backtest results';
            if (err.response?.status === 404) {
                msg = 'No backtest available for this strategy';
            }

            // Set to null = no data / error
            setBacktests((prev) => ({ ...prev, [strategyId]: null }));

            // Optional: try cache fallback
            const cached = await AsyncStorage.getItem(`backtest_${strategyId}`);
            if (cached) {
                setBacktests((prev) => ({
                    ...prev,
                    [strategyId]: JSON.parse(cached),
                }));
            }
        }
    }, []);

    const toggleFollow = useCallback(async (strategyId, shouldFollow) => {
        try {
            setLoading(true);
            setError(null);

            const action = shouldFollow ? 'follow' : 'unfollow';

            // Fix 1: correct endpoint path (adjust if your baseURL includes /api)
            const res = await api.post(`/api/appdata/strategies/${strategyId}/follow`, { action });
            // console.log("✅ Activation Response:", res.data);

            // Fix 2: Safely extract values (both response shapes have these fields)
            const { followerCount, isFollowing } = res.data;

            if (followerCount === undefined || isFollowing === undefined) {
                throw new Error('Invalid response from server');
            }

            // Fix 3: Update state correctly
            setStrategies(prevStrategies => {
                const updated = prevStrategies.map(s =>
                    s._id === strategyId
                        ? {
                            ...s,
                            followerCount,
                            isFollowing,
                        }
                        : s
                );

                // Fix 4: Save the freshly updated array to cache
                AsyncStorage.setItem('copyStrategiesCache', JSON.stringify(updated))
                    .catch(err => console.error('Cache save failed:', err));

                return updated;
            });

        } catch (err) {
            console.error('Follow toggle failed:', err);
            setError('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDashboardMetrics = useCallback(async () => {
        try {
            const res = await api.get('/api/appdata/dashboard-metrics');
            // console.log('res', res.data);
            const metrics = res.data?.data || null;

            setDashboardMetrics(metrics);

            // cache
            if (metrics) {
                await AsyncStorage.setItem(
                    'dashboardMetricsCache',
                    JSON.stringify(metrics)
                );
            }

        } catch (err) {
            console.error('Failed to fetch dashboard metrics:', err);

            // fallback cache
            const cached = await AsyncStorage.getItem('dashboardMetricsCache');
            if (cached) {
                setDashboardMetrics(JSON.parse(cached));
            }
        }
    }, []);

    const updateStrategyLocalStatus = (id, status) => {
        setStrategies(prev =>
            prev.map(s =>
                s._id === id ? { ...s, status } : s
            )
        );
    };

    useEffect(() => {
        fetchStrategies();
        fetchDashboardMetrics();
    }, [fetchStrategies, fetchDashboardMetrics]);

    return (
        <CopyStrategyContext.Provider
            value={{
                strategies,
                loading,
                error,
                toggleFollow,
                refreshStrategies: fetchStrategies,
                backtests,
                fetchStrategyBacktest,
                dashboardMetrics,
                fetchDashboardMetrics,
                updateStrategyLocalStatus,
            }}
        >
            {children}
        </CopyStrategyContext.Provider>
    );
};