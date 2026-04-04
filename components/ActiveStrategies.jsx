// components/ActiveStrategies.jsx
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';
import { AlgoTradingContext } from '@/context/AlgoTradingContext';
import { router } from 'expo-router';

const ActiveStrategies = () => {
    const { strategies, toggleFollow, refreshStrategies, updateStrategyLocalStatus } = useContext(CopyStrategyContext);
    const { updateStategyStatus } = useContext(AlgoTradingContext);

    const activeStrategies = strategies.filter(s => s.isFollowing === true);

    const [localStatuses, setLocalStatuses] = useState({});

    const handleToggleStatus = async (strategyId) => {
        const strategy = strategies.find(s => s._id === strategyId);
        if (!strategy) return;

        const currentStatus = localStatuses[strategyId] || strategy.status || 'Paused';
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';

        // Instant UI feedback
        setLocalStatuses(prev => ({ ...prev, [strategyId]: newStatus }));
        updateStrategyLocalStatus(strategyId, newStatus);

        try {
            await updateStategyStatus(strategy, newStatus);
            refreshStrategies();
        } catch (error) {
            console.error('Failed to update strategy status:', error);
            // Revert on error (optional)
            setLocalStatuses(prev => ({ ...prev, [strategyId]: currentStatus }));
        }
    };

    const handleUnfollow = (strategyId, name) => {
        Alert.alert(
            'Unfollow Strategy',
            `Are you sure you want to unfollow "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unfollow',
                    style: 'destructive',
                    onPress: () => {
                        toggleFollow(strategyId, false);
                    },
                },
            ]
        );
    };

    const handleViewPerformance = (strategyId) => {
        router.push(`/StrategyPerformance/${strategyId}`);
    };

    const getCurrentStatus = (strategy) => {
        return localStatuses[strategy._id] || strategy.status || 'Paused';
    };

    if (activeStrategies.length === 0) {
        return (
            <LinearGradient
                colors={['#1e2937', '#0f172a']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="brain-off" size={52} color="#475569" />
                    <Text style={styles.emptyTitle}>No Active Strategies</Text>
                    <Text style={styles.emptySubtitle}>
                        Strategies you follow will appear here when activated
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#1e2937', '#0f172a']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="brain" size={26} color="#22c55e" />
                    <Text style={styles.title}>Active Strategies</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{activeStrategies.length}</Text>
                </View>
            </View>

            {/* Strategy List */}
            {activeStrategies.map((strategy) => {
                const currentStatus = getCurrentStatus(strategy);
                const isActive = currentStatus === 'Active';

                return (
                    <TouchableOpacity
                        key={strategy._id}
                        style={styles.strategyCard}
                        onPress={() => handleViewPerformance(strategy._id)}
                        activeOpacity={0.95}
                    >
                        <View style={styles.strategyHeader}>
                            <View style={styles.strategyInfo}>
                                <Text style={styles.strategyName}>{strategy.name}</Text>
                                <Text style={styles.strategyType}>
                                    {strategy.strategyType || 'Custom'} • {strategy.assetClass || '—'}
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                {/* Status Badge */}
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: isActive ? '#14532d' : '#92400e' }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {currentStatus}
                                    </Text>
                                </View>

                                {/* Toggle Button */}
                                <TouchableOpacity
                                    style={[styles.controlButton, isActive && styles.activeControl]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleToggleStatus(strategy._id);
                                    }}
                                >
                                    <Ionicons
                                        name={isActive ? 'pause' : 'play'}
                                        size={20}
                                        color="#e2e8f0"
                                    />
                                </TouchableOpacity>

                                {/* Unfollow */}
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleUnfollow(strategy._id, strategy.name);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="account-minus"
                                        size={20}
                                        color="#f87171"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Description */}
                        {strategy.description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {strategy.description}
                            </Text>
                        )}

                        {/* Metrics */}
                        <View style={styles.metricsRow}>
                            <View style={styles.metric}>
                                <Text style={[
                                    styles.metricValue,
                                    { color: String(strategy.pnl || '').startsWith('-') ? '#ef4444' : '#22c55e' }
                                ]}>
                                    {strategy.pnl || '—'}
                                </Text>
                                <Text style={styles.metricLabel}>P&L</Text>
                            </View>

                            <View style={styles.metric}>
                                <Text style={[styles.metricValue, { color: '#60a5fa' }]}>
                                    {strategy.winRate || '—'}
                                </Text>
                                <Text style={styles.metricLabel}>Win Rate</Text>
                            </View>

                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>
                                    {strategy.trades || '—'}
                                </Text>
                                <Text style={styles.metricLabel}>Trades</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </LinearGradient>
    );
};

export default ActiveStrategies;

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        color: '#f8fafc',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    countBadge: {
        backgroundColor: '#1e2937',
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    countText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    strategyCard: {
        backgroundColor: '#1e2937',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    strategyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    strategyInfo: {
        flex: 1,
    },
    strategyName: {
        fontSize: 17.5,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 4,
    },
    strategyType: {
        fontSize: 13,
        color: '#94a3b8',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        minWidth: 78,
        alignItems: 'center',
    },
    statusText: {
        color: '#f1f5f9',
        fontSize: 12.5,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    controlButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeControl: {
        backgroundColor: '#14532d',
        borderColor: '#22c55e',
    },
    description: {
        fontSize: 13.5,
        color: '#94a3b8',
        lineHeight: 19,
        marginBottom: 14,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    metric: {
        alignItems: 'center',
        flex: 1,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12.5,
        color: '#64748b',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        color: '#e2e8f0',
        fontSize: 19,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        color: '#64748b',
        fontSize: 14.5,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        maxWidth: '80%',
    },
});