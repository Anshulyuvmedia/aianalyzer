import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, } from 'react-native'
import HomeHeader from '@/components/HomeHeader';
import AiTrading from '@/components/AiTrading';
import { AlgoTradingContext } from "@/context/AlgoTradingContext";
import { useLocalSearchParams } from 'expo-router';
import { CopyStrategyContext } from '../../../context/CopyStrategyContext';
import RecentAlgoTrades from '@/components/RecentAlgoTrades';
import { connectSocket, subscribeToStrategies } from '../../../lib/socketService';

const StrategyPerformance = () => {
    const { id } = useLocalSearchParams();
    const { algotradingData, trades, pnl, resetTrades, lastTradeTime, engineStatus, engineLogs } = useContext(AlgoTradingContext);
    const { strategies } = useContext(CopyStrategyContext);
    // const strategy = strategies?.find(s => s._id === id);
    const aitrading = algotradingData?.aiTrading;
    const [localStrategy, setLocalStrategy] = useState(null);
    const strategy = localStrategy;

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
            // subscribe once
            subscribeToStrategies([id]);
            handleReconnect = () => {
                console.log("✅ Reconnected");
                subscribeToStrategies([id]);
            };
            socket.on("connect", handleReconnect);
        };
        init();
        return () => {
            // unsubscribeFromStrategies([id]);
            if (socket && handleReconnect) {
                socket.off("connect", handleReconnect);
            }
        };
    }, [id]);

    if (!strategy) {
        return (
            <View style={styles.container}>
                <HomeHeader page="" title="Strategy Not Found" />
                <View style={styles.centerMessage}>
                    <Text style={styles.errorText}>Strategy #{id} not found</Text>
                </View>
            </View>
        );
    }
    // console.log('strategies', strategies);
    return (
        <View style={styles.container}>
            <HomeHeader page="" title="Algo Trading" subtitle={strategy?.description} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AiTrading data={aitrading} strategy={strategy} lastTradeTime={lastTradeTime} engineStatus={engineStatus} engineLogs={engineLogs} />
                <RecentAlgoTrades data={trades} pnl={pnl} strategy={strategy} />
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
})