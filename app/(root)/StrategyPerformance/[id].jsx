import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import HomeHeader from '@/components/HomeHeader';
import AiTrading from '@/components/AiTrading';
import { AlgoTradingContext } from "@/context/AlgoTradingContext";
import { useLocalSearchParams } from 'expo-router';
import { CopyStrategyContext } from '../../../context/CopyStrategyContext';

const StrategyPerformance = () => {
    const { id } = useLocalSearchParams();
    const { algotradingData } = useContext(AlgoTradingContext);
    const { strategies } = useContext(CopyStrategyContext);
    const strategy = strategies?.find(s => s._id === id);

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
    const aitrading = algotradingData?.aiTrading;
    return (
        <View style={styles.container}>
            <HomeHeader page="" title="Algo Trading" subtitle="Manage and monitor your automated trading strategies" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AiTrading data={aitrading} strategy={strategy} />
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