// components/orders/PendingOrderCard/PendingOrderCardContent.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PendingOrderCardContent({
    order,
    isBuy,
    isLimit,
    isStop,
    isCancelling,
    isModifying,
    onModify,
    onCancel,
    formatPrice
}) {
    const getOrderTypeLabel = (type) => {
        if (!type) return 'UNKNOWN';
        return type.replace("ORDER_TYPE_", "");
    };

    const getStatusColor = (state) => {
        const stateStr = String(state || '')?.toUpperCase();
        if (stateStr === 'ORDER_STATE_PLACED') return '#3B82F6';
        if (stateStr === 'ORDER_STATE_PARTIAL') return '#F59E0B';
        return '#8B949E';
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
                    {isStop && (
                        <View style={styles.stopBadge}>
                            <Text style={styles.stopText}>STOP</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.volume}>{order.volume || 0} lots</Text>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>{getOrderTypeLabel(order.type)}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Entry Price</Text>
                    <Text style={styles.detailValue}>$ {order.openPrice}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(order.state) }]}>
                        {order.state?.replace("ORDER_STATE_", "") || 'PENDING'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Market Price</Text>
                    <Text style={[styles.detailValue, { color: 'lightgreen' }]}>
                        $ {order.currentPrice}
                    </Text>
                </View>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.modifyButton}
                    onPress={onModify}
                    disabled={isModifying}
                >
                    {isModifying ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                        <>
                            <Ionicons name="create-outline" size={18} color="#3B82F6" />
                            <Text style={styles.modifyButtonText}>Modify</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    disabled={isCancelling}
                >
                    {isCancelling ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <>
                            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </>
                    )}
                </TouchableOpacity>
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
    stopBadge: {
        backgroundColor: "#F59E0B20",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    stopText: {
        fontSize: 9,
        fontWeight: "600",
        color: "#F59E0B"
    },
    volume: {
        color: "#fff",
        fontSize: 14
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
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8
    },
    modifyButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#3B82F620"
    },
    modifyButtonText: {
        color: "#3B82F6",
        fontSize: 14,
        fontWeight: "600"
    },
    cancelButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#ef444420"
    },
    cancelButtonText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600"
    }
});