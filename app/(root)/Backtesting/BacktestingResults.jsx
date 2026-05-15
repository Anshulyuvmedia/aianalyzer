// app/(root)/Backtesting/BacktestingResults.jsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Share, Platform, Alert, Dimensions, Modal, RefreshControl } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useBacktesting } from '../../../context/BacktestingContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BacktestingResults = () => {
    const { backtestResults, loading, error, resetForm, formData } = useBacktesting();
    const [exporting, setExporting] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Re-fetch results logic here
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const formatCurrency = (value) => {
        if (!value) return '$0';
        const num = typeof value === 'string' ? parseFloat(value.replace('$', '')) : value;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatPercentage = (value) => {
        if (!value) return '0%';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `${num.toFixed(2)}%`;
    };

    const handleExportPDF = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExporting(true);
        try {
            // Generate report content
            const reportContent = generateReportContent();

            if (Platform.OS === 'web') {
                // Web download
                const blob = new Blob([reportContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backtest_report_${Date.now()}.html`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                // Mobile share
                const fileUri = FileSystem.documentDirectory + `backtest_report_${Date.now()}.html`;
                await FileSystem.writeAsStringAsync(fileUri, reportContent);
                // await Sharing.shareAsync(fileUri, {
                //     mimeType: 'text/html',
                //     dialogTitle: 'Export Backtest Report',
                // });
            }

            Alert.alert('Success', 'Report exported successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const handleExportCSV = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExporting(true);
        try {
            const csvContent = generateCSVContent();

            if (Platform.OS === 'web') {
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backtest_trades_${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                const fileUri = FileSystem.documentDirectory + `backtest_trades_${Date.now()}.csv`;
                await FileSystem.writeAsStringAsync(fileUri, csvContent);
                // await Sharing.shareAsync(fileUri, {
                //     mimeType: 'text/csv',
                //     dialogTitle: 'Export Trade Data',
                // });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    const handleShareResults = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const shareMessage = generateShareMessage();
            await Share.share({
                message: shareMessage,
                title: 'My Backtest Results',
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const generateReportContent = () => {
        const metrics = backtestResults?.metrics || {};
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Backtest Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #0a0a0a; color: #fff; }
                    .container { max-width: 1200px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
                    .metric-card { background: #1a1a2e; padding: 20px; border-radius: 12px; }
                    .metric-value { font-size: 28px; font-weight: bold; }
                    .metric-label { color: #888; margin-top: 8px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
                    th { background: #1a1a2e; }
                    .positive { color: #22c55e; }
                    .negative { color: #ef4444; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Backtest Report</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                        <p>Symbol: ${formData?.symbol || 'N/A'} | Timeframe: ${formData?.timeframe || 'N/A'}</p>
                    </div>
                    
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value ${metrics.winRate > 50 ? 'positive' : 'negative'}">${metrics.winRate || 0}%</div>
                            <div class="metric-label">Win Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${metrics.profitFactor || 0}</div>
                            <div class="metric-label">Profit Factor</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value negative">${metrics.maxDrawdown || 0}%</div>
                            <div class="metric-label">Max Drawdown</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${metrics.totalTrades || 0}</div>
                            <div class="metric-label">Total Trades</div>
                        </div>
                    </div>
                    
                    ${backtestResults?.trades?.length > 0 ? `
                    <h2>Trade Details</h2>
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Type</th><th>Entry</th><th>Exit</th><th>P&L</th></tr>
                        </thead>
                        <tbody>
                            ${backtestResults.trades.map(trade => `
                                <tr>
                                    <td>${trade.date}</td>
                                    <td>${trade.type}</td>
                                    <td>${trade.entry}</td>
                                    <td>${trade.exit}</td>
                                    <td class="${trade.pnl?.startsWith('-') ? 'negative' : 'positive'}">${trade.pnl}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : ''}
                </div>
            </body>
        </html>`;
    };

    const generateCSVContent = () => {
        const trades = backtestResults?.trades || [];
        if (trades.length === 0) return '';

        const headers = ['Date', 'Type', 'Entry', 'Exit', 'P&L', 'Duration'];
        const rows = trades.map(trade =>
            [trade.date, trade.type, trade.entry, trade.exit, trade.pnl, trade.duration].join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    };

    const generateShareMessage = () => {
        const metrics = backtestResults?.metrics || {};
        return `📊 My Backtest Results\n\n` +
            `Win Rate: ${metrics.winRate || 0}%\n` +
            `Profit Factor: ${metrics.profitFactor || 0}\n` +
            `Total Trades: ${metrics.totalTrades || 0}\n` +
            `Max Drawdown: ${metrics.maxDrawdown || 0}%\n\n` +
            `Generated via Trading Strategy Backtester`;
    };

    const handleNewBacktest = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        resetForm();
        router.push('/(root)/(tabs)/backtesting');
    };

    if (loading) {
        return (
            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#22c55e" />
                        <Text style={styles.loadingText}>Processing backtest results...</Text>
                        <Text style={styles.loadingSubtext}>This may take a few moments</Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    <View style={styles.centerContainer}>
                        <Feather name="alert-triangle" size={64} color="#ef4444" />
                        <Text style={styles.errorTitle}>Backtest Failed</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={handleNewBacktest}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </LinearGradient>
        );
    }

    if (!backtestResults) {
        return (
            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    <View style={styles.centerContainer}>
                        <Feather name="bar-chart-2" size={64} color="#4B5563" />
                        <Text style={styles.emptyTitle}>No Results Yet</Text>
                        <Text style={styles.emptyText}>Run a backtest to see performance metrics</Text>
                        <TouchableOpacity style={styles.runButton} onPress={handleNewBacktest}>
                            <Feather name="play" size={20} color="#fff" />
                            <Text style={styles.runButtonText}>Start New Backtest</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </LinearGradient>
        );
    }

    const metrics = backtestResults.metrics || {
        winRate: '0%',
        profitFactor: '0',
        maxDrawdown: '0%',
        totalTrades: '0',
        netProfit: '$0',
        sharpeRatio: '0',
        avgWin: '$0',
        avgLoss: '$0',
        bestTrade: '$0',
        worstTrade: '$0',
        expectancy: '$0',
    };

    const trades = backtestResults.trades || [];

    return (
        <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBoxBorder}
        >
            <LinearGradient
                colors={['#1e2836', '#111827', '#1e2836']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#60a5fa" />
                    }
                >
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Feather name="trending-up" size={24} color="#22c55e" />
                            <View>
                                <Text style={styles.header}>Backtest Results</Text>
                                <Text style={styles.subheader}>
                                    {formData?.symbol} • {formData?.timeframe} • {formData?.duration} Months
                                </Text>
                            </View>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.iconButton} onPress={handleShareResults}>
                                <Feather name="share-2" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={handleExportPDF}>
                                {exporting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Feather name="download" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.newButton} onPress={handleNewBacktest}>
                                <Feather name="plus" size={16} color="#fff" />
                                <Text style={styles.newButtonText}>New</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tab Navigation */}
                    <View style={styles.tabContainer}>
                        {['overview', 'metrics', 'trades'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedTab === 'overview' && (
                        <>
                            {/* Summary Cards */}
                            <View style={styles.summaryGrid}>
                                <LinearGradient
                                    colors={['#22c55e20', '#22c55e05']}
                                    style={styles.summaryCard}
                                >
                                    <Text style={styles.summaryLabel}>Net Profit</Text>
                                    <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
                                        {formatCurrency(metrics.netProfit)}
                                    </Text>
                                </LinearGradient>
                                <LinearGradient
                                    colors={['#3b82f620', '#3b82f605']}
                                    style={styles.summaryCard}
                                >
                                    <Text style={styles.summaryLabel}>Win Rate</Text>
                                    <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>
                                        {formatPercentage(metrics.winRate)}
                                    </Text>
                                </LinearGradient>
                                <LinearGradient
                                    colors={['#eab30820', '#eab30805']}
                                    style={styles.summaryCard}
                                >
                                    <Text style={styles.summaryLabel}>Profit Factor</Text>
                                    <Text style={[styles.summaryValue, { color: '#eab308' }]}>
                                        {metrics.profitFactor}
                                    </Text>
                                </LinearGradient>
                            </View>

                            {/* Key Metrics Grid */}
                            <View style={styles.metricsContainer}>
                                <View style={styles.metricRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricValue, { color: '#60a5fa' }]}>{metrics.totalTrades}</Text>
                                        <Text style={styles.metricLabel}>Total Trades</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricValue, { color: '#22c55e' }]}>{metrics.avgWin}</Text>
                                        <Text style={styles.metricLabel}>Avg Win</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricValue, { color: '#ef4444' }]}>{metrics.avgLoss}</Text>
                                        <Text style={styles.metricLabel}>Avg Loss</Text>
                                    </View>
                                </View>
                                <View style={styles.metricRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricValue, { color: '#ef4444' }]}>{metrics.maxDrawdown}</Text>
                                        <Text style={styles.metricLabel}>Max DD</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricValue}>{metrics.sharpeRatio}</Text>
                                        <Text style={styles.metricLabel}>Sharpe Ratio</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricValue}>{metrics.expectancy}</Text>
                                        <Text style={styles.metricLabel}>Expectancy</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Best/Worst Trades */}
                            <View style={styles.extremesContainer}>
                                <View style={styles.bestTrade}>
                                    <Feather name="award" size={20} color="#22c55e" />
                                    <View>
                                        <Text style={styles.extremeLabel}>Best Trade</Text>
                                        <Text style={styles.bestValue}>{metrics.bestTrade}</Text>
                                    </View>
                                </View>
                                <View style={styles.worstTrade}>
                                    <Feather name="alert-circle" size={20} color="#ef4444" />
                                    <View>
                                        <Text style={styles.extremeLabel}>Worst Trade</Text>
                                        <Text style={styles.worstValue}>{metrics.worstTrade}</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}

                    {selectedTab === 'metrics' && (
                        <View style={styles.detailedMetrics}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricCardTitle}>Performance Metrics</Text>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Total Return</Text>
                                    <Text style={[styles.metricCardValue, { color: '#22c55e' }]}>{metrics.totalReturn || '0%'}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Annual Return</Text>
                                    <Text style={[styles.metricCardValue, { color: '#22c55e' }]}>{metrics.annualReturn || '0%'}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Max Drawdown</Text>
                                    <Text style={[styles.metricCardValue, { color: '#ef4444' }]}>{metrics.maxDrawdown}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Sharpe Ratio</Text>
                                    <Text style={styles.metricCardValue}>{metrics.sharpeRatio}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Sortino Ratio</Text>
                                    <Text style={styles.metricCardValue}>{metrics.sortinoRatio || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricCardTitle}>Risk Metrics</Text>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Risk per Trade</Text>
                                    <Text style={styles.metricCardValue}>{formData?.riskPerTrade || '2'}%</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Max Consecutive Losses</Text>
                                    <Text style={styles.metricCardValue}>{metrics.maxConsecutiveLosses || '0'}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Recovery Factor</Text>
                                    <Text style={styles.metricCardValue}>{metrics.recoveryFactor || 'N/A'}</Text>
                                </View>
                                <View style={styles.metricCardItem}>
                                    <Text style={styles.metricCardLabel}>Risk of Ruin</Text>
                                    <Text style={styles.metricCardValue}>{metrics.riskOfRuin || '0%'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {selectedTab === 'trades' && trades.length > 0 && (
                        <View style={styles.tradeDetailsContainer}>
                            <View style={styles.tradeStats}>
                                <Text style={styles.tradeStatsText}>
                                    Showing last {Math.min(trades.length, 50)} of {trades.length} trades
                                </Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
                                <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Type</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Entry</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Exit</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>P&L</Text>
                            </View>
                            {trades.slice(0, 50).map((trade, index) => (
                                <View key={index} style={styles.tradeRow}>
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{trade.date}</Text>
                                    <View style={[styles.typeIndicator, { flex: 0.8 }]}>
                                        <Text style={[
                                            styles.typeText,
                                            trade.type === 'Long' ? styles.longType : styles.shortType
                                        ]}>
                                            {trade.type}
                                        </Text>
                                    </View>
                                    <Text style={[styles.tableCell, { flex: 1 }]}>{trade.entry}</Text>
                                    <Text style={[styles.tableCell, { flex: 1 }]}>{trade.exit}</Text>
                                    <Text style={[
                                        styles.tableCell,
                                        { flex: 1 },
                                        trade.pnl?.startsWith('-') ? styles.negativePnl : styles.positivePnl
                                    ]}>
                                        {trade.pnl}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {selectedTab === 'trades' && trades.length === 0 && (
                        <View style={styles.noTradesContainer}>
                            <Feather name="inbox" size={48} color="#4B5563" />
                            <Text style={styles.noTradesText}>No trade data available</Text>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
        flex: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
        flex: 1,
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    loadingSubtext: {
        color: '#A0AEC0',
        fontSize: 14,
        marginTop: 8,
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
    },
    errorText: {
        color: '#A0AEC0',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
    },
    emptyText: {
        color: '#A0AEC0',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 20,
    },
    runButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        gap: 8,
    },
    runButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    header: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    subheader: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
    },
    newButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#3b82f6',
    },
    tabText: {
        color: '#A0AEC0',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    summaryLabel: {
        color: '#A0AEC0',
        fontSize: 12,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    metricsContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    metricItem: {
        alignItems: 'center',
        flex: 1,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    metricLabel: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 4,
    },
    extremesContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    bestTrade: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22c55e10',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#22c55e30',
    },
    worstTrade: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef444410',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#ef444430',
    },
    extremeLabel: {
        color: '#A0AEC0',
        fontSize: 11,
    },
    bestValue: {
        color: '#22c55e',
        fontSize: 16,
        fontWeight: '600',
    },
    worstValue: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    detailedMetrics: {
        gap: 16,
    },
    metricCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
    },
    metricCardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    metricCardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    metricCardLabel: {
        color: '#A0AEC0',
        fontSize: 14,
    },
    metricCardValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    tradeDetailsContainer: {
        flex: 1,
    },
    tradeStats: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    tradeStatsText: {
        color: '#A0AEC0',
        fontSize: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2d3748',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    tableHeaderText: {
        color: '#A0AEC0',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    tradeRow: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    tableCell: {
        color: '#fff',
        fontSize: 11,
        textAlign: 'center',
    },
    typeIndicator: {
        alignItems: 'center',
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    longType: {
        backgroundColor: '#22c55e',
        color: '#fff',
    },
    shortType: {
        backgroundColor: '#ef4444',
        color: '#fff',
    },
    positivePnl: {
        color: '#22c55e',
    },
    negativePnl: {
        color: '#ef4444',
    },
    noTradesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noTradesText: {
        color: '#A0AEC0',
        fontSize: 14,
        marginTop: 12,
    },
});

export default BacktestingResults;