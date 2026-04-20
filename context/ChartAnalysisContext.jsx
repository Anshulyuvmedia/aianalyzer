// contexts/ChartAnalysisContext.jsx - Simplified version
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@/config/api';

const AnalysisContext = createContext(undefined);

export function AnalysisProvider({ children }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [lastError, setLastError] = useState(null);
    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedTimeframe: 'all',
        selectedBias: 'all',
        sortBy: 'newest'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const getPaginatedAnalyses = useCallback(() => {
        const filtered = getFilteredAnalyses();
        const start = 0;
        const end = currentPage * itemsPerPage;
        return filtered.slice(start, end);
    }, [getFilteredAnalyses, currentPage, itemsPerPage]);

    const hasMoreAnalyses = useCallback(() => {
        const filtered = getFilteredAnalyses();
        return currentPage * itemsPerPage < filtered.length;
    }, [getFilteredAnalyses, currentPage, itemsPerPage]);

    const loadMoreAnalyses = useCallback(() => {
        if (hasMoreAnalyses()) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMoreAnalyses]);
    // Fetch analysis history
    const fetchAnalysisHistory = useCallback(async () => {
        try {
            setIsLoadingHistory(true);
            const saved = await AsyncStorage.getItem('userData');
            if (!saved) {
                throw new Error('No user data found');
            }

            const user = JSON.parse(saved);
            const userId = user._id;
            const url = `${API_BASE_URL}/api/appdata/get-chart-analysis`;

            const response = await axios.get(url, {
                params: { userid: userId }
            });

            const history = response.data?.analysisData || [];
            setAnalysisHistory(history);
            return history;
        } catch (error) {
            console.error('Fetch history error:', error.message);
            setLastError(error.message);
            return [];
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    // Request new analysis
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

            const url = `${API_BASE_URL}/api/appdata/chart-analysis`;
            const requestBody = { ...params, userId };

            const response = await axios.post(url, requestBody, {
                timeout: 130000,
                headers: { 'Content-Type': 'application/json' }
            });

            const data = response.data;

            if (!data.success) {
                throw new Error(data.message || 'Analysis failed');
            }

            const newAnalysis = {
                id: Date.now().toString(),
                ...data,
                requestedAt: new Date().toISOString(),
            };

            setLastAnalysis(newAnalysis);
            await fetchAnalysisHistory();

            return {
                success: true,
                data: newAnalysis,
                analysisData: data  // ← Include the full analysis data
            };

        } catch (err) {
            const userMessage = err?.response?.data?.message || err?.message || 'Could not complete chart analysis.';
            setLastError(userMessage);
            Alert.alert('Analysis Error', userMessage);
            return {
                success: false,
                error: userMessage
            };
        } finally {
            setIsAnalyzing(false);
        }
    }, [fetchAnalysisHistory]);

    // Get filtered analyses
    const getFilteredAnalyses = useCallback(() => {
        let analyses = [...analysisHistory];

        // console.log('Filtering with:', filters);

        // Apply search filter - FIX: Ensure searchQuery is a string
        if (filters.searchQuery && typeof filters.searchQuery === 'string' && filters.searchQuery.trim().length > 0) {
            const query = filters.searchQuery.toLowerCase().trim();
            analyses = analyses.filter(analysis => {
                const pairs = analysis.analysisData?.overallAnalysis?.map(p => p.pair) || [];
                const matches = pairs.some(pair => pair.toLowerCase().includes(query));
                if (matches) console.log(`Match found for query "${query}"`);
                return matches;
            });
        }

        // Apply timeframe filter
        if (filters.selectedTimeframe !== 'all') {
            analyses = analyses.filter(analysis =>
                analysis.analysisData?.request?.timeframe === filters.selectedTimeframe
            );
        }

        // Apply bias filter
        if (filters.selectedBias !== 'all') {
            analyses = analyses.filter(analysis => {
                const marketSummary = analysis.analysisData?.marketSummary;
                return marketSummary?.overallBias?.toLowerCase() === filters.selectedBias;
            });
        }

        // Apply sorting - newest first (most recent at top)
        analyses.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.requestedAt || 0);
            const dateB = new Date(b.createdAt || b.requestedAt || 0);
            return dateB - dateA; // Newest first
        });

        // console.log('Filtered analyses count:', analyses.length);
        return analyses;
    }, [analysisHistory, filters]);

    // Get statistics
    const getStatistics = useCallback(() => {
        const analyses = analysisHistory;
        if (analyses.length === 0) return null;

        let totalBullish = 0, totalBearish = 0, totalNeutral = 0;
        const pairFrequency = new Map();

        for (const analysis of analyses) {
            const marketSummary = analysis.analysisData?.marketSummary;
            if (marketSummary?.overallBias === 'Bullish') totalBullish++;
            else if (marketSummary?.overallBias === 'Bearish') totalBearish++;
            else totalNeutral++;

            const pairs = analysis.analysisData?.overallAnalysis?.map(p => p.pair) || [];
            for (const pair of pairs) {
                pairFrequency.set(pair, (pairFrequency.get(pair) || 0) + 1);
            }
        }

        const mostAnalyzed = Array.from(pairFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pair, count]) => ({ pair, count }));

        return {
            totalAnalyses: analyses.length,
            totalBullish,
            totalBearish,
            totalNeutral,
            mostAnalyzed,
            successRate: totalBullish + totalBearish > 0
                ? ((totalBullish / (totalBullish + totalBearish)) * 100).toFixed(1)
                : 0
        };
    }, [analysisHistory]);

    const clearLastAnalysis = useCallback(() => {
        setLastAnalysis(null);
        setLastError(null);
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    useEffect(() => {
        fetchAnalysisHistory();
    }, [fetchAnalysisHistory]);

    const value = {
        isAnalyzing,
        isLoadingHistory,
        lastAnalysis,
        analysisHistory,
        lastError,
        filters,
        statistics: getStatistics(),
        requestAnalysis,
        clearLastAnalysis,
        fetchAnalysisHistory,
        updateFilters,
        getFilteredAnalyses,
        getPaginatedAnalyses,
        loadMoreAnalyses
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