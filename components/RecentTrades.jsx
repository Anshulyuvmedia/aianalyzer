import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';


const RecentTrades = () => {
    const trades = [
        {
            pair: 'BTC/USD',
            type: 'Long',
            timeAgo: '2h ago',
            priceRange: '42,150 - 43,200',
            change: '+2.49%',
        },
        {
            pair: 'ETH/USD',
            type: 'Short',
            timeAgo: '4h ago',
            priceRange: '2,680 - 2,620',
            change: '-2.24%',
        },
        {
            pair: 'SOL/USD',
            type: 'Long',
            timeAgo: '6h ago',
            priceRange: '98.50 - 101.20',
            change: '+2.74%',
        },
        {
            pair: 'ADA/USD',
            type: 'Short',
            timeAgo: '8h ago',
            priceRange: '0.485 - 0.472',
            change: '-2.68%',
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
                        <Ionicons name="analytics-outline" size={24} color="green" />
                        <Text style={styles.header}>Recent Trades</Text>
                    </View>
                    {trades.map((trade, index) => (
                        <View key={index} style={styles.tradeItem}>
                            <View style={styles.tradeInfo}>
                                <Text style={styles.pair}>{trade.pair}</Text>
                                <Text style={styles.tradeDetails}>
                                    {trade.type} • {trade.timeAgo}
                                </Text>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text
                                    style={[
                                        styles.change,
                                        trade.change.startsWith('+') ? styles.positive : styles.negative,
                                    ]}
                                >
                                    {trade.change}
                                </Text>
                                <Text style={styles.priceRange}>{trade.priceRange}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default RecentTrades;

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
    pair: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    tradeDetails: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    priceRange: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    change: {
        fontSize: 12,
        fontWeight: '500',
    },
    positive: {
        color: '#34C759', // Green for positive change
    },
    negative: {
        color: '#FF3B30', // Red for negative change
    },
});