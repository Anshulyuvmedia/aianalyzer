import { useState, useEffect, useCallback, useContext } from 'react';
import { DashboardContext } from '@/context/DashboardContext';
import { AlgoTradingContext } from '@/context/AlgoTradingContext';
import api from '@/lib/axios';

function computeSharpeRatio(equityHistory) {
  if (!equityHistory || equityHistory.length < 10) return null;
  const returns = [];
  for (let i = 1; i < equityHistory.length; i++) {
    const prev = equityHistory[i - 1];
    if (prev > 0) {
      returns.push((equityHistory[i] - prev) / prev);
    }
  }
  if (returns.length < 5) return null;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avg) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;
  return Number(((avg / stdDev) * Math.sqrt(252)).toFixed(2));
}

function computeDailyVaR(equityHistory) {
  if (!equityHistory || equityHistory.length < 10) return null;
  const returns = [];
  for (let i = 1; i < equityHistory.length; i++) {
    const prev = equityHistory[i - 1];
    if (prev > 0) {
      returns.push((equityHistory[i] - prev) / prev);
    }
  }
  if (returns.length < 5) return null;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.max(0, Math.floor(sorted.length * 0.05));
  return Number((Math.abs(sorted[index]) * 100).toFixed(1));
}

function computeCalmarRatio(equityHistory, maxDrawdown) {
  if (!equityHistory || equityHistory.length < 20 || !maxDrawdown || maxDrawdown === 0) return null;
  const first = equityHistory[0];
  const last = equityHistory[equityHistory.length - 1];
  if (first <= 0) return null;
  const totalReturn = (last - first) / first;
  const years = equityHistory.length / 252;
  if (years <= 0) return null;
  const cagr = Math.pow(1 + totalReturn, 1 / years) - 1;
  return Number((cagr / (maxDrawdown / 100)).toFixed(2));
}

function aggregateMonthlyFromTrades(trades) {
  if (!trades || trades.length === 0) return [];
  const monthlyMap = {};
  trades.forEach(t => {
    if (!t.time) return;
    const date = new Date(t.time);
    const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { trades: 0, profit: 0, winningTrades: 0 };
    }
    monthlyMap[key].trades += 1;
    const profit = Number(t.profit) || 0;
    monthlyMap[key].profit += profit;
    if (profit > 0) monthlyMap[key].winningTrades += 1;
  });
  return Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    trades: data.trades,
    profit: data.profit,
    winRate: data.trades > 0 ? Number(((data.winningTrades / data.trades) * 100).toFixed(1)) : 0,
  })).sort((a, b) => {
    const da = new Date(a.month);
    const db = new Date(b.month);
    return db - da;
  });
}

export default function useReportData() {
  const { dashboardData, loadingDashboard, refreshDashboard } = useContext(DashboardContext);
  const { algotradingData, loadingAlgotrading, fetchAlgoTradingData } = useContext(AlgoTradingContext);
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformance = useCallback(async () => {
    try {
      setLoadingPerformance(true);
      const res = await api.get('/api/appdata/performance');
      if (res.data?.success) {
        setPerformanceData(res.data);
      }
    } catch (err) {
      console.log('Performance fetch failed:', err);
    } finally {
      setLoadingPerformance(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([
        refreshDashboard(),
        fetchAlgoTradingData(),
        fetchPerformance(),
      ]);
    } catch (err) {
      setError('Failed to refresh report data');
    }
  }, [refreshDashboard, fetchAlgoTradingData, fetchPerformance]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const loading = loadingDashboard || loadingAlgotrading || loadingPerformance;

  const totalTrades = algotradingData?.summary?.totalTrades || 0;
  const winRate = dashboardData?.winRate ?? algotradingData?.summary?.avgWinRate ?? 0;
  const maxDrawdown = dashboardData?.maxDrawdown ?? 0;
  const totalProfit = algotradingData?.summary?.totalPL ?? dashboardData?.totalPortfolio ?? 0;
  const avgWin = totalTrades > 0 && totalProfit ? Number((totalProfit / totalTrades).toFixed(2)) : 0;

  const equityCurve = (performanceData?.performance || []).map(p => ({
    timestamp: p.timestamp,
    value: p.value,
  }));

  const equityHistory = (performanceData?.performance || []).map(p => p.value);

  const monthlyPerformance = aggregateMonthlyFromTrades(dashboardData?.recentTrades || []);

  const strategyBreakdown = (algotradingData?.activeStrategies || []).map(s => ({
    name: s.name,
    trades: s.trades || 0,
    profit: s.pnl || 0,
    winRate: s.winRate || 0,
    status: s.status || 'Inactive',
  }));

  const sharpeRatio = computeSharpeRatio(equityHistory);
  const dailyVaR = computeDailyVaR(equityHistory);
  const calmarRatio = computeCalmarRatio(equityHistory, maxDrawdown);

  return {
    loading,
    error,
    refresh,
    performanceMetrics: { totalTrades, winRate, maxDrawdown, totalProfit, avgWin },
    equityCurve,
    monthlyPerformance,
    strategyBreakdown,
    riskMetrics: { sharpeRatio, dailyVaR, calmarRatio, maxDrawdown, winRate },
  };
}
