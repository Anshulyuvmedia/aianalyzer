import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SummaryCards = ({ totalPnl, totalProfit, totalLoss, totalVolume }) => {
    const cards = [
        {
            label: 'Total PnL',
            value: `$${totalPnl.toFixed(2)}`,
            color: totalPnl >= 0 ? '#22c55e' : '#ef4444',
            icon: 'trending-up'
        },
        {
            label: 'Profit',
            value: `$${totalProfit.toFixed(2)}`,
            color: '#22c55e',
            icon: 'arrow-up-circle'
        },
        {
            label: 'Loss',
            value: `$${totalLoss.toFixed(2)}`,
            color: '#ef4444',
            icon: 'arrow-down-circle'
        },
        {
            label: 'Volume',
            value: totalVolume.toFixed(2),
            color: '#8B949E',
            icon: 'layers'
        }
    ];

    return (
        <View style={styles.container}>
            {cards.map((card, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name={card.icon} size={16} color={card.color} />
                        <Text style={styles.label}>{card.label}</Text>
                    </View>
                    <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    card: {
        flex: 1,
        minWidth: '35%',
        backgroundColor: '#161B22',
        borderRadius: 12,
        padding: 12
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8
    },
    label: {
        color: '#8B949E',
        fontSize: 12
    },
    value: {
        fontSize: 18,
        fontWeight: '700'
    }
});