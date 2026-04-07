// components/placeOrder/LimitPriceInput.jsx
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

export const LimitPriceInput = ({ price, onPriceChange, digits }) => (
    <View style={styles.section}>
        <Text style={styles.sectionLabel}>Limit Price</Text>
        <TextInput
            style={styles.input}
            value={price}
            onChangeText={onPriceChange}
            keyboardType="decimal-pad"
            placeholder="Enter price"
            placeholderTextColor="#666"
        />
    </View>
);