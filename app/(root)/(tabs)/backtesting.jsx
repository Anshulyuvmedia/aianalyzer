// app/(root)/(tabs)/backtesting.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    TextInput,
    RefreshControl,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

import HomeHeader from '@/components/HomeHeader';
import { useBacktesting } from '../../../context/BacktestingContext';
import ConditionInput from '../../../components/UserBacktesting/ConditionInput';
import MarketSymbolPicker from '../../../components/UserBacktesting/MarketSymbolPicker';
import SectionHeader from '../../../components/UserBacktesting/SectionHeader';
import StrategyImageUpload from '../../../components/UserBacktesting/StrategyImageUpload';
import { API_BASE_URL } from '@/config/api';

const BackTesting = () => {
    const {
        formData,
        updateFormData,
        aiLoading,
        createStrategy,
        currentStep,
        resetForm,
    } = useBacktesting();

    const [validationErrors, setValidationErrors] = useState({});
    const [userStrategies, setUserStrategies] = useState([]);
    const [loadingStrategies, setLoadingStrategies] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('my-strategies'); // 'my-strategies' or 'create-new'

    // Fetch user's strategies
    const fetchUserStrategies = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const user = JSON.parse(userData);
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.get(
                `${API_BASE_URL}/api/appdata/user-strategies?userId=${user._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data?.success) {
                setUserStrategies(response.data.data);
            }
        } catch (err) {
            console.error('[fetchUserStrategies] Error:', err);
        } finally {
            setLoadingStrategies(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserStrategies();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserStrategies();
    };

    const handleCreateStrategy = async () => {
        const errors = {};
        if (!formData.market) errors.market = 'Please select a market';
        if (!formData.symbol) errors.symbol = 'Please select a symbol';
        if (!formData.entryConditions.trim()) errors.entry = 'Entry conditions required';
        if (!formData.stopLossConditions.trim()) errors.stopLoss = 'Stop loss conditions required';
        if (!formData.targetConditions.trim()) errors.target = 'Target conditions required';

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await createStrategy();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Reset form and close modal
            resetForm();
            setShowCreateModal(false);
            setActiveTab('my-strategies');

            // Refresh strategies list
            await fetchUserStrategies();

            Alert.alert(
                'Strategy Created! 🎯',
                'AI has analyzed your strategy and prepared recommendations.',
                [
                    {
                        text: 'Review Parameters',
                        onPress: () => router.push('/(root)/Backtesting/AIGuidance'),
                    },
                    { text: 'Later', style: 'cancel' },
                ]
            );
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Creation Failed', error.message);
        }
    };

    const handleSelectStrategy = (strategy) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
            `Delete "${strategy.strategyId?.symbol || 'Strategy'}"?`,
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
                                    headers: { Authorization: `Bearer ${token}` },
                                    data: { userId: user._id }
                                }
                            );

                            await fetchUserStrategies();
                            Alert.alert('Success', 'Strategy deleted');
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.error || 'Failed to delete');
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
                style={styles.strategyCard}
                onPress={() => handleSelectStrategy(item)}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.strategyCardGradient}
                >
                    <View style={styles.strategyCardHeader}>
                        <View style={styles.symbolContainer}>
                            <FontAwesome name={getMarketIcon(strategy.market)} size={18} color="#60a5fa" />
                            <Text style={styles.strategySymbol}>{strategy.symbol}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(strategy.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(strategy.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(strategy.status) }]}>
                                {strategy.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.strategyMarket}>{strategy.market.toUpperCase()}</Text>

                    <View style={styles.strategyConditions}>
                        <Text style={styles.conditionsLabel}>Entry:</Text>
                        <Text style={styles.conditionsText} numberOfLines={1}>
                            {strategy.entryConditions?.slice(0, 2).join(', ')}
                        </Text>
                    </View>

                    <View style={styles.strategyFooter}>
                        <View style={styles.strategyStats}>
                            <Feather name="calendar" size={10} color="#64748b" />
                            <Text style={styles.strategyDate}>
                                {new Date(strategy.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.strategyActions}>
                            <TouchableOpacity
                                style={styles.runIconButton}
                                onPress={() => handleSelectStrategy(item)}
                            >
                                <Feather name="play" size={14} color="#3b82f6" />
                                <Text style={styles.runIconText}>Test</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteIconButton}
                                onPress={() => handleDeleteStrategy(item)}
                            >
                                <Feather name="trash-2" size={14} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStrategiesContainer}>
            <Feather name="file-text" size={48} color="#334155" />
            <Text style={styles.emptyTitle}>No Strategies Yet</Text>
            <Text style={styles.emptyText}>
                Create your first trading strategy to get started
            </Text>
            <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => {
                    resetForm();
                    setActiveTab('create-new');
                }}
            >
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.createNewButtonText}>Create New Strategy</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.safeArea} edges={['top']}>
            <HomeHeader
                page="home"
                title="Strategy Studio"
                subtitle="Create & backtest with AI assistance"
            />

            {/* Tab Selector */}
            <View style={styles.mainTabContainer}>
                <TouchableOpacity
                    style={[styles.mainTab, activeTab === 'my-strategies' && styles.activeMainTab]}
                    onPress={() => setActiveTab('my-strategies')}
                >
                    <Feather name="list" size={18} color={activeTab === 'my-strategies' ? '#fff' : '#64748b'} />
                    <Text style={[styles.mainTabText, activeTab === 'my-strategies' && styles.activeMainTabText]}>
                        My Strategies
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mainTab, activeTab === 'create-new' && styles.activeMainTab]}
                    onPress={() => {
                        resetForm();
                        setActiveTab('create-new');
                    }}
                >
                    <Feather name="plus" size={18} color={activeTab === 'create-new' ? '#fff' : '#64748b'} />
                    <Text style={[styles.mainTabText, activeTab === 'create-new' && styles.activeMainTabText]}>
                        Create New
                    </Text>
                </TouchableOpacity>
            </View>

            {/* My Strategies Tab */}
            {activeTab === 'my-strategies' && (
                <ScrollView
                    style={styles.tabContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60a5fa" />
                    }
                >
                    {loadingStrategies ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Loading strategies...</Text>
                        </View>
                    ) : userStrategies.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <View style={styles.strategiesList}>
                            {userStrategies.map((item) => (
                                <View key={item._id}>
                                    {renderStrategyCard({ item })}
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Create New Strategy Tab */}
            {activeTab === 'create-new' && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.tabContent}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.createScrollContent}>
                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressStep}>
                                <View style={[styles.progressCircle, styles.progressCircleActive]}>
                                    <Text style={styles.progressCircleText}>1</Text>
                                </View>
                                <Text style={styles.progressLabel}>Define Strategy</Text>
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressStep}>
                                <View style={[styles.progressCircle, currentStep === 2 && styles.progressCircleActive]}>
                                    <Text style={styles.progressCircleText}>2</Text>
                                </View>
                                <Text style={styles.progressLabel}>Configure & Test</Text>
                            </View>
                        </View>

                        {/* Strategy Form */}
                        <LinearGradient
                            colors={['#1a1a2e', '#16213e', '#0f3460']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.formCard}
                        >
                            <MarketSymbolPicker errors={validationErrors} />

                            <SectionHeader icon="code" title="Strategy Logic" color="#60a5fa" />

                            <StrategyImageUpload />

                            <View style={styles.conditionsGrid}>
                                <ConditionInput
                                    title="Entry Conditions"
                                    value={formData.entryConditions}
                                    onChangeText={(text) => {
                                        updateFormData('entryConditions', text);
                                        if (validationErrors.entry) {
                                            setValidationErrors(prev => ({ ...prev, entry: null }));
                                        }
                                    }}
                                    placeholder="Define when to enter trades..."
                                    color="#22c55e"
                                    example="e.g., RSI crosses below 30"
                                    error={validationErrors.entry}
                                    required
                                />
                                <ConditionInput
                                    title="Stop Loss"
                                    value={formData.stopLossConditions}
                                    onChangeText={(text) => {
                                        updateFormData('stopLossConditions', text);
                                        if (validationErrors.stopLoss) {
                                            setValidationErrors(prev => ({ ...prev, stopLoss: null }));
                                        }
                                    }}
                                    placeholder="Define risk management..."
                                    color="#ef4444"
                                    example="e.g., 1% below entry price"
                                    error={validationErrors.stopLoss}
                                    required
                                />
                                <ConditionInput
                                    title="Take Profit"
                                    value={formData.targetConditions}
                                    onChangeText={(text) => {
                                        updateFormData('targetConditions', text);
                                        if (validationErrors.target) {
                                            setValidationErrors(prev => ({ ...prev, target: null }));
                                        }
                                    }}
                                    placeholder="Define profit targets..."
                                    color="#3b82f6"
                                    example="e.g., 2% above entry"
                                    error={validationErrors.target}
                                    required
                                />
                                <ConditionInput
                                    title="Exit Rules"
                                    value={formData.exitConditions}
                                    onChangeText={(text) => updateFormData('exitConditions', text)}
                                    placeholder="Additional exit rules..."
                                    color="#eab308"
                                    example="e.g., Time-based exit"
                                    optional
                                />
                            </View>

                            {/* AI Insight Banner */}
                            <LinearGradient
                                colors={['#1e3a5f', '#1a2745']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.aiInsightBanner}
                            >
                                <Feather name="cpu" size={24} color="#60a5fa" />
                                <View style={styles.aiInsightContent}>
                                    <Text style={styles.aiInsightTitle}>AI-Powered Strategy Creation</Text>
                                    <Text style={styles.aiInsightText}>
                                        Our AI will analyze your conditions and recommend optimal parameters
                                    </Text>
                                </View>
                            </LinearGradient>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.createButton, aiLoading && styles.createButtonDisabled]}
                                    onPress={handleCreateStrategy}
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? (
                                        <>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={styles.createButtonText}>Analyzing Strategy...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Feather name="zap" size={20} color="#fff" />
                                            <Text style={styles.createButtonText}>Generate AI Strategy</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainTabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 4,
    },
    mainTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    activeMainTab: {
        backgroundColor: '#3b82f6',
    },
    mainTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    activeMainTabText: {
        color: '#fff',
    },
    tabContent: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        color: '#A0AEC0',
        marginTop: 12,
    },
    strategiesList: {
        padding: 16,
        paddingTop: 0,
    },
    strategyCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    strategyCardGradient: {
        padding: 14,
    },
    strategyCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    symbolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    strategySymbol: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    strategyMarket: {
        color: '#60a5fa',
        fontSize: 11,
        marginBottom: 8,
    },
    strategyConditions: {
        marginBottom: 10,
    },
    conditionsLabel: {
        color: '#64748b',
        fontSize: 10,
        marginBottom: 2,
    },
    conditionsText: {
        color: '#94a3b8',
        fontSize: 11,
    },
    strategyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    strategyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    strategyDate: {
        color: '#64748b',
        fontSize: 10,
    },
    strategyActions: {
        flexDirection: 'row',
        gap: 8,
    },
    runIconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f620',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    runIconText: {
        color: '#3b82f6',
        fontSize: 11,
        fontWeight: '500',
    },
    deleteIconButton: {
        padding: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '600',
    },
    emptyStrategiesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
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
    createNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    createNewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    createScrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    progressCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        borderWidth: 2,
        borderColor: '#334155',
    },
    progressCircleActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#60a5fa',
    },
    progressCircleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    progressLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '500',
    },
    progressLine: {
        width: 30,
        height: 2,
        backgroundColor: '#334155',
        marginHorizontal: 6,
    },
    formCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    conditionsGrid: {
        gap: 12,
    },
    aiInsightBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginTop: 16,
        gap: 10,
    },
    aiInsightContent: {
        flex: 1,
    },
    aiInsightTitle: {
        color: '#60a5fa',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    aiInsightText: {
        color: '#94a3b8',
        fontSize: 11,
    },
    actionButtons: {
        marginTop: 20,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    createButtonDisabled: {
        backgroundColor: '#1e293b',
        opacity: 0.7,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default BackTesting;