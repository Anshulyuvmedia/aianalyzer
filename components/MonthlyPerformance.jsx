import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '@expo/vector-icons/';
import { formatCurrency, formatPercent } from '@/utils/numberFormatter';

const MonthlyPerformance = ({ data }) => {
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
                            <AntDesign name="barschart" size={24} color="#5998e5" />
                            <Text style={styles.header}>Monthly Performance</Text>
                        </View>
                        {rows.length === 0 ? (
                            <Text style={styles.emptyText}>No trade history available</Text>
                        ) : (
                            rows.map((row, index) => (
                                <View key={index} style={styles.performanceItem}>
                                    <View>
                                        <Text style={styles.month}>{row.month}</Text>
                                        <Text style={styles.metric}>Trades: {row.trades}</Text>
                                    </View>
                                    <View>
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

export default MonthlyPerformance;

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
        width: '100%',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    month: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    metric: {
        color: '#A0AEC0',
        fontSize: 14,
    },
    metricPrice: {
        color: '#47de80',
        fontSize: 14,
        fontWeight: 'bold',
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