// components/orders/PendingOrderCard/ModifyOrderSheet.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModifyOrderSheet({
    order,
    isBuy,
    isLimit,
    isStop,
    onSubmit,
    onClose,
    isModifying,
    formatPrice,
    symbolSpecs
}) {
    // Initialize state with order values
    const [newPrice, setNewPrice] = useState('');
    const [newVolume, setNewVolume] = useState('');
    const [newStopLoss, setNewStopLoss] = useState('');
    const [newTakeProfit, setNewTakeProfit] = useState('');

    // Reset form when order changes
    useEffect(() => {
        if (order) {
            setNewPrice(order.price?.toString() || '');
            setNewVolume(order.volume?.toString() || '');
            setNewStopLoss(order.stopLoss?.toString() || '');
            setNewTakeProfit(order.takeProfit?.toString() || '');
        }
    }, [order]);

    const spec = symbolSpecs?.[order.symbol] || {};
    const digits = spec?.digits ??
        (order.symbol === 'GOLD' ? 2 :
            order.symbol === 'OILCash' ? 2 : 5);
    const volumeStep = spec?.volumeStep || 0.01;
    const minLot = spec?.minVolume || 0.01;
    const maxLot = spec?.maxVolume || 100;

    const getOrderTypeLabel = (type) => {
        if (!type) return 'UNKNOWN';
        return type.replace("ORDER_TYPE_", "").replace("_", " ");
    };

    const validateModifications = () => {
        const volume = parseFloat(newVolume);
        if (isNaN(volume) || volume < minLot) {
            alert(`Volume must be at least ${minLot} lots`);
            return false;
        }
        if (volume > maxLot) {
            alert(`Volume cannot exceed ${maxLot} lots`);
            return false;
        }

        if ((isLimit || isStop) && newPrice) {
            const price = parseFloat(newPrice);
            if (isNaN(price) || price <= 0) {
                alert(`Please enter a valid ${isLimit ? 'limit' : 'stop'} price`);
                return false;
            }
        }

        // Validate stop loss and take profit if provided
        if (newStopLoss) {
            const stopLoss = parseFloat(newStopLoss);
            if (isNaN(stopLoss) || stopLoss <= 0) {
                alert('Please enter a valid stop loss price');
                return false;
            }
            // Add logic to validate stop loss based on order type
            if (isBuy && stopLoss >= order.price) {
                alert('Stop loss for BUY order should be below entry price');
                return false;
            }
            if (!isBuy && stopLoss <= order.price) {
                alert('Stop loss for SELL order should be above entry price');
                return false;
            }
        }

        if (newTakeProfit) {
            const takeProfit = parseFloat(newTakeProfit);
            if (isNaN(takeProfit) || takeProfit <= 0) {
                alert('Please enter a valid take profit price');
                return false;
            }
            // Add logic to validate take profit based on order type
            if (isBuy && takeProfit <= order.price) {
                alert('Take profit for BUY order should be above entry price');
                return false;
            }
            if (!isBuy && takeProfit >= order.price) {
                alert('Take profit for SELL order should be below entry price');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateModifications()) return;

        const modifications = {};

        // Only include changed values
        if ((isLimit || isStop) && newPrice && parseFloat(newPrice) !== order.price) {
            modifications.price = parseFloat(newPrice);
        }

        if (newVolume && parseFloat(newVolume) !== order.volume) {
            modifications.volume = parseFloat(newVolume);
        }

        if (newStopLoss && parseFloat(newStopLoss) !== order.stopLoss) {
            modifications.stopLoss = parseFloat(newStopLoss);
        } else if (newStopLoss === '' && order.stopLoss) {
            // Allow removing stop loss
            modifications.stopLoss = null;
        }

        if (newTakeProfit && parseFloat(newTakeProfit) !== order.takeProfit) {
            modifications.takeProfit = parseFloat(newTakeProfit);
        } else if (newTakeProfit === '' && order.takeProfit) {
            // Allow removing take profit
            modifications.takeProfit = null;
        }

        if (Object.keys(modifications).length === 0) {
            alert('No changes to apply');
            return;
        }

        onSubmit(modifications);
    };

    const formatNumber = (value, decimals = digits) => {
        if (!value) return '';
        return parseFloat(value).toFixed(decimals);
    };

    return (
        <View style={styles.sheetContainer}>
            <View style={styles.dragIndicator}>
                <View style={styles.dragIndicatorBar} />
            </View>

            <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Modify Order</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#8B949E" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.orderInfoCard}>
                    <Text style={styles.orderInfoSymbol}>{order.symbol}</Text>
                    <View style={styles.orderInfoBadges}>
                        <View style={[styles.badge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                            <Text style={styles.badgeText}>{isBuy ? "BUY" : "SELL"}</Text>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{getOrderTypeLabel(order.type)}</Text>
                        </View>
                    </View>
                </View>

                {(isLimit || isStop) && (
                    <View style={styles.modifySection}>
                        <Text style={styles.sectionTitle}>
                            {isLimit ? 'Limit Price' : 'Stop Price'}
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Current: {formatPrice(order.price, order.symbol)}
                        </Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.input}
                                value={newPrice}
                                onChangeText={setNewPrice}
                                keyboardType="decimal-pad"
                                placeholder={`Enter new ${isLimit ? 'limit' : 'stop'} price`}
                                placeholderTextColor="#6B7280"
                                editable={!isModifying}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.modifySection}>
                    <Text style={styles.sectionTitle}>Volume (Lots)</Text>
                    <Text style={styles.sectionSubtitle}>
                        Current: {order.volume} lots | Min: {minLot} | Max: {maxLot}
                    </Text>
                    <View style={styles.volumeControls}>
                        <TouchableOpacity
                            style={styles.volumeButton}
                            onPress={() => {
                                const current = parseFloat(newVolume);
                                if (!isNaN(current) && current > minLot) {
                                    const newVal = Math.max(minLot, current - volumeStep);
                                    setNewVolume(formatNumber(newVal, 2));
                                } else if (isNaN(current)) {
                                    setNewVolume(minLot.toString());
                                }
                            }}
                            disabled={isModifying}
                        >
                            <Ionicons name="remove" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, styles.volumeInput]}
                            value={newVolume}
                            onChangeText={setNewVolume}
                            keyboardType="decimal-pad"
                            placeholder="Volume"
                            placeholderTextColor="#6B7280"
                            editable={!isModifying}
                        />
                        <TouchableOpacity
                            style={styles.volumeButton}
                            onPress={() => {
                                const current = parseFloat(newVolume);
                                if (!isNaN(current) && current < maxLot) {
                                    const newVal = Math.min(maxLot, current + volumeStep);
                                    setNewVolume(formatNumber(newVal, 2));
                                } else if (isNaN(current)) {
                                    setNewVolume(minLot.toString());
                                }
                            }}
                            disabled={isModifying}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.modifySection}>
                    <Text style={styles.sectionTitle}>Stop Loss (Optional)</Text>
                    <Text style={styles.sectionSubtitle}>
                        {order.stopLoss ? `Current: ${formatPrice(order.stopLoss, order.symbol)}` : 'No stop loss set'}
                    </Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.input}
                            value={newStopLoss}
                            onChangeText={setNewStopLoss}
                            keyboardType="decimal-pad"
                            placeholder="Enter stop loss price (leave empty to remove)"
                            placeholderTextColor="#6B7280"
                            editable={!isModifying}
                        />
                    </View>
                </View>

                <View style={styles.modifySection}>
                    <Text style={styles.sectionTitle}>Take Profit (Optional)</Text>
                    <Text style={styles.sectionSubtitle}>
                        {order.takeProfit ? `Current: ${formatPrice(order.takeProfit, order.symbol)}` : 'No take profit set'}
                    </Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.input}
                            value={newTakeProfit}
                            onChangeText={setNewTakeProfit}
                            keyboardType="decimal-pad"
                            placeholder="Enter take profit price (leave empty to remove)"
                            placeholderTextColor="#6B7280"
                            editable={!isModifying}
                        />
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelModifyButton}
                        onPress={onClose}
                        disabled={isModifying}
                    >
                        <Text style={styles.cancelModifyText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.confirmModifyButton}
                        onPress={handleSubmit}
                        disabled={isModifying}
                    >
                        {isModifying ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.confirmModifyText}>Confirm Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        backgroundColor: "#161B22",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#0D1117"
    },
    sheetTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700"
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#0D1117",
        justifyContent: "center",
        alignItems: "center"
    },
    dragIndicator: {
        alignItems: 'center',
        marginBottom: 10,
    },
    dragIndicatorBar: {
        width: 40,
        height: 4,
        backgroundColor: '#8B949E',
        borderRadius: 2,
    },
    orderInfoCard: {
        backgroundColor: "#0D1117",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: "center"
    },
    orderInfoSymbol: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8
    },
    orderInfoBadges: {
        flexDirection: "row",
        gap: 8
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6
    },
    buyBadge: {
        backgroundColor: "#22c55e20"
    },
    sellBadge: {
        backgroundColor: "#ef444420"
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff"
    },
    typeBadge: {
        backgroundColor: "#3B82F620",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#3B82F6"
    },
    modifySection: {
        marginBottom: 24
    },
    sectionTitle: {
        color: "#8B949E",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4
    },
    sectionSubtitle: {
        color: "#6B7280",
        fontSize: 12,
        marginBottom: 12
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0D1117",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#30363D",
        paddingHorizontal: 12
    },
    currencySymbol: {
        color: "#8B949E",
        fontSize: 16,
        marginRight: 8
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        paddingVertical: 12
    },
    volumeControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    volumeButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#0D1117",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#30363D"
    },
    volumeInput: {
        flex: 1,
        textAlign: "center"
    },
    currentValue: {
        color: "#8B949E",
        fontSize: 12,
        marginTop: 4
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        marginBottom: 40
    },
    cancelModifyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#0D1117",
        alignItems: "center"
    },
    cancelModifyText: {
        color: "#8B949E",
        fontSize: 16,
        fontWeight: "600"
    },
    confirmModifyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#3B82F6",
        alignItems: "center"
    },
    confirmModifyText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});