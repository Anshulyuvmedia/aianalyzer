// components/orders/PendingOrderCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PendingOrderCard({ order, onCancel, isCancelling, formatPrice }) {
    const isBuy = order.type?.includes("BUY");
    const isLimit = order.type?.includes("LIMIT");

    const getOrderTypeLabel = (type) => {
        if (!type) return 'UNKNOWN';
        return type.replace("ORDER_TYPE_", "");
    };

    const getDisplayPrice = () => {
        const price = order.price;
        if (!price || price === 0) return 'Market';
        return formatPrice(price, order.symbol);
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.symbolContainer}>
                    <Text style={styles.symbol}>{order.symbol || 'Unknown'}</Text>
                    <View style={[styles.typeBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                        <Text style={styles.typeText}>{isBuy ? "BUY" : "SELL"}</Text>
                    </View>
                    {isLimit && (
                        <View style={styles.limitBadge}>
                            <Text style={styles.limitText}>LIMIT</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.volume}>{order.volume || 0} lots</Text>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Order Type</Text>
                    <Text style={styles.detailValue}>{getOrderTypeLabel(order.type)}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Price</Text>
                    <Text style={styles.detailValue}>{getDisplayPrice()}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={styles.detailValue}>{order.state?.replace("ORDER_STATE_", "") || 'PENDING'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => onCancel(order)}
                disabled={isCancelling}
            >
                {isCancelling ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                    <>
                        <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </>
                )}
            </TouchableOpacity>
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
        gap: 8,
        flexWrap: "wrap"
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
    limitBadge: {
        backgroundColor: "#3B82F620",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    limitText: {
        fontSize: 9,
        fontWeight: "600",
        color: "#3B82F6"
    },
    volume: {
        color: "#8B949E",
        fontSize: 12
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12
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
    },
    cancelButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#ef444420",
        marginTop: 8
    },
    cancelButtonText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600"
    }
});