// components/orders/OrderDetailsModal.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrderDetailsModal({ visible, onClose, order, formatPrice, isBuy }) {
    if (!order) return null;

    const formatDate = (date) => {
        if (!date) return '--';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            return d.toLocaleString();
        } catch {
            return '--';
        }
    };

    const getDisplayPrice = () => {
        const price = order?.openPrice || order?.price;
        if (!price || price === 0) return 'Market';
        return formatPrice(price, order?.symbol);
    };

    const getProfitColor = (profit) => {
        if (!profit && profit !== 0) return '#8B949E';
        return profit > 0 ? '#22c55e' : '#ef4444';
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                <View style={styles.modalContent}>
                    <View style={styles.detailedHeader}>
                        <Text style={styles.detailedTitle}>Order Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#8B949E" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dragIndicator}>
                        <View style={styles.dragIndicatorBar} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.detailedContent}>
                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Order ID</Text>
                            <Text style={styles.detailedValue}>{order?.positionId || order?.id || '--'}</Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Instrument</Text>
                            <Text style={styles.detailedValue}>{order?.symbol || 'Unknown'}</Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Direction</Text>
                            <View style={[styles.directionBadge, isBuy ? styles.buyBadgeDetailed : styles.sellBadgeDetailed]}>
                                <Text style={styles.directionText}>{isBuy ? "BUY" : "SELL"}</Text>
                            </View>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Amount</Text>
                            <Text style={styles.detailedValue}>{order?.volume || 0} Lot(s)</Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Open Price</Text>
                            <Text style={styles.detailedValue}>{getDisplayPrice()}</Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Close Price</Text>
                            <Text style={styles.detailedValue}>
                                {order?.closePrice ? formatPrice(order.closePrice, order.symbol) : '--'}
                            </Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Close Reason</Text>
                            <Text style={styles.detailedValue}>
                                {order?.closeReason || order?.reason?.replace("ORDER_REASON_", "") || '--'}
                            </Text>
                        </View>

                        {order?.profit !== undefined && order?.profit !== null && (
                            <View style={styles.detailedRow}>
                                <Text style={styles.detailedLabel}>Profit/Loss</Text>
                                <Text style={[styles.detailedValue, { color: getProfitColor(order.profit) }]}>
                                    {order.profit > 0 ? '+' : ''}${Math.abs(order.profit).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        {order?.swaps !== undefined && order?.swaps !== null && (
                            <View style={styles.detailedRow}>
                                <Text style={styles.detailedLabel}>Swaps</Text>
                                <Text style={[styles.detailedValue, { color: '#ef4444' }]}>
                                    -${Math.abs(order.swaps).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Take Profit/Stop Loss</Text>
                            <Text style={styles.detailedValue}>
                                {order?.takeProfit && order?.stopLoss ?
                                    `${formatPrice(order.takeProfit, order.symbol)} / ${formatPrice(order.stopLoss, order.symbol)}` :
                                    '-/-'}
                            </Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Time Opened</Text>
                            <Text style={styles.detailedValue}>{formatDate(order?.time)}</Text>
                        </View>

                        <View style={styles.detailedRow}>
                            <Text style={styles.detailedLabel}>Time Closed</Text>
                            <Text style={styles.detailedValue}>{formatDate(order?.closedAt || order?.doneTime)}</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: "#161B22",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.8,
        minHeight: SCREEN_HEIGHT * 0.5,
    },
    dragIndicator: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dragIndicatorBar: {
        width: 40,
        height: 4,
        backgroundColor: '#8B949E',
        borderRadius: 2,
    },
    detailedHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117",
    },
    detailedTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#0D1117",
        justifyContent: "center",
        alignItems: "center",
    },
    detailedContent: {
        padding: 20,
    },
    detailedRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117",
    },
    detailedLabel: {
        color: "#8B949E",
        fontSize: 14,
        fontWeight: "500",
    },
    detailedValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "right",
        flex: 1,
        marginLeft: 12,
    },
    directionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    buyBadgeDetailed: {
        backgroundColor: "#22c55e20",
    },
    sellBadgeDetailed: {
        backgroundColor: "#ef444420",
    },
    directionText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff",
    },
});