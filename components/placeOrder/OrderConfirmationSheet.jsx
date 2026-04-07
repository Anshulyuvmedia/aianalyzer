// components/placeOrder/OrderConfirmationSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import { styles } from './styles';

const ConfirmationRow = ({ label, value, valueStyle }) => (
    <View style={styles.sheetRow}>
        <Text style={styles.sheetLabel}>{label}</Text>
        <Text style={[styles.sheetValue, valueStyle]}>{value}</Text>
    </View>
);

export const OrderConfirmationSheet = React.forwardRef(({
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
    const riskReward = stopLoss && takeProfit 
        ? `1:${(Math.abs(Number(takeProfit) - priceNum) / Math.abs(Number(stopLoss) - priceNum)).toFixed(2)}`
        : null;

    return (
        <RBSheet
            ref={ref}
            height={enableTPSL ? 680 : 580}
            openDuration={250}
            customStyles={{ container: styles.sheetContainer }}
        >
            <View style={[styles.sideIndicator, side === "buy" ? styles.confirmBuy : styles.confirmSell]} />
            <View style={styles.sheetContent}>
                <Text style={styles.sheetTitle}>Confirm Order</Text>

                <ConfirmationRow label="Symbol" value={symbol} />
                <ConfirmationRow 
                    label="Side" 
                    value={side.toUpperCase()} 
                    valueStyle={side === "buy" ? styles.buyText : styles.sellText}
                />
                <ConfirmationRow label="Order Type" value={orderType} />
                <ConfirmationRow label="Lot Size" value={lotNum} />
                <ConfirmationRow label="Price" value={priceNum.toFixed(digits)} />

                {enableTPSL && (
                    <>
                        {stopLoss && (
                            <ConfirmationRow 
                                label="Stop Loss" 
                                value={`${Number(stopLoss).toFixed(digits)}${slDistanceInPips ? ` (${slDistanceInPips} pips)` : ''}`}
                                valueStyle={{ color: '#EF4444' }}
                            />
                        )}
                        {takeProfit && (
                            <ConfirmationRow 
                                label="Take Profit" 
                                value={`${Number(takeProfit).toFixed(digits)}${tpDistanceInPips ? ` (${tpDistanceInPips} pips)` : ''}`}
                                valueStyle={{ color: '#22C55E' }}
                            />
                        )}
                        {riskReward && (
                            <ConfirmationRow label="Risk/Reward" value={riskReward} />
                        )}
                    </>
                )}

                <ConfirmationRow 
                    label="Estimated Value" 
                    value={`$${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
                />

                <View style={styles.sheetDivider} />

                <ConfirmationRow label="Margin Required" value={`$${marginRequired.toFixed(digits)}`} />
                <ConfirmationRow label="Leverage" value={`1:${leverage}`} />
                <ConfirmationRow 
                    label="Free Margin After Trade" 
                    value={`$${freeMarginAfterTrade.toFixed(digits)}`}
                    valueStyle={freeMarginAfterTrade < 0 && styles.marginWarning}
                />

                <View style={styles.sheetButtons}>
                    <TouchableOpacity style={styles.sheetCancelButton} onPress={onClose}>
                        <Text style={styles.sheetCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sheetConfirmButton,
                            side === "buy" ? styles.confirmBuy : styles.confirmSell,
                            !isTradeAllowed && { opacity: 0.4 }
                        ]}
                        disabled={!isTradeAllowed || submitting}
                        onPress={onConfirm}
                    >
                        <Text style={styles.sheetConfirmText}>
                            {submitting ? "Placing Order..." : `Confirm ${side.toUpperCase()}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </RBSheet>
    );
});

OrderConfirmationSheet.displayName = 'OrderConfirmationSheet';