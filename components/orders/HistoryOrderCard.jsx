// components/orders/HistoryOrderCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoryOrderCard({ order, formatPrice }) {
    // Safely determine order type
    const isBuy = order.type?.includes("BUY") || order.side === 'buy';
    const isFilled = order.isFilled || order.state === 'ORDER_STATE_FILLED';
    const isCancelled = order.isCancelled || order.state === 'ORDER_STATE_CANCELED';

    const getOrderTypeLabel = (type) => {
        if (!type) return 'UNKNOWN';
        return type.replace("ORDER_TYPE_", "");
    };

    const getStatusColor = (state) => {
        const stateStr = String(state || '').toUpperCase();
        if (stateStr === 'ORDER_STATE_FILLED' || stateStr === 'FILLED') return '#22c55e';
        if (stateStr === 'ORDER_STATE_CANCELED' || stateStr === 'CANCELED') return '#ef4444';
        if (stateStr === 'ORDER_STATE_REJECTED' || stateStr === 'REJECTED') return '#ef4444';
        return '#8B949E';
    };

    const getStatusText = (state) => {
        const stateStr = String(state || '');
        if (stateStr.includes('FILLED')) return 'Filled';
        if (stateStr.includes('CANCELED')) return 'Cancelled';
        if (stateStr.includes('REJECTED')) return 'Rejected';
        return stateStr.replace("ORDER_STATE_", "") || 'Unknown';
    };

    const formatDate = (date) => {
        if (!date) return '--';
        try {
            return new Date(date).toLocaleString();
        } catch {
            return '--';
        }
    };

    // Get display price (handle both openPrice and price fields)
    const getDisplayPrice = () => {
        const price = order.openPrice || order.price;
        if (!price || price === 0) return 'Market';
        return formatPrice(price, order.symbol);
    };

    return (
        <View style={[styles.card, isFilled && styles.filledCard, isCancelled && styles.cancelledCard]}>
            <View style={styles.cardHeader}>
                <View style={styles.symbolContainer}>
                    <Text style={styles.symbol}>{order.symbol || 'Unknown'}</Text>
                    <View style={[styles.typeBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                        <Text style={styles.typeText}>{isBuy ? "BUY" : "SELL"}</Text>
                    </View>
                </View>
                <Text style={styles.volume}>{order.volume || 0} lots</Text>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>{getOrderTypeLabel(order.type)}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Price</Text>
                    <Text style={styles.detailValue}>{getDisplayPrice()}</Text>
                </View>

                {order.stopLoss && order.stopLoss !== 0 && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Stop Loss</Text>
                        <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                            {formatPrice(order.stopLoss, order.symbol)}
                        </Text>
                    </View>
                )}

                {order.takeProfit && order.takeProfit !== 0 && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Take Profit</Text>
                        <Text style={[styles.detailValue, { color: '#22c55e' }]}>
                            {formatPrice(order.takeProfit, order.symbol)}
                        </Text>
                    </View>
                )}

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(order.state) }]}>
                        {getStatusText(order.state)}
                    </Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(order.doneTime || order.time)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#161B22",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12
    },
    filledCard: {
        borderLeftWidth: 3,
        borderLeftColor: "#22c55e"
    },
    cancelledCard: {
        borderLeftWidth: 3,
        borderLeftColor: "#ef4444"
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117"
    },
    symbolContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    symbol: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700"
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    buyBadge: {
        backgroundColor: "#22c55e20"
    },
    sellBadge: {
        backgroundColor: "#ef444420"
    },
    typeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fff"
    },
    volume: {
        color: "#8B949E",
        fontSize: 12
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12
    },
    detailItem: {
        flex: 1,
        minWidth: "45%"
    },
    detailLabel: {
        color: "#8B949E",
        fontSize: 11,
        marginBottom: 4
    },
    detailValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500"
    }
});