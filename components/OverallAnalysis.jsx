import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMemo } from 'react';

const OverallAnalysis = ({ data }) => {
    // Flatten ALL pairs from ALL saved analyses
    const allPairs = useMemo(() => {
        if (!data?.analysisData || !Array.isArray(data.analysisData)) return [];

        return data.analysisData
            .flatMap(savedAnalysis => savedAnalysis.analysisData?.overallAnalysis || [])
            .map(item => ({
                pair: item.pair,
                timeframe: item.timeframe,
                pattern: {
                    name: item.analysis.patternRecognition.pattern,
                    status:
                        item.analysis.patternRecognition.bias === "Bullish"
                            ? "Bullish"
                            : item.analysis.patternRecognition.bias === "Bearish"
                                ? "Bearish"
                                : "Neutral",
                    confidence: item.analysis.patternRecognition.confidence + "%"
                },
                indicator: {
                    name: item.analysis.technicalIndicators.indicator,
                    value: item.analysis.technicalIndicators.value,
                    status:
                        item.analysis.technicalIndicators.bias === "Bullish"
                            ? "Bullish"
                            : item.analysis.technicalIndicators.bias === "Bearish"
                                ? "Bearish"
                                : "Neutral"
                },
                smc: {
                    name: item.analysis.smcZone.type,
                    status:
                        item.analysis.smcZone.strength === "High"
                            ? "Bullish"
                            : item.analysis.smcZone.strength === "Low"
                                ? "Neutral"
                                : "Bearish",
                    price: item.analysis.smcZone.price,
                    strength: item.analysis.smcZone.strength
                }
            }));
    }, [data]);

    const renderItem = ({ item }) => (
        <View style={styles.analysisItem}>
            <View style={styles.itemHeader}>
                <Text style={styles.pairText}>{item.pair} • {item.timeframe}</Text>
            </View>

            {/* Pattern Recognition */}
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
                            {item.pattern.status === "Bullish" ? "Bullish" :
                                item.pattern.status === "Bearish" ? "Bearish" : "Neutral"}
                        </Text>
                        <Text style={styles.subDetail}>Confidence: {item.pattern.confidence}</Text>
                    </View>
                </View>
            </View>

            {/* Technical Indicator */}
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
                            {item.indicator.status === "Bullish" ? "Bullish" :
                                item.indicator.status === "Bearish" ? "Bearish" : "Neutral"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* SMC Zone */}
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
                        <Text style={[styles.status, getsmcStyle(item.smc.status)]}>
                            {item.smc.status === "Bullish" ? "Bullish" :
                                item.smc.status === "Bearish" ? "Bearish" : "Neutral"}
                        </Text>
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
                            data={allPairs}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `${item.pair}-${item.timeframe}-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.flatListContent}
                            snapToAlignment="center"
                            decelerationRate="fast"
                            disableIntervalMomentum
                        />
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

// Helper functions - now based on actual string values (reliable)
const getStatusStyle = (status) => {
    if (status === "Bullish") return styles.bullish;
    if (status === "Bearish") return styles.bearish;
    return styles.neutral;
};

const getIndicatorStyle = getStatusStyle;
const getsmcStyle = getStatusStyle;

export default OverallAnalysis;

// Styles remain 100% unchanged
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {},
    gradientBoxBorder: { borderRadius: 15, padding: 1 },
    innerGradient: { borderRadius: 14, padding: 15 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    header: { color: '#fff', fontSize: 18, fontWeight: '600', marginStart: 5 },
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
    liveText: { color: '#A0AEC0', fontSize: 12, fontWeight: '500', marginStart: 4 },
    description: { color: '#A0AEC0', fontSize: 14, marginBottom: 20 },
    flatListContent: { paddingBottom: 10 },
    analysisItem: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 15,
        marginRight: 15,
        width: 280,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    itemHeader: { marginBottom: 10 },
    pairText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    section: { marginBottom: 15 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { color: '#60a5fa', fontSize: 15, fontWeight: '500', marginStart: 8 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLeft: { flex: 1 },
    detail: { color: '#d1d5db', fontSize: 14, marginBottom: 4 },
    statusContainer: { alignItems: 'flex-end' },
    status: {
        fontSize: 13,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        textAlign: 'center',
        marginBottom: 4,
        borderWidth: 1,
    },
    subDetail: { color: '#9ca3af', fontSize: 12, textAlign: 'right' },
    bullish: { backgroundColor: '#22c55e22', borderColor: '#22c55e', color: '#22c55e' },
    bearish: { backgroundColor: '#ef444422', borderColor: '#ef4444', color: '#ef4444' },
    neutral: { backgroundColor: '#f59e0b22', borderColor: '#f59e0b', color: '#f59e0b' },
});