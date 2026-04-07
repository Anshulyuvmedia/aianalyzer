// components/placeOrder/LotSizeInput.jsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export const LotSizeInput = ({
    lot,
    onLotChange,
    onIncrease,
    onDecrease,
    contractSize,
    symbol,
    minLot,
    maxLot,
    volumeStep
}) => (
    <View style={styles.section}>
        <Text style={styles.sectionLabel}>Lot Size</Text>
        <View style={styles.lotRow}>
            <TouchableOpacity onPress={onDecrease} style={styles.lotAdjustButton}>
                <Text style={styles.lotButton}>−</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.lotInput}
                value={lot}
                onChangeText={onLotChange}
                keyboardType="decimal-pad"
            />

            <TouchableOpacity onPress={onIncrease} style={styles.lotAdjustButton}>
                <Text style={styles.lotButton}>+</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
            1 Lot = {contractSize} {symbol.replace("USD", "")}
        </Text>
        <Text style={styles.helperText}>
            (Min {minLot} | Max {maxLot} | Step {volumeStep})
        </Text>
    </View>
);