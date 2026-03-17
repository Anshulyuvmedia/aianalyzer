import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecentCopyTrades from '@/components/RecentCopyTrades';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';

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

                // 1. Try to get strategy from cache (fast path)
                const cached = await AsyncStorage.getItem('copyStrategiesCache');
                if (cached) {
                    const all = JSON.parse(cached);
                    const found = all?.find(s => s._id === id);
                    if (found) setStrategy(found);
                }

                // 2. Ensure backtest is being fetched (context handles caching & loading)
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
    // console.log('Backtest data from context for id', id, ':', backtests[id]);
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

    // ──────────────────────────────────────────────
    // Prepare FlatList data (sections as items)
    // ──────────────────────────────────────────────
    const listData = [
        { type: 'backtest', backtest: actualBacktest },
        { type: 'core-info', strategy },
        { type: 'trading-params', strategy },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'core-info':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Core Information</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="calendar-clock"
                                label="Timeframes"
                                value={item.strategy.timeframes?.join(' • ') || 'Not specified'}
                            />
                            <InfoRow
                                icon="chart-line"
                                label="Symbols"
                                value={item.strategy.symbols?.join(', ') || 'Any'}
                            />
                            <InfoRow
                                icon="tag-multiple"
                                label="Tags"
                                value={item.strategy.tags?.join(' • ') || 'None'}
                            />
                        </View>
                    </View>
                );

            case 'trading-params':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trading Parameters</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="shield-check"
                                label="Risk per Trade"
                                value={`${item.strategy.defaultConfig?.riskPerTradePercent || 1}%`}
                                valueStyle={{ color: '#fbbf24' }}
                            />
                            <InfoRow
                                icon="wallet"
                                label="Initial Capital"
                                value={`$${item.strategy.defaultConfig?.initialCapital?.toLocaleString() || 'N/A'}`}
                            />
                        </View>
                    </View>
                );

            case 'backtest':
                return <BacktestSection backtest={item.backtest} />;

            default:
                return null;
        }
    };

    const HeaderComponent = () => (
        <LinearGradient colors={['#000000', '#1e293b']} style={styles.headerCard}>
            <Text style={styles.strategyName}>{strategy.name}</Text>
            <Text style={styles.strategyDescription}>
                {strategy.description || 'No description available'}
            </Text>

            <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.badgePrimary]}>
                    <MaterialCommunityIcons name="finance" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.strategyType || 'Custom'}</Text>
                </View>
                <View style={[styles.badge, styles.badgeSecondary]}>
                    <MaterialCommunityIcons name="earth" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.assetClass || 'N/A'}</Text>
                </View>
            </View>
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
                stickyHeaderIndices={[0]}
            />
        </View>
    );
};

// ──────────────────────────────────────────────
// New Backtest display component
// ──────────────────────────────────────────────
const BacktestSection = ({ backtest }) => {
    // console.log('[BacktestSection] Received backtest prop:', backtest);

    // Loading state
    if (backtest === undefined) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Backtesting Result</Text>
                <View style={styles.infoCard}>
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text style={{ color: '#94a3b8', marginTop: 12 }}>
                            Loading backtest results...
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // No data / empty object
    if (!backtest || typeof backtest !== 'object' || Object.keys(backtest).length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Backtesting Result</Text>
                <View style={styles.infoCard}>
                    <View style={{ padding: 32, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="chart-line-stacked" size={48} color="#4B5563" />
                        <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
                            No backtest results available yet
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // Data exists — extract safely
    const m = backtest.metrics || {};
    const config = backtest.config || {};
    const tradesCount = backtest.totalTrades || m.totalTrades || 0;
    const isNegative = (m.totalPnL || 0) < 0;

    const fromDate = config.dateRange?.from ? new Date(config.dateRange.from) : null;
    const toDate = config.dateRange?.to ? new Date(config.dateRange.to) : null;

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backtesting Result</Text>
            <View style={styles.infoCard}>
                {/* Period & Capital */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <View>
                        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Test Period</Text>
                        <Text style={{ color: '#f1f5f9', fontWeight: '600' }}>
                            {fromDate ? fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} –{' '}
                            {toDate ? toDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Initial Capital</Text>
                        <Text style={{ color: '#10B981', fontWeight: '700' }}>
                            ${config.initialCapital?.toLocaleString() || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Metrics Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    <MetricCard
                        label="Net Profit"
                        value={m.totalPnL != null ? `$${m.totalPnL.toFixed(2)}` : '—'}
                        color={isNegative ? '#EF4444' : '#10B981'}
                    />
                    <MetricCard
                        label="Max Drawdown"
                        value={m.maxDrawdownPercent != null ? `${m.maxDrawdownPercent.toFixed(2)}%` : '—'}
                        color="#EF4444"
                    />
                    <MetricCard
                        label="Win Rate"
                        value={m.winRatePercent != null ? `${m.winRatePercent.toFixed(1)}%` : '—'}
                        color="#3B82F6"
                    />
                    <MetricCard
                        label="Total Trades"
                        value={tradesCount}
                        color="#60A5FA"
                    />
                </View>

                {tradesCount > 0 && tradesCount <= 5 && (
                    <Text style={{ color: '#FBBF24', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
                        Only {tradesCount} trade{tradesCount > 1 ? 's' : ''} — limited sample size
                    </Text>
                )}

                <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 20, textAlign: 'center', lineHeight: 18 }}>
                    Simulated backtest • Past performance does not guarantee future results
                </Text>
            </View>
        </View>
    );
};

const MetricCard = ({ label, value, color }) => (
    <View
        style={{
            flex: 1,
            minWidth: '45%',
            backgroundColor: '#111827',
            borderRadius: 12,
            padding: 12,
            borderLeftWidth: 4,
            borderLeftColor: color,
        }}
    >
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{label}</Text>
        <Text
            style={{
                color: color === '#EF4444' && value.startsWith('-') ? '#EF4444' : '#f1f5f9',
                fontSize: 18,
                fontWeight: '700',
                marginTop: 4,
            }}
        >
            {value}
        </Text>
    </View>
);

// InfoRow remains unchanged
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

/* ──────────────────────────────────────────────
Styles
─────────────────────────────────────────────── */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    flatListContent: {
        paddingBottom: 24, // or more if you have bottom tab/nav
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

    // Header Card
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
    strategyName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textTransform: 'capitalize',
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
    badgeText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },

    // Sections
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
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
        padding: 16,          // increased padding for better spacing
        borderWidth: 1,
        borderColor: '#334155',
    },

    // Info Row
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