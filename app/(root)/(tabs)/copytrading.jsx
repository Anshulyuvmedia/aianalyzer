import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import TopTraders from '@/components/TopTraders';
import RecentCopyTrades from '@/components/RecentCopyTrades';
import CopyTradingPerformance from '@/components/CopyTradingPerformance';

const CopyTrading = () => {
    const [data] = useState({
        dashboardMetrics: [
            {
                id: 'total-portfolio',
                label: 'Copy Trading P&L',
                value: '$2,847.90',
                changeColor: '#34C759',
                iconColor: '#4ade80',
                icon: 'line-chart',
            },
            {
                id: 'active-strategies',
                label: 'Followed Traders',
                value: '2',
                changeColor: '#34C759',
                iconColor: '#60a5fa',
                icon: 'users',
            },
            {
                id: 'win-rate',
                label: 'Success Rate',
                value: '81.5%',
                changeColor: '#34C759',
                iconColor: '#facc15',
                icon: 'trophy',
            },
            {
                id: 'max-drawdown',
                label: 'Copied Trades',
                value: '47',
                changeColor: '#FF3B15',
                iconColor: '#c084fc',
                icon: 'activity',
            },
        ],
    });

    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <IndexCard data={data} page="algo" /> },
        { id: '2', component: <TopTraders /> },
        { id: '3', component: <RecentCopyTrades /> },
        { id: '4', component: <CopyTradingPerformance /> },

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
            <HomeHeader page="home" title="Copy Trading" subtitle="Follow and copy trades from successful traders" />

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
    )
}

export default CopyTrading;

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