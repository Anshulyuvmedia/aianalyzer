// components/placeOrder/OrderConfirmationSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RBSheet from 'react-native-raw-bottom-sheet';

const OrderConfirmationSheet = React.forwardRef(({
    side,
    symbol,
    orderType,
    lotNum,
    priceNum,
    digits,
    enableTPSL,
    stopLoss,
    takeProfit,
    slDistanceInPips,
    tpDistanceInPips,
    estimatedValue,
    marginRequired,
    leverage,
    freeMarginAfterTrade,
    freeMargin,
    isTradeAllowed,
    submitting,
    onConfirm,
    onClose
}, ref) => {
    const formatNumber = (num, decimals = 2) => {
        if (!num && num !== 0) return '--';
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    // ✅ FIXED: Properly handle price formatting
    const formatPrice = (price) => {
        if (price === undefined || price === null || price === '') return '--';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return '--';
        const decimalPlaces = digits || 2;
        return numPrice.toFixed(decimalPlaces);
    };

    return (
        <RBSheet
            ref={ref}
            closeOnDragDown={true}
            closeOnPressMask={true}
            height={550}
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
                },
            }}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Confirm Order</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#8B949E" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.orderTypeCard}>
                        <Text style={styles.orderTypeLabel}>
                            {orderType?.toUpperCase()} ORDER
                        </Text>
                        <View style={[styles.sideBadge, side === 'buy' ? styles.buyBadge : styles.sellBadge]}>
                            <Text style={styles.sideText}>{side?.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Symbol</Text>
                            <Text style={styles.detailValue}>{symbol}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Volume</Text>
                            <Text style={styles.detailValue}>{lotNum} lots</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Entry Price</Text>
                            <Text style={styles.detailValue}>
                                {orderType === 'market' ? 'Market' : formatPrice(priceNum)}
                            </Text>
                        </View>

                        {enableTPSL && (
                            <>
                                {stopLoss && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Stop Loss</Text>
                                        <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                                            {formatPrice(stopLoss)}
                                            {slDistanceInPips && ` (${slDistanceInPips} pips)`}
                                        </Text>
                                    </View>
                                )}
                                {takeProfit && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Take Profit</Text>
                                        <Text style={[styles.detailValue, { color: '#22c55e' }]}>
                                            {formatPrice(takeProfit)}
                                            {tpDistanceInPips && ` (${tpDistanceInPips} pips)`}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Estimated Value</Text>
                            <Text style={styles.detailValue}>${formatNumber(estimatedValue)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Margin Required</Text>
                            <Text style={styles.detailValue}>${formatNumber(marginRequired)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Leverage</Text>
                            <Text style={styles.detailValue}>1:{leverage}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Free Margin After Trade</Text>
                            <Text style={[
                                styles.detailValue,
                                freeMarginAfterTrade < 0 ? { color: '#ef4444' } : { color: '#22c55e' }
                            ]}>
                                ${formatNumber(freeMarginAfterTrade)}
                            </Text>
                        </View>
                    </View>

                    {freeMarginAfterTrade < 0 && (
                        <View style={styles.warningCard}>
                            <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                Insufficient margin! This trade would exceed your available margin.
                            </Text>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                side === 'buy' ? styles.confirmBuy : styles.confirmSell,
                                (!isTradeAllowed || freeMarginAfterTrade < 0 || submitting) && styles.disabledButton
                            ]}
                            onPress={onConfirm}
                            disabled={!isTradeAllowed || freeMarginAfterTrade < 0 || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    Confirm {side?.toUpperCase()}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </RBSheet>
    );
});

OrderConfirmationSheet.displayName = 'OrderConfirmationSheet';

export default OrderConfirmationSheet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161B22',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0D1117',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0D1117',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderTypeCard: {
        backgroundColor: '#0D1117',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderTypeLabel: {
        color: '#8B949E',
        fontSize: 14,
        fontWeight: '600',
    },
    sideBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    buyBadge: {
        backgroundColor: '#22c55e20',
    },
    sellBadge: {
        backgroundColor: '#ef444420',
    },
    sideText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#0D1117',
    },
    detailLabel: {
        color: '#8B949E',
        fontSize: 14,
        fontWeight: '500',
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#0D1117',
        marginVertical: 8,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F59E0B20',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    warningText: {
        flex: 1,
        color: '#F59E0B',
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#0D1117',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#8B949E',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBuy: {
        backgroundColor: '#22c55e',
    },
    confirmSell: {
        backgroundColor: '#ef4444',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.5,
    },
});