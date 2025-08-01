import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

const OverallAnalysis = () => {
    const analysisData = [
        {
            pair: 'BTC/USD',
            timeframe: '4H',
            pattern: { name: 'Double Bottom', status: '✅ Bullish', confidence: '89%' },
            indicator: { name: 'RSI', value: '67.4', status: '🟡 Neutral' },
            smc: { name: 'Order Block', status: '✅ Bullish', price: '$42,850', strength: 'High' },
        },
        {
            pair: 'ETH/USD',
            timeframe: '1H',
            pattern: { name: 'Head & Shoulders', status: '❌ Bearish', confidence: '76%' },
            indicator: { name: 'MACD', value: '0.024', status: '✅ Bullish' },
            smc: { name: 'Fair Value Gap', status: '❌ Bearish', price: '$41,200', strength: 'Medium' },
        },
        {
            pair: 'SOL/USD',
            timeframe: '15M',
            pattern: { name: 'Bull Flag', status: '✅ Bullish', confidence: '92%' },
            indicator: { name: 'ADX', value: '34.2', status: '🔵 Strong Trend' },
            smc: { name: 'Breaker Block', status: '✅ Bullish', price: '$43,500', strength: 'High' },
        },
        {
            pair: 'ADA/USD',
            timeframe: '1D',
            pattern: { name: 'Ascending Triangle', status: '✅ Bullish', confidence: '68%' },
            indicator: { name: 'ATR', value: '1.2%', status: '🟡 High Volatility' },
            smc: { name: 'Liquidity Pool', status: '🟡 Neutral', price: '$0.485', strength: 'Medium' },
        },
        {
            pair: 'AVAX/USD',
            timeframe: '2H',
            pattern: { name: 'Falling Wedge', status: '✅ Bullish', confidence: '84%' },
            indicator: { name: 'Bollinger Bands', value: 'Oversold', status: '✅ Bullish' },
            smc: { name: 'Demand Zone', status: '✅ Bullish', price: '$35.20', strength: 'High' },
        },
        {
            pair: 'MATIC/USD',
            timeframe: '30M',
            pattern: { name: 'Bear Flag', status: '❌ Bearish', confidence: '79%' },
            indicator: { name: 'VWAP', value: 'Below', status: '❌ Bearish' },
            smc: { name: 'Supply Zone', status: '❌ Bearish', price: '$0.92', strength: 'High' },
        },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.analysisItem}>
            <View style={styles.itemHeader}>
                <Text style={styles.pairText}>{item.pair} • {item.timeframe}</Text>
            </View>
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Feather name="target" size={18} color="#60a5fa" />
                    <Text style={styles.sectionTitle}>Pattern Recognition</Text>
                </View>
                <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                        <Text style={styles.detail}>{item.pattern.name}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.status, getStatusStyle(item.pattern.status)]}>
                            {item.pattern.status}
                        </Text>
                        <Text style={styles.subDetail}>Confidence: {item.pattern.confidence}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="chart-line" size={20} color="#4ade80" />
                    <Text style={styles.sectionTitle}>Technical Indicator</Text>
                </View>
                <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                        <Text style={styles.detail}>{item.indicator.name}: {item.indicator.value}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.status, getIndicatorStyle(item.indicator.status)]}>
                            {item.indicator.status}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Feather name="shield" size={20} color="#c084fc" />
                    <Text style={styles.sectionTitle}>SMC Zone</Text>
                </View>
                <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                        <Text style={styles.detail}>{item.smc.name}</Text>
                        <Text style={styles.detail}>{item.smc.price}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.status, getsmcStyle(item.smc.status)]}>{item.smc.status}</Text>
                        <Text style={styles.subDetail}>Strength: {item.smc.strength}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBoxBorder}
        >
            <LinearGradient
                colors={['#1e2836', '#111827', '#1e2836']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
            >
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                <MaterialCommunityIcons name="brain" size={24} color="#60a5fa" />
                                <Text style={styles.header}>Overall Analysis</Text>
                            </View>
                            <View style={styles.liveBadge}>
                                <Octicons name="dot-fill" size={12} color="green" />
                                <Text style={styles.liveText}>Live Analysis</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>
                            AI-powered comprehensive market analysis combining patterns, indicators, and SMC zones
                        </Text>
                        <FlatList
                            data={analysisData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.flatListContent}
                            snapToInterval={300} // Adjust based on item width
                            // decelerationRate="fast"
                        />
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

// Helper functions to determine status styles
const getStatusStyle = (status) => {
    if (status.includes('✅')) return styles.bullish;
    if (status.includes('❌')) return styles.bearish;
    if (status.includes('🟡') || status.includes('🔵')) return styles.neutral;
    return {};
};

const getIndicatorStyle = (indicator) => {
    if (indicator.includes('✅')) return styles.bullish;
    if (indicator.includes('❌')) return styles.bearish;
    if (indicator.includes('🟡') || indicator.includes('🔵')) return styles.neutral;
    return {};
};

const getsmcStyle = (smc) => {
    if (smc.includes('✅')) return styles.bullish;
    if (smc.includes('❌')) return styles.bearish;
    if (smc.includes('🟡') || smc.includes('🔵')) return styles.neutral;
    return {};
};

export default OverallAnalysis;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f293780',
        borderWidth: 1,
        borderColor: '#37415180',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    liveText: {
        color: '#A0AEC0',
        fontSize: 12,
        fontWeight: '500',
        marginStart: 4,
    },
    description: {
        color: '#A0AEC0',
        fontSize: 14,
        marginBottom: 20,
    },
    flatListContent: {
        paddingBottom: 10,
    },
    analysisItem: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 15,
        marginRight: 15,
        width: 280, // Fixed width for consistent sizing
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    itemHeader: {
        marginBottom: 10,
    },
    pairText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        color: '#60a5fa',
        fontSize: 15,
        fontWeight: '500',
        marginStart: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLeft: {
        flex: 1,
    },
    detail: {
        color: '#d1d5db',
        fontSize: 14,
        marginBottom: 4,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    status: {
        fontSize: 13,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        textAlign: 'center',
        marginBottom: 4,
        borderWidth: 1,
    },
    subDetail: {
        color: '#9ca3af',
        fontSize: 12,
        textAlign: 'right',
    },
    bullish: {
        backgroundColor: '#22c55e22',
        borderColor: '#22c55e',
        color: '#22c55e',
    },
    bearish: {
        backgroundColor: '#ef444422',
        borderColor: '#ef4444',
        color: '#ef4444',
    },
    neutral: {
        backgroundColor: '#f59e0b22',
        borderColor: '#f59e0b',
        color: '#f59e0b',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
    },
});