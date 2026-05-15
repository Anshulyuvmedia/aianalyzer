// app/(root)/Backtesting/StrategyDetails.jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

const StrategyDetails = () => {
    const { strategyId, userId } = useLocalSearchParams();
    const [strategy, setStrategy] = useState(null);
    const [userStrategy, setUserStrategy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchStrategyDetails();
    }, [strategyId]);

    const fetchStrategyDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');
            const user = JSON.parse(userData);

            const response = await axios.get(
                `${API_BASE_URL}/api/appdata/strategy/${strategyId}?userId=${user._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setStrategy(response.data.data.strategy);
                setUserStrategy(response.data.data.userStrategy);
            }
        } catch (err) {
            console.error('[fetchStrategyDetails] Error:', err);
            Alert.alert('Error', 'Failed to load strategy details');
        } finally {
            setLoading(false);
        }
    };

    const handleRunBacktest = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/(root)/Backtesting/AIGuidance',
            params: { strategyId, preloaded: 'true' },
        });
    };

    const handleShareStrategy = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await Share.share({
                message: `Check out my trading strategy for ${strategy?.symbol}!\n\nEntry: ${strategy?.entryConditions?.slice(0, 2).join(', ')}...\n\nCreated with AI Strategy Backtester`,
                title: `Strategy: ${strategy?.symbol}`,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteStrategy = () => {
        Alert.alert(
            'Delete Strategy',
            'Are you sure you want to delete this strategy?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            const userData = await AsyncStorage.getItem('userData');
                            const user = JSON.parse(userData);

                            await axios.delete(
                                `${API_BASE_URL}/api/appdata/strategy/${strategyId}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    data: { userId: user._id }
                                }
                            );

                            Alert.alert('Success', 'Strategy deleted successfully');
                            router.back();
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
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading strategy...</Text>
            </View>
        );
    }

    if (!strategy) {
        return (
            <View style={styles.centerContainer}>
                <Feather name="alert-circle" size={48} color="#ef4444" />
                <Text style={styles.errorText}>Strategy not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Strategy Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleShareStrategy} style={styles.iconButton}>
                        <Feather name="share-2" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteStrategy} style={styles.iconButton}>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Header Card */}
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerCard}
                >
                    <View style={styles.symbolRow}>
                        <Text style={styles.symbol}>{strategy.symbol}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(strategy.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(strategy.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(strategy.status) }]}>
                                {strategy.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.market}>{strategy.market.toUpperCase()}</Text>
                    <Text style={styles.date}>
                        Created: {new Date(strategy.createdAt).toLocaleDateString()}
                    </Text>
                </LinearGradient>

                {/* Tab Bar */}
                <View style={styles.tabContainer}>
                    {['overview', 'conditions', 'ai-suggestions'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View style={styles.tabContent}>
                        <View style={styles.infoCard}>
                            <Text style={styles.sectionTitle}>Strategy Summary</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Market:</Text>
                                <Text style={styles.infoValue}>{strategy.market.toUpperCase()}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Symbol:</Text>
                                <Text style={styles.infoValue}>{strategy.symbol}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Status:</Text>
                                <Text style={[styles.infoValue, { color: getStatusColor(strategy.status) }]}>
                                    {strategy.status}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Created:</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(strategy.createdAt).toLocaleString()}
                                </Text>
                            </View>
                            {strategy.lastBacktestAt && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Last Backtest:</Text>
                                    <Text style={styles.infoValue}>
                                        {new Date(strategy.lastBacktestAt).toLocaleString()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {userStrategy?.aiSuggestions && (
                            <View style={styles.aiCard}>
                                <Text style={styles.sectionTitle}>🤖 AI Analysis</Text>
                                <Text style={styles.aiAnalysis}>{userStrategy.aiSuggestions.analysis}</Text>
                                {userStrategy.aiSuggestions.recommendations?.map((rec, index) => (
                                    <View key={index} style={styles.recommendationItem}>
                                        <Feather name="check-circle" size={14} color="#22c55e" />
                                        <Text style={styles.recommendationText}>{rec}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Conditions Tab */}
                {activeTab === 'conditions' && (
                    <View style={styles.tabContent}>
                        <View style={styles.conditionCard}>
                            <Text style={styles.sectionTitle}>📈 Entry Conditions</Text>
                            {strategy.entryConditions?.map((condition, index) => (
                                <View key={index} style={styles.conditionItem}>
                                    <View style={[styles.conditionDot, { backgroundColor: '#22c55e' }]} />
                                    <Text style={styles.conditionText}>{condition}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.conditionCard}>
                            <Text style={styles.sectionTitle}>🛑 Stop Loss Conditions</Text>
                            {strategy.stopLossConditions?.map((condition, index) => (
                                <View key={index} style={styles.conditionItem}>
                                    <View style={[styles.conditionDot, { backgroundColor: '#ef4444' }]} />
                                    <Text style={styles.conditionText}>{condition}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.conditionCard}>
                            <Text style={styles.sectionTitle}>🎯 Target Conditions</Text>
                            {strategy.targetConditions?.map((condition, index) => (
                                <View key={index} style={styles.conditionItem}>
                                    <View style={[styles.conditionDot, { backgroundColor: '#3b82f6' }]} />
                                    <Text style={styles.conditionText}>{condition}</Text>
                                </View>
                            ))}
                        </View>

                        {strategy.exitConditions?.length > 0 && (
                            <View style={styles.conditionCard}>
                                <Text style={styles.sectionTitle}>🚪 Exit Rules</Text>
                                {strategy.exitConditions.map((condition, index) => (
                                    <View key={index} style={styles.conditionItem}>
                                        <View style={[styles.conditionDot, { backgroundColor: '#eab308' }]} />
                                        <Text style={styles.conditionText}>{condition}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* AI Suggestions Tab */}
                {activeTab === 'ai-suggestions' && userStrategy?.aiSuggestions && (
                    <View style={styles.tabContent}>
                        <View style={styles.paramsCard}>
                            <Text style={styles.sectionTitle}>📊 Recommended Parameters</Text>

                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Duration:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.duration} months</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Timeframe:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.timeframe}</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Sessions:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.sessions}</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Risk per Trade:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.riskPerTrade}%</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Direction:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.direction}</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Max Trades:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.maxTrades}</Text>
                            </View>
                            <View style={styles.paramRow}>
                                <Text style={styles.paramLabel}>Slippage:</Text>
                                <Text style={styles.paramValue}>{userStrategy.aiSuggestions.slippage} pips</Text>
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📅 Trading Days</Text>
                            <View style={styles.daysGrid}>
                                {Object.entries(userStrategy.aiSuggestions.days || {}).map(([day, enabled]) => (
                                    <View key={day} style={[styles.dayBadge, enabled && styles.dayBadgeActive]}>
                                        <Text style={[styles.dayText, enabled && styles.dayTextActive]}>
                                            {day.slice(0, 3)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Action Button */}
                <TouchableOpacity style={styles.runButton} onPress={handleRunBacktest}>
                    <Feather name="play" size={20} color="#fff" />
                    <Text style={styles.runButtonText}>Run Backtest</Text>
                </TouchableOpacity>
            </ScrollView>
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
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginTop: 12,
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
    backButtonText: {
        color: '#3b82f6',
        fontSize: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    headerCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    symbolRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    symbol: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    market: {
        color: '#60a5fa',
        fontSize: 14,
        marginBottom: 8,
    },
    date: {
        color: '#64748b',
        fontSize: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
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
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    tabContent: {
        gap: 16,
    },
    infoCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    infoLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    infoValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    aiCard: {
        backgroundColor: '#1e40af20',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#3b82f630',
    },
    aiAnalysis: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    recommendationText: {
        color: '#cbd5e1',
        fontSize: 13,
        flex: 1,
    },
    conditionCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
    },
    conditionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    conditionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    conditionText: {
        color: '#cbd5e1',
        fontSize: 13,
        flex: 1,
    },
    paramsCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
    },
    paramRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    paramLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    paramValue: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    dayBadge: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    dayBadgeActive: {
        backgroundColor: '#3b82f6',
    },
    dayText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    dayTextActive: {
        color: '#fff',
    },
    runButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 24,
        marginBottom: 32,
        gap: 8,
    },
    runButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default StrategyDetails;