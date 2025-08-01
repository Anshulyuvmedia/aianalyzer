import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';

const AIMarketInsights = () => {
    return (
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
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Feather name="trending-up" size={24} color="#60a5fa" />
                            <Text style={styles.header}>AI Market Insights</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Market Sentiment</Text>
                            <Text style={styles.detail}>
                                Overall bullish sentiment detected across major pairs. Strong momentum patterns emerging in BTC and SOL.
                            </Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>High Confidence Signals</Text>
                            <Text style={styles.detail}>
                                3 patterns showing 85%+ confidence. Bull Flag on SOL/USD presents strongest opportunity.
                            </Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Risk Assessment</Text>
                            <Text style={styles.detail}>
                                Moderate volatility detected. Consider position sizing and stop-loss placement carefully.
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default AIMarketInsights;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    section: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        color: '#60a5fa',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
    },
    detail: {
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
    },
});