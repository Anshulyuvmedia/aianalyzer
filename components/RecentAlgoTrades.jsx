// components/RecentAlgoTrades.jsx
import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import FlashTradeItem from './FlashTradeItem';

const RecentAlgoTrades = ({ data, pnl }) => {
    const trades = Array.isArray(data) ? data : [];

    // ⏱️ Time formatter
    const getTimeAgo = (isoString) => {
        if (!isoString) return '—';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const buildTradeAnalytics = (trades) => {
        const positions = {};
        const completed = [];

        trades.forEach((t) => {
            const key = t.symbol;

            if (t.type === "ENTRY") {
                positions[key] = {
                    ...t,
                    entryPrice: Number(t.price),
                    entryTime: t.time,
                };
            }

            if (t.type === "EXIT" && positions[key]) {
                const entry = positions[key];
                const exitPrice = Number(t.price);

                let pnl = 0;
                let pnlPercent = 0;

                if (entry.direction === "LONG") {
                    pnl = exitPrice - entry.entryPrice;
                    pnlPercent = entry.entryPrice ? (pnl / entry.entryPrice) * 100 : 0;
                } else {
                    pnl = entry.entryPrice - exitPrice;
                    pnlPercent = entry.entryPrice ? (pnl / entry.entryPrice) * 100 : 0;
                }

                completed.push({
                    symbol: t.symbol,
                    direction: entry.direction,
                    entryPrice: entry.entryPrice,
                    exitPrice,
                    pnl: Number(pnl.toFixed(2)),
                    pnlPercent: Number(pnlPercent.toFixed(2)),
                    holdingTime: new Date(t.time) - new Date(entry.entryTime),
                    time: t.time,
                    _receivedAt: t._receivedAt || Date.now(),
                });

                delete positions[key];
            }
        });

        return completed.reverse(); // Most recent first
    };

    const analytics = (completedTrades) => {
        const total = completedTrades.length;
        const wins = completedTrades.filter(t => t.pnl > 0);
        const losses = completedTrades.filter(t => t.pnl < 0);

        const totalPnl = completedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const winRate = total ? (wins.length / total) * 100 : 0;

        return { total, totalPnl, winRate };
    };

    const completedTrades = buildTradeAnalytics(trades);
    const stats = analytics(completedTrades);

    return (
        <LinearGradient
            colors={['#1e2937', '#0f172a']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <Ionicons name="trending-up" size={26} color="#22c55e" />
                    <Text style={styles.headerTitle}>Recent Trades</Text>
                </View>

                {completedTrades.length > 0 && (
                    <View style={styles.tradeCount}>
                        <Text style={styles.tradeCountText}>
                            {completedTrades.length}
                        </Text>
                    </View>
                )}
            </View>

            {/* Total PnL Summary */}
            {completedTrades.length > 0 && (
                <View style={styles.pnlSummary}>
                    <Text style={styles.pnlLabel}>Realized PnL</Text>
                    <Text style={[
                        styles.totalPnl,
                        { color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444' }
                    ]}>
                        ₹{stats.totalPnl >= 0 ? '+' : ''}{Number(stats.totalPnl || 0).toFixed(2)}
                    </Text>

                    <View style={styles.winRateRow}>
                        <Text style={styles.winRateLabel}>Win Rate</Text>
                        <Text style={styles.winRateValue}>
                            {stats.winRate.toFixed(1)}%
                        </Text>
                    </View>
                </View>
            )}

            {/* Trades List */}
            <View style={styles.tradesContainer}>
                {completedTrades.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>No completed trades yet</Text>
                        <Text style={styles.emptySubtext}>
                            Your recent exits will appear here
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {completedTrades.map((trade, index) => {
                            const isRecent = Date.now() - (trade._receivedAt || 0) < 2000;

                            return (
                                <FlashTradeItem
                                    key={index}
                                    trade={{
                                        ...trade,
                                        timeAgo: getTimeAgo(trade.time)
                                    }}
                                    isRecent={isRecent}
                                />
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </LinearGradient>
    );
};

export default RecentAlgoTrades;

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        color: '#f8fafc',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    tradeCount: {
        backgroundColor: '#1e2937',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    tradeCountText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    pnlSummary: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 18,
    },
    pnlLabel: {
        color: '#94a3b8',
        fontSize: 13,
        marginBottom: 4,
    },
    totalPnl: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    winRateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    winRateLabel: {
        color: '#94a3b8',
        fontSize: 13.5,
    },
    winRateValue: {
        color: '#22c55e',
        fontSize: 15.5,
        fontWeight: '700',
    },
    tradesContainer: {
        flex: 1,
        minHeight: 180,
    },
    scrollView: {
        maxHeight: 420, // Adjust based on your screen
    },
    scrollContent: {
        paddingBottom: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#475569',
        fontSize: 13.5,
        marginTop: 6,
        textAlign: 'center',
    },
});