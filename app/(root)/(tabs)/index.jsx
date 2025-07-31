import { StyleSheet, View, FlatList, Text, RefreshControl } from 'react-native';
import React, { useState } from 'react'
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import ActiveAlerts from '@/components/ActiveAlerts';

const Index = () => {
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState({
    dashboardMetrics: [
      {
        id: "total-portfolio",
        label: "Total Portfolio",
        value: "$127,432.50",
        change: "+12.3%",
        changeColor: "#34C759",
        iconColor: '#4ade80',
        icon: "dollar",
        // route: "/portfolio"
      },
      {
        id: "active-strategies",
        label: "Active Strategies",
        value: "8",
        change: "+2",
        changeColor: "#34C759",
        iconColor: '#60a5fa',
        icon: "activity",
        // route: "/strategies"
      },
      {
        id: "win-rate",
        label: "Win Rate",
        value: "73.2%",
        change: "+5.1%",
        changeColor: "#34C759",
        iconColor: '#c084fc',
        icon: "target",
        // route: "/performance"
      },
      {
        id: "max-drawdown",
        label: "Max Drawdown",
        value: "4.8%",
        change: "-1.2%",
        changeColor: "#FF3B15",
        iconColor: '#facc15',
        icon: "alert-triangle",
        // route: "/risk"
      }
    ],
  });

  const components = [
    { id: '1', component: <IndexCard data={data} /> },
    { id: '2', component: <MarketSentiments /> },
    { id: '3', component: <RecentTrades /> },
    { id: '4', component: <ActiveAlerts /> },
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
      <HomeHeader page={'home'} title={'Dashboard'} subtitle="Here's your trading overview for today." />
      <FlatList
        data={components}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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

export default Index;