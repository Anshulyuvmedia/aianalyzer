// components/FlashTradeItem.jsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FlashTradeItem = ({ trade, isRecent }) => {
    const flashAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isRecent) {
            // Flash + subtle scale effect
            Animated.parallel([
                Animated.timing(flashAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: false,
                }),
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.015,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ]).start();
        }
    }, [isRecent]);

    const bgColor = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            '#1e2937',                    // Normal dark background
            trade?.pnl >= 0 ? '#14532d' : '#7f1d1d'   // Flash color (green/red)
        ],
    });

    const borderColor = trade?.pnl >= 0 ? '#22c55e' : '#ef4444';

    return (
        <Animated.View
            style={[
                styles.tradeItem,
                {
                    backgroundColor: bgColor,
                    transform: [{ scale: scaleAnim }],
                    borderLeftColor: borderColor,
                }
            ]}
        >
            {/* Left Side - Symbol & Details */}
            <View style={styles.leftContainer}>
                <View style={styles.symbolRow}>
                    <Text style={styles.symbol}>
                        {String(trade?.symbol || "—")}
                    </Text>

                    <View style={[
                        styles.directionBadge,
                        { backgroundColor: trade?.direction === "LONG" ? "#166534" : "#991b1b" }
                    ]}>
                        <Text style={styles.directionText}>
                            {trade?.direction || "—"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.timeAgo}>
                    {trade?.timeAgo || "—"}
                </Text>
            </View>

            {/* Right Side - PnL & Prices */}
            <View style={styles.rightContainer}>
                <Text style={[
                    styles.pnlAmount,
                    { color: trade?.pnl >= 0 ? '#22c55e' : '#ef4444' }
                ]}>
                    {trade?.pnl >= 0 ? '+' : ''}₹{Number(trade?.pnl || 0).toFixed(2)}
                </Text>

                <Text style={styles.priceRange}>
                    {Number(trade?.entryPrice || 0).toFixed(2)}
                    <Text style={styles.arrow}> → </Text>
                    {Number(trade?.exitPrice || 0).toFixed(2)}
                </Text>
            </View>
        </Animated.View>
    );
};

export default FlashTradeItem;

const styles = StyleSheet.create({
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e2937',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#334155',
        borderLeftWidth: 4,
    },
    leftContainer: {
        flex: 1,
    },
    symbolRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    symbol: {
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    directionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    directionText: {
        color: '#f1f5f9',
        fontSize: 11.5,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    timeAgo: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 5,
        fontWeight: '500',
    },
    rightContainer: {
        alignItems: 'flex-end',
    },
    pnlAmount: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    priceRange: {
        color: '#94a3b8',
        fontSize: 13.5,
        marginTop: 4,
        fontWeight: '500',
    },
    arrow: {
        color: '#475569',
        fontSize: 13,
    },
});