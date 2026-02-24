// src/context/CopyStrategyContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';

export const CopyStrategyContext = createContext();

export const CopyStrategyProvider = ({ children }) => {
    const [strategies, setStrategies] = useState([]); // better name
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStrategies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/appData/public-strategies');
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

    const toggleFollow = useCallback(async (strategyId, shouldFollow) => {
        try {
            setLoading(true);
            setError(null);

            const action = shouldFollow ? 'follow' : 'unfollow';

            // Fix 1: correct endpoint path (adjust if your baseURL includes /api)
            const res = await api.post(`/api/appData/strategies/${strategyId}/follow`, { action });
            // console.log('Follow API response:', res.data);

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

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    return (
        <CopyStrategyContext.Provider
            value={{
                strategies,
                loading,
                error,
                toggleFollow,
                refreshStrategies: fetchStrategies,
            }}
        >
            {children}
        </CopyStrategyContext.Provider>
    );
};