// components/orders/HistoryOrderCard.jsx
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HistoryOrderCard({ order, formatPrice }) {
    const refRBSheet = useRef(null);

    const isBuy = useMemo(() => {
        const side = order?.side || order?.type;
        return side?.toLowerCase().includes('buy');
    }, [order]);

    const isFilled = useMemo(() => {
        const state = order?.state || order?.status;
        return state?.includes('FILLED');
    }, [order]);

    const isCancelled = useMemo(() => {
        const state = order?.state || order?.status;
        return state?.includes('CANCELED') || state?.includes('REJECTED');
    }, [order]);

    const getOrderTypeLabel = useCallback((type) => {
        if (!type) return 'UNKNOWN';
        return type.replace("ORDER_TYPE_", "").replace("_", " ");
    }, []);

    const getStatusColor = useCallback((state) => {
        const stateStr = String(state || '')?.toUpperCase();
        if (stateStr.includes('FILLED')) return '#22c55e';
        if (stateStr.includes('CANCELED')) return '#ef4444';
        if (stateStr.includes('REJECTED')) return '#ef4444';
        return '#8B949E';
    }, []);

    const getStatusText = useCallback((state) => {
        const stateStr = String(state || '');
        if (stateStr.includes('FILLED')) return 'Filled';
        if (stateStr.includes('CANCELED')) return 'Cancelled';
        if (stateStr.includes('REJECTED')) return 'Rejected';
        return stateStr.replace("ORDER_STATE_", "") || 'Unknown';
    }, []);

    const formatDate = useCallback((date) => {
        if (!date) return '--';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--';
            return d.toLocaleString();
        } catch {
            return '--';
        }
    }, []);

    const getDisplayPrice = useCallback(() => {
        const price = order?.openPrice || order?.price;
        if (!price || price === 0) return 'Market';
        return formatPrice(price, order?.symbol);
    }, [order, formatPrice]);

    const getProfitColor = useCallback((profit) => {
        if (!profit && profit !== 0) return '#8B949E';
        return profit > 0 ? '#22c55e' : '#ef4444';
    }, []);

    const openSheet = () => {
        refRBSheet.current.open();
    };

    return (
        <>
            <TouchableOpacity onPress={openSheet} activeOpacity={0.7}>
                <View style={[
                    styles.card,
                    isFilled && styles.filledCard,
                    isCancelled && styles.cancelledCard
                ]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.symbolContainer}>
                            <Text style={styles.symbol}>{order?.symbol || 'Unknown'}</Text>
                            <View style={[styles.typeBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                                <Text style={styles.typeText}>{isBuy ? "BUY" : "SELL"}</Text>
                            </View>
                        </View>
                        <Text style={styles.volume}>{order?.volume || 0} lots</Text>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>{getOrderTypeLabel(order?.type)}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Price</Text>
                            <Text style={styles.detailValue}>{getDisplayPrice()}</Text>
                        </View>

                        {(order?.stopLoss && order.stopLoss !== 0) && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Stop Loss</Text>
                                <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                                    {formatPrice(order.stopLoss, order.symbol)}
                                </Text>
                            </View>
                        )}

                        {(order?.takeProfit && order.takeProfit !== 0) && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Take Profit</Text>
                                <Text style={[styles.detailValue, { color: '#22c55e' }]}>
                                    {formatPrice(order.takeProfit, order.symbol)}
                                </Text>
                            </View>
                        )}

                        {order?.profit !== undefined && order?.profit !== null && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>P&L</Text>
                                <Text style={[styles.detailValue, { color: getProfitColor(order.profit) }]}>
                                    {order.profit > 0 ? '+' : ''}{order.profit.toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={[styles.detailValue, { color: getStatusColor(order?.state) }]}>
                                {getStatusText(order?.state)}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>
                                {formatDate(order?.doneTime || order?.time || order?.closedAt)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                closeOnPressBack={true}
                height={SCREEN_HEIGHT * 0.75}
                openDuration={300}
                closeDuration={300}
                dragFromTopOnly={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                    container: {
                        backgroundColor: '#161B22',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    draggableIcon: {
                        backgroundColor: '#8B949E',
                        width: 40,
                        height: 4,
                        borderRadius: 2,
                    },
                }}
            >
                <View style={styles.sheetContainer}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Order Details</Text>
                        <TouchableOpacity onPress={() => refRBSheet.current?.close()} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#8B949E" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order ID</Text>
                            <Text style={styles.detailValue}>{order?.positionId || order?.id || '--'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Instrument</Text>
                            <Text style={styles.detailValue}>{order?.symbol || 'Unknown'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Direction</Text>
                            <View style={[styles.directionBadge, isBuy ? styles.buyBadgeDetailed : styles.sellBadgeDetailed]}>
                                <Text style={styles.directionText}>{isBuy ? "BUY" : "SELL"}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amount</Text>
                            <Text style={styles.detailValue}>{order?.volume || 0} Lot(s)</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order Type</Text>
                            <Text style={styles.detailValue}>{getOrderTypeLabel(order?.type)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Open Price</Text>
                            <Text style={styles.detailValue}>{getDisplayPrice()}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Close Price</Text>
                            <Text style={styles.detailValue}>
                                {order?.closePrice ? formatPrice(order.closePrice, order.symbol) : '--'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Close Reason</Text>
                            <Text style={styles.detailValue}>
                                {order?.closeReason || order?.reason?.replace("ORDER_REASON_", "") || '--'}
                            </Text>
                        </View>

                        {order?.profit !== undefined && order?.profit !== null && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Profit/Loss</Text>
                                <Text style={[styles.detailValue, { color: getProfitColor(order.profit) }]}>
                                    {order.profit > 0 ? '+' : ''}${Math.abs(order.profit).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        {order?.swaps !== undefined && order?.swaps !== null && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Swaps</Text>
                                <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                                    -${Math.abs(order.swaps).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Stop Loss/Take Profit</Text>
                            <Text style={styles.detailValue}>
                                {order?.stopLoss || order?.takeProfit ?
                                    `${order.stopLoss ? formatPrice(order.stopLoss, order.symbol) : '-'} / ${order.takeProfit ? formatPrice(order.takeProfit, order.symbol) : '-'}` :
                                    '-/-'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={[styles.detailValue, { color: getStatusColor(order?.state) }]}>
                                {getStatusText(order?.state)}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Time Opened</Text>
                            <Text style={styles.detailValue}>{formatDate(order?.time)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Time Closed</Text>
                            <Text style={styles.detailValue}>{formatDate(order?.closedAt || order?.doneTime)}</Text>
                        </View>
                    </ScrollView>
                </View>
            </RBSheet>
        </>
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
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: '#161B22',
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117",
    },
    sheetTitle: {
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117",
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