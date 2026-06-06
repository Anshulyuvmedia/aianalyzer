import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, Octicons } from '@expo/vector-icons';
import { formatCurrency, formatPercent } from '@/utils/numberFormatter';
import LineChartComponent from '@/components/charts/LineChartComponent';

const PerformanceReports = ({ metrics, equityCurve }) => {
    const { totalTrades = 0, winRate = 0, maxDrawdown = 0, totalProfit = 0, avgWin = 0 } = metrics || {};

    const metricItems = [
        { label: 'Total Trades', value: String(totalTrades), color: '#ffffff' },
        { label: 'Win Rate', value: formatPercent(winRate), color: '#22c55e' },
        { label: 'Max Drawdown', value: formatPercent(maxDrawdown), color: '#ef4444' },
        { label: 'Total Profit', value: formatCurrency(totalProfit), color: '#22c55e' },
        { label: 'Avg Win', value: formatCurrency(avgWin), color: '#facc15' },
    ];

    const chartData = equityCurve?.length > 1
        ? {
            labels: [],
            values: equityCurve.map(p => p.value),
        }
        : null;

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
                        <View style={styles.controlsRow}>
                            <View style={styles.controlsRow}>
                                <Octicons name="checklist" size={24} color="#60a5fa" />
                                <Text style={styles.header}>Reports</Text>
                            </View>
                        </View>
                        <View style={styles.metricsContainer}>
                            {metricItems.map((metric, index) => (
                                <View key={index} style={styles.metricBox}>
                                    <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                                    <Text style={styles.metricLabel}>{metric.label}</Text>
                                </View>
                            ))}
                        </View>
                        {/* <View style={styles.chartSection}>
                            <Text style={styles.sectionTitle}>Equity Curve</Text>
                            {chartData ? (
                                <LineChartComponent data={chartData} />
                            ) : (
                                <View style={styles.chartPlaceholder}>
                                    <Feather name="trending-up" size={30} color="#9ca3af" />
                                    <Text style={styles.placeholderText}>No equity data available yet</Text>
                                </View>
                            )}
                        </View> */}
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default PerformanceReports;

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
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: '#2d3748',
        borderWidth: 1,
        borderColor: '#4B5563',
        borderRadius: 10,
    },
    picker: {
        color: '#fff',

    },
    exportButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    exportButtonCSV: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    exportText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    metricBox: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        width: '48%',
        marginBottom: 10,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    metricLabel: {
        color: '#A0AEC0',
        fontSize: 12,
        textAlign: 'center',
    },
    chartSection: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    chartPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    placeholderText: {
        color: '#9ca3af',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
});