import CopyTradingPerformance from '@/components/CopyTradingPerformance';
import HomeHeader from '@/components/HomeHeader';
import RecentCopyTrades from '@/components/RecentCopyTrades';
import StrategyList from '@/components/StrategyList';
import IndexCard from '@/components/IndexCard';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

const CopyStrategy = () => {
    // console.log('copyStrategyData', strategies);
    const [data] = useState({
        dashboardMetrics: [
            {
                id: 'total-portfolio',
                label: 'Copy Trading P&L',
                // value: copystats?.copyTradingPnL,
                changeColor: '#34C759',
                iconColor: '#4ade80',
                icon: 'line-chart',
            },
            {
                id: 'active-strategies',
                label: 'Followed Traders',
                // value: copystats?.followedTraders,
                changeColor: '#34C759',
                iconColor: '#60a5fa',
                icon: 'users',
            },
            {
                id: 'win-rate',
                label: 'Success Rate',
                // value: copystats?.successRate,
                changeColor: '#34C759',
                iconColor: '#facc15',
                icon: 'trophy',
            },
            {
                id: 'max-drawdown',
                label: 'Copied Trades',
                // value: copystats?.copiedTrades,
                changeColor: '#FF3B15',
                iconColor: '#c084fc',
                icon: 'activity',
            },
        ],
    });

    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <IndexCard data={data} page="algo" /> },
        { id: '2', component: <StrategyList /> },
        // { id: '3', component: <RecentCopyTrades recentCopyTrades={recentCopyTrades} /> },
        { id: '4', component: <CopyTradingPerformance /> },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.section}>
            {item.component}
        </View>
    );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };
    return (
        <View style={styles.container}>
            <HomeHeader page="home" title="Copy Strategy" subtitle="Follow strategies for better results" />

            <FlatList
                data={components}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#34C759', '#FF3B15']}
                        progressBackgroundColor="#1e2836"
                    />
                }
            />
        </View>
    )
}

export default CopyStrategy;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    section: {
        marginBottom: 10,
    },
});