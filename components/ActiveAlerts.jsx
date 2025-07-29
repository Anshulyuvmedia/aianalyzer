import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Octicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';


const ActiveAlerts = () => {
    const trades = [
        {
            name: 'Pattern Alert',
            info: 'Double Bottom detected on BTC/USD 4H',
            time: '5m ago',
        },
        {
            name: 'Indicator Alert',
            info: 'RSI oversold on ETH/USD 1H',
            time: '12m ago',
        },
        {
            name: 'Copy Trade',
            info: 'New position opened by @CryptoKing',
            time: '18m ago',
        },
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
                    <View className="flex-row">
                        <Octicons name="stop" size={24} color="gold" />
                        <Text style={styles.header}>Active Alerts</Text>
                    </View>
                    {trades.map((trade, index) => (
                        <View key={index} style={styles.tradeItem}>
                            <View style={styles.tradeInfo}>
                                <Text style={styles.name}>{trade.name}</Text>
                                <Text style={styles.tradeDetails}>
                                    {trade.info} • {trade.timeAgo}
                                </Text>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.change}>
                                    {trade.time}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default ActiveAlerts;

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#1A202C',
        borderRadius: 8,
        // padding: 10,
        marginVertical: 10,
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
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
        marginStart: 5,
    },
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#131b2a',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2D3748',
    },
    tradeInfo: {
        flexDirection: 'column',
    },
    name: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
    tradeDetails: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    priceRange: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    change: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280', // Green for positive change
    },
});