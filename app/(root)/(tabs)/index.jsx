import ActiveAlerts from '@/components/ActiveAlerts';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import { useContext, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ConnectionContext } from "../../context/ConnectionContext";

const Index = () => {
  const { dashboardData } = useContext(ConnectionContext);
  const rawDashboard = dashboardData?.dashboardData;

  const overview = rawDashboard;
  const marketSentiment = rawDashboard?.marketSentiment;
  const recentTrades = rawDashboard?.recentTrades;
  // console.log("recentTrades", JSON.stringify(recentTrades,null,3));
  const activeAlerts = rawDashboard?.alerts;



  const [refreshing, setRefreshing] = useState(false);

  const dynamicDashboardMetrics = overview ? [
    {
      id: "total-portfolio",
      label: "Total Portfolio",
      value: `$${overview.totalPortfolio.toLocaleString() || 10}`,
      change: "—",
      changeColor: "#9CA3AF",
      iconColor: '#4ade80',
      icon: "dollar",
    },
    {
      id: "win-rate",
      label: "Win Rate",
      value: `${overview.winRate || 25}%`,
      change: "—",
      changeColor: "#9CA3AF",
      iconColor: '#c084fc',
      icon: "target",
    },
    {
      id: "max-drawdown",
      label: "Max Drawdown",
      value: `${overview.maxDrawdown || 10}%`,
      change: "—",
      changeColor: "#9CA3AF",
      iconColor: '#facc15',
      icon: "alert-triangle",
    },
    {
      id: "active-strategies",
      label: "Active Strategies",
      value: `${overview.activeStrategies || 3}`,
      change: "—",
      changeColor: "#9CA3AF",
      iconColor: '#facc15',
      icon: "activity",
    }

  ] : [];



  const components = [
    { id: '1', component: <IndexCard data={{ dashboardMetrics: dynamicDashboardMetrics }} /> },
    { id: '2', component: <MarketSentiments data={marketSentiment} /> },
    { id: '3', component: <RecentTrades data={recentTrades} /> },
    // { id: '4', component: <ActiveAlerts data={{ activeAlerts }} /> },
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