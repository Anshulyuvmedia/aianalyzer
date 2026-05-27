import ActiveStrategies from '@/components/algoTradingComponents/ActiveStrategies';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import { useContext, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AlgoTradingContext } from "@/context/AlgoTradingContext";
import { formatCurrency } from '@/utils/numberFormatter';

const AlgoTrading = () => {
    const { algotradingData } = useContext(AlgoTradingContext);
    const summary = algotradingData?.summary;
    const [data, setData] = useState({
        dashboardMetrics: []
    });

    useEffect(() => {
        if (!summary) return;

        setData({
            dashboardMetrics: [
                {
                    id: 'total-pl',
                    label: 'Total P&L',
                    value: formatCurrency(summary?.totalPL),
                    changeColor: '#34C759',
                    iconColor: '#4ade80',
                    icon: 'dollar',
                },
                {
                    id: 'avg-win-rate',
                    label: 'Avg Win Rate',
                    value: summary?.avgWinRate ?? 0,
                    iconColor: '#60a5fa',
                    changeColor: '#34C759',
                    icon: 'line-chart',
                },
                {
                    id: 'total-trades',
                    label: 'Total Trades',
                    value: summary?.totalTrades ?? 0,
                    iconColor: '#facc15',
                    changeColor: '#34C759',
                    icon: 'activity',
                },
                {
                    id: 'active-strategies',
                    label: 'Following',
                    value: summary?.activeStrategies ?? 0,
                    iconColor: '#22c55e',
                    changeColor: '#34C759',
                    icon: 'play-circle',
                },
            ],
        });
    }, [summary]);

    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <IndexCard data={data} page="algo" /> },
        { id: '2', component: <ActiveStrategies /> },
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
                contentContainerStyle={styles.section}
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
        paddingHorizontal: 10,
    },
    section: {
        marginTop: 0,
    },
});

export default AlgoTrading;