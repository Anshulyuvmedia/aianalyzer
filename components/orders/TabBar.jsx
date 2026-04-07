import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const TabBar = ({ tabs, activeTab, onTabChange }) => {
    return (
        <View style={styles.tabBar}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                    onPress={() => onTabChange(tab.key)}
                >
                    <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                        {tab.label} {tab.count !== undefined && `(${tab.count})`}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#0D1117",
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 4
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8
    },
    activeTab: {
        backgroundColor: "#161B22"
    },
    tabText: {
        color: "#8B949E",
        fontSize: 14,
        fontWeight: "500"
    },
    activeTabText: {
        color: "#22c55e"
    }
});