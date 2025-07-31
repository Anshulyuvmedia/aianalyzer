import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';

const RecentCopyTrades = () => {
    const trades = [
        {
            id: '1',
            stock: 'BTC/USD',
            cmp: '+$85.30',
            traderName: 'CryptoKing',
            type: 'Long',
            status: 'Open',
            entry: '$42,150',
            current: '$42,850',
            time: '15m ago',
        },
        {
            id: '2',
            stock: 'ETH/USD',
            cmp: '-$145.60',
            traderName: 'AlgoExpert',
            type: 'Short',
            status: 'Closed',
            entry: '$2,680',
            current: '$2,534',
            time: '1h ago',
        },
        {
            id: '3',
            stock: 'BTC/USD',
            cmp: '+$85.30',
            traderName: 'CryptoKing',
            type: 'Long',
            status: 'Open',
            entry: '$42,150',
            current: '$42,850',
            time: '15m ago',
        },
    ];

    const renderTradeItem = ({ item }) => (
        <View style={styles.tradeCard}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.stockName}>{item.stock}</Text>
                    <Text style={styles.traderName}>by {item.traderName}</Text>
                </View>
                <View style={styles.statusCmpContainer}>
                    <Text
                        style={[
                            styles.cmpText,
                            { color: item.cmp.startsWith('-') ? '#FF3B15' : '#34C759' },
                        ]}
                    >
                        {item.cmp}
                    </Text>
                    <Text style={styles.timestamp}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.tradeDetails}>
                <View style={styles.statusContainer}>
                    <Text
                        style={[
                            styles.statusText,
                            {
                                backgroundColor:
                                    item.type === 'Long' ? '#14532d' : '#7f1d1d',
                            },
                        ]}
                    >
                        {item.type}
                    </Text>
                    <Text
                        style={[
                            styles.statusText,
                            {
                                backgroundColor:
                                    item.status === 'Open' ? '#1e3a8a' : '#374151',
                            },
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>Entry: {item.entry}</Text>
                    <Text style={styles.priceText}>Current: {item.current}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
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
                    <View style={styles.cardContent}>
                        <View className="flex-row">
                            <Feather name="activity" size={20} color='#4ade80' />
                            <Text style={styles.headerText}>Recent Copy Trades</Text>
                        </View>
                        <FlatList
                            data={trades}
                            renderItem={renderTradeItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    No recent trades available.
                                </Text>
                            }
                        />
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBoxBorder: {
        borderRadius: 20,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    innerGradient: {
        borderRadius: 18,
        padding: 20,
    },
    cardContent: {
        minHeight: 200, // Ensure card has minimum height
    },
    headerText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 20,
        letterSpacing: 0.5,
        marginStart: 5,
    },
    tradeCard: {
        backgroundColor: '#2d374833',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    stockName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    traderName: {
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 2,
    },
    statusCmpContainer: {
        alignItems: 'flex-end',
    },
    cmpText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    timestamp: {
        color: '#9ca3af',
        fontSize: 12,
    },
    tradeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 8,
        textTransform: 'capitalize',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 10,
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default RecentCopyTrades;