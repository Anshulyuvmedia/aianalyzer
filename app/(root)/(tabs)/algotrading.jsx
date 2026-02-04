import ActiveStrategies from '@/components/ActiveStrategies';
import AiTrading from '@/components/AiTrading';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import RecentTrades from '@/components/RecentTrades';
import { useContext, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AlgoTradingContext } from "@/context/AlgoTradingContext";

const AlgoTrading = () => {
    const { loadingDashboard, loadingAlgotrading, algotradingData } = useContext(AlgoTradingContext);

    const summary = algotradingData?.summary;
    const aitrading = algotradingData?.aiTrading;
    const activeStrategies = algotradingData?.activeStrategies;
    const recentTrades = algotradingData?.recentTrades;

    const [data, setData] = useState({
        dashboardMetrics: []
    });

    useEffect(() => {
        if (!summary) return;

        setData({
            dashboardMetrics: [
                {
                    id: 'total-portfolio',
                    label: 'Total P&L',
                    value: summary?.totalPL ?? 0,
                    changeColor: '#34C759',
                    iconColor: '#4ade80',
                    icon: 'dollar',
                },
                {
                    id: 'active-strategies',
                    label: 'Avg Win Rate',
                    value: summary?.avgWinRate ?? 0,
                    iconColor: '#60a5fa',
                    changeColor: '#34C759',
                    icon: 'line-chart',
                },
                {
                    id: 'win-rate',
                    label: 'Total Trades',
                    value: summary?.totalTrades ?? 0,
                    iconColor: '#facc15',
                    changeColor: '#34C759',
                    icon: 'activity',
                },
                {
                    id: 'max-drawdown',
                    label: 'Active Strategies',
                    value: summary?.activeStrategies ?? 0,
                    iconColor: '#c084fc',
                    changeColor: '#FF3B15',
                    icon: 'play',
                },
            ],
        });
    }, [summary]);

    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <IndexCard data={data} page="algo" /> },
        { id: '2', component: <AiTrading data={aitrading} /> },
        { id: '3', component: <ActiveStrategies data={activeStrategies} /> },
        { id: '4', component: <RecentTrades data={recentTrades} /> },
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
        marginTop: 10,
    },
});

export default AlgoTrading;