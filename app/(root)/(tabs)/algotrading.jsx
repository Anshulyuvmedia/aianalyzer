import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import AiTrading from '@/components/AiTrading';
import ActiveStrategies from '@/components/ActiveStrategies';
import RecentTrades from '@/components/RecentTrades';

const AlgoTrading = () => {
    const [data] = useState({
        dashboardMetrics: [
            {
                id: 'total-portfolio',
                label: 'Total P&L',
                value: '$4,583.60',
                changeColor: '#34C759',
                iconColor: '#4ade80',
                icon: 'dollar',
            },
            {
                id: 'active-strategies',
                label: 'Avg Win Rate',
                value: '74.5%',
                iconColor: '#60a5fa',
                changeColor: '#34C759',
                icon: 'line-chart',
            },
            {
                id: 'win-rate',
                label: 'Total Trades',
                value: '172',
                iconColor: '#facc15',
                changeColor: '#34C759',
                icon: 'activity',
            },
            {
                id: 'max-drawdown',
                label: 'Active Strategies',
                value: '3',
                iconColor: '#c084fc',
                changeColor: '#FF3B15',
                icon: 'play',
            },
        ],
    });

    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <IndexCard data={data} page="algo" /> },
        { id: '2', component: <AiTrading /> },
        { id: '3', component: <ActiveStrategies /> },
        { id: '4', component: <RecentTrades /> },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.section}>
            {item.component}
        </View>
    );

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate a refresh action (e.g., fetching new data)
        setTimeout(() => {
            setRefreshing(false);
        }, 2000); // Replace with actual data fetching logic
    };

    return (
        <View style={styles.container}>
            <HomeHeader page="home" title="Algo Trading" subtitle="Manage and monitor your automated trading strategies" />

            <FlatList
                data={components}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#34C759', '#FF3B15']} // Custom colors for the refresh indicator
                        progressBackgroundColor="#1e2836" // Background color of the refresh circle
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    section: {
        marginBottom: 10,
    },
});

export default AlgoTrading;