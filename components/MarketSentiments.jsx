import { Feather } from '@expo/vector-icons';
import { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { DashboardContext } from '@/context/DashboardContext';
import { BrokerContext } from '@/context/BrokerContext';

const MarketSentiments = ({ limit = 5 }) => {
    const {
        dashboardData,
        sentimentData,
        availableTabs,
        loadingSentiment,
        refreshSymbolSentiment,
        fetchSentimentData
    } = useContext(DashboardContext);
    const { positions, isConnected: brokerConnected } = useContext(BrokerContext);
    const [activeTab, setActiveTab] = useState(null);
    const [refreshingSymbol, setRefreshingSymbol] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const displayedTabs = showAll ? availableTabs : availableTabs.slice(0, limit);
    // Refresh specific symbol sentiment
    const handleRefreshSymbol = async (symbol) => {
        try {
            setRefreshingSymbol(symbol);
            await refreshSymbolSentiment(symbol);
        } catch (error) {
            console.error(`Failed to refresh sentiment for ${symbol}:`, error);
        } finally {
            setRefreshingSymbol(null);
        }
    };

    // Set initial active tab
    useEffect(() => {
        if (availableTabs.length > 0 && !activeTab) {
            setActiveTab(availableTabs[0]);
        }
    }, [availableTabs]);

    // Refresh sentiment data when dashboard updates
    useEffect(() => {
        if (dashboardData?.marketSentiment && dashboardData.marketSentiment.length > 0) {
            fetchSentimentData();
        }
    }, [dashboardData]);

    // Current selected coin data
    const current = sentimentData[activeTab] || {};
    const {
        sentiment = 'Neutral',
        sentiment_score = 50,
        market_mood = 'No sentiment data available',
        ai_confidence = 0,
        price = 0,
        change_24h = 0
    } = current;

    // Circular gauge setup
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.max(0, Math.min(100, sentiment_score)) / 100 * circumference;

    const getSentimentColor = (score) => {
        if (score >= 66) return '#34C759';
        if (score >= 33) return '#FBBF24';
        return '#FF3B30';
    };

    const sentimentColor = getSentimentColor(sentiment_score);

    // Loading state
    if (loadingSentiment && availableTabs.length === 0) {
        return (
            <View style={styles.container}>
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
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Loading market sentiment...</Text>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </View>
        );
    }

    if (availableTabs.length === 0 && !loadingSentiment) {
        return (
            <View style={styles.container}>
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
                        <View style={styles.emptyContainer}>
                            <Feather name="bar-chart-2" size={48} color="#4b5563" />
                            <Text style={styles.emptyTitle}>No Sentiment Data</Text>
                            <Text style={styles.emptyText}>
                                {brokerConnected && positions?.length > 0
                                    ? "Sentiment analysis will appear here shortly"
                                    : brokerConnected
                                        ? "Open a position to see AI-powered market sentiment"
                                        : "Connect your broker account and open positions to see AI sentiment analysis"}
                            </Text>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <View style={styles.cardContent}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.headerLeft}>
                                <Feather name="activity" size={22} color={sentimentColor} />
                                <View style={styles.headerText}>
                                    <Text style={styles.cardTitle}>Market Sentiment</Text>
                                    <Text style={styles.subText}>Powered by Claude AI</Text>
                                </View>
                            </View>
                            <View style={styles.headerRight}>
                                <Text style={styles.subText}>AI Confidence</Text>
                                <View style={styles.aiConfidenceRow}>
                                    <View style={styles.aiSlider}>
                                        <View
                                            style={[
                                                styles.aiSliderFill,
                                                {
                                                    width: `${ai_confidence}%`,
                                                    backgroundColor: getSentimentColor(ai_confidence),
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.aiConfidenceText,
                                            { color: getSentimentColor(ai_confidence) },
                                        ]}
                                    >
                                        {ai_confidence}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Dynamic Tabs */}
                        <View style={styles.tabContainer}>
                            {displayedTabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                >
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={[
                                            styles.tabText,
                                            activeTab === tab && styles.activeTabText,
                                            styles.tabLabel,
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* Show more button */}
                        {availableTabs.length > limit && !showAll && (
                            <TouchableOpacity onPress={() => setShowAll(true)}>
                                <Text style={styles.showMore}>
                                    +{availableTabs.length - limit} more positions
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Refresh button for current symbol */}
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={() => handleRefreshSymbol(activeTab)}
                            disabled={refreshingSymbol === activeTab}
                        >
                            {refreshingSymbol === activeTab ? (
                                <ActivityIndicator size="small" color="#3b82f6" />
                            ) : (
                                <>
                                    <Feather name="refresh-cw" size={14} color="#94a3b8" />
                                    <Text style={styles.refreshText}>Refresh Analysis</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Sentiment Section */}
                        <View style={styles.sentimentSection}>
                            <Text style={styles.sentimentTitle}>
                                Sentiment:{' '}
                                <Text style={{ color: sentimentColor, fontWeight: 'bold' }}>
                                    {sentiment}
                                </Text>
                            </Text>

                            <View style={styles.circleContainer}>
                                <Svg width={size} height={size}>
                                    <Circle
                                        stroke="#2d3748"
                                        fill="none"
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                    />
                                    <Circle
                                        stroke={sentimentColor}
                                        fill="none"
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - progress}
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                    />
                                    <SvgText
                                        x="50%"
                                        y="50%"
                                        textAnchor="middle"
                                        fontSize="20"
                                        fontWeight="bold"
                                        fill={sentimentColor}
                                        dy=".3em"
                                    >
                                        {sentiment_score}
                                    </SvgText>
                                </Svg>
                            </View>

                            {/* Sentiment Bar */}
                            <View style={styles.sentimentBarContainer}>
                                <View style={styles.sentimentBar}>
                                    <View
                                        style={{
                                            width: `${sentiment_score}%`,
                                            height: '100%',
                                            backgroundColor: sentimentColor,
                                            borderRadius: 6,
                                        }}
                                    />
                                </View>
                                <View style={styles.sentimentLabels}>
                                    <Text style={[styles.labelText, { color: sentiment_score < 40 ? sentimentColor : '#666' }]}>
                                        Fear
                                    </Text>
                                    <Text style={[styles.labelText, { color: sentiment_score >= 40 && sentiment_score <= 60 ? sentimentColor : '#666' }]}>
                                        Neutral
                                    </Text>
                                    <Text style={[styles.labelText, { color: sentiment_score > 60 ? sentimentColor : '#666' }]}>
                                        Greed
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Market Mood Description */}
                        <View style={[styles.descriptionBox, { borderColor: sentimentColor }]}>
                            <Text style={[styles.descriptionTitle, { color: sentimentColor }]}>
                                Current Market Mood
                            </Text>
                            <Text style={styles.descriptionText}>{market_mood}</Text>
                        </View>

                        {/* Price & 24h Change */}
                        <View style={styles.metricsRow}>
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>24h Change</Text>
                                <Text
                                    style={[
                                        styles.metricValue,
                                        { color: change_24h >= 0 ? '#34C759' : '#FF3B30' },
                                    ]}
                                >
                                    {change_24h >= 0 ? '+' : ''}{change_24h?.toFixed(2) || 0}%
                                </Text>
                            </View>
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Price</Text>
                                <Text style={styles.metricValue}>
                                    ${typeof price === 'number' ? price.toFixed(price < 0.01 ? 8 : 2) : price}
                                </Text>
                            </View>
                        </View>

                        {/* Cache info */}
                        <Text style={styles.cacheInfo}>
                            AI analysis cached for 6 hours
                        </Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 10 },
    gradientBoxBorder: { borderRadius: 18, padding: 2 },
    innerGradient: { borderRadius: 16, padding: 18 },
    cardContent: {},
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerText: { marginLeft: 10 },
    cardTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
    subText: { color: '#94a3b8', fontSize: 12 },
    headerRight: { alignItems: 'flex-end' },
    aiConfidenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    aiSlider: { width: 70, height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden', marginRight: 8 },
    aiSliderFill: { height: '100%', borderRadius: 3 },
    aiConfidenceText: { fontWeight: '600', fontSize: 13 },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
        gap: 6,
        flexWrap: 'wrap',
    },
    tab: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, flex: 1, alignItems: 'center', minWidth: 80 },
    activeTab: { backgroundColor: '#3b82f6' },
    tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: '700' },
    tabLabel: { maxWidth: 100, textAlign: 'center' },

    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        marginBottom: 16,
        backgroundColor: '#1e293b',
        borderRadius: 8,
    },
    refreshText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },

    sentimentSection: { alignItems: 'center', marginBottom: 20 },
    sentimentTitle: { color: '#e2e8f0', fontSize: 17, fontWeight: '600', marginBottom: 16 },
    circleContainer: { marginBottom: 16 },
    sentimentBarContainer: { width: '100%', alignItems: 'center' },
    sentimentBar: { width: '100%', height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
    sentimentLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
    labelText: { fontSize: 13, color: '#64748b' },

    descriptionBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
    descriptionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    descriptionText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },

    metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    metric: { alignItems: 'center' },
    metricLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
    metricValue: { color: '#fff', fontSize: 18, fontWeight: '700' },

    cacheInfo: {
        color: '#64748b',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 12,
    },
});

export default MarketSentiments;