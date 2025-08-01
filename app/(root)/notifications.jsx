import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, Octicons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';

const Notifications = () => {
    const notifications = [
        {
            id: '1',
            message: 'New Bullish pattern detected on BTC/USD (4H)',
            status: '✅',
            time: '06:45 PM IST, Aug 01, 2025',
        },
        {
            id: '2',
            message: 'High volatility alert for ETH/USD (1H)',
            status: '🟡',
            time: '06:30 PM IST, Aug 01, 2025',
        },
        {
            id: '3',
            message: 'Order Block confirmed on SOL/USD (15M)',
            status: '✅',
            time: '06:15 PM IST, Aug 01, 2025',
        },
        {
            id: '4',
            message: 'Bearish signal on MATIC/USD (30M)',
            status: '❌',
            time: '06:00 PM IST, Aug 01, 2025',
        },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page="Home" title="Notifications" />
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
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    />
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

// Helper function to determine status style
const getStatusStyle = (status) => {
    if (status === '✅') return styles.bullish;
    if (status === '❌') return styles.bearish;
    if (status === '🟡') return styles.neutral;
    return {};
};

export default Notifications;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,

    },
    content: {
        // padding: 15,
        paddingTop: 10,
    },
    gradientBoxBorder: {
        flex: 1,
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        flex: 1,
        borderRadius: 14,
        padding: 10,
    },
    notificationItem: {
        backgroundColor: '#1e293b',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3, // Enhanced shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageText: {
        color: '#d1d5db',
        fontSize: 15,
        flex: 1,
    },
    status: {
        fontSize: 14,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        textAlign: 'center',
    },
    timeText: {
        color: '#9ca3af',
        fontSize: 12,
        textAlign: 'right',
    },
    bullish: {
        backgroundColor: '#22c55e22',
        borderColor: '#22c55e',
        color: '#22c55e',
    },
    bearish: {
        backgroundColor: '#ef444422',
        borderColor: '#ef4444',
        color: '#ef4444',
    },
    neutral: {
        backgroundColor: '#f59e0b22',
        borderColor: '#f59e0b',
        color: '#f59e0b',
    },
});