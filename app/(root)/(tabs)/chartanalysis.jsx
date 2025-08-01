import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import SelectTradingPairs from '@/components/SelectTradingPairs';
import OverallAnalysis from '@/components/OverallAnalysis';
import AIMarketInsights from '@/components/AIMarketInsights';

const ChartAnalysis = () => {
    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <SelectTradingPairs /> },
        { id: '2', component: <OverallAnalysis /> },
        { id: '3', component: <AIMarketInsights /> },

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
            <HomeHeader page="Home" title="Chart Analysis" subtitle="AI-powered chart pattern recognition and technical analysis" />

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

export default ChartAnalysis;

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