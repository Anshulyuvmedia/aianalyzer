// app/(root)/(tabs)/index.jsx
import HomeHeader from '@/components/HomeHeader';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import { useContext, useState, useMemo, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { DashboardContext } from "@/context/DashboardContext";
import { BrokerContext } from "@/context/BrokerContext";

const Index = () => {
  const { dashboardData, loadingDashboard, refreshDashboard, isConnected: dashboardConnected } = useContext(DashboardContext);
  const {
    accountInfo,
    positions,
    isConnected: brokerConnected,
    refreshStatus,
    loading: brokerLoading,
    fetchPositions
  } = useContext(BrokerContext);

  const [refreshing, setRefreshing] = useState(false);

  // Calculate real-time metrics from positions
  const calculateMetricsFromPositions = useMemo(() => {
    if (!brokerConnected || !positions || positions.length === 0) {
      return null;
    }

    // Calculate total P&L
    let totalPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalNegativePnL = 0;
    let totalPositivePnL = 0;

    positions.forEach(pos => {
      const pnl = pos.pnl || 0;
      totalPnL += pnl;

      if (pnl > 0) {
        winningTrades++;
        totalPositivePnL += pnl;
      } else if (pnl < 0) {
        losingTrades++;
        totalNegativePnL += Math.abs(pnl);
      }
    });

    // Win Rate = winning trades / total trades
    const totalTrades = winningTrades + losingTrades;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Max Drawdown = max loss from peak equity
    // Using the largest single position loss or total negative P&L
    let maxDrawdown = 0;

    // Find largest individual position loss
    positions.forEach(pos => {
      const pnl = pos.pnl || 0;
      if (pnl < 0) {
        const drawdownPercent = Math.abs(pnl) / (accountInfo?.equity || 10000) * 100;
        if (drawdownPercent > maxDrawdown) {
          maxDrawdown = drawdownPercent;
        }
      }
    });

    // Also consider total negative P&L as drawdown from peak
    const totalDrawdownPercent = totalNegativePnL / (accountInfo?.equity || 10000) * 100;
    maxDrawdown = Math.max(maxDrawdown, totalDrawdownPercent);

    return {
      winRate,
      maxDrawdown,
      totalPnL,
      winningTrades,
      losingTrades,
      totalPositivePnL,
      totalNegativePnL
    };
  }, [positions, brokerConnected, accountInfo]);

  // Use real broker data if connected, otherwise use dashboard data
  const totalPortfolio = brokerConnected && accountInfo?.equity
    ? accountInfo.equity
    : dashboardData?.totalPortfolio || 0;

  const winRate = brokerConnected && calculateMetricsFromPositions
    ? calculateMetricsFromPositions.winRate
    : dashboardData?.winRate || 0;

  const maxDrawdown = brokerConnected && calculateMetricsFromPositions
    ? calculateMetricsFromPositions.maxDrawdown
    : dashboardData?.maxDrawdown || 0;

  const activeStrategies = brokerConnected && positions?.length
    ? positions.length
    : dashboardData?.activeStrategies || 0;

  const isLiveConnected = brokerConnected || dashboardConnected;

  // Log real-time metrics for debugging
  // useEffect(() => {
  //   if (brokerConnected && calculateMetricsFromPositions) {
  //     console.log('📊 Real-time Dashboard Metrics:');
  //     console.log(`  - Win Rate: ${calculateMetricsFromPositions.winRate.toFixed(1)}% (${calculateMetricsFromPositions.winningTrades}W / ${calculateMetricsFromPositions.losingTrades}L)`);
  //     console.log(`  - Max Drawdown: ${calculateMetricsFromPositions.maxDrawdown.toFixed(1)}%`);
  //     console.log(`  - Total P&L: $${calculateMetricsFromPositions.totalPnL.toFixed(2)}`);
  //   }
  // }, [brokerConnected, calculateMetricsFromPositions]);

  const dynamicDashboardMetrics = useMemo(() => [
    {
      id: "total-portfolio",
      label: "Total Portfolio",
      value: `$${totalPortfolio.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      change: isLiveConnected ? "Live" : "—",
      changeColor: isLiveConnected ? "#4ade80" : "#9CA3AF",
      iconColor: '#4ade80',
      icon: "dollar",
    },
    {
      id: "win-rate",
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: brokerConnected && calculateMetricsFromPositions?.winningTrades > 0
        ? `${calculateMetricsFromPositions.winningTrades}W / ${calculateMetricsFromPositions.losingTrades}L`
        : (isLiveConnected ? "Real-time" : "—"),
      changeColor: isLiveConnected ? "#4ade80" : "#9CA3AF",
      iconColor: '#c084fc',
      icon: "target",
    },
    {
      id: "max-drawdown",
      label: "Max Drawdown",
      value: `${maxDrawdown.toFixed(1)}%`,
      change: maxDrawdown > 0 ? "Active" : "—",
      changeColor: maxDrawdown > 10 ? "#ef4444" : (maxDrawdown > 5 ? "#facc15" : "#9CA3AF"),
      iconColor: '#facc15',
      icon: "alert-triangle",
    },
    {
      id: "active-strategies",
      label: "Active Positions",
      value: `${activeStrategies}`,
      change: isLiveConnected ? "Trading" : "—",
      changeColor: isLiveConnected ? "#4ade80" : "#9CA3AF",
      iconColor: '#60a5fa',
      icon: "activity",
    }
  ], [totalPortfolio, winRate, maxDrawdown, activeStrategies, isLiveConnected, brokerConnected, calculateMetricsFromPositions]);

  const data = ['index', 'sentiment', 'trades'];

  const renderItem = ({ item }) => {
    switch (item) {
      case 'index':
        return <IndexCard data={{ dashboardMetrics: dynamicDashboardMetrics }} />;
      case 'sentiment':
        return <MarketSentiments />;
      case 'trades':
        return <RecentTrades data={dashboardData?.recentTrades || []} />;
      default:
        return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshDashboard(),
        brokerConnected ? refreshStatus() : Promise.resolve(),
        brokerConnected ? fetchPositions() : Promise.resolve()
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <HomeHeader
        page={'home'}
        title={'Dashboard'}
        subtitle={"Here's your trading overview for today."}
      />

      {(brokerConnected || dashboardConnected) && (
        <View style={styles.connectionBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.connectionText}>
            {brokerConnected ? "Live Data" : "Cached Data"}
          </Text>
          {brokerConnected && (
            <View style={styles.positionCount}>
              <Text style={styles.positionCountText}>
                {positions?.length || 0} Active
              </Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.section}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loadingDashboard || brokerLoading}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={['#4ade80']}
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
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 5,
    gap: 8,
    marginInline: 'auto',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 2,
  },
  connectionText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  positionCount: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  positionCountText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default Index;