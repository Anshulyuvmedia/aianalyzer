// app/(root)/components/orders/ModifyOrder/SummaryCard.jsx
import React from 'react';
import { View, Text } from 'react-native';

export const SummaryCard = ({ quantity, priceNum, marginRequired, styles }) => {
    return (
        <View style={styles.orderInfoCard}>
            <Text style={styles.orderInfoValue}>Qty: {quantity}</Text>
            <Text style={styles.orderInfoValue}>Price: {priceNum}</Text>
            <Text style={styles.orderInfoValue}>
                Margin: {marginRequired.toFixed(2)}
            </Text>
        </View>
    );
};