import React, { useContext, useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native'
import HomeHeader from '@/components/HomeHeader';
import AiTrading from '@/components/AiTrading';
import { AlgoTradingContext } from "@/context/AlgoTradingContext";
import { useLocalSearchParams } from 'expo-router';
import { CopyStrategyContext } from '../../../context/CopyStrategyContext';
import RecentAlgoTrades from '@/components/RecentAlgoTrades';
import { connectSocket, subscribeToStrategies, unsubscribeFromStrategies } from '../../../lib/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY_PREFIX = 'stratConfig_';

const StrategyPerformance = () => {
    const { id } = useLocalSearchParams();
    const { algotradingData, trades, pnl, resetTrades, lastTradeTime, engineStatus, engineLogs, updateStategyStatus } = useContext(AlgoTradingContext);
    const { strategies, loading, toggleFollow } = useContext(CopyStrategyContext);
    const [localStrategy, setLocalStrategy] = useState(null);
    const [userConfig, setUserConfig] = useState(null);
    const [configLoaded, setConfigLoaded] = useState(false);

    const pnlValue = pnl?.pnl ?? pnl?.value ?? 0;

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const stored = await AsyncStorage.getItem(`${CONFIG_KEY_PREFIX}${id}`);
                if (stored) setUserConfig(JSON.parse(stored));
            } catch (e) {
                console.warn('Failed to load strategy config:', e);
            } finally {
                setConfigLoaded(true);
            }
        };
        if (id) loadConfig();
    }, [id]);

    const handleSaveConfig = useCallback(async (strategyId, config) => {
        setUserConfig(config);
        try {
            await AsyncStorage.setItem(`${CONFIG_KEY_PREFIX}${strategyId}`, JSON.stringify(config));
            return true;
        } catch (e) {
            console.warn('Failed to save strategy config:', e);
            return false;
        }
    }, []);

    const handleToggleStatus = (strategyId) => {
        const strategy = strategies.find(s => s._id === strategyId);
        if (!strategy) return;
        const live = algotradingData?.strategies?.find(s => s._id === strategyId);
        const currentStatus = live?.status || strategy.status || 'Paused';
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        updateStategyStatus(strategy, newStatus, {
            lotSize: parseFloat(userConfig?.lotSize) || 0.01,
            riskPerTradePercent: parseFloat(userConfig?.riskPercent) || 1
        });
    };

    const handleUnfollow = async (strategyId) => {
        const strategy = strategies.find(s => s._id === strategyId);
        if (!strategy) return;
        const live = algotradingData?.strategies?.find(s => s._id === strategyId);
        if (live?.status === 'Active' || strategy.status === 'Active') {
            await updateStategyStatus(strategy, 'Paused');
        }
        toggleFollow(strategyId, false);
    };

    useEffect(() => {
        const found = strategies?.find(s => s._id === id);
        if (found) setLocalStrategy(found);
    }, [strategies, id]);

    useEffect(() => {
        if (!id) return;
        resetTrades();
        let socket;
        let handleReconnect;
        const init = async () => {
            socket = await connectSocket();
            subscribeToStrategies([id]);
            handleReconnect = () => {
                subscribeToStrategies([id]);
            };
            socket.on("connect", handleReconnect);
        };
        init();
        return () => {
            unsubscribeFromStrategies([id]);
            if (socket && handleReconnect) {
                socket.off("connect", handleReconnect);
            }
        };
    }, [id]);

    if (loading && !localStrategy) {
        return (
            <View style={styles.container}>
                <HomeHeader page="" title="Loading..." />
                <View style={styles.centerMessage}>
                    <ActivityIndicator size="large" color="#22c55e" />
                </View>
            </View>
        );
    }

    if (!localStrategy) {
        return (
            <View style={styles.container}>
                <HomeHeader page="" title="Strategy Not Found" />
                <View style={styles.centerMessage}>
                    <Text style={styles.errorText}>Strategy #{id} not found</Text>
                </View>
            </View>
        );
    }

    const capital = localStrategy.defaultConfig?.initialCapital || 10000;

    return (
        <View style={styles.container}>
            <HomeHeader page="" title="Strategy Results" subtitle={localStrategy?.description} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AiTrading
                    strategy={localStrategy}
                    algotradingData={algotradingData}
                    lastTradeTime={lastTradeTime}
                    pnl={pnlValue}
                    engineStatus={engineStatus}
                    onToggleStatus={handleToggleStatus}
                    onUnfollow={handleUnfollow}
                    userConfig={userConfig}
                    configLoaded={configLoaded}
                    onSaveConfig={handleSaveConfig}
                    capital={capital}
                />
                <RecentAlgoTrades data={trades} pnl={pnl} />
            </ScrollView>
        </View>
    )
}

export default StrategyPerformance

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    centerMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 20,
    },
})
