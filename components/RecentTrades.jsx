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

    // Format price based on value (crypto needs more decimals)
    const formatPrice = (price) => {
        if (!price || price === '—') return '—';
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return '—';
        if (numPrice < 0.01) return numPrice.toFixed(6);
        if (numPrice < 1) return numPrice.toFixed(4);
        return numPrice.toFixed(2);
    };

    // Format P&L if available
    const formatPnL = (profit) => {
        if (!profit && profit !== 0) return null;
        const isPositive = profit >= 0;
        return {
            text: `${isPositive ? '+' : ''}$${Math.abs(profit).toFixed(2)}`,
            color: isPositive ? '#10b981' : '#ef4444'
        };
    };

    const mappedTrades = trades.map((trade) => {
        const pnl = formatPnL(trade.profit);
        return {
            id: trade.id,
            pair: trade.symbol || '—',
            direction: trade.side?.toLowerCase() || trade.type?.toLowerCase() || '—',
            timeAgo: getTimeAgo(trade.time || trade.doneTime),
            price: formatPrice(trade.price),
            size: trade.size || trade.volume,
            pnl: pnl,
            isBuy: trade.side?.toLowerCase() === 'buy' || trade.type?.toLowerCase()?.includes('buy'),
        };
    });

    // Show only last 5 trades for better UX
    const displayTrades = mappedTrades.slice(0, 5);

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
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="analytics-outline" size={24} color="#10b981" />
                            <Text style={styles.header}>Recent Trades</Text>
                        </View>
                        {trades.length > 5 && (
                            <Text style={styles.totalCount}>{trades.length} total</Text>
                        )}
                    </View>

                    {displayTrades.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color="#4b5563" />
                            <Text style={styles.emptyText}>No recent trades yet</Text>
                            <Text style={styles.emptySubText}>
                                Trades will appear here when you start trading
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Header Row */}
                            <View style={styles.listHeader}>
                                <Text style={[styles.listHeaderText, { flex: 2 }]}>Pair</Text>
                                <Text style={[styles.listHeaderText, { flex: 1.5, textAlign: 'right' }]}>Price</Text>
                                <Text style={[styles.listHeaderText, { flex: 1.5, textAlign: 'right' }]}>P&L</Text>
                            </View>

                            {displayTrades.map((trade, index) => (
                                <View key={trade.id || index} style={styles.tradeItem}>
                                    <View style={styles.tradeInfo}>
                                        <Text style={styles.pair}>{trade.pair}</Text>
                                        <Text
                                            style={[
                                                styles.tradeDetails,
                                                trade.isBuy ? styles.buy : styles.sell,
                                            ]}
                                        >
                                            {trade.direction?.toUpperCase()} • {trade.timeAgo}
                                        </Text>
                                        {trade.size && (
                                            <Text style={styles.sizeText}>
                                                Size: {trade.size}
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceText}>
                                            ${trade.price}
                                        </Text>
                                        {trade.pnl && (
                                            <Text
                                                style={[
                                                    styles.pnlText,
                                                    { color: trade.pnl.color }
                                                ]}
                                            >
                                                {trade.pnl.text}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </>
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginLeft: 8,
    },
    totalCount: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    listHeader: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3748',
    },
    listHeaderText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#131b2a',
        padding: 12,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2D3748',
    },
    tradeInfo: {
        flex: 2,
    },
    pair: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    tradeDetails: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },
    sizeText: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 2,
    },
    priceContainer: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    priceText: {
        color: '#D1D5DB',
        fontSize: 14,
        fontWeight: '600',
    },
    pnlText: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },
    buy: {
        color: '#10b981',
    },
    sell: {
        color: '#ef4444',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubText: {
        color: '#64748b',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
});