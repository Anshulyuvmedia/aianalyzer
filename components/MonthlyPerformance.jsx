import { StyleSheet, Text, View,} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '@expo/vector-icons/';

const MonthlyPerformance = () => {
    const performanceData = [
        { month: 'Jan 2024', trades: 42, profit: '$2,340.5', winRate: '76.2%' },
        { month: 'Dec 2023', trades: 38, profit: '$1,890.3', winRate: '71.1%' },
        { month: 'Nov 2023', trades: 45, profit: '$3,210.8', winRate: '80%' },
        { month: 'Oct 2023', trades: 39, profit: '$1,560.4', winRate: '69.2%' },
        { month: 'Sep 2023', trades: 41, profit: '$2,780.9', winRate: '75.6%' },
        { month: 'Aug 2023', trades: 42, profit: '$1,920.6', winRate: '73.8%' },
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
                        <View className="flex-row">
                            <AntDesign name="barschart" size={24} color="#5998e5" />
                            <Text style={styles.header}>Monthly Performance</Text>
                        </View>
                        {performanceData.map((data, index) => (
                            <View key={index} style={styles.performanceItem}>
                                <View>
                                    <Text style={styles.month}>{data.month}</Text>
                                    <Text style={styles.metric}>Trades: {data.trades}</Text>
                                </View>
                                <View>
                                    <Text style={styles.metricPrice}>Profit: {data.profit}</Text>
                                    <Text style={styles.metric}>Win Rate: {data.winRate}</Text>
                                </View>
                            </View>
                        ))}
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
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
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
});