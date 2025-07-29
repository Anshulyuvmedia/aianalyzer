import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const MarketSentiments = () => {
    const [activeTab, setActiveTab] = useState('BTC/USD');

    const [sentimentData, setSentimentData] = useState({
        'BTC/USD': { aiConfidence: 80, sentiments: 75, change24h: '+12.3%', currentPrice: '$42,850', sentiment: 'Greed', description: 'Market shows strong greed sentiment with high buying pressure. BTC/USD is experiencing significant bullish momentum.' },
        'ETH/USD': { aiConfidence: 50, sentiments: 50, change24h: '+8.5%', currentPrice: '$2,680', sentiment: 'Neutral', description: 'Market shows neutral sentiment with balanced trading. ETH/USD is in a consolidation phase.' },
        'SOL/USD': { aiConfidence: 30, sentiments: 25, change24h: '-3.2%', currentPrice: '$98.50', sentiment: 'Fear', description: 'Market shows fear sentiment with selling pressure. SOL/USD is experiencing bearish conditions.' },
        'ADA/USD': { aiConfidence: 55, sentiments: 45, change24h: '+2.1%', currentPrice: '$0.485', sentiment: 'Neutral', description: 'Market shows neutral sentiment with balanced trading. ADA/USD is in a consolidation phase.' },
    });

    const { aiConfidence, sentiments, change24h, currentPrice, sentiment, description } = sentimentData[activeTab];
    const screenWidth = Dimensions.get('window').width;
    const size = 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (sentiments / 100) * circumference;

    // Only keep Animated.Value for borderColor and tabBackgroundColor if needed
    const borderColor = useState(new Animated.Value(0))[0];
    const tabBackgroundColor = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const confidenceRatio = sentiments / 100;
        Animated.parallel([
            Animated.timing(borderColor, {
                toValue: confidenceRatio,
                duration: 500,
                useNativeDriver: false,
            }),
            Animated.timing(tabBackgroundColor, {
                toValue: confidenceRatio,
                duration: 500,
                useNativeDriver: false,
            }),
        ]).start();
    }, [sentiments, borderColor, tabBackgroundColor]);

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
                        <View style={styles.cardHeader}>
                            <View style={styles.headerLeft}>
                                <Feather name="activity" size={20} color={sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30'} />
                                <View style={styles.headerText}>
                                    <Text style={styles.cardChange}>Market Sentiment</Text>
                                    <Text style={styles.subText}>AI Analysis</Text>
                                </View>
                            </View>
                            <View style={styles.headerRight}>
                                <Text style={styles.subText}>AI Confidence</Text>
                                <View className="flex-row items-center">
                                    <View style={styles.aislider}>
                                        <View style={[styles.aisliderTrack, { width: `${aiConfidence}%`, backgroundColor: aiConfidence >= 66 ? '#34C759' : aiConfidence >= 33 && aiConfidence < 66 ? '#FBBF24' : '#FF3B30' }]} />
                                    </View>
                                    <Text style={{ color: aiConfidence >= 66 ? '#34C759' : aiConfidence >= 33 && aiConfidence < 66 ? '#FBBF24' : '#FF3B30' }}>{aiConfidence}%</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tabContainer}>
                            {['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[
                                        styles.tab,
                                        activeTab === tab && styles.activeTab,
                                    ]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.chartPlaceholder}>
                            <View style={styles.confidenceContainer}>
                                <Text style={styles.sentimentTitle}>Sentiment Indicator: {sentiment}</Text>

                                <Svg height={size} width={size}>
                                    <Circle
                                        stroke="#2d3748"
                                        fill="none"
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                    />
                                    <Circle
                                        stroke={sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30'}
                                        fill="none"
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - progress}
                                        strokeLinecap="round"
                                        rotation={-90}
                                        origin={`${size / 2}, ${size / 2}`}
                                    />
                                    <SvgText
                                        x={size / 2}
                                        y={size / 2}
                                        textAnchor="middle"
                                        fontSize="16"
                                        fill={sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30'}
                                        fontWeight="bold"
                                        dy=".3em"
                                    >
                                        {sentiments}
                                    </SvgText>
                                </Svg>
                            </View>
                            <View style={styles.sentimentIndicator}>
                                <View style={styles.slider}>
                                    <View style={[styles.sliderTrack, { width: `${sentiments}%`, backgroundColor: sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30' }]} />
                                </View>
                                <View style={styles.indicatorRow}>
                                    <Text style={[styles.indicatorText, { color: sentiments < 33 ? '#FF3B30' : '#9CA3AF' }]}>Fear</Text>
                                    <Text style={[styles.indicatorText, { color: sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#9CA3AF' }]}>Neutral</Text>
                                    <Text style={[styles.indicatorText, { color: sentiments >= 66 ? '#34C759' : '#9CA3AF' }]}>Greed</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.sentimentBox, {
                            backgroundColor: sentiments >= 66 ? '#142b2b' : sentiments >= 33 && sentiments < 66 ? '#2d2422' : '#311b26',
                            borderColor: sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30'
                        }]}>
                            <Text style={[styles.sentimentHeader, { color: sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30' }]}>Current Sentiment</Text>
                            <Text style={styles.sentimentDescription}>{description}</Text>
                        </View>

                        <View style={styles.metricsContainer}>
                            <View style={styles.metricBox}>
                                <Text style={[styles.metricValue, { color: sentiments >= 66 ? '#34C759' : sentiments >= 33 && sentiments < 66 ? '#FBBF24' : '#FF3B30' }]}>{change24h}</Text>
                                <Text style={styles.metricLabel}>24h Change</Text>
                            </View>
                            <View style={styles.metricBox}>
                                <Text style={styles.metricValue}>{currentPrice}</Text>
                                <Text style={styles.metricLabel}>Current Price</Text>
                            </View>
                        </View>

                        <Text style={styles.lastUpdated}>Last updated: 2 minutes ago</Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View >
    );
};

export default MarketSentiments;

// Styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // marginBottom: 10,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    cardContent: {
        // alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 8,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    cardChange: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    subText: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 5,
    },
    confidenceContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: '#121827',
        padding: 2,
        borderRadius: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1f52dc',
    },
    tabGradient: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    tabText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    chartPlaceholder: {
        // backgroundColor: '#131928',
        width: '100%',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    placeholderText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    sentimentIndicator: {
        marginTop: 10,
    },
    sentimentTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    indicatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    indicatorText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    sentimentBox: {
        backgroundColor: '#131928',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    sentimentHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    sentimentDescription: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricBox: {
        backgroundColor: '#11182780',
        borderColor: '#3741514d',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    metricValue: {
        color: '#60a5fa',
        fontSize: 18,
        fontWeight: '600',
    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    lastUpdated: {
        color: '#9CA3AF',
        fontSize: 12,
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 5,
        backgroundColor: '#1d1d26',
        borderRadius: 5,
        marginVertical: 5,
    },
    sliderTrack: {
        height: '100%',
        borderRadius: 5,
    },
    aislider: {
        width: '45%',
        height: 5,
        backgroundColor: '#1d1d26',
        borderRadius: 5,
        marginVertical: 5,
    },
    aisliderTrack: {
        height: '100%',
        backgroundColor: '#05FF93',
        borderRadius: 5,
    },
});