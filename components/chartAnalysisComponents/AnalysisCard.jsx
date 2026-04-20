// components/chartAnalysisComponents/AnalysisCard.jsx
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export const AnalysisCard = ({ analysis, isExpanded, onToggle }) => {
    const analysisData = analysis.analysisData;
    const overallAnalysis = analysisData?.overallAnalysis || [];
    const analysisDate = new Date(analysis.createdAt || analysis.requestedAt);
    const marketSummary = analysisData?.marketSummary;

    const biasColor = marketSummary?.overallBias === 'Bullish' ? '#22c55e' :
        marketSummary?.overallBias === 'Bearish' ? '#ef4444' : '#f59e0b';

    const getSignalColor = (signal) => {
        if (signal === 'Bullish') return '#22c55e';
        if (signal === 'Bearish') return '#ef4444';
        return '#f59e0b';
    };

    const handleViewPairDetails = (pairItem) => {
        router.push({
            pathname: '../ChartAnalysisResults/PairDetailsScreen',
            params: {
                data: JSON.stringify(pairItem),
                analysisData: JSON.stringify(analysis)
            },
        });
    };

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
                <TouchableOpacity
                    style={styles.analysisHeader}
                    onPress={onToggle}
                    activeOpacity={0.7}
                >
                    <View style={styles.analysisHeaderLeft}>
                        <Text style={styles.analysisTime}>
                            {analysisDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                        <View style={styles.statsBadge}>
                            <Text style={styles.statsBadgeText}>{overallAnalysis.length} pairs</Text>
                        </View>
                        <View style={styles.styleBadge}>
                            <Text style={styles.styleBadgeText}>
                                {analysisData?.request?.analysisStyle || 'Price Action'}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.biasBadge, { backgroundColor: biasColor + '20', borderColor: biasColor }]}>
                        <Text style={[styles.biasText, { color: biasColor }]}>
                            {marketSummary?.overallBias || 'Neutral'}
                        </Text>
                    </View>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {overallAnalysis.filter(item => !item.error).map((item, idx) => {
                            const signalColor = getSignalColor(
                                item.technicalIndicators?.rsi?.bias === 'Bullish' ? 'Bullish' :
                                    item.technicalIndicators?.rsi?.bias === 'Bearish' ? 'Bearish' : 'Neutral'
                            );

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.pairItem}
                                    onPress={() => handleViewPairDetails(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.pairHeader}>
                                        <View>
                                            <Text style={styles.pairSymbol}>{item.pair}</Text>
                                            <Text style={styles.pairTimeframe}>{item.timeframe}</Text>
                                        </View>
                                        <View style={styles.pairActions}>
                                            <View style={[styles.signalBadge, { backgroundColor: signalColor + '15', borderColor: signalColor }]}>
                                                <View style={[styles.signalDot, { backgroundColor: signalColor }]} />
                                                <Text style={[styles.signalText, { color: signalColor }]}>
                                                    {item.technicalIndicators?.rsi?.bias || 'Neutral'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.pairStats}>
                                        <View style={styles.pairStat}>
                                            <Text style={styles.pairStatLabel}>Price</Text>
                                            <Text style={styles.pairStatValue}>{item.lastPrice?.toFixed(4) || '—'}</Text>
                                        </View>
                                        <View style={styles.pairStat}>
                                            <Text style={styles.pairStatLabel}>RSI</Text>
                                            <Text style={styles.pairStatValue}>{item.technicalIndicators?.rsi?.value || '—'}</Text>
                                        </View>
                                        <View style={styles.pairStat}>
                                            <Text style={styles.pairStatLabel}>Trend</Text>
                                            <Text style={[styles.pairStatValue, { color: getSignalColor(item.trendAnalysis?.direction) }]}>
                                                {item.trendAnalysis?.direction || 'Neutral'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </LinearGradient>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 16,
        padding: 1,
        marginBottom: 12,
    },
    innerGradient: {
        borderRadius: 15,
        padding: 12,
    },
    analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    analysisHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        flexWrap: 'wrap',
    },
    analysisTime: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    statsBadge: {
        backgroundColor: '#151515',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statsBadgeText: {
        color: '#6b7280',
        fontSize: 10,
    },
    styleBadge: {
        backgroundColor: '#3b82f620',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3b82f640',
    },
    styleBadgeText: {
        color: '#60a5fa',
        fontSize: 9,
    },
    biasBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    biasText: {
        fontSize: 11,
        fontWeight: '600',
    },
    expandedContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#151515',
        gap: 10,
    },
    pairItem: {
        backgroundColor: '#151515',
        borderRadius: 12,
        padding: 12,
    },
    pairHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pairSymbol: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    pairTimeframe: {
        color: '#6b7280',
        fontSize: 10,
        marginTop: 2,
    },
    pairActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    signalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    signalDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    signalText: {
        fontSize: 10,
        fontWeight: '600',
    },
    pairStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    pairStat: {
        flex: 1,
        alignItems: 'center',
    },
    pairStatLabel: {
        color: '#6b7280',
        fontSize: 10,
    },
    pairStatValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
});