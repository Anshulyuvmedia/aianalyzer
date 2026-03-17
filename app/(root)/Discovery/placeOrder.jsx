// app/discovery/placeOrder.tsx
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstruments } from '@/context/InstrumentContext';
import { BrokerContext } from '@/context/BrokerContext';
import HomeHeader from '@/components/HomeHeader';
import RBSheet from "react-native-raw-bottom-sheet";

export default function PlaceOrder() {
    const { selectedInstrument, quoteData, symbolSpecs, placeOrder } = useInstruments();
    const { accountInfo, fetchPositions } = useContext(BrokerContext);
    // console.log('symbolSpecs', JSON.stringify(symbolSpecs, null, 2));
    const router = useRouter();
    const params = useLocalSearchParams();
    const confirmSheetRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    // Most robust pattern:
    const symbol = Array.isArray(params.symbol)
        ? params.symbol[0]               // take first value if array
        : params.symbol?.toString() ?? '';

    const transactionType = Array.isArray(params.transactionType)
        ? params.transactionType[0]
        : params.transactionType?.toString() ?? 'buy';   // fallback to 'buy'

    const initialSide = (transactionType === 'buy' || transactionType === 'sell')
        ? transactionType
        : 'buy';

    const [orderType, setOrderType] = useState('market');
    const [side, setSide] = useState(initialSide);
    const [lot, setLot] = useState('0.01');
    const [price, setPrice] = useState('');
    const spec = symbolSpecs?.[symbol] || {};
    const digits = spec?.digits ?? 5;
    // Safely get current price as number with fallback
    const ask = Number(quoteData?.ask);
    const bid = Number(quoteData?.bid);
    const spread = ask - bid;
    const currentPrice = side === "buy" ? (isNaN(ask) ? 0 : ask) : (isNaN(bid) ? 0 : bid);
    const instrumentName = selectedInstrument?.name || (spec?.description);
    useEffect(() => {
        if (orderType === 'limit' && !price && currentPrice > 0) {
            setPrice(currentPrice.toFixed(digits));
        }
    }, [orderType, currentPrice, price]);
    // Safe calculation with fallback
    const lotNum = Number(lot) || 0;
    const priceNum = orderType === 'limit' ? Number(price) || currentPrice : currentPrice;
    const contractSize = Number(spec?.contractSize ?? 1);
    const quantity = lotNum * contractSize;
    const estimatedValue = quantity * priceNum;
    // Account values
    const leverage = Number(accountInfo?.leverage || 100);
    const balance = Number(accountInfo?.balance || 0);
    const freeMargin = Number(accountInfo?.freeMargin || balance);
    const marginRequired = useMemo(() => {
        return (quantity * priceNum) / leverage;
    }, [quantity, priceNum, leverage]);

    const freeMarginAfterTrade = freeMargin - marginRequired;
    const isTradeAllowed =
        accountInfo?.tradeAllowed &&
        accountInfo?.synchronized &&
        lotNum > 0 &&
        priceNum > 0 &&
        freeMargin > 0 &&
        marginRequired <= freeMargin;
    const volumeStep = Number(spec.volumeStep || 0.01);
    const maxLot = Number(spec.maxVolume || 100);
    const stepPrecision = (volumeStep.toString().split('.')[1] || '').length;

    const normalizeLot = (value) => {
        const num = Number(value);
        if (isNaN(num)) return lot;

        const steps = Math.round(num / volumeStep);
        const normalized = steps * volumeStep;

        return normalized.toFixed(stepPrecision);
    };
    const increaseLot = () => {
        setLot((prev) => {
            const next = Number(prev) + volumeStep;
            return Math.min(maxLot, next).toFixed(2);
        });
    };

    const decreaseLot = () => {
        const minLot = Number(spec.minVolume || 0.01);
        setLot((prev) => Math.max(minLot, Number(prev) - volumeStep).toFixed(2));
    };
    const handleLotChange = (value) => {
        const cleaned = value.replace(',', '.');

        if (!/^\d*\.?\d*$/.test(cleaned)) return;

        setLot(normalizeLot(cleaned));
    };

    const handlePlaceOrder = () => {
        if (lotNum <= 0) return;
        if (orderType === 'limit' && priceNum <= 0) return;

        const minLot = Number(spec.minVolume || 0.01);
        const maxLot = Number(spec.maxVolume || 100);
        if (!accountInfo?.tradeAllowed) {
            Alert.alert(
                "Trading Disabled",
                "Trading is currently disabled for this account."
            );
            return;
        }

        if (lotNum > maxLot) {
            Alert.alert(
                "Invalid Volume",
                `Maximum lot size is ${maxLot}`
            );
            return;
        }
        if (lotNum < minLot) {
            Alert.alert(
                "Invalid Volume",
                `Minimum lot size is ${minLot}`
            );
            return;
        }

        if (!accountInfo?.synchronized) {
            Alert.alert(
                "Connection Issue",
                "Trading server is not synchronized. Please reconnect."
            );
            return;
        }
        confirmSheetRef.current?.open();
    };

    const submitOrder = async () => {
        if (marginRequired > freeMargin) {
            Alert.alert(
                "Insufficient Margin",
                "You don't have enough margin to place this trade."
            );
            return;
        }
        if (lotNum <= 0) {
            Alert.alert("Invalid Volume", "Volume must be greater than 0");
            return;
        }
        if (orderType === "limit" && !price) {
            Alert.alert("Invalid Price", "Limit order requires a price");
            return;
        }
        if (!accountInfo.tradeAllowed) {
            Alert.alert("Trading is disabled on this account.");
            return;
        }
        if (accountInfo.freeMargin <= 0) {
            Alert.alert("Insufficient margin. Please deposit funds.");
            return;
        }
        if (!symbol) {
            Alert.alert("Please select a trading instrument.");
            return;
        }
        if (!lot || lot <= 0) {
            Alert.alert("Enter a valid lot size.");
            return;
        }
        try {
            const payload = {
                symbol: symbol,
                side: side,
                orderType: orderType,
                volume: lotNum,
                price: orderType === 'limit' ? priceNum : null
            };
            if (submitting) return;
            setSubmitting(true);
            try {
                const result = await placeOrder(payload);
                if (!result?.success) {
                    throw new Error(result?.message || "Order rejected");
                }
                confirmSheetRef.current?.close();
                Alert.alert(
                    "Order Executed",
                    `${side.toUpperCase()} ${lotNum} ${symbol} successfully`
                );
                await fetchPositions();
                setTimeout(() => router.back(), 400);
            } catch (err) {
                Alert.alert(
                    "Order Failed",
                    err?.message || "Failed to place order"
                );
            } finally {
                setSubmitting(false);
            }
        } catch (err) {
            console.log("order failed", err);
            Alert.alert(
                "Order Failed",
                err?.response?.data?.error || "Failed to place order"
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <HomeHeader page="discovery" title='Place Order' subtitle={''} />
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.instrumentName}>{symbol}</Text>
                    <Text style={styles.instrumentSubtitle}>{instrumentName}</Text>
                </View>

                {/* Side Selector */}
                <View style={styles.sideSelector}>
                    <TouchableOpacity
                        style={[styles.sideButton, side === 'buy' && styles.sideButtonActiveBuy]}
                        onPress={() => setSide('buy')}
                    >
                        <Text style={[styles.sideButtonText, side === 'buy' && styles.sideButtonTextActive]}>
                            Buy | Long
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sideButton, side === 'sell' && styles.sideButtonActiveSell]}
                        onPress={() => setSide('sell')}
                    >
                        <Text style={[styles.sideButtonText, side === 'sell' && styles.sideButtonTextActive]}>
                            Sell | Short
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Order Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Order Type</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, orderType === 'market' && styles.typeButtonActive]}
                            onPress={() => setOrderType('market')}
                        >
                            <Text style={[styles.typeButtonText, orderType === 'market' && styles.typeButtonTextActive]}>
                                Market
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeButton, orderType === 'limit' && styles.typeButtonActive]}
                            onPress={() => setOrderType('limit')}
                        >
                            <Text style={[styles.typeButtonText, orderType === 'limit' && styles.typeButtonTextActive]}>
                                Limit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Lot Size */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Lot Size</Text>
                    <View style={styles.lotRow}>
                        <TouchableOpacity onPress={decreaseLot}>
                            <Text style={styles.lotButton}>-</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.lotInput}
                            value={lot}
                            onChangeText={handleLotChange}
                            keyboardType="decimal-pad"
                        />

                        <TouchableOpacity onPress={increaseLot}>
                            <Text style={styles.lotButton}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ color: "#8B949E", fontSize: 12, marginTop: 4 }}>
                        1 Lot = {contractSize} {symbol.replace("USD", "")}
                    </Text>
                    <Text style={{ color: "#8B949E", fontSize: 13, marginTop: 6 }}>
                        (Min {spec.minVolume || 0.01} | Max {spec.maxVolume || 100} | Step {spec.volumeStep || 0.01})
                    </Text>
                </View>

                {/* Limit Price */}
                {orderType === 'limit' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Limit Price</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="decimal-pad"
                            placeholder="Enter price"
                            placeholderTextColor="#666"
                        />
                    </View>
                )}

                {/* Estimated Value */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Account Balance</Text>
                        <Text style={styles.summaryValue}>
                            $ {balance.toFixed(digits)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Asset Quantity</Text>
                        <Text style={styles.summaryValue}>
                            {quantity.toFixed(4)} {symbol.replace("USD", "")}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Position Value</Text>
                        <Text style={styles.summaryValue}>
                            $ {estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Current Price</Text>
                        <Text style={styles.summaryValue}>
                            $ {currentPrice.toFixed(digits)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Margin Required</Text>
                        <Text style={styles.summaryValue}>
                            $ {marginRequired.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Used Margin</Text>
                        <Text style={styles.sheetValue}>
                            ${Number(accountInfo?.margin || 0).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Equity</Text>
                        <Text style={styles.sheetValue}>
                            ${Number(accountInfo?.equity || 0).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Credit</Text>
                        <Text style={styles.sheetValue}>
                            ${Number(accountInfo?.credit || 0).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Spread</Text>
                        <Text style={styles.summaryValue}>
                            {spread.toFixed(digits)}
                        </Text>
                    </View>

                </View>
            </ScrollView>

            {/* Fixed Bottom Action */}
            <View style={styles.bottomBar}>
                {marginRequired > freeMargin && (
                    <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 10 }}>
                        Insufficient margin to place this trade.
                    </Text>
                )}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        side === "buy" ? styles.confirmBuy : styles.confirmSell,
                        !isTradeAllowed && { opacity: 0.4 }
                    ]}
                    disabled={!isTradeAllowed}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.confirmButtonText}>
                        {side === "buy" ? 'Buy' : 'Sell'} {symbol}
                    </Text>
                </TouchableOpacity>
            </View>

            <RBSheet
                ref={confirmSheetRef}
                height={620}
                openDuration={250}
                customStyles={{
                    container: styles.sheetContainer
                }}
            >
                <View style={[
                    styles.sideIndicator,
                    side === "buy" ? styles.confirmBuy : styles.confirmSell
                ]} />
                <View style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>Confirm Order</Text>
                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Symbol</Text>
                        <Text style={styles.sheetValue}>{symbol}</Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Side</Text>
                        <Text style={[
                            styles.sheetValue,
                            side === "buy" ? styles.buyText : styles.sellText
                        ]}>
                            {side.toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Order Type</Text>
                        <Text style={styles.sheetValue}>{orderType}</Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Lot Size</Text>
                        <Text style={styles.sheetValue}>{lotNum}</Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Price</Text>
                        <Text style={styles.sheetValue}>{priceNum.toFixed(digits)}</Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Estimated</Text>
                        <Text style={styles.sheetValue}>
                            ${estimatedValue.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        </Text>
                    </View>
                    <View style={styles.sheetDivider} />

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Margin Required</Text>
                        <Text style={styles.sheetValue}>
                            ${marginRequired.toFixed(digits)}
                        </Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Leverage</Text>
                        <Text style={styles.sheetValue}>
                            1:{leverage}
                        </Text>
                    </View>

                    <View style={styles.sheetRow}>
                        <Text style={styles.sheetLabel}>Free Margin After Trade</Text>
                        <Text style={[
                            styles.sheetValue,
                            freeMarginAfterTrade < 0 && styles.marginWarning,
                            freeMarginAfterTrade < freeMargin * 0.2 && { color: '#F59E0B' }
                        ]}>
                            ${freeMarginAfterTrade.toFixed(digits)}
                        </Text>
                    </View>
                    <View style={styles.sheetButtons}>

                        <TouchableOpacity
                            style={styles.sheetCancelButton}
                            onPress={() => confirmSheetRef.current?.close()}
                        >
                            <Text style={styles.sheetCancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.sheetConfirmButton,
                                side === "buy" ? styles.confirmBuy : styles.confirmSell,
                                !isTradeAllowed && { opacity: 0.4 }
                            ]}
                            disabled={!isTradeAllowed || submitting}
                            onPress={submitOrder}
                        >
                            <Text style={styles.sheetConfirmText}>
                                {submitting ? "Placing Order..." : `Confirm ${side.toUpperCase()}`}
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </RBSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0E11',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 140,
    },
    header: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 10,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    instrumentName: {
        color: '#22C55E',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    instrumentSubtitle: {
        color: '#8B949E',
        fontSize: 15,
        marginTop: 4,
    },
    sideSelector: {
        flexDirection: 'row',
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 6,
        marginBottom: 5,
    },
    sideButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    sideButtonActiveBuy: {
        backgroundColor: '#22C55E',
    },
    sideButtonActiveSell: {
        backgroundColor: '#EF4444',
    },
    sideButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    sideButtonTextActive: {
        color: '#fff',
    },
    section: {
        marginBottom: 10,
    },
    sectionLabel: {
        color: '#8B949E',
        fontSize: 16,
        marginBottom: 12,
        fontWeight: '500',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 6,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#1E252E',
    },
    typeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#22C55E',
    },
    input: {
        backgroundColor: '#12161C',
        color: '#FFFFFF',
        fontSize: 18,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E252E',
    },
    summaryCard: {
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    summaryLabel: {
        color: '#8B949E',
        fontSize: 16,
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#0B0E11',
        borderTopWidth: 1,
        borderTopColor: '#1E252E',
    },
    confirmButton: {
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    confirmBuy: {
        backgroundColor: '#22C55E',
    },
    confirmSell: {
        backgroundColor: '#EF4444',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#8B949E',
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 18,
        marginBottom: 24,
    },
    sheetContainer: {
        backgroundColor: '#12161C',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20
    },
    sheetContent: {
        flex: 1
    },
    sheetTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center'
    },
    sheetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8
    },
    sheetLabel: {
        color: '#8B949E',
        fontSize: 15
    },
    sheetValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600'
    },
    buyText: {
        color: '#22C55E'
    },
    sellText: {
        color: '#EF4444'
    },
    sheetButtons: {
        flexDirection: 'row',
        marginTop: 28,
        gap: 12
    },
    sheetCancelButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#1E252E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A323C'
    },
    sheetCancelText: {
        color: '#8B949E',
        fontSize: 16,
        fontWeight: '600'
    },
    sheetConfirmButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sheetConfirmText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700'
    },
    sheetDivider: {
        height: 1,
        backgroundColor: '#1E252E',
        marginVertical: 12
    },
    marginWarning: {
        color: '#EF4444'
    },
    sideIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 14
    },
    lotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12161C',
        borderRadius: 16,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#1E252E'
    },

    lotButton: {
        fontSize: 26,
        color: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontWeight: '600'
    },

    lotInput: {
        flex: 1,
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 18,
        paddingVertical: 12
    },
});