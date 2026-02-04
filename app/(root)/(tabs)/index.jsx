import ActiveAlerts from '@/components/ActiveAlerts';
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import { useContext, useState, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { DashboardContext } from "@/context/DashboardContext";

const Index = () => {
  const { dashboardData, fetchDashboardData } = useContext(DashboardContext);
  const rawDashboard = dashboardData?.dashboardData;

  const overview = rawDashboard;
  const marketSentiment = rawDashboard?.marketSentiment;
  const recentTrades = rawDashboard?.recentTrades;
  // console.log("recentTrades", JSON.stringify(recentTrades, null, 3));
  const activeAlerts = rawDashboard?.alerts;



  const [refreshing, setRefreshing] = useState(false);

  const dynamicDashboardMetrics = useMemo(() => {
    if (!overview) return [];

    return [
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

    ];
  }, [overview]);
  const data = ['index', 'sentiment', 'trades'];

  const renderItem = ({ item }) => {
    switch (item) {
      case 'index':
        return <IndexCard data={{ dashboardMetrics: dynamicDashboardMetrics }} />;
      case 'sentiment':
        return <MarketSentiments data={marketSentiment} />;
      case 'trades':
        return <RecentTrades data={recentTrades} />;
      default:
        return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };


  return (
    <View style={styles.container}>
      <HomeHeader page={'home'} title={'Dashboard'} subtitle="Here's your trading overview for today." />
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.section}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
    paddingBottom: 40,
  },
});

export default Index;