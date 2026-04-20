// app/(root)/ChartAnalysisResults/PairDetailsScreen.jsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function PairDetailsScreen() {
    const params = useLocalSearchParams();
    const item = params.data ? JSON.parse(params.data) : null;
    const analysisData = params.analysisData ? JSON.parse(params.analysisData) : null;
    // console.log('analysisData', JSON.stringify(analysisData, null, 2));
    if (!item) {
        return (
            <View style={styles.errorContainer}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>No data available</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const getSignalColor = (signal) => {
        if (signal === 'Bullish') return '#22c55e';
        if (signal === 'Bearish') return '#ef4444';
        return '#6b7280';
    };

    const getStatusStyle = (status) => {
        if (status === 'Bullish') return styles.bullish;
        if (status === 'Bearish') return styles.bearish;
        return styles.neutral;
    };

    const handleViewChart = () => {
        router.push({
            pathname: '../ChartAnalysisResults/ChartViewScreen',
            params: {
                pair: JSON.stringify(item),
                analysisData: JSON.stringify(analysisData),
            },
        });
    };

    return (
        <View style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerSection}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#60a5fa" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.pairSymbol}>{item.pair}</Text>
                        <View style={styles.timeframeBadge}>
                            <Text style={styles.timeframeText}>{item.timeframe}</Text>
                        </View>
                    </View>
                    <View style={[styles.signalBadge, { backgroundColor: getSignalColor(item.trendAnalysis.direction) + '15', borderColor: getSignalColor(item.trendAnalysis.direction) }]}>
                        <View style={[styles.signalDot, { backgroundColor: getSignalColor(item.trendAnalysis.direction) }]} />
                        <Text style={[styles.signalText, { color: getSignalColor(item.trendAnalysis.direction) }]}>{item.trendAnalysis.direction}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* View Chart Button - Navigate to fullscreen chart */}
                    <TouchableOpacity
                        style={styles.viewChartButton}
                        onPress={handleViewChart}
                    >
                        <Feather name="bar-chart-2" size={20} color="#60a5fa" />
                        <Text style={styles.viewChartText}>View Fullscreen Chart</Text>
                        <Feather name="maximize-2" size={20} color="#60a5fa" />
                    </TouchableOpacity>

                    {/* Price Info */}
                    <View style={styles.priceCard}>
                        <Text style={styles.priceLabel}>Current Price</Text>
                        <Text style={styles.priceValue}>{item.lastPrice?.toFixed(4) || '—'}</Text>
                        {item.priceChange && (
                            <View style={styles.priceChangeRow}>
                                <Feather name={item.priceChange.direction === 'Up' ? "trending-up" : "trending-down"} size={16} color={item.priceChange.direction === 'Up' ? '#22c55e' : '#ef4444'} />
                                <Text style={[styles.priceChange, { color: item.priceChange.direction === 'Up' ? '#22c55e' : '#ef4444' }]}>
                                    {item.priceChange.direction === 'Up' ? '↑' : '↓'} {Math.abs(item.priceChange.percent)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Technical Indicators Grid */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Indicators</Text>
                        <View style={styles.indicatorsGrid}>
                            <View style={styles.indicatorCard}>
                                <Text style={styles.indicatorLabel}>RSI</Text>
                                <Text style={styles.indicatorValue}>{item.technicalIndicators?.rsi?.value || '—'}</Text>
                                <Text style={[styles.indicatorSignal, getStatusStyle(item.technicalIndicators?.rsi?.signal)]}>
                                    {item.technicalIndicators?.rsi?.signal || 'Neutral'}
                                </Text>
                            </View>
                            <View style={styles.indicatorCard}>
                                <Text style={styles.indicatorLabel}>MACD</Text>
                                <Text style={styles.indicatorValue}>{item.technicalIndicators?.macd?.signalLine || '—'}</Text>
                                <Text style={[styles.indicatorSignal, getStatusStyle(item.technicalIndicators?.macd?.signal)]}>
                                    {item.technicalIndicators?.macd?.signal || 'Neutral'}
                                </Text>
                            </View>
                            <View style={styles.indicatorCard}>
                                <Text style={styles.indicatorLabel}>Trend</Text>
                                <Text style={[styles.indicatorValue, getStatusStyle(item.trendAnalysis?.direction)]}>
                                    {item.trendAnalysis?.direction || 'Neutral'}
                                </Text>
                                <Text style={styles.indicatorSub}>Strength: {item.trend?.strength || '—'}</Text>
                            </View>
                            <View style={styles.indicatorCard}>
                                <Text style={styles.indicatorLabel}>Volatility</Text>
                                <Text style={styles.indicatorValue}>{item.volatility?.level || '—'}</Text>
                                <View style={styles.volatilityIndicator}>
                                    <View style={[styles.volatilityBar, {
                                        width: item.volatility?.level === 'High' ? '100%' :
                                            item.volatility?.level === 'Medium' ? '60%' : '30%',
                                        backgroundColor: item.volatility?.level === 'High' ? '#ef4444' :
                                            item.volatility?.level === 'Medium' ? '#f59e0b' : '#22c55e'
                                    }]} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Bollinger Bands */}
                    {item.technicalIndicators?.bollingerBands && (
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Feather name="bar-chart-2" size={20} color="#c084fc" />
                                <Text style={styles.detailTitle}>Bollinger Bands</Text>
                            </View>
                            <View style={styles.bbContainer}>
                                <View style={styles.bbRow}>
                                    <Text style={styles.bbLabel}>Upper Band:</Text>
                                    <Text style={styles.bbValue}>{item.technicalIndicators.bollingerBands.upper?.toFixed(4)}</Text>
                                </View>
                                <View style={styles.bbRow}>
                                    <Text style={styles.bbLabel}>Middle Band:</Text>
                                    <Text style={styles.bbValue}>{item.technicalIndicators.bollingerBands.middle?.toFixed(4)}</Text>
                                </View>
                                <View style={styles.bbRow}>
                                    <Text style={styles.bbLabel}>Lower Band:</Text>
                                    <Text style={styles.bbValue}>{item.technicalIndicators.bollingerBands.lower?.toFixed(4)}</Text>
                                </View>
                                <View style={styles.bbRow}>
                                    <Text style={styles.bbLabel}>Bandwidth:</Text>
                                    <Text style={styles.bbValue}>{item.technicalIndicators.bollingerBands.bandwidth}%</Text>
                                </View>
                            </View>
                            <View style={[styles.signalPill, { backgroundColor: getSignalColor(item.technicalIndicators.bollingerBands.signal) + '20', alignSelf: 'center' }]}>
                                <Text style={[styles.signalPillText, { color: getSignalColor(item.technicalIndicators.bollingerBands.signal) }]}>
                                    {item.technicalIndicators.bollingerBands.signal}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Support & Resistance */}
                    {item.supportResistance && (item.supportResistance.support || item.supportResistance.resistance) && (
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Feather name="activity" size={20} color="#60a5fa" />
                                <Text style={styles.detailTitle}>Key Levels</Text>
                            </View>
                            <View style={styles.levelContainer}>
                                <View style={styles.levelItem}>
                                    <Text style={styles.levelLabel}>Resistance</Text>
                                    <Text style={styles.levelPrice}>{item.supportResistance.resistance?.price?.toFixed(4) || '—'}</Text>
                                    <View style={[styles.levelStrengthBadge, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}>
                                        <Text style={[styles.levelStrengthText, { color: '#ef4444' }]}>{item.supportResistance.resistance?.strength || 'Weak'}</Text>
                                    </View>
                                </View>
                                <View style={styles.levelDivider} />
                                <View style={styles.levelItem}>
                                    <Text style={styles.levelLabel}>Support</Text>
                                    <Text style={styles.levelPrice}>{item.supportResistance.support?.price?.toFixed(4) || '—'}</Text>
                                    <View style={[styles.levelStrengthBadge, { backgroundColor: '#22c55e15', borderColor: '#22c55e' }]}>
                                        <Text style={[styles.levelStrengthText, { color: '#22c55e' }]}>{item.supportResistance.support?.strength || 'Weak'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Pattern Recognition */}
                    {item.pattern && item.pattern.pattern !== 'No Clear Pattern' && item.pattern.pattern !== 'Analyzing' && (
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Feather name="target" size={20} color="#60a5fa" />
                                <Text style={styles.detailTitle}>Pattern Recognition</Text>
                            </View>
                            <Text style={styles.patternName}>{item.pattern.pattern}</Text>
                            <View style={styles.confidenceBar}>
                                <View style={[styles.confidenceFill, { width: `${item.pattern.confidence}%` }]} />
                                <Text style={styles.confidenceText}>{item.pattern.confidence}% confidence</Text>
                            </View>
                        </View>
                    )}

                    {/* AI Insights */}
                    {(item.aiTrend || item.aiRsi || item.aiSupport) && (
                        <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                                <Feather name="cpu" size={20} color="#a855f7" />
                                <Text style={styles.detailTitle}>AI Insights</Text>
                            </View>
                            {item.aiTrend && (
                                <View style={styles.aiRow}>
                                    <Text style={styles.aiLabel}>AI Trend Prediction:</Text>
                                    <Text style={[styles.aiValue, { color: getSignalColor(item.aiTrend) }]}>{item.aiTrend}</Text>
                                </View>
                            )}
                            {item.aiRsi && (
                                <View style={styles.aiRow}>
                                    <Text style={styles.aiLabel}>AI RSI Signal:</Text>
                                    <Text style={[styles.aiValue, { color: getSignalColor(item.aiRsi) }]}>{item.aiRsi}</Text>
                                </View>
                            )}
                            {item.aiSupport && (
                                <View style={styles.aiRow}>
                                    <Text style={styles.aiLabel}>AI Support Level:</Text>
                                    <Text style={styles.aiValue}>{item.aiSupport}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Trade Recommendation */}
                    {item.recommendation && item.recommendation.action !== 'HOLD' && (
                        <View style={[styles.recommendationCard, {
                            backgroundColor: item.recommendation.action === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            borderLeftColor: item.recommendation.action === 'BUY' ? '#22c55e' : '#ef4444',
                        }]}>
                            <View style={styles.recommendationHeader}>
                                <Text style={styles.recommendationTitle}>Trade Recommendation</Text>
                                <View style={[styles.recommendationActionBadge, { backgroundColor: item.recommendation.action === 'BUY' ? '#22c55e' : '#ef4444' }]}>
                                    <Text style={styles.recommendationActionText}>{item.recommendation.action}</Text>
                                </View>
                            </View>
                            {item.recommendation.entry && (
                                <View style={styles.recommendationDetails}>
                                    <View style={styles.recommendationRow}>
                                        <Text style={styles.recommendationLabel}>Entry Price</Text>
                                        <Text style={styles.recommendationValue}>{item.recommendation.entry.toFixed(4)}</Text>
                                    </View>
                                    <View style={styles.recommendationRow}>
                                        <Text style={styles.recommendationLabel}>Stop Loss</Text>
                                        <Text style={[styles.recommendationValue, { color: '#ef4444' }]}>{item.recommendation.stopLoss?.toFixed(4)}</Text>
                                    </View>
                                    <View style={styles.recommendationRow}>
                                        <Text style={styles.recommendationLabel}>Take Profit</Text>
                                        <Text style={[styles.recommendationValue, { color: '#22c55e' }]}>{item.recommendation.takeProfit?.toFixed(4)}</Text>
                                    </View>
                                    <View style={styles.recommendationDivider} />
                                    <View style={styles.recommendationRow}>
                                        <Text style={styles.recommendationLabel}>Risk/Reward Ratio</Text>
                                        <Text style={styles.recommendationValue}>1:{item.recommendation.riskReward}</Text>
                                    </View>
                                    <View style={styles.recommendationRow}>
                                        <Text style={styles.recommendationLabel}>Confidence</Text>
                                        <View style={[styles.confidenceBadge, {
                                            backgroundColor: item.recommendation.confidence === 'High' ? '#22c55e20' :
                                                item.recommendation.confidence === 'Medium' ? '#f59e0b20' : '#6b728020'
                                        }]}>
                                            <Text style={[styles.confidenceBadgeText, {
                                                color: item.recommendation.confidence === 'High' ? '#22c55e' :
                                                    item.recommendation.confidence === 'Medium' ? '#f59e0b' : '#6b7280'
                                            }]}>
                                                {item.recommendation.confidence}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 16
    },

    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
        paddingTop: 8,
    },
    backButton: {
        padding: 8,
        backgroundColor: '#151515',
        borderRadius: 10
    },
    backButtonText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500'
    },
    headerInfo: {
        flex: 1
    },
    pairSymbol: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700'
    },
    timeframeBadge: {
        backgroundColor: '#151515',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 4
    },
    timeframeText: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500'
    },
    signalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1
    },
    signalDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    signalText: {
        fontSize: 13,
        fontWeight: '600'
    },

    viewChartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    viewChartText: {
        color: '#60a5fa',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        textAlign: 'center',
    },

    priceCard: {
        backgroundColor: '#151515',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20
    },
    priceLabel: {
        color: '#6b7280',
        fontSize: 13,
        marginBottom: 8
    },
    priceValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        fontFamily: 'monospace'
    },
    priceChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8
    },
    priceChange: {
        fontSize: 14,
        fontWeight: '500'
    },

    section: {
        marginBottom: 20
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12
    },

    indicatorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    indicatorCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#151515',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center'
    },
    indicatorLabel: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 6
    },
    indicatorValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4
    },
    indicatorSignal: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4
    },
    indicatorSub: {
        color: '#6b7280',
        fontSize: 10,
        marginTop: 4
    },

    volatilityIndicator: {
        height: 4,
        backgroundColor: '#0f172a',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
        width: '100%'
    },
    volatilityBar: {
        height: '100%',
        borderRadius: 2
    },

    detailCard: {
        backgroundColor: '#151515',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16
    },
    detailTitle: {
        color: '#60a5fa',
        fontSize: 16,
        fontWeight: '600'
    },

    macdContainer: {
        gap: 8,
        marginBottom: 12
    },
    macdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    macdLabel: {
        color: '#6b7280',
        fontSize: 13
    },
    macdValue: {
        color: '#d1d5db',
        fontSize: 13,
        fontFamily: 'monospace'
    },

    bbContainer: {
        gap: 8,
        marginBottom: 12
    },
    bbRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bbLabel: {
        color: '#6b7280',
        fontSize: 13
    },
    bbValue: {
        color: '#d1d5db',
        fontSize: 13,
        fontFamily: 'monospace'
    },

    signalPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8
    },
    signalPillText: {
        fontSize: 13,
        fontWeight: '600'
    },

    levelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    levelItem: {
        flex: 1,
        alignItems: 'center'
    },
    levelDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#151515'
    },
    levelLabel: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 6
    },
    levelPrice: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8
    },
    levelStrengthBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1
    },
    levelStrengthText: {
        fontSize: 11,
        fontWeight: '500'
    },

    patternName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10
    },
    confidenceBar: {
        height: 6,
        backgroundColor: '#0f172a',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 6
    },
    confidenceFill: {
        height: '100%',
        backgroundColor: '#60a5fa',
        borderRadius: 3
    },
    confidenceText: {
        color: '#6b7280',
        fontSize: 11,
        marginTop: 6
    },

    aiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    aiLabel: {
        color: '#6b7280',
        fontSize: 13
    },
    aiValue: {
        color: '#d1d5db',
        fontSize: 13,
        fontWeight: '500'
    },

    recommendationCard: {
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        marginTop: 8
    },
    recommendationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    recommendationTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    recommendationActionBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20
    },
    recommendationActionText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700'
    },
    recommendationDetails: {
        gap: 10
    },
    recommendationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    recommendationLabel: {
        color: '#6b7280',
        fontSize: 13
    },
    recommendationValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },
    recommendationDivider: {
        height: 1,
        backgroundColor: '#151515',
        marginVertical: 8
    },
    confidenceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12
    },
    confidenceBadgeText: {
        fontSize: 12,
        fontWeight: '600'
    },

    bullish: { color: '#22c55e' },
    bearish: { color: '#ef4444' },
    neutral: { color: '#f59e0b' },
});