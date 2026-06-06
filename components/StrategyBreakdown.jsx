import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { formatCurrency, formatPercent } from '@/utils/numberFormatter';

const StrategyBreakdown = ({ data }) => {
    const rows = data && data.length > 0 ? data : [];

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
                            <Feather name="pie-chart" size={24} color="#ac78e3" />
                            <Text style={styles.header}>Strategy Breakdown</Text>
                        </View>
                        {rows.length === 0 ? (
                            <Text style={styles.emptyText}>No strategies with trade data</Text>
                        ) : (
                            rows.map((row, index) => (
                                <View key={index} style={styles.performanceItem}>
                                    <View style={styles.leftColumn}>
                                        <Text style={styles.name}>{row.name}</Text>
                                        <Text style={styles.metric}>Trades: {row.trades}</Text>
                                    </View>
                                    <View style={styles.rightColumn}>
                                        <Text style={[styles.metricPrice, row.profit < 0 && styles.metricLoss]}>
                                            Profit: {formatCurrency(row.profit)}
                                        </Text>
                                        <Text style={styles.metric}>Win Rate: {formatPercent(row.winRate)}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default StrategyBreakdown;

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
    performanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
        alignItems: 'flex-end',
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    metric: {
        color: '#A0AEC0',
        fontSize: 14,
        marginBottom: 5,
    },
    metricPrice: {
        color: '#47de80',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    metricLoss: {
        color: '#ef4444',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});