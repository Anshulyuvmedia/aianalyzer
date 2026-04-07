// components/placeOrder/SideSelector.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export const SideSelector = ({ side, onSideChange }) => (
    <View style={styles.sideSelector}>
        <TouchableOpacity
            style={[styles.sideButton, side === 'buy' && styles.sideButtonActiveBuy]}
            onPress={() => onSideChange('buy')}
        >
            <Text style={[styles.sideButtonText, side === 'buy' && styles.sideButtonTextActive]}>
                Buy | Long
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.sideButton, side === 'sell' && styles.sideButtonActiveSell]}
            onPress={() => onSideChange('sell')}
        >
            <Text style={[styles.sideButtonText, side === 'sell' && styles.sideButtonTextActive]}>
                Sell | Short
            </Text>
        </TouchableOpacity>
    </View>
);