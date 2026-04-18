// components/AIMarketInsights.jsx
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AIMarketInsights = ({ data }) => {
    const [expandedPair, setExpandedPair] = useState(null);

    if (!data) {
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
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#60a5fa" />
                        <Text style={styles.loadingText}>Loading analysis...</Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        );
    }

    const analysisData = data.analysisData || data;
    const aiInsights = analysisData.aiInsights;
    const overallAnalysis = analysisData.overallAnalysis || [];
    const marketSummary = analysisData.marketSummary;

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
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Market Summary Banner */}
                    {marketSummary && (
                        <View style={styles.summaryBanner}>
                            <View style={styles.summaryHeader}>
                                <Feather name="trending-up" size={20} color="#60a5fa" />
                                <Text style={styles.summaryTitle}>Market Summary</Text>
                            </View>
                            <Text style={styles.summaryText}>{marketSummary.summary}</Text>
                            <View style={styles.sentimentBar}>
                                <View style={[styles.sentimentSegment, {
                                    width: `${marketSummary.bullishPercentage}%`,
                                    backgroundColor: '#22c55e'
                                }]} />
                                <View style={[styles.sentimentSegment, {
                                    width: `${marketSummary.neutralPercentage}%`,
                                    backgroundColor: '#6b7280'
                                }]} />
                                <View style={[styles.sentimentSegment, {
                                    width: `${marketSummary.bearishPercentage}%`,
                                    backgroundColor: '#ef4444'
                                }]} />
                            </View>
                            <View style={styles.sentimentLabels}>
                                <Text style={[styles.sentimentLabel, { color: '#22c55e' }]}>
                                    Bullish {marketSummary.bullishPercentage}%
                                </Text>
                                <Text style={[styles.sentimentLabel, { color: '#6b7280' }]}>
                                    Neutral {marketSummary.neutralPercentage}%
                                </Text>
                                <Text style={[styles.sentimentLabel, { color: '#ef4444' }]}>
                                    Bearish {marketSummary.bearishPercentage}%
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Executive Summary from AI */}
                    {aiInsights?.executiveSummary && (
                        <View style={styles.executiveSummary}>
                            <View style={styles.summaryHeader}>
                                <Feather name="cpu" size={20} color="#60a5fa" />
                                <Text style={styles.summaryTitle}>AI Executive Summary</Text>
                            </View>
                            <Text style={styles.executiveText}>{aiInsights.executiveSummary}</Text>
                        </View>
                    )}

                    {/* Pair-wise Analysis */}
                    <Text style={styles.sectionTitle}>Detailed Analysis</Text>

                    {(aiInsights?.pairAnalyses || overallAnalysis).map((analysis, index) => {
                        const pair = analysis.pair;
                        const isExpanded = expandedPair === pair;
                        const recommendation = analysis.recommendation;
                        const technicalSignals = analysis.technicalSignals;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.pairCard}
                                onPress={() => setExpandedPair(isExpanded ? null : pair)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.pairHeader}>
                                    <Text style={styles.pairSymbol}>{pair}</Text>
                                    <View style={[
                                        styles.signalBadge,
                                        {
                                            backgroundColor: technicalSignals?.overall === 'Bullish' ? '#22c55e' :
                                                technicalSignals?.overall === 'Bearish' ? '#ef4444' : '#6b7280'
                                        }
                                    ]}>
                                        <Text style={styles.signalText}>
                                            {technicalSignals?.overall || 'Neutral'}
                                        </Text>
                                    </View>
                                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#fff" />
                                </View>

                                <View style={styles.pairStats}>
                                    <View style={styles.stat}>
                                        <Text style={styles.statLabel}>Trend</Text>
                                        <Text style={[
                                            styles.statValue,
                                            {
                                                color: analysis.trend === 'Bullish' ? '#22c55e' :
                                                    analysis.trend === 'Bearish' ? '#ef4444' : '#6b7280'
                                            }
                                        ]}>
                                            {analysis.trend || 'Neutral'}
                                        </Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Text style={styles.statLabel}>Momentum</Text>
                                        <Text style={styles.statValue}>{analysis.momentum || 'Neutral'}</Text>
                                    </View>
                                    {analysis.keyLevels && (
                                        <>
                                            <View style={styles.stat}>
                                                <Text style={styles.statLabel}>Support</Text>
                                                <Text style={styles.statValue}>{analysis.keyLevels.support?.toFixed(4) || '—'}</Text>
                                            </View>
                                            <View style={styles.stat}>
                                                <Text style={styles.statLabel}>Resistance</Text>
                                                <Text style={styles.statValue}>{analysis.keyLevels.resistance?.toFixed(4) || '—'}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>

                                {isExpanded && (
                                    <View style={styles.expandedContent}>
                                        {/* Patterns */}
                                        {analysis.patternsFound && analysis.patternsFound.length > 0 && (
                                            <View style={styles.infoSection}>
                                                <Text style={styles.infoTitle}>📊 Patterns Detected</Text>
                                                {analysis.patternsFound.map((pattern, idx) => (
                                                    <Text key={idx} style={styles.infoText}>• {pattern}</Text>
                                                ))}
                                            </View>
                                        )}

                                        {/* Technical Signals */}
                                        <View style={styles.infoSection}>
                                            <Text style={styles.infoTitle}>📈 Technical Signals</Text>
                                            <Text style={styles.infoText}>RSI: {technicalSignals?.rsi || 'Neutral'}</Text>
                                            <Text style={styles.infoText}>MACD: {technicalSignals?.macd || 'Neutral'}</Text>
                                        </View>

                                        {/* SMC Insights */}
                                        {analysis.smcInsights && (
                                            <View style={styles.infoSection}>
                                                <Text style={styles.infoTitle}>🏦 Smart Money Concepts</Text>
                                                <Text style={styles.infoText}>{analysis.smcInsights}</Text>
                                            </View>
                                        )}

                                        {/* Trading Recommendation */}
                                        {recommendation && recommendation.action !== 'HOLD' && (
                                            <View style={styles.recommendationCard}>
                                                <Text style={styles.recommendationTitle}>🎯 Trading Recommendation</Text>
                                                <Text style={styles.recommendationAction}>
                                                    {recommendation.action}
                                                </Text>
                                                {recommendation.entry && (
                                                    <View style={styles.recommendationDetails}>
                                                        <Text style={styles.detailText}>Entry: {recommendation.entry.toFixed(4)}</Text>
                                                        <Text style={styles.detailText}>Stop Loss: {recommendation.stopLoss?.toFixed(4)}</Text>
                                                        <Text style={styles.detailText}>Take Profit: {recommendation.takeProfit?.toFixed(4)}</Text>
                                                        <Text style={styles.detailText}>Risk/Reward: {recommendation.riskReward}:1</Text>
                                                        <Text style={styles.detailText}>Confidence: {recommendation.confidence}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Best Opportunities */}
                    {aiInsights?.bestOpportunities && aiInsights.bestOpportunities.length > 0 && (
                        <View style={styles.opportunitiesSection}>
                            <Text style={styles.sectionTitle}>🔥 Best Trading Opportunities</Text>
                            {aiInsights.bestOpportunities.map((opportunity, idx) => (
                                <View key={idx} style={styles.opportunityCard}>
                                    <Text style={styles.opportunityPair}>{opportunity.pair}</Text>
                                    <Text style={styles.opportunitySetup}>{opportunity.setup}</Text>
                                    <Text style={styles.opportunityRationale}>{opportunity.rationale}</Text>
                                    <View style={styles.opportunityMetrics}>
                                        <Text style={styles.metricText}>R:R {opportunity.riskReward}:1</Text>
                                        <Text style={[
                                            styles.metricText,
                                            {
                                                color: opportunity.confidence === 'High' ? '#22c55e' :
                                                    opportunity.confidence === 'Medium' ? '#f59e0b' : '#6b7280'
                                            }
                                        ]}>
                                            {opportunity.confidence} Confidence
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Risk Assessment */}
                    {aiInsights?.riskAssessment && (
                        <View style={styles.riskSection}>
                            <Text style={styles.sectionTitle}>⚠️ Risk Assessment</Text>
                            <View style={styles.riskCard}>
                                <Text style={styles.riskSubtitle}>Key Risks:</Text>
                                {aiInsights.riskAssessment.keyRisks?.map((risk, idx) => (
                                    <Text key={idx} style={styles.riskText}>• {risk}</Text>
                                ))}
                                <Text style={[styles.riskSubtitle, { marginTop: 10 }]}>Invalidation Conditions:</Text>
                                {aiInsights.riskAssessment.invalidationConditions?.map((condition, idx) => (
                                    <Text key={idx} style={styles.riskText}>• {condition}</Text>
                                ))}
                                <Text style={[styles.riskSubtitle, { marginTop: 10 }]}>Suggested Position Size:</Text>
                                <Text style={styles.riskText}>{aiInsights.riskAssessment.suggestedPositionSize}</Text>
                            </View>
                        </View>
                    )}

                    {/* Additional Insights */}
                    {aiInsights?.additionalInsights && (
                        <View style={styles.insightsSection}>
                            <Text style={styles.sectionTitle}>💡 Additional Insights</Text>
                            <View style={styles.insightsCard}>
                                {aiInsights.additionalInsights.correlations && (
                                    <Text style={styles.insightsText}>
                                        <Text style={styles.insightsLabel}>Correlations:</Text> {aiInsights.additionalInsights.correlations}
                                    </Text>
                                )}
                                {aiInsights.additionalInsights.upcomingEvents && (
                                    <Text style={styles.insightsText}>
                                        <Text style={styles.insightsLabel}>Upcoming Events:</Text> {aiInsights.additionalInsights.upcomingEvents}
                                    </Text>
                                )}
                                {aiInsights.additionalInsights.alternativeScenarios && (
                                    <Text style={styles.insightsText}>
                                        <Text style={styles.insightsLabel}>Alternative Scenarios:</Text> {aiInsights.additionalInsights.alternativeScenarios}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
    summaryBanner: {
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryText: {
        color: '#d1d5db',
        fontSize: 14,
        marginBottom: 10,
    },
    sentimentBar: {
        flexDirection: 'row',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    sentimentSegment: {
        height: '100%',
    },
    sentimentLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sentimentLabel: {
        fontSize: 10,
    },
    executiveSummary: {
        backgroundColor: 'rgba(96, 165, 250, 0.05)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    executiveText: {
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    pairCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
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
    signalBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    signalText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    pairStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        flexWrap: 'wrap',
    },
    stat: {
        alignItems: 'center',
        minWidth: 70,
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: 11,
    },
    statValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    expandedContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    infoSection: {
        marginBottom: 12,
    },
    infoTitle: {
        color: '#60a5fa',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    infoText: {
        color: '#d1d5db',
        fontSize: 12,
        marginBottom: 3,
    },
    recommendationCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
    },
    recommendationTitle: {
        color: '#22c55e',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    recommendationAction: {
        color: '#22c55e',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    recommendationDetails: {
        gap: 3,
    },
    detailText: {
        color: '#d1d5db',
        fontSize: 12,
    },
    opportunitiesSection: {
        marginTop: 15,
    },
    opportunityCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    opportunityPair: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    opportunitySetup: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
    },
    opportunityRationale: {
        color: '#d1d5db',
        fontSize: 12,
        marginBottom: 8,
    },
    opportunityMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    metricText: {
        color: '#9ca3af',
        fontSize: 11,
    },
    riskSection: {
        marginTop: 15,
    },
    riskCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 10,
        padding: 12,
    },
    riskSubtitle: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    riskText: {
        color: '#d1d5db',
        fontSize: 12,
        marginBottom: 4,
    },
    insightsSection: {
        marginTop: 15,
        marginBottom: 20,
    },
    insightsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 12,
    },
    insightsText: {
        color: '#d1d5db',
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 18,
    },
    insightsLabel: {
        color: '#60a5fa',
        fontWeight: '500',
    },
});

export default AIMarketInsights;