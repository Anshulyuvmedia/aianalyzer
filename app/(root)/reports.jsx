import { StyleSheet, View, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import PerformanceReports from '@/components/PerformanceReports';
import MonthlyPerformance from '@/components/MonthlyPerformance';
import StrategyBreakdown from '@/components/StrategyBreakdown';
import RiskAnalysis from '@/components/RiskAnalysis';
import useReportData from '@/hooks/useReportData';

const Report = () => {
    const { loading, error, refresh, performanceMetrics, equityCurve, monthlyPerformance, strategyBreakdown, riskMetrics } = useReportData();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
        } catch (e) {
            console.log('Refresh failed:', e);
        } finally {
            setRefreshing(false);
        }
    }, [refresh]);

    const sections = [
        { id: 'performance', component: <PerformanceReports metrics={performanceMetrics} equityCurve={equityCurve} /> },
        { id: 'monthly', component: <MonthlyPerformance data={monthlyPerformance} /> },
        { id: 'strategies', component: <StrategyBreakdown data={strategyBreakdown} /> },
        { id: 'risk', component: <RiskAnalysis metrics={riskMetrics} /> },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.section}>
            {item.component}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <HomeHeader page="broker" title="Performance Reports" subtitle="Detailed analysis and export of your trading performance" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#60a5fa" />
                    <Text style={styles.loadingText}>Loading report data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HomeHeader page="broker" title="Performance Reports" subtitle="Detailed analysis and export of your trading performance" />

            <FlatList
                data={sections}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#34C759', '#FF3B15']}
                        progressBackgroundColor="#1e2836"
                    />
                }
            />
        </View>
    )
}

export default Report;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    section: {
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 12,
    },
})