// components/orders/DateRangeSelector.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DateRangeSelector = ({ selectedRange, onRangeChange }) => {
    const ranges = [
        { id: 'today', label: 'Today', icon: 'sunny-outline' },
        { id: 'yesterday', label: 'Yesterday', icon: 'calendar-outline' },
        { id: 'week', label: 'Last 7 Days', icon: 'calendar-outline' },
        { id: 'month', label: 'Last 30 Days', icon: 'calendar-outline' }
    ];

    const getRangeDisplayText = () => {
        switch (selectedRange) {
            case 'today': return 'Today';
            case 'yesterday': return 'Yesterday';
            case 'week': return 'Last 7 Days';
            case 'month': return 'Last 30 Days';
            default: return 'Select Range';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.rangeButtons}>
                {ranges.map((range) => (
                    <TouchableOpacity
                        key={range.id}
                        style={[
                            styles.rangeButton,
                            selectedRange === range.id && styles.rangeButtonActive
                        ]}
                        onPress={() => onRangeChange(range.id)}
                    >
                        <Ionicons
                            name={range.icon}
                            size={16}
                            color={selectedRange === range.id ? "#22c55e" : "#8B949E"}
                        />
                        <Text style={[
                            styles.rangeButtonText,
                            selectedRange === range.id && styles.rangeButtonTextActive
                        ]}>
                            {range.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={16} color="#8B949E" />
                <Text style={styles.dateInfoText}>Showing: {getRangeDisplayText()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#0D1117",
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
        padding: 12
    },
    rangeButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12
    },
    rangeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#161B22",
        borderWidth: 1,
        borderColor: "#1E252E"
    },
    rangeButtonActive: {
        backgroundColor: "#22c55e20",
        borderColor: "#22c55e"
    },
    rangeButtonText: {
        color: "#8B949E",
        fontSize: 12,
        fontWeight: "500"
    },
    rangeButtonTextActive: {
        color: "#22c55e"
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#1E252E"
    },
    dateInfoText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500"
    }
});