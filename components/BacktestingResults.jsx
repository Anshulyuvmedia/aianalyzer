import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, AntDesign } from '@expo/vector-icons';

const BacktestingResults = () => {
    const { width } = Dimensions.get('window');
    const isSmallScreen = width < 375; // Adjust threshold based on your design needs

    const metrics = [
        { label: 'Win Rate', value: '73.2%', color: '#22c55e' },
        { label: 'Profit Factor', value: '1.85', color: '#ffffff' },
        { label: 'Max Drawdown', value: '12.4%', color: '#ef4444' },
        { label: 'Total Trades', value: '156', color: '#ffffff' },
    ];

    const trades = [
        { date: '2024-01-15', pair: 'BTC/USD', type: 'Long', entry: '$42,150', exit: '$43,200', pnl: '$1,050', duration: '2h 15m' },
        { date: '2024-01-15', pair: 'ETH/USD', type: 'Short', entry: '$2,680', exit: '$2,620', pnl: '$896', duration: '1h 45m' },
        { date: '2024-01-14', pair: 'SOL/USD', type: 'Long', entry: '$98.5', exit: '$161.2', pnl: '$275', duration: '3h 20m' },
        { date: '2024-01-14', pair: 'ADA/USD', type: 'Long', entry: '$0.485', exit: '$0.472', pnl: '-$156', duration: '4h 10m' },
    ];

    const handleExportPDF = () => {
        console.log('Exporting to PDF');
    };

    const handleExportCSV = () => {
        console.log('Exporting to CSV');
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
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%' }}>
                                <Feather name="trending-up" size={20} color="#22c55e" />
                                <Text style={styles.header}>Backtesting Results</Text>
                            </View>
                            <View style={styles.exportButtons}>
                                <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                                    <AntDesign name="export" size={18} color="white" />
                                    <Text style={styles.exportButtonText}> PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.exportButtonCSV} onPress={handleExportCSV}>
                                    <AntDesign name="export" size={18} color="white" />
                                    <Text style={styles.exportButtonText}> CSV</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.metricsContainer, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                            {metrics.map((metric, index) => (
                                <View key={index} style={[styles.metricBox, { width: '46%', marginBottom: 15 }]}>
                                    <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                                    <Text style={styles.metricLabel}>{metric.label}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.equityCurveContainer}>
                            <Text style={styles.sectionTitle}>Equity Curve</Text>
                            <View style={styles.equityChartPlaceholder}>
                                <Feather name="trending-up" size={30} color="#4B5563" />
                                <Text style={styles.placeholderText}>Equity curve chart would appear here</Text>
                            </View>
                        </View>
                        <View style={styles.tradeDetailsContainer}>
                            <Text style={styles.sectionTitle}>Trade Details</Text>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Date</Text>
                                <Text style={styles.tableHeaderText}>Pair</Text>
                                <Text style={styles.tableHeaderText}>Type</Text>
                                <Text style={styles.tableHeaderText}>Entry</Text>
                                <Text style={styles.tableHeaderText}>Exit</Text>
                                <Text style={styles.tableHeaderText}>P&L</Text>
                                <Text style={styles.tableHeaderText}>Duration</Text>
                            </View>
                            {trades.map((trade, index) => (
                                <View key={index} style={styles.tradeRow}>
                                    <Text style={styles.tableCell}>{trade.date}</Text>
                                    <Text style={styles.tableCell}>{trade.pair}</Text>
                                    <View style={styles.typeIndicator}>
                                        <Text style={[styles.typeText, trade.type === 'Long' ? styles.longType : styles.shortType]}>
                                            {trade.type}
                                        </Text>
                                    </View>
                                    <Text style={styles.tableCell}>{trade.entry}</Text>
                                    <Text style={styles.tableCell}>{trade.exit}</Text>
                                    <Text style={[styles.tableCell, trade.pnl.startsWith('-') ? styles.negativePnl : styles.positivePnl]}>
                                        {trade.pnl}
                                    </Text>
                                    <Text style={styles.tableCell}>{trade.duration}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default BacktestingResults;

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    exportButtons: {
        flexDirection: 'row',
    },
    exportButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButtonCSV: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    metricsContainer: {
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    metricBox: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginRight: 10,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    metricLabel: {
        color: '#A0AEC0',
        fontSize: 12,
        textAlign: 'center',
    },
    equityCurveContainer: {
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
    equityChartPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    placeholderText: {
        color: '#4B5563',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    tradeDetailsContainer: {
        flex: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2d3748',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    tableHeaderText: {
        color: '#A0AEC0',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    tradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    tableCell: {
        color: '#fff',
        fontSize: 10,
        flex: 1,
        textAlign: 'center',
    },
    typeIndicator: {
        alignItems: 'center',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    longType: {
        backgroundColor: '#22c55e',
        color: '#fff',
    },
    shortType: {
        backgroundColor: '#ef4444',
        color: '#fff',
    },
    positivePnl: {
        color: '#22c55e',
    },
    negativePnl: {
        color: '#ef4444',
    },
});