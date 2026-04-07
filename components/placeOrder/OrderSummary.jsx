// components/placeOrder/OrderSummary.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

const SummaryRow = ({ label, value }) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
    </View>
);

export const OrderSummary = ({ 
    balance, 
    quantity, 
    symbol, 
    estimatedValue, 
    currentPrice, 
    marginRequired, 
    margin, 
    equity, 
    credit, 
    spread, 
    digits 
}) => (
    <View style={styles.summaryCard}>
        <SummaryRow label="Account Balance" value={`$ ${balance.toFixed(digits)}`} />
        <SummaryRow 
            label="Asset Quantity" 
            value={`${quantity.toFixed(4)} ${symbol.replace("USD", "")}`} 
        />
        <SummaryRow 
            label="Position Value" 
            value={`$ ${estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
        />
        <SummaryRow label="Current Price" value={`$ ${currentPrice.toFixed(digits)}`} />
        <SummaryRow label="Margin Required" value={`$ ${marginRequired.toFixed(2)}`} />
        <SummaryRow label="Used Margin" value={`$${Number(margin || 0).toFixed(2)}`} />
        <SummaryRow label="Equity" value={`$${Number(equity || 0).toFixed(2)}`} />
        <SummaryRow label="Credit" value={`$${Number(credit || 0).toFixed(2)}`} />
        <SummaryRow label="Spread" value={spread.toFixed(digits)} />
    </View>
);