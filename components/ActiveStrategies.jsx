// components/ActiveStrategies.jsx
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';
import { AlgoTradingContext } from '@/context/AlgoTradingContext';
import { router } from 'expo-router';

const ActiveStrategies = () => {
    const { strategies, toggleFollow, refreshStrategies, updateStrategyLocalStatus } = useContext(CopyStrategyContext);
    const { updateStategyStatus } = useContext(AlgoTradingContext);

    const [selectedAssetClass, setSelectedAssetClass] = useState('ALL');
    const [localStatuses, setLocalStatuses] = useState({});

    const activeStrategies = strategies.filter(s => s.isFollowing === true);

    // Define asset classes for tabs
    const assetClasses = [
        { key: 'ALL', label: 'All', icon: 'apps' },
        { key: 'FOREX', label: 'Forex', icon: 'currency-usd' },
        { key: 'CRYPTO', label: 'Crypto', icon: 'bitcoin' },
        { key: 'COMMODITIES', label: 'Commodities', icon: 'chart-line' },
        { key: 'INDICES', label: 'Indices', icon: 'trending-up' },
        { key: 'STOCKS', label: 'Stocks', icon: 'finance' },
        { key: 'OTHERS', label: 'Others', icon: 'dots-horizontal' }
    ];

    // Filter strategies based on selected asset class
    const filteredStrategies = activeStrategies.filter(strategy => {
        if (selectedAssetClass === 'ALL') return true;
        return strategy.assetClass === selectedAssetClass;
    });

    // console.log('activeStrategies', activeStrategies);
    // console.log('filteredStrategies', filteredStrategies);

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

    // Helper function to get asset class specific styles
    const getAssetClassStyle = (assetClass) => {
        switch (assetClass) {
            case 'FOREX': return styles.tagForex;
            case 'CRYPTO': return styles.tagCrypto;
            case 'COMMODITIES': return styles.tagCommodities;
            case 'INDICES': return styles.tagIndices;
            case 'STOCKS': return styles.tagStocks;
            default: return styles.tagOthers;
        }
    };

    // Render tab item
    const renderTab = (tab) => (
        <TouchableOpacity
            key={tab.key}
            style={[
                styles.tab,
                selectedAssetClass === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedAssetClass(tab.key)}
        >
            <MaterialCommunityIcons
                name={tab.icon}
                size={18}
                color={selectedAssetClass === tab.key ? '#22c55e' : '#94a3b8'}
            />
            <Text style={[
                styles.tabText,
                selectedAssetClass === tab.key && styles.activeTabText
            ]}>
                {tab.label}
            </Text>
        </TouchableOpacity>
    );

    if (activeStrategies.length === 0) {
        return (
            <LinearGradient
                colors={['#1e2937', '#0f172a']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="brain" size={52} color="#475569" />
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
                    <Text style={styles.countText}>{filteredStrategies.length}</Text>
                </View>
            </View>

            {/* Tabs Section */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsList}
                >
                    {assetClasses.map(tab => renderTab(tab))}
                </ScrollView>
            </View>

            {/* Strategy List */}
            {filteredStrategies.length === 0 ? (
                <View style={styles.noResultsContainer}>
                    <MaterialCommunityIcons name="filter-remove" size={48} color="#475569" />
                    <Text style={styles.noResultsText}>
                        No {selectedAssetClass !== 'ALL' ? selectedAssetClass.toLowerCase() : ''} strategies available
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStrategies}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item: strategy }) => {
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
                                        <View style={styles.typeContainer}>
                                            <View style={[styles.assetTag, getAssetClassStyle(strategy.assetClass)]}>
                                                <Text style={styles.assetTagText}>{strategy.assetClass || '—'}</Text>
                                            </View>
                                            <Text style={styles.strategyType}>
                                                {strategy.strategyType || 'Custom'}
                                            </Text>
                                        </View>
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

                                {/* Tags */}
                                <View style={styles.tagsContainer}>
                                    {strategy.symbols?.slice(0, 2).map((symbol, i) => (
                                        <View key={i} style={styles.tag}>
                                            <Text style={styles.tagText}>{symbol}</Text>
                                        </View>
                                    ))}
                                    {strategy.timeframes?.slice(0, 2).map((tf, i) => (
                                        <View key={i} style={styles.tag}>
                                            <Text style={styles.tagText}>{tf}</Text>
                                        </View>
                                    ))}
                                    {strategy.tags?.slice(0, 2).map((tag, i) => (
                                        <View key={i} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>

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
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        flex: 1,
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
    tabsContainer: {
        marginBottom: 16,
    },
    tabsList: {
        paddingHorizontal: 4,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1e2937',
        gap: 6,
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeTab: {
        backgroundColor: '#14532d',
        borderColor: '#22c55e',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#22c55e',
    },
    listContent: {
        paddingBottom: 20,
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
        marginRight: 12,
    },
    strategyName: {
        fontSize: 17.5,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 6,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    assetTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    assetTagText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    strategyType: {
        fontSize: 12,
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
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 6,
    },
    tag: {
        backgroundColor: '#0f172a',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagText: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '500',
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
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        color: '#64748b',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 12,
    },
    tagForex: { backgroundColor: '#059669' },
    tagCrypto: { backgroundColor: '#8B5CF6' },
    tagCommodities: { backgroundColor: '#D97706' },
    tagIndices: { backgroundColor: '#DC2626' },
    tagStocks: { backgroundColor: '#0891B2' },
    tagOthers: { backgroundColor: '#6B7280' },
});