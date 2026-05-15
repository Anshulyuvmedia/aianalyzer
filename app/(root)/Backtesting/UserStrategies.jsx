// app/(root)/Backtesting/UserStrategies.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

const UserStrategies = () => {
    const [strategies, setStrategies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchStrategies = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                throw new Error('User not logged in');
            }

            const user = JSON.parse(userData);
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.get(
                `${API_BASE_URL}/api/appdata/user-strategies?userId=${user._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setStrategies(response.data.data);
                setError(null);
            } else {
                throw new Error(response.data?.error || 'Failed to fetch strategies');
            }
        } catch (err) {
            console.error('[fetchStrategies] Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStrategies();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStrategies();
        setRefreshing(false);
    };

    const handleStrategyPress = (strategy) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
            pathname: '/(root)/Backtesting/StrategyDetails',
            params: {
                strategyId: strategy.strategyId._id,
                userId: strategy.userId
            },
        });
    };

    const handleRunBacktest = (strategy) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Navigate to backtest with this strategy
        router.push({
            pathname: '/(root)/Backtesting/AIGuidance',
            params: {
                strategyId: strategy.strategyId._id,
                preloaded: 'true'
            },
        });
    };

    const handleDeleteStrategy = (strategy) => {
        Alert.alert(
            'Delete Strategy',
            `Are you sure you want to delete "${strategy.strategyId?.name || strategy.strategyId?.symbol || 'Strategy'}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        try {
                            const userData = await AsyncStorage.getItem('userData');
                            const user = JSON.parse(userData);
                            const token = await AsyncStorage.getItem('userToken');

                            await axios.delete(
                                `${API_BASE_URL}/api/appdata/strategy/${strategy.strategyId._id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    data: { userId: user._id }
                                }
                            );

                            fetchStrategies();
                            Alert.alert('Success', 'Strategy deleted successfully');
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.error || 'Failed to delete strategy');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'tested': return '#3b82f6';
            case 'draft': return '#eab308';
            case 'archived': return '#64748b';
            default: return '#64748b';
        }
    };

    const getMarketIcon = (market) => {
        switch (market) {
            case 'crypto': return 'bitcoin';
            case 'forex': return 'dollar-sign';
            case 'stocks': return 'trending-up';
            case 'commodities': return 'package';
            default: return 'bar-chart-2';
        }
    };

    const renderStrategyCard = ({ item }) => {
        const strategy = item.strategyId;
        if (!strategy) return null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleStrategyPress(item)}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.symbolContainer}>
                            <Feather name={getMarketIcon(strategy.market)} size={20} color="#60a5fa" />
                            <Text style={styles.symbol}>{strategy.symbol}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(strategy.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(strategy.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(strategy.status) }]}>
                                {strategy.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.market}>{strategy.market.toUpperCase()}</Text>

                    <View style={styles.conditionsPreview}>
                        <Text style={styles.conditionsLabel}>Entry:</Text>
                        <Text style={styles.conditionsText} numberOfLines={1}>
                            {strategy.entryConditions?.slice(0, 2).join(', ')}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Feather name="calendar" size={12} color="#64748b" />
                            <Text style={styles.statText}>
                                {new Date(strategy.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Feather name="layers" size={12} color="#64748b" />
                            <Text style={styles.statText}>
                                {strategy.entryConditions?.length || 0} conditions
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.backtestButton]}
                            onPress={() => handleRunBacktest(item)}
                        >
                            <Feather name="play" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Run Backtest</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteStrategy(item)}
                        >
                            <Feather name="trash-2" size={14} color="#ef4444" />
                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Feather name="file-text" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>No Strategies Yet</Text>
            <Text style={styles.emptyText}>
                Create your first trading strategy to get started
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/(root)/(tabs)/backtesting')}
            >
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Strategy</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading strategies...</Text>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Strategies</Text>
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => router.push('/(root)/(tabs)/backtesting')}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={strategies}
                renderItem={renderStrategyCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60a5fa" />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#A0AEC0',
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    newButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 20,
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    symbol: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    market: {
        color: '#60a5fa',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    conditionsPreview: {
        marginBottom: 12,
    },
    conditionsLabel: {
        color: '#64748b',
        fontSize: 11,
        marginBottom: 4,
    },
    conditionsText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        color: '#64748b',
        fontSize: 11,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    backtestButton: {
        backgroundColor: '#3b82f6',
    },
    deleteButton: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default UserStrategies;