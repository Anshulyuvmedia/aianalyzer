// app/discovery/placeOrder.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstruments } from '@/context/InstrumentContext';
import HomeHeader from '@/components/HomeHeader';

export default function PlaceOrder() {
    const router = useRouter();
    const params = useLocalSearchParams();
    // Most robust pattern:
    const symbol = Array.isArray(params.symbol)
        ? params.symbol[0]               // take first value if array
        : params.symbol?.toString() ?? '';

    const transactionType = Array.isArray(params.transactionType)
        ? params.transactionType[0]
        : params.transactionType?.toString() ?? 'buy';   // fallback to 'buy'
    const { selectedInstrument, quoteData } = useInstruments();

    const initialSide = (transactionType === 'buy' || transactionType === 'sell')
        ? transactionType
        : 'buy';

    const [orderType, setOrderType] = useState('market');
    const [side, setSide] = useState(initialSide);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');

    // Safely get current price as number with fallback
    const currentPrice = Number(quoteData?.close ?? quoteData?.price ?? 100);

    const instrumentName =
        selectedInstrument?.name ||
        (selectedInstrument?.currency_base && selectedInstrument?.currency_quote
            ? `${selectedInstrument.currency_base}/${selectedInstrument.currency_quote}`
            : symbol?.toString() || 'Instrument');

    useEffect(() => {
        if (orderType === 'limit' && !price && currentPrice > 0) {
            setPrice(currentPrice.toFixed(2));
        }
    }, [orderType, currentPrice, price]);

    // Safe calculation with fallback
    const qtyNum = Number(quantity) || 0;
    const priceNum = orderType === 'limit' ? Number(price) || currentPrice : currentPrice;
    const estimatedValue = qtyNum * priceNum;

    const isBuy = side === 'buy';

    const handlePlaceOrder = () => {
        if (qtyNum <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
            return;
        }

        if (orderType === 'limit' && priceNum <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid limit price.');
            return;
        }

        Alert.alert(
            'Confirm Order',
            `${isBuy ? 'Buy' : 'Sell'} ${qtyNum} of ${symbol}\n` +
            `Type: ${orderType === 'market' ? 'Market' : `Limit @ $${priceNum.toFixed(2)}`}\n` +
            `Estimated: $${estimatedValue.toFixed(2)}\n\n` +
            'This is a demo action. No real order will be placed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Alert.alert('Order Placed (Demo)', 'Your order has been simulated.');
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <HomeHeader
                    page="discovery"
                    title='Place Order'
                    subtitle={''}
                />
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
                            Buy
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sideButton, side === 'sell' && styles.sideButtonActiveSell]}
                        onPress={() => setSide('sell')}
                    >
                        <Text style={[styles.sideButtonText, side === 'sell' && styles.sideButtonTextActive]}>
                            Sell
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

                {/* Quantity */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Quantity</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        placeholder="Enter quantity"
                        placeholderTextColor="#666"
                        autoFocus
                    />
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
                        <Text style={styles.summaryLabel}>Estimated {isBuy ? 'Cost' : 'Proceeds'}</Text>
                        <Text style={styles.summaryValue}>
                            ${estimatedValue.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Current Price</Text>
                        <Text style={styles.summaryValue}>
                            ${currentPrice.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Action */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        isBuy ? styles.confirmBuy : styles.confirmSell,
                    ]}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.confirmButtonText}>
                        {isBuy ? 'Buy' : 'Sell'} {symbol}
                    </Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 28,
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
        marginBottom: 24,
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
        color: '#000000',
    },
    section: {
        marginBottom: 24,
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
        color: '#000000',
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
});