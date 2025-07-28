import { StyleSheet, View, FlatList, RefreshControl, Dimensions, Text } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import { BarChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

const DetailedMetrics = () => {
    const [refreshing, setRefreshing] = useState(false);

    // Monthly Returns Data
    const monthlyReturnsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                data: [-2, 5, -1, 6, 4, 3, 2, 1, 0, 2, 3, 1],
                colors: [(opacity = 1) => `rgba(96, 157, 249, ${opacity})`],
            },
        ],
    };

    // Detailed Metrics Data
    const metricsData = [
        { label: 'Annualized Return', value: '23.4%' },
        { label: 'Volatility', value: '18.2%' },
        { label: 'Total Trades', value: '247' },
        { label: 'Avg Trade', value: '0.34%' },
        { label: 'Best Trade', value: '12.8%', isPositive: true },
        { label: 'Worst Trade', value: '-5.2%', isNegative: true },
        { label: 'Profit Factor', value: '1.85' },
        { label: 'Calmar Ratio', value: '2.79' },
    ];

    // Dummy Recent Trades Data
    const recentTrades = [
        { date: '2025-07-25', symbol: 'TCS', action: 'BUY', quantity: 100 },
        { date: '2025-07-24', symbol: 'HDFCBANK', action: 'SELL', quantity: 75 },
        { date: '2025-07-23', symbol: 'INFY', action: 'BUY', quantity: 150 },
        { date: '2025-07-22', symbol: 'ICICIBANK', action: 'SELL', quantity: 50 },
        { date: '2025-07-21', symbol: 'RELIANCE', action: 'BUY', quantity: 200 },
        { date: '2025-07-20', symbol: 'TATA', action: 'SELL', quantity: 120 },
    ];

    // Refresh control handler
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            // Simulate data refresh
            setRefreshing(false);
        }, 1000);
    };

    // Combined data structure for FlatList sections
    const combinedData = [
        { type: 'chart', data: null },
        { type: 'metrics', data: metricsData },
        { type: 'trades', data: recentTrades },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'chart':
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.sectionTitle}>Monthly Returns</Text>
                        <BarChart
                            data={monthlyReturnsData}
                            width={Dimensions.get('window').width - 40}
                            height={200}
                            yAxisLabel=""
                            chartConfig={{
                                backgroundGradientFrom: '#1A1A2E',
                                backgroundGradientTo: '#16213E',
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                barPercentage: 0.5,
                            }}
                            style={styles.chart}
                            withInnerLines={false}
                            fromZero={true}
                        />
                    </View>
                );
            case 'metrics':
                return (
                    <View style={styles.metricsContainer}>
                        <Text style={styles.sectionTitle}>Detailed Metrics</Text>
                        <FlatList
                            data={item.data}
                            renderItem={renderMetricItem}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.metricsGrid}
                            contentContainerStyle={styles.metricsList}
                        />
                    </View>
                );
            case 'trades':
                return (
                    <View style={styles.tradesContainer}>
                        <Text style={styles.sectionTitle}>Recent Trades</Text>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Date</Text>
                            <Text style={styles.tableHeaderText}>Symbol</Text>
                            <Text style={styles.tableHeaderText}>Action</Text>
                            <Text style={styles.tableHeaderText}>Quantity</Text>
                        </View>
                        <FlatList
                            data={item.data}
                            renderItem={renderTradeItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.tradesList}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    const renderMetricItem = ({ item }) => (
        <View style={styles.metricBorder}>
            <LinearGradient
                colors={['#4E4E6A', '#2A2A40']} // Gradient for border effect
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={styles.gradientBorder}
            >
                <LinearGradient
                    colors={['#13131e', '#1e1e27']} // Gradient for card background
                    start={{ x: 1, y: 0.5 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.metricCard}
                >
                    <Text style={styles.metricLabel}>{item.label}</Text>
                    <Text style={[
                        styles.metricValue,
                        item.isPositive && styles.positiveValue,
                        item.isNegative && styles.negativeValue
                    ]}>{item.value}</Text>
                </LinearGradient>
            </LinearGradient>
        </View>
    );

    const renderTradeItem = ({ item }) => (
        <View style={styles.tradeBorder}>
            <LinearGradient
                colors={['#4E4E6A', '#2A2A40']} // Gradient for border effect
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={styles.gradientBorder}
            >
                <LinearGradient
                    colors={['#2A2A40', '#1E1E2F']}
                    start={{ x: 1, y: 0.5 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.tradeRow}
                >
                    <Text style={styles.tableCell}>{item.date}</Text>
                    <Text style={styles.tableCell}>{item.symbol}</Text>
                    <Text style={[styles.tableCell, item.action === 'SELL' ? styles.sellAction : styles.buyAction]}>
                        {item.action}
                    </Text>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                </LinearGradient>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Dashboard'} />
            <View style={styles.gradientBackground}>
                <FlatList
                    data={combinedData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#05FF93']} />
                    }
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default DetailedMetrics;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
    },
    gradientBackground: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    content: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    chartContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    chart: {
        borderRadius: 16,
    },
    metricsContainer: {
        marginBottom: 20,
    },
    metricsGrid: {
        justifyContent: 'space-between',
    },
    metricsList: {
        paddingBottom: 10,
    },
    metricBorder: {
        borderRadius: 13,
        marginBottom: 15,
        width: '48%', // Adjusted for 2-column layout
    },
    gradientBorder: {
        borderRadius: 12,
        padding: 1, // Creates the border effect
    },
    metricCard: {
        borderRadius: 12,
        padding: 15,
    },
    metricLabel: {
        color: '#A9A9A9',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
    },
    metricValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    positiveValue: {
        color: '#05FF93',
    },
    negativeValue: {
        color: '#FF0505',
    },
    tradesContainer: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tableHeaderText: {
        color: '#A9A9A9',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        textAlign: 'center',
    },
    tradeBorder: {
        borderRadius: 13,
        // borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        marginBottom: 10,

    },
    tradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderRadius: 12,
    },
    tradesList: {
        paddingBottom: 20,
    },
    tableCell: {
        color: '#FFF',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    sellAction: {
        color: '#FF0505',
        fontWeight: '600',
    },
    buyAction: {
        color: '#05FF93',
        fontWeight: '600',
    },
});