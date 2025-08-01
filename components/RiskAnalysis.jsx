import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons/';

const RiskAnalysis = () => {
    const riskMetrics = [
        { label: 'Sharpe Ratio', value: '1.87' },
        { label: 'Daily VaR (95%)', value: '2.3%' },
        { label: 'Calmar Ratio', value: '0.68' },
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
                            <Feather name="activity" size={24} color="#fb923c" />
                            <Text style={styles.header}>Risk Analysis</Text>
                        </View>

                        {riskMetrics.map((metric, index) => (
                            <View key={index} style={styles.metricItem}>
                                <Text style={styles.metricLabel}>{metric.label}</Text>
                                <Text style={styles.metricValue}>{metric.value}</Text>
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
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
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