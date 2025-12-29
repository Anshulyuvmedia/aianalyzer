import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const RecentTrades = ({ data }) => {
    const trades = data || [];

    // Map API fields to UI fields
    const mappedTrades = trades.map(trade => ({
        pair: trade.symbol,
        direction: trade.side,
        timeAgo: new Date(trade.time).toLocaleString(),
        percent: ((trade.fee / trade.notional) * 100).toFixed(2),
        entry: trade.price,
        exit: trade.price,
    }));

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="analytics-outline" size={24} color="green" />
                        <Text style={styles.header}>Recent Trades</Text>
                    </View>

                    {mappedTrades.map((trade, index) => (
                        <View key={index} style={styles.tradeItem}>
                            <View style={styles.tradeInfo}>
                                <Text style={styles.pair}>{trade.pair}</Text>
                                <Text
                                    style={[
                                        styles.tradeDetails,
                                        trade.direction === 'sell' ? styles.sell : styles.buy,
                                    ]}
                                >
                                    {trade.direction} • {trade.timeAgo}
                                </Text>

                            </View>

                            <View style={styles.priceContainer}>
                                <Text
                                    style={[
                                        styles.change,
                                        trade.percent >= 0 ? styles.positive : styles.negative,
                                    ]}
                                >
                                    {trade.percent >= 0 ? `+${trade.percent}%` : `${trade.percent}%`}
                                </Text>
                                <Text style={styles.priceRange}>
                                    {trade.entry} → {trade.exit}
                                </Text>
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
        borderRadius: 8,
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
        marginStart: 5,
    },
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#131b2a',
        alignItems: 'center',
        padding: 10,
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
        fontSize: 16,
        fontWeight: '600',
    },
    tradeDetails: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 2,
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
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    positive: {
        color: '#34C759',
    },
    negative: {
        color: '#FF3B30',
    },
    tradeDetails: {
        fontSize: 13,
        marginTop: 2,
        color: '#9CA3AF', // default fallback
    },

    sell: {
        color: '#34C759', // green
        fontWeight: '700',
    },

    buy: {
        color: '#FF3B30', // red
        fontWeight: '700',
    },

});
