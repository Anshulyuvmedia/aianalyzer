import ActiveAlerts from '@/components/ActiveAlerts';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import { useContext, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ConnectionContext } from "../../context/ConnectionContext";

const Index = () => {
  const { dashboardData, loadingDashboard } = useContext(ConnectionContext);
  const overview = dashboardData?.overview;
  const marketSentiment = dashboardData?.marketSentiment;
  const recentTrades = dashboardData?.recentTrades;
  const activeAlerts = dashboardData?.alerts;


  const [refreshing, setRefreshing] = useState(false);

  const dynamicDashboardMetrics = overview ? [
    {
      id: "total-portfolio",
      label: "Total Portfolio",
      value: `$${overview.portfolioValue?.toLocaleString()}`,
      change: `${overview.portfolioChange > 0 ? "+" : ""}${overview.portfolioChange}%`,
      changeColor: overview.portfolioChange > 0 ? "#34C759" : "#FF3B15",
      iconColor: '#4ade80',
      icon: "dollar",
    },
    {
      id: "active-strategies",
      label: "Active Strategies",
      value: overview.activeStrategies,
      change: `${overview.strategiesChange > 0 ? "+" : ""}${overview.strategiesChange}`,
      changeColor: overview.strategiesChange > 0 ? "#34C759" : "#FF3B15",
      iconColor: '#60a5fa',
      icon: "activity",
    },
    {
      id: "win-rate",
      label: "Win Rate",
      value: `${overview.winRate}%`,
      change: `${overview.winRateChange > 0 ? "+" : ""}${overview.winRateChange}%`,
      changeColor: overview.winRateChange > 0 ? "#34C759" : "#FF3B15",
      iconColor: '#c084fc',
      icon: "target",
    },
    {
      id: "max-drawdown",
      label: "Max Drawdown",
      value: `${overview.maxDrawdown}%`,
      change: `${overview.drawdownChange > 0 ? "+" : ""}${overview.drawdownChange}%`,
      changeColor: overview.drawdownChange > 0 ? "#34C759" : "#FF3B15",
      iconColor: '#facc15',
      icon: "alert-triangle",
    }
  ] : [];


  const components = [
    { id: '1', component: <IndexCard data={{ dashboardMetrics: dynamicDashboardMetrics }} /> },
    { id: '2', component: <MarketSentiments data={{ marketSentiment }} /> },
    { id: '3', component: <RecentTrades data={{recentTrades}} /> },
    { id: '4', component: <ActiveAlerts data={{activeAlerts}} /> },
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