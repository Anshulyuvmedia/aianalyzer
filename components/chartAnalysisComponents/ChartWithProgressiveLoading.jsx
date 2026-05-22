// components/chartAnalysisComponents/ChartWithProgressiveLoading.jsx

import { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { TradingViewChart } from './TradingViewChart';

export const ChartWithProgressiveLoading = ({ symbol, analysisData, onLoadComplete, onError }) => {
    const [visibleCandles, setVisibleCandles] = useState(100);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const totalCandles = analysisData?.candles?.length || 0;
    
    // Show chart with initial candles, then load more
    const progressiveData = useMemo(() => {
        if (!analysisData) return null;
        
        return {
            ...analysisData,
            candles: analysisData.candles?.slice(-visibleCandles)
        };
    }, [analysisData, visibleCandles]);
    
    // Auto-load more after chart renders
    useEffect(() => {
        if (totalCandles > visibleCandles && !isLoadingMore) {
            const timer = setTimeout(() => {
                setIsLoadingMore(true);
                setVisibleCandles(prev => Math.min(prev + 100, totalCandles));
                setIsLoadingMore(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [visibleCandles, totalCandles]);
    
    return (
        <View style={styles.container}>
            <TradingViewChart
                symbol={symbol}
                analysisData={progressiveData}
                onLoadComplete={onLoadComplete}
                onError={onError}
                isLandscape={true}
            />
            {visibleCandles < totalCandles && (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#60a5fa" />
                    <Text style={styles.loadingText}>
                        Loading {visibleCandles}/{totalCandles} candles...
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingIndicator: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: { color: '#60a5fa', fontSize: 10 },
});