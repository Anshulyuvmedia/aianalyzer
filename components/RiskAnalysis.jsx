import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons/';
import { formatPercent } from '@/utils/numberFormatter';

const RiskAnalysis = ({ metrics }) => {
    const { sharpeRatio, dailyVaR, calmarRatio, maxDrawdown, winRate } = metrics || {};

    const items = [
        { label: 'Sharpe Ratio', value: sharpeRatio != null ? sharpeRatio.toFixed(2) : 'N/A', good: sharpeRatio != null && sharpeRatio >= 1 },
        { label: 'Daily VaR (95%)', value: dailyVaR != null ? `${dailyVaR}%` : 'N/A', good: dailyVaR != null && dailyVaR <= 3 },
        { label: 'Calmar Ratio', value: calmarRatio != null ? calmarRatio.toFixed(2) : 'N/A', good: calmarRatio != null && calmarRatio >= 1 },
        { label: 'Max Drawdown', value: formatPercent(maxDrawdown), good: maxDrawdown <= 15 },
        { label: 'Win Rate', value: formatPercent(winRate), good: winRate >= 50 },
    ];

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
                            <Feather name="activity" size={24} color="#fb923c" />
                            <Text style={styles.header}>Risk Analysis</Text>
                        </View>

                        {items.map((item, index) => (
                            <View key={index} style={styles.metricItem}>
                                <Text style={styles.metricLabel}>{item.label}</Text>
                                <Text style={[styles.metricValue, { color: item.good ? '#22c55e' : '#ef4444' }]}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default RiskAnalysis;

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
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    metricItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    metricLabel: {
        color: '#fff',
        fontSize: 14,
    },
    metricValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});