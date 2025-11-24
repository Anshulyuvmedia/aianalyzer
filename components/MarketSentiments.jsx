import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const MarketSentiments = ({ data }) => {
    const [activeTab, setActiveTab] = useState('BTC/USD');
    const [sentimentData, setSentimentData] = useState({});

    // Get current active coin data
    const current = sentimentData[activeTab] || {};
    const {
        aiConfidence = 0,
        sentimentScore = 0,
        change24h = 0,
        currentPrice = 0,
        sentimentLabel = 'Neutral',
        description = 'Loading...'
    } = current;

    // Circular progress setup
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (sentimentScore / 100) * circumference;

    // Determine color based on sentiment
    const getSentimentColor = (score) => {
        if (score >= 66) return '#34C759'; // Greed - Green
        if (score >= 33) return '#FBBF24'; // Neutral - Yellow
        return '#FF3B30'; // Fear - Red
    };

    const sentimentColor = getSentimentColor(sentimentScore);

    useEffect(() => {
        if (!data || !data.marketSentiment) return;

        const formatted = {};
        Object.keys(data.marketSentiment).forEach(pair => {
            const item = data.marketSentiment[pair];
            formatted[pair] = {
                aiConfidence: item.aiConfidence || 0,
                sentimentScore: item.sentimentScore || 0,
                change24h: item.change24h || 0,
                currentPrice: item.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
                sentimentLabel: item.sentimentLabel || 'Neutral',
                description:
                    item.sentimentLabel === 'Greed'
                        ? 'Market shows strong bullish sentiment and greed.'
                        : item.sentimentLabel === 'Fear'
                            ? 'Market shows fear and selling pressure.'
                            : 'Market sentiment is neutral.'
            };
        });

        setSentimentData(formatted);

        // Set default active tab to first available
        if (Object.keys(formatted).length > 0 && !formatted[activeTab]) {
            setActiveTab(Object.keys(formatted)[0]);
        }
    }, [data]);

    if (!data || Object.keys(sentimentData).length === 0) {
        return (
            <View style={styles.container}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Loading market sentiment...</Text>
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
                                    <Text style={styles.subText}>Powered by AI Analysis</Text>
                                </View>
                            </View>
                            <View style={styles.headerRight}>
                                <Text style={styles.subText}>AI Confidence</Text>
                                <View style={styles.aiConfidenceRow}>
                                    <View style={styles.aiSlider}>
                                        <View style={[styles.aiSliderFill, {
                                            width: `${aiConfidence}%`,
                                            backgroundColor: getSentimentColor(aiConfidence)
                                        }]} />
                                    </View>
                                    <Text style={[styles.aiConfidenceText, { color: getSentimentColor(aiConfidence) }]}>
                                        {aiConfidence.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabContainer}>
                            {Object.keys(sentimentData).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                        {tab.replace('/USD', '')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sentiment Circle + Slider */}
                        <View style={styles.sentimentSection}>
                            <Text style={styles.sentimentTitle}>
                                Sentiment: <Text style={{ color: sentimentColor, fontWeight: 'bold' }}>{sentimentLabel}</Text>
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
                                        rotation="-90"
                                        originX={size / 2}
                                        originY={size / 2}
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
                                        {sentimentScore.toFixed(0)}
                                    </SvgText>
                                </Svg>
                            </View>

                            {/* Sentiment Bar */}
                            <View style={styles.sentimentBarContainer}>
                                <View style={styles.sentimentBar}>
                                    <View style={[styles.sentimentFill, { width: `${sentimentScore}%`, backgroundColor: sentimentColor }]} />
                                </View>
                                <View style={styles.sentimentLabels}>
                                    <Text style={[styles.labelText, { color: sentimentScore < 40 ? sentimentColor : '#666' }]}>Fear</Text>
                                    <Text style={[styles.labelText, { color: sentimentScore >= 40 && sentimentScore <= 60 ? sentimentColor : '#666' }]}>Neutral</Text>
                                    <Text style={[styles.labelText, { color: sentimentScore > 60 ? sentimentColor : '#666' }]}>Greed</Text>
                                </View>
                            </View>
                        </View>

                        {/* Description Box */}
                        <View style={[styles.descriptionBox, { borderColor: sentimentColor }]}>
                            <Text style={[styles.descriptionTitle, { color: sentimentColor }]}>Current Market Mood</Text>
                            <Text style={styles.descriptionText}>{description}</Text>
                        </View>

                        {/* Price & Change */}
                        <View style={styles.metricsRow}>
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>24h Change</Text>
                                <Text style={[styles.metricValue, { color: change24h >= 0 ? '#34C759' : '#FF3B30' }]}>
                                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                                </Text>
                            </View>
                            <View style={styles.metric}>
                                <Text style={styles.metricLabel}>Price</Text>
                                <Text style={styles.metricValue}>${currentPrice}</Text>
                            </View>
                        </View>

                        <Text style={styles.lastUpdated}>Last updated: just now</Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

export default MarketSentiments;

const styles = StyleSheet.create({
    container: { marginVertical: 10 },
    gradientBoxBorder: { borderRadius: 18, padding: 2 },
    innerGradient: { borderRadius: 16, padding: 18 },
    cardContent: {},
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
        marginBottom: 20,
        gap: 6
    },
    tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, flex: 1, alignItems: 'center' },
    activeTab: { backgroundColor: '#3b82f6' },
    tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: '700' },

    sentimentSection: { alignItems: 'center', marginBottom: 20 },
    sentimentTitle: { color: '#e2e8f0', fontSize: 17, fontWeight: '600', marginBottom: 16 },
    circleContainer: { marginBottom: 16 },
    sentimentBarContainer: { width: '100%', alignItems: 'center' },
    sentimentBar: { width: '100%', height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
    sentimentFill: { height: '100%', borderRadius: 4 },
    sentimentLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
    labelText: { fontSize: 13, color: '#64748b' },

    descriptionBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
    descriptionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    descriptionText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },

    metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    metric: { alignItems: 'center' },
    metricLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
    metricValue: { color: '#fff', fontSize: 18, fontWeight: '700' },

    lastUpdated: { textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 8 }
});