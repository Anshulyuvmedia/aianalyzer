import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';
import Svg, { Polyline, Line, Rect, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const StrategyDetails = () => {
    const { id } = useLocalSearchParams();
    const { strategies, backtests, fetchStrategyBacktest } = useContext(CopyStrategyContext);
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const cached = await AsyncStorage.getItem('copyStrategiesCache');
                if (cached) {
                    const all = JSON.parse(cached);
                    const found = all?.find(s => s._id === id);
                    if (found) setStrategy(found);
                }

                fetchStrategyBacktest(id);

            } catch (err) {
                console.error('Load error:', err);
                setError(err.message || 'Failed to load strategy');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadData();
    }, [id, fetchStrategyBacktest]);

    const backtestData = backtests[id];
    const actualBacktest = backtestData?.backtest ?? null;
    const m = actualBacktest?.metrics || {};
    const config = actualBacktest?.config || {};
    const equityPoints = actualBacktest?.equityCurve || [];

    if (loading || !strategy) {
        return (
            <View style={styles.safeArea}>
                <HomeHeader page="home" title="Strategy Details" />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Loading strategy details...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.safeArea}>
                <HomeHeader page="home" title="Strategy Details" />
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Oops!</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </View>
        );
    }

    const listData = [
        { type: 'overview', m, config },
        { type: 'equity-curve', equityPoints, config },
        { type: 'risk-metrics', m },
        { type: 'monthly-returns', backtest: actualBacktest },
        { type: 'core-info', strategy },
        { type: 'trading-params', strategy },
        { type: 'backtest-config', config, backtest: actualBacktest },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'overview':
                return <PerformanceOverview metrics={item.m} config={item.config} />;
            case 'equity-curve':
                return <EquityCurveSection points={item.equityPoints} config={item.config} />;
            case 'risk-metrics':
                return <RiskMetricsSection metrics={item.m} />;
            case 'monthly-returns':
                return <MonthlyReturnsSection backtest={item.backtest} />;
            case 'core-info':
                return <CoreInfoSection strategy={item.strategy} />;
            case 'trading-params':
                return <TradingParamsSection strategy={item.strategy} />;
            case 'backtest-config':
                return <BacktestConfigSection config={item.config} backtest={item.backtest} />;
            default:
                return null;
        }
    };

    const HeaderComponent = () => (
        <LinearGradient colors={['#000000', '#1e293b']} style={styles.headerCard}>
            <View style={styles.headerTopRow}>
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <StatusBadge status={strategy.status} />
            </View>
            {/* <Text style={styles.strategyDescription}>
                {strategy.description || 'No description available'}
            </Text> */}

            <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.badgeSecondary]}>
                    <MaterialCommunityIcons name="earth" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.assetClass || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, styles.badgeAccent]}>
                    <MaterialCommunityIcons name="account-group" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.followerCount || 0} followers</Text>
                </View>
            </View>

            {strategy.averageRating > 0 && (
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Ionicons
                            key={i}
                            name={i <= Math.round(strategy.averageRating) ? 'star' : 'star-outline'}
                            size={16}
                            color="#FBBF24"
                            style={{ marginRight: 2 }}
                        />
                    ))}
                    <Text style={styles.ratingText}>{strategy.averageRating.toFixed(1)}</Text>
                </View>
            )}
        </LinearGradient>
    );

    return (
        <View style={styles.safeArea}>
            <HomeHeader page="chatbot" title="Strategy Details" subtitle="Complete detail for strategies" />
            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(_, index) => `section-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                ListHeaderComponent={HeaderComponent}
            />
        </View>
    );
};

const StatusBadge = ({ status }) => {
    const dotColor = status === 'Active' ? '#22c55e' : status === 'Paused' ? '#fbbf24' : '#6b7280';
    const label = status || 'Unknown';
    return (
        <View style={[styles.statusBadge, { borderColor: dotColor }]}>
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.statusText, { color: dotColor }]}>{label}</Text>
        </View>
    );
};

const PerformanceOverview = ({ metrics, config }) => {
    const pnl = metrics.totalPnL ?? 0;
    const isProfitable = pnl > 0;
    const capital = config.initialCapital;
    const returnPct = capital > 0 ? ((pnl / capital) * 100).toFixed(1) : '—';

    const items = [
        { label: 'Net Profit', value: `$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: isProfitable ? '#22c55e' : '#ef4444', subtitle: `${returnPct}% return` },
        { label: 'Win Rate', value: metrics.winRatePercent != null ? `${metrics.winRatePercent.toFixed(1)}%` : '—', color: '#3b82f6', subtitle: `${metrics.winningTrades || 0}W / ${metrics.losingTrades || 0}L` },
        { label: 'Profit Factor', value: metrics.profitFactor != null ? (metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)) : '—', color: '#a855f7', subtitle: metrics.profitFactor > 1.5 ? 'Healthy' : 'Low' },
        { label: 'Sharpe Ratio', value: metrics.sharpeRatio != null ? metrics.sharpeRatio.toFixed(2) : '—', color: '#f97316', subtitle: metrics.sharpeRatio >= 1 ? 'Good' : metrics.sharpeRatio > 0 ? 'Fair' : 'Poor' },
        { label: 'Max Drawdown', value: metrics.maxDrawdownPercent != null ? `${metrics.maxDrawdownPercent.toFixed(1)}%` : '—', color: '#ef4444', subtitle: `$${metrics.maxDrawdown?.toLocaleString() || 0}` },
        { label: 'Total Trades', value: metrics.totalTrades || 0, color: '#60a5fa', subtitle: `${metrics.avgTradePnL != null ? '$' + metrics.avgTradePnL.toFixed(0) : '—'} avg / trade` },
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.metricsGrid}>
                {items.map((item, i) => (
                    <View key={i} style={[styles.metricCard, { borderLeftColor: item.color }]}>
                        <Text style={styles.metricLabel}>{item.label}</Text>
                        <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
                        <Text style={styles.metricSubtitle}>{item.subtitle}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const EquityCurveSection = ({ points, config }) => {
    if (!points || points.length < 2) return null;

    const chartW = 340;
    const chartH = 200;
    const padL = 50;
    const padR = 16;
    const padT = 16;
    const padB = 32;
    const drawW = chartW - padL - padR;
    const drawH = chartH - padT - padB;

    const equityValues = points.map(p => p.equity || 0);
    const minEq = Math.min(...equityValues);
    const maxEq = Math.max(...equityValues);
    const eqRange = maxEq - minEq || 1;
    const initEq = config.initialCapital || points[0]?.equity || 0;

    const linePoints = points.map((p, i) => {
        const x = padL + (i / (points.length - 1)) * drawW;
        const y = padT + drawH - ((p.equity - minEq) / eqRange) * drawH;
        return `${x},${y}`;
    }).join(' ');

    const zeroY = padT + drawH - ((initEq - minEq) / eqRange) * drawH;

    const yLabels = [minEq, (minEq + maxEq) / 2, maxEq];
    const endEquity = equityValues[equityValues.length - 1];
    const isProfitable = endEquity >= initEq;
    const lineColor = isProfitable ? '#22c55e' : '#ef4444';

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equity Curve</Text>
            <View style={[styles.infoCard, { padding: 12 }]}>
                <Svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
                    <Defs>
                        <SvgGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={lineColor} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
                        </SvgGradient>
                    </Defs>

                    <Line x1={padL} y1={zeroY} x2={padL + drawW} y2={zeroY} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

                    {yLabels.map((val, i) => {
                        const y = padT + drawH - ((val - minEq) / eqRange) * drawH;
                        return (
                            <React.Fragment key={i}>
                                <Line x1={padL} y1={y} x2={padL + drawW} y2={y} stroke="#1e293b" strokeWidth="1" />
                                <SvgText x={padL - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                                    {val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val.toFixed(0)}`}
                                </SvgText>
                            </React.Fragment>
                        );
                    })}

                    <Rect x={padL} y={padT} width={drawW} height={drawH} fill="url(#equityFill)" />

                    <Polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                    <SvgText x={padL + drawW / 2} y={chartH - 4} fill="#64748b" fontSize="10" textAnchor="middle">Trades</SvgText>
                </Svg>

                <View style={styles.equityLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#64748b' }]} />
                        <Text style={styles.legendText}>Initial: ${initEq.toLocaleString()}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: lineColor }]} />
                        <Text style={styles.legendText}>Final: ${endEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const RiskMetricsSection = ({ metrics }) => {
    const items = [
        { icon: 'swap-horizontal-bold', label: 'Avg RR', value: metrics.avgRR != null ? `1:${metrics.avgRR.toFixed(2)}` : '—', color: '#f97316' },
        { icon: 'arrow-up-bold-circle', label: 'Largest Win', value: metrics.largestWin != null ? `$${metrics.largestWin.toFixed(2)}` : '—', color: '#22c55e' },
        { icon: 'arrow-down-bold-circle', label: 'Largest Loss', value: metrics.largestLoss != null ? `$${metrics.largestLoss.toFixed(2)}` : '—', color: '#ef4444' },
        { icon: 'cash-plus', label: 'Avg Win', value: metrics.avgWin != null ? `$${metrics.avgWin.toFixed(2)}` : '—', color: '#22c55e' },
        { icon: 'cash-minus', label: 'Avg Loss', value: metrics.avgLoss != null ? `$${metrics.avgLoss.toFixed(2)}` : '—', color: '#ef4444' },
        { icon: 'fire', label: 'Max Consec. Wins', value: metrics.maxConsecutiveWins ?? '—', color: '#22c55e' },
        { icon: 'water', label: 'Max Consec. Losses', value: metrics.maxConsecutiveLosses ?? '—', color: '#ef4444' },
        { icon: 'clock-outline', label: 'Avg Trade Duration', value: metrics.avgTradeDurationMinutes != null ? formatDuration(metrics.avgTradeDurationMinutes) : '—', color: '#60a5fa' },
    ];

    const metricCards = [
        { label: 'Gross Profit', value: metrics.grossProfit != null ? `$${metrics.grossProfit.toFixed(2)}` : '—', color: '#22c55e' },
        { label: 'Gross Loss', value: metrics.grossLoss != null ? `$${metrics.grossLoss.toFixed(2)}` : '—', color: '#ef4444' },
        { label: 'Sortino Ratio', value: metrics.sortinoRatio != null ? metrics.sortinoRatio.toFixed(2) : '—', color: '#a855f7' },
        { label: 'Calmar Ratio', value: metrics.calmarRatio != null ? metrics.calmarRatio.toFixed(2) : '—', color: '#f97316' },
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk & Trade Statistics</Text>
            <View style={styles.infoCard}>
                <View style={styles.riskGrid}>
                    {items.map((item, i) => (
                        <View key={i} style={styles.riskRow}>
                            <View style={styles.riskIconWrap}>
                                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                            </View>
                            <View style={styles.riskContent}>
                                <Text style={styles.riskLabel}>{item.label}</Text>
                                <Text style={[styles.riskValue, { color: item.color }]}>{item.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={styles.metricsGrid}>
                    {metricCards.map((item, i) => (
                        <View key={i} style={[styles.metricCardSmall, { borderLeftColor: item.color }]}>
                            <Text style={styles.metricLabel}>{item.label}</Text>
                            <Text style={[styles.metricValue, { color: item.color, fontSize: 16 }]}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const MonthlyReturnsSection = ({ backtest }) => {
    const monthly = backtest?.monthlyReturns;
    if (!monthly || monthly.length === 0) return null;

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Returns</Text>
            <View style={styles.infoCard}>
                {monthly.slice(-12).reverse().map((m, i) => {
                    const isPos = m.returnPercent >= 0;
                    return (
                        <View key={i} style={styles.monthRow}>
                            <Text style={styles.monthLabel}>{m.month}</Text>
                            <View style={styles.monthBarWrap}>
                                <View style={[styles.monthBar, { width: `${Math.min(Math.abs(m.returnPercent), 30)}%` || '0%', backgroundColor: isPos ? '#22c55e' : '#ef4444' }]} />
                            </View>
                            <Text style={[styles.monthValue, { color: isPos ? '#22c55e' : '#ef4444' }]}>
                                {isPos ? '+' : ''}{m.returnPercent.toFixed(1)}%
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const CoreInfoSection = ({ strategy }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Information</Text>
        <View style={styles.infoCard}>
            <InfoRow icon="calendar-clock" label="Timeframes" value={strategy.timeframes?.join(' • ') || 'Not specified'} />
            <InfoRow icon="chart-line" label="Symbols" value={strategy.symbols?.join(', ') || 'Any'} />
            <InfoRow icon="tag-multiple" label="Strategy" value={strategy.tags?.join(' • ') || 'None'} />
            {/* <InfoRow icon="calendar" label="Created" value={strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} /> */}
            {/* <InfoRow icon="star" label="Rating" value={strategy.averageRating ? `${strategy.averageRating.toFixed(1)} / 5` : 'No ratings'} /> */}
            <InfoRow icon="account-group" label="Followers" value={`${strategy.followerCount || 0}`} />
        </View>
    </View>
);

const TradingParamsSection = ({ strategy }) => {
    const dc = strategy.defaultConfig || {};
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trading Parameters</Text>
            <View style={styles.infoCard}>
                <InfoRow icon="shield-check" label="Risk per Trade" value={`${dc.riskPerTradePercent || 1}%`} valueStyle={{ color: '#fbbf24' }} />
                {/* <InfoRow icon="wallet" label="Initial Capital" value={`$${dc.initialCapital?.toLocaleString() || 'N/A'}`} /> */}
                <InfoRow icon="swap-horizontal" label="Direction" value={dc.direction || 'Both'} />
                <InfoRow icon="order-bool-ascending" label="Order Type" value={dc.orderType || 'Market'} />
                <InfoRow icon="layers-triple" label="Max Trades" value={`${dc.maxTrade || 1} at once`} />
                <InfoRow icon="ruler" label="Slippage" value={dc.useSlippage !== false ? `${dc.slippagePips || 0.5} pips` : 'Disabled'} />
                {/* <InfoRow icon="calendar-range" label="Test Duration" value={dc.duration ? `${dc.duration} days` : 'N/A'} /> */}
            </View>
        </View>
    );
};

const BacktestConfigSection = ({ config, backtest }) => {
    const fromDate = config.dateRange?.from ? new Date(config.dateRange.from) : null;
    const toDate = config.dateRange?.to ? new Date(config.dateRange.to) : null;
    const dur = backtest?.durationSeconds;

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backtest Configuration</Text>
            <View style={styles.infoCard}>
                <InfoRow icon="chart-line" label="Symbol" value={config.symbol || 'N/A'} />
                <InfoRow icon="clock-outline" label="Timeframe" value={config.timeframe || 'N/A'} />
                {fromDate && toDate && (
                    <InfoRow
                        icon="calendar-range"
                        label="Period"
                        value={`${fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${toDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    />
                )}
                <InfoRow icon="wallet" label="Initial Capital" value={`$${config.initialCapital?.toLocaleString() || 'N/A'}`} />
                {dur != null && (
                    <InfoRow icon="timer-outline" label="Execution Time" value={`${formatDuration(dur)}`} />
                )}
            </View>
        </View>
    );
};

const InfoRow = ({ icon, label, value, valueStyle }) => (
    <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color="#10B981" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
        </View>
    </View>
);

const formatDuration = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    flatListContent: {
        paddingBottom: 24,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    },
    errorTitle: {
        marginTop: 16,
        color: '#f87171',
        fontSize: 24,
        fontWeight: '700',
    },
    errorText: {
        marginTop: 8,
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    headerCard: {
        padding: 24,
        paddingTop: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    strategyName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'capitalize',
        flex: 1,
        marginRight: 12,
    },
    strategyDescription: {
        fontSize: 15,
        color: '#cbd5e1',
        lineHeight: 22,
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    badgePrimary: {
        backgroundColor: '#10B981',
    },
    badgeSecondary: {
        backgroundColor: '#6366f1',
    },
    badgeAccent: {
        backgroundColor: '#7c3aed',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    ratingText: {
        color: '#FBBF24',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    metricCard: {
        flex: 1,
        minWidth: '46%',
        backgroundColor: '#111827',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
    },
    metricCardSmall: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#111827',
        borderRadius: 12,
        padding: 10,
        borderLeftWidth: 3,
        marginTop: 12,
    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f1f5f9',
    },
    metricSubtitle: {
        color: '#6b7280',
        fontSize: 11,
        marginTop: 2,
    },
    equityLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    riskGrid: {
        gap: 2,
    },
    riskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    riskIconWrap: {
        width: 32,
        alignItems: 'center',
    },
    riskContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 8,
    },
    riskLabel: {
        color: '#94a3b8',
        fontSize: 14,
    },
    riskValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    monthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    monthLabel: {
        color: '#94a3b8',
        fontSize: 13,
        width: 36,
    },
    monthBarWrap: {
        flex: 1,
        height: 8,
        backgroundColor: '#111827',
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    monthBar: {
        height: '100%',
        backgroundColor: '#22c55e',
        borderRadius: 4,
        opacity: 0.7,
    },
    monthValue: {
        fontSize: 13,
        fontWeight: '600',
        width: 56,
        textAlign: 'right',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
    },
});

export default StrategyDetails;
