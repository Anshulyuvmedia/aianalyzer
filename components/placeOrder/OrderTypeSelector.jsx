// components/placeOrder/OrderTypeSelector.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export const OrderTypeSelector = ({ orderType, onOrderTypeChange }) => (
    <View style={styles.section}>
        <Text style={styles.sectionLabel}>Order Type</Text>
        <View style={styles.typeSelector}>
            <TouchableOpacity
                style={[styles.typeButton, orderType === 'market' && styles.typeButtonActive]}
                onPress={() => onOrderTypeChange('market')}
            >
                <Text style={[styles.typeButtonText, orderType === 'market' && styles.typeButtonTextActive]}>
                    Market
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.typeButton, orderType === 'limit' && styles.typeButtonActive]}
                onPress={() => onOrderTypeChange('limit')}
            >
                <Text style={[styles.typeButtonText, orderType === 'limit' && styles.typeButtonTextActive]}>
                    Limit
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);