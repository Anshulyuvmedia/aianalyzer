import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const RecentTrades = ({ data }) => {
    const trades = Array.isArray(data) ? data : [];

    // Simple relative time helper
    const getTimeAgo = (isoString) => {
        if (!isoString) return '—';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // We'll show — for % and exit until you have closed positions
    const mappedTrades = trades.map((trade) => ({
        pair: trade.symbol || '—',
        direction: trade.side?.toLowerCase() || '—',
        timeAgo: getTimeAgo(trade.time),
        // For real PnL % you need exit price / average entry + fees
        // Until then: show fee % or — (most apps hide or show 0%)
        percent: '—', // or calculate fee % if you want: ((trade.fee / trade.notional) * 100).toFixed(2)
        entry: trade.price?.toFixed(2) || '—',
        exit: '—', // change this when you have exit data
        isBuy: trade.side?.toLowerCase() === 'buy',
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="analytics-outline" size={24} color="#10b981" />
                        <Text style={styles.header}>Recent Trades</Text>
                    </View>

                    {mappedTrades.length === 0 ? (
                        <Text style={styles.emptyText}>No recent trades yet</Text>
                    ) : (
                        mappedTrades.map((trade, index) => (
                            <View key={index} style={styles.tradeItem}>
                                <View style={styles.tradeInfo}>
                                    <Text style={styles.pair}>{trade.pair}</Text>
                                    <Text
                                        style={[
                                            styles.tradeDetails,
                                            trade.isBuy ? styles.buy : styles.sell,
                                        ]}
                                    >
                                        {trade.direction.toUpperCase()} • {trade.timeAgo}
                                    </Text>
                                </View>

                                <View style={styles.priceContainer}>
                                    <Text
                                        style={[
                                            styles.change,
                                            trade.percent === '—'
                                                ? styles.neutral
                                                : trade.percent >= 0
                                                    ? styles.positive
                                                    : styles.negative,
                                        ]}
                                    >
                                        {trade.percent === '—' ? '—' : trade.percent >= 0 ? `+${trade.percent}%` : trade.percent}
                                    </Text>
                                    <Text style={styles.priceRange}>
                                        {trade.entry} → {trade.exit}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default RecentTrades;

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    container: {
        borderRadius: 8,
    },
    header: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginLeft: 8,
    },
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#131b2a',
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2D3748',
    },
    tradeInfo: {
        flex: 1,
    },
    pair: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    tradeDetails: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 4,
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceRange: {
        color: '#D1D5DB',
        fontSize: 14,
        marginTop: 4,
    },
    change: {
        fontSize: 15,
        fontWeight: '700',
    },
    positive: {
        color: '#10b981', // green
    },
    negative: {
        color: '#ef4444', // red
    },
    neutral: {
        color: '#9CA3AF',
    },
    buy: {
        color: '#10b981', // green for BUY
        fontWeight: '700',
    },
    sell: {
        color: '#ef4444', // red for SELL
        fontWeight: '700',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 15,
        textAlign: 'center',
        paddingVertical: 20,
    },
});