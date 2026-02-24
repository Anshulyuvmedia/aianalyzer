import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';
import { router } from 'expo-router';

const ActiveStrategies = () => {
    const { strategies, toggleFollow } = useContext(CopyStrategyContext);
    const [activeStrategies, setActiveStrategies] = useState([]);

    // Filter only followed strategies (assuming isFollowing exists)
    useEffect(() => {
        if (strategies?.length > 0) {
            const followed = strategies.filter(s => s.isFollowing === true);
            // Add local UI state if backend doesn't provide status yet
            const withStatus = followed.map(s => ({
                ...s,
                status: s.status || 'Active',           // can come from backend later
                statusColor: s.status === 'Paused' ? '#92400e' : '#14532d',
            }));
            setActiveStrategies(withStatus);
        }
    }, [strategies]);

    const handleToggleStatus = (strategyId) => {
        setActiveStrategies(prev =>
            prev.map(s =>
                s._id === strategyId
                    ? {
                        ...s,
                        status: s.status === 'Active' ? 'Paused' : 'Active',
                        statusColor: s.status === 'Active' ? '#92400e' : '#14532d',
                    }
                    : s
            )
        );

        // TODO: Call real API to pause/resume strategy
        // e.g. api.post(`/strategies/${strategyId}/status`, { status: newStatus })
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
                        toggleFollow(strategyId, false); // false = unfollow
                        // Optional: remove from local list immediately
                        setActiveStrategies(prev => prev.filter(s => s._id !== strategyId));
                    },
                },
            ]
        );
    };

    const handleViewPerformance = (strategyId) => {
        router.push(`/StrategyPerformance/${strategyId}`);
    };

    if (activeStrategies.length === 0) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#AEAED4', '#000', '#AEAED4']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <LinearGradient
                        colors={['#1e2836', '#111827', '#1e2836']}
                        start={{ x: 0.4, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.innerGradient}
                    >
                        <View style={styles.innerContainer}>
                            <Text style={styles.emptyText}>No active strategies yet</Text>
                            <Text style={styles.emptySubtext}>
                                Start following strategies to see them here
                            </Text>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBorder}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="brain" size={26} color="#34C759" />
                        <Text style={styles.title}>Active Strategies</Text>
                    </View>

                    {/* Strategy Cards */}
                    {activeStrategies.map(strategy => (
                        <TouchableOpacity key={strategy._id} style={styles.strategyCard} onPress={() => handleViewPerformance(strategy._id)}>
                            <View style={styles.strategyHeader}>
                                <View style={styles.strategyMainInfo}>
                                    <Text style={styles.strategyName}>{strategy.name}</Text>
                                    <Text style={styles.strategyType}>
                                        {strategy.strategyType || 'Custom'} • {strategy.assetClass || '—'}
                                    </Text>
                                </View>

                                <View style={styles.actionsRow}>
                                    {/* Status Toggle */}
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: strategy.statusColor },
                                        ]}
                                    >
                                        <Text style={styles.statusText}>{strategy.status}</Text>
                                    </View>

                                    {/* Play/Pause icon */}
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPress={() => handleToggleStatus(strategy._id)}
                                    >
                                        <Ionicons
                                            name={strategy.status === 'Active' ? 'pause' : 'play'}
                                            size={22}
                                            color="#e5e7eb"
                                        />
                                    </TouchableOpacity>

                                    {/* Unfollow */}
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPress={() => handleUnfollow(strategy._id, strategy.name)}
                                    >
                                        <MaterialCommunityIcons name="account-minus" size={22} color="#f87171" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Description (optional - truncate if too long) */}
                            {strategy.description && (
                                <Text style={styles.description} numberOfLines={2}>
                                    {strategy.description}
                                </Text>
                            )}

                            {/* Metrics */}
                            <View style={styles.metricsRow}>
                                <View style={styles.metric}>
                                    <Text
                                        style={[
                                            styles.metricValue,
                                            {
                                                color: String(strategy.pnl || '').startsWith('-')
                                                    ? '#f87171'
                                                    : '#34C759',
                                            },
                                        ]}
                                    >
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
                                    <Text style={styles.metricValue}>{strategy.trades || '—'}</Text>
                                    <Text style={styles.metricLabel}>Trades</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    gradientBorder: { borderRadius: 16, padding: 1.5 },
    innerGradient: { borderRadius: 14.5, padding: 16 },
    // innerContainer: { borderRadius: 14.5, padding: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f3f4f6',
        marginLeft: 10,
    },

    strategyCard: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    strategyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    strategyMainInfo: { flex: 1 },
    strategyName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#f3f4f6',
        marginBottom: 3,
        textTransform: 'capitalize',
    },
    strategyType: {
        fontSize: 13,
        color: '#9ca3af',
    },

    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    controlButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    description: {
        fontSize: 13,
        color: '#9ca3af',
        lineHeight: 18,
        marginBottom: 12,
    },

    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    metric: { alignItems: 'center', flex: 1 },
    metricValue: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },

    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e5e7eb',
        textAlign: 'center',
        marginVertical: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
});

export default ActiveStrategies;