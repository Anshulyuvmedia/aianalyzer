import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import StrategyInput from '@/components/StrategyInput';
import AIGuidance from '@/components/AIGuidance';
import BacktestingResults from '@/components/BacktestingResults';

const BackTesting = () => {
    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <StrategyInput /> },
        { id: '2', component: <AIGuidance /> },
        { id: '3', component: <BacktestingResults /> },

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
            <HomeHeader page="home" title="Strategy Backtesting" subtitle="Test your trading strategies with historical data" />

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

export default BackTesting

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    section: {
        marginBottom: 10,
    },
})