import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const PositionCard = ({
    position,
    currentPrice,
    pnl,
    pnlPercentage,
    isBuy,
    isSelected,
    selectionMode,
    onPress,
    onLongPress,
    onClose,
    formatPrice,
    formatVolume
}) => {
    const swipeableRef = useRef(null);

    const renderRightActions = (progress, dragX) => {
        return (
            <TouchableOpacity
                style={styles.closeAction}
                onPress={() => onClose(position)}
            >
                <Animated.View style={styles.closeActionContent}>
                    <Ionicons name="close-circle-outline" size={24} color="#fff" />
                    <Text style={styles.closeActionText}>Close</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
        >
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <View style={[
                    styles.card,
                    isSelected && styles.selectedCard,
                    pnl >= 0 ? styles.profitBorder : styles.lossBorder
                ]}>
                    {selectionMode && (
                        <View style={styles.checkboxContainer}>
                            <Ionicons
                                name={isSelected ? "checkbox" : "square-outline"}
                                size={24}
                                color={pnl >= 0 ? "#22c55e" : "#ef4444"}
                            />
                        </View>
                    )}

                    <View style={styles.cardHeader}>
                        <View style={styles.symbolContainer}>
                            <Ionicons
                                name="trending-up"
                                size={20}
                                color={isBuy ? "#22c55e" : "#ef4444"}
                            />
                            <Text style={styles.symbol}>{position.symbol}</Text>
                            <View style={[
                                styles.typeBadge,
                                isBuy ? styles.buyBadge : styles.sellBadge
                            ]}>
                                <Text style={styles.typeText}>
                                    {isBuy ? "BUY" : "SELL"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.volumeContainer}>
                            <Ionicons name="layers-outline" size={14} color="#8B949E" />
                            <Text style={styles.volumeText}>
                                {formatVolume(position.volume)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Open</Text>
                            <Text style={styles.priceValue}>
                                {formatPrice(position.openPrice, position.symbol)}
                            </Text>
                        </View>

                        <Ionicons name="arrow-forward" size={16} color="#8B949E" />

                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Current</Text>
                            <Text style={styles.priceValue}>
                                {formatPrice(currentPrice, position.symbol)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Points</Text>
                            <Text style={[
                                styles.statValue,
                                (currentPrice - position.openPrice) >= 0 ? styles.profitText : styles.lossText
                            ]}>
                                {((currentPrice - position.openPrice) / (position.pipSize || 0.0001)).toFixed(1)}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PnL</Text>
                            <Text style={[
                                styles.statValue,
                                styles.pnlValue,
                                pnl >= 0 ? styles.profitText : styles.lossText
                            ]}>
                                ${Math.abs(pnl).toFixed(2)}
                            </Text>
                            <Text style={[
                                styles.pnlPercentage,
                                pnl >= 0 ? styles.profitText : styles.lossText
                            ]}>
                                ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Swap</Text>
                            <Text style={[
                                styles.statValue,
                                (position.swap || 0) >= 0 ? styles.profitText : styles.lossText
                            ]}>
                                ${(position.swap || 0).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {position.realizedProfit !== 0 && (
                        <View style={styles.realizedContainer}>
                            <Text style={styles.realizedLabel}>Realized PnL:</Text>
                            <Text style={[
                                styles.realizedValue,
                                (position.realizedProfit || 0) >= 0 ? styles.profitText : styles.lossText
                            ]}>
                                ${(position.realizedProfit || 0).toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#161B22",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#0D1117"
    },
    selectedCard: {
        backgroundColor: "#1A2332",
        borderColor: "#22c55e"
    },
    profitBorder: {
        borderLeftWidth: 3,
        borderLeftColor: "#22c55e"
    },
    lossBorder: {
        borderLeftWidth: 3,
        borderLeftColor: "#ef4444"
    },
    checkboxContainer: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
    },
    symbolContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    symbol: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff"
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
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
    volumeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    volumeText: {
        color: "#8B949E",
        fontSize: 12
    },
    priceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#0D1117"
    },
    priceItem: {
        flex: 1,
        alignItems: "center"
    },
    priceLabel: {
        color: "#8B949E",
        fontSize: 11,
        marginBottom: 4
    },
    priceValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    statItem: {
        flex: 1,
        alignItems: "center"
    },
    statLabel: {
        color: "#8B949E",
        fontSize: 11,
        marginBottom: 4
    },
    statValue: {
        fontSize: 14,
        fontWeight: "600"
    },
    pnlValue: {
        fontSize: 16,
        fontWeight: "700"
    },
    pnlPercentage: {
        fontSize: 10,
        marginTop: 2
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: "#0D1117"
    },
    realizedContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#0D1117",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    realizedLabel: {
        color: "#8B949E",
        fontSize: 11
    },
    realizedValue: {
        fontSize: 12,
        fontWeight: "600"
    },
    profitText: {
        color: "#22c55e"
    },
    lossText: {
        color: "#ef4444"
    },
    closeAction: {
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "flex-end",
        marginBottom: 12,
        borderRadius: 12,
        width: 80,
        marginLeft: 8
    },
    closeActionContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: 80
    },
    closeActionText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4
    }
});