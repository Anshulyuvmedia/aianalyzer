import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const CopyTradingPerformance = () => {
    return (
        <View style={styles.container}>
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
                        <View className="flex-row">
                            <FontAwesome name="line-chart" size={20} color='#4ade80' />
                            <Text style={styles.headerText}>Copy Trading Performance</Text>
                        </View>

                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    )
}

export default CopyTradingPerformance

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBoxBorder: {
        borderRadius: 20,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    innerGradient: {
        borderRadius: 18,
        padding: 20,
    },
    cardContent: {
        minHeight: 200, // Ensure card has minimum height
    },
    headerText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 20,
        letterSpacing: 0.5,
        marginStart: 5,
    },
})