// app/(root)/components/orders/ModifyOrder/OrderInfoCard.jsx
import React from 'react';
import { View, Text } from 'react-native';

export const OrderInfoCard = ({ order, digits, styles }) => {
    // console.log('order', order);
    return (
        <View style={styles.orderInfoCard}>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Order Type:</Text>
                <Text style={styles.orderInfoValue}>
                    {order.side.toUpperCase()}
                </Text>
            </View>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Current Order:</Text>
                <Text style={styles.orderInfoValue}>
                    {order.volume} lots @ $ {order?.price?.toFixed(2)}
                </Text>
            </View>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Market Price:</Text>
                <Text style={styles.orderInfoValue}>
                    $ {order?.marketPrice?.toFixed(2)}
                </Text>
            </View>

            {order.stopLoss && (
                <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>SL:</Text>
                    <Text style={styles.orderInfoValue}>{order?.stopLoss.toFixed(digits)}</Text>
                </View>
            )}

            {order.takeProfit && (
                <View style={styles.orderInfoRow}>
                    <Text style={styles.orderInfoLabel}>TP:</Text>
                    <Text style={styles.orderInfoValue}>{order?.takeProfit.toFixed(digits)}</Text>
                </View>
            )}
        </View>
    );
};