import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EmptyState = ({ icon, title, message }) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color="#8B949E" />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8
    },
    message: {
        color: "#8B949E",
        fontSize: 14,
        textAlign: "center"
    }
});