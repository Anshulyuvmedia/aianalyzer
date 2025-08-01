import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, Octicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Ensure this package is installed

const PerformanceReports = () => {
    const [reportType, setReportType] = useState('performance');
    const [timePeriod, setTimePeriod] = useState('month');
    const [dateRange, setDateRange] = useState('This Month'); // Sync with timePeriod

    const metrics = [
        { label: 'Total Trades', value: '247', color: '#ffffff' },
        { label: 'Win Rate', value: '74.9%', color: '#22c55e' },
        { label: 'Profit Factor', value: '2.34', color: '#60a5fa' },
        { label: 'Max Drawdown', value: '8.7%', color: '#ef4444' },
        { label: 'Total Profit', value: '$15,670.5', color: '#22c55e' },
        { label: 'Avg Win', value: '$156.40', color: '#facc15' },
    ];

    const handleDateRangeChange = (range) => {
        const periodMap = {
            week: 'This Week',
            month: 'This Month',
            quarter: 'This Quarter',
            year: 'This Year',
            all: 'All Time',
        };
        setTimePeriod(range);
        setDateRange(periodMap[range] || 'This Month');
        console.log('Selected time period:', range);
    };

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
                        <View style={styles.controlsRow}>
                            <View style={styles.controlsRow}>
                                <Octicons name="checklist" size={24} color="#60a5fa" />
                                <Text style={styles.header}>Reports</Text>
                            </View>
                            <View style={styles.controlsRow}>
                                <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                                    <Text style={styles.exportText}>Export PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.exportButtonCSV} onPress={handleExportCSV}>
                                    <Text style={styles.exportText}>Export CSV</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.controlsRow}>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={reportType}
                                    onValueChange={(itemValue) => setReportType(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#A0AEC0"
                                >
                                    <Picker.Item label="Performance Summary" value="performance" />
                                    <Picker.Item label="Trade History" value="trades" />
                                    <Picker.Item label="Strategy Analysis" value="strategies" />
                                    <Picker.Item label="Risk Analysis" value="risk" />
                                </Picker>
                            </View>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={timePeriod}
                                    onValueChange={(itemValue) => handleDateRangeChange(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#A0AEC0"
                                >
                                    <Picker.Item label="This Week" value="week" />
                                    <Picker.Item label="This Month" value="month" />
                                    <Picker.Item label="This Quarter" value="quarter" />
                                    <Picker.Item label="This Year" value="year" />
                                    <Picker.Item label="All Time" value="all" />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.metricsContainer}>
                            {metrics.map((metric, index) => (
                                <View key={index} style={styles.metricBox}>
                                    <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                                    <Text style={styles.metricLabel}>{metric.label}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.chartSection}>
                            <Text style={styles.sectionTitle}>Equity Curve</Text>
                            <View style={styles.chartPlaceholder}>
                                <Feather name="trending-up" size={30} color="#9ca3af" />
                                <Text style={styles.placeholderText}>Detailed equity curve chart would appear here</Text>
                            </View>
                        </View>
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