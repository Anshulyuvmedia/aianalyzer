import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesome, Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';

const IndexCard = () => {
    const [data, setData] = useState({
        dashboardMetrics: [
            {
                id: "total-portfolio",
                label: "Total Portfolio",
                value: "$127,432.50",
                change: "+12.3%",
                changeColor: "#34C759",
                icon: "dollar",
                route: "/portfolio"
            },
            {
                id: "active-strategies",
                label: "Active Strategies",
                value: "8",
                change: "+2",
                changeColor: "#34C759",
                icon: "activity",
                route: "/strategies"
            },
            {
                id: "win-rate",
                label: "Win Rate",
                value: "73.2%",
                change: "+5.1%",
                changeColor: "#34C759",
                icon: "target",
                route: "/performance"
            },
            {
                id: "max-drawdown",
                label: "Max Drawdown",
                value: "4.8%",
                change: "-1.2%",
                changeColor: "#FF3B15",
                icon: "alert-triangle",
                route: "/risk"
            }
        ],
    });

    return (
        <View style={styles.container}>
            <View style={styles.cardGrid}>
                {data.dashboardMetrics.map((metric, index) => (
                    <View
                        key={metric.id}
                        style={styles.card}
                    >
                        <LinearGradient
                            colors={['#AEAED4', '#000', '#AEAED4']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.gradientBoxBorder}
                        >
                            <LinearGradient
                                colors={['#1e2836', '#111827', '#1e2836']}
                                start={{ x: 0.4, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.innerGradient}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        {metric.icon === "dollar" ? (
                                            <FontAwesome name={metric.icon} size={20} color="#1E90FF" />
                                        ) : (
                                            <Feather name={metric.icon} size={20} color="#1E90FF" />
                                        )}
                                        <Text style={[styles.cardChange, { color: metric.changeColor }]}>
                                            {metric.change}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardValue}>{metric.value}</Text>
                                    <Text style={styles.cardLabel}>{metric.label}</Text>
                                </View>
                            </LinearGradient>
                        </LinearGradient>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default IndexCard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    cardContent: {
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    cardChange: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 5,
    },
    cardLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '400',
    },
});