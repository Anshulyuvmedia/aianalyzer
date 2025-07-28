import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, RefreshControl, TextInput } from 'react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import RBSheet from 'react-native-raw-bottom-sheet';

// Move stockData outside component to prevent re-creation
const stockData = [
    { id: '1', title: 'RELIANCE', company: 'Reliance Industries Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)', peRatio: 24.56 },
    { id: '2', title: 'TCS', company: 'Tata Consultancy Services Ltd', value: '4056.90', volume: '987,654', mcap: '14.8L Cr', change: '+15.20 (0.85%)', peRatio: 28.90 },
    { id: '3', title: 'HDFCBANK', company: 'HDFC Bank Ltd', value: '1650.30', volume: '2,345,678', mcap: '12.5L Cr', change: '-10.50 (0.60%)', peRatio: 22.30 },
    { id: '4', title: 'INFY', company: 'Infosys Ltd', value: '1850.45', volume: '1,567,890', mcap: '10.9L Cr', change: '+8.90 (0.50%)', peRatio: 25.75 },
    { id: '5', title: 'ICICIBANK', company: 'ICICI Bank Ltd', value: '1250.60', volume: '1,890,123', mcap: '11.2L Cr', change: '+12.30 (0.95%)', peRatio: 20.15 },
];

const StockDetails = () => {
    const { id } = useLocalSearchParams();
    const sheetRef = useRef(null);
    const router = useRouter();

    // State management
    const [priceChartData, setPriceChartData] = useState([
        { time: '9:30', price: 2600 },
        { time: '10:30', price: 2610 },
        { time: '11:30', price: 2595 },
        { time: '12:00', price: 2605 },
        { time: '1:00', price: 2600 },
        { time: '2:00', price: 2615 },
        { time: '3:00', price: 2600 },
    ]);
    const [fundamentalsData, setFundamentalsData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [action, setAction] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('Market');

    // Memoize stock to prevent unnecessary re-renders
    const stock = useMemo(() => stockData.find((item) => item.id === id), [id]);

    // Calculate total value (always call useMemo, even if stock is undefined)
    const totalValue = useMemo(() => {
        if (!stock) return 0;
        const qty = Number(quantity);
        const price = Number((stock.value || '0').replace(',', ''));
        return isNaN(qty) ? 0 : (qty * price).toFixed(2);
    }, [quantity, stock?.value, stock]);

    // Use useEffect instead of conditional useMemo
    useEffect(() => {
        if (stock) {
            setFundamentalsData([
                { label: 'P/E Ratio', value: stock.peRatio },
                { label: 'Volume', value: stock.volume },
                { label: 'Market Cap', value: stock.mcap },
                { label: 'Dividend Yield', value: '1.5%' },
                { label: 'EPS', value: '95.30' },
                { label: 'Beta', value: '1.2' },
            ]);
        }
    }, [stock]);

    // Early return if stock is not found
    if (!stock) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Stock not found</Text>
            </View>
        );
    }

    // Calculate dynamic yAxisInterval for LineChart
    const prices = priceChartData.map((data) => data.price);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const yAxisInterval = Math.max(10, Math.round(priceRange / 5));

    const chartData = {
        labels: priceChartData.map((data) => data.time),
        datasets: [
            {
                data: priceChartData.map((data) => data.price),
                color: (opacity = 1) => `rgba(96, 157, 249, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const screenWidth = Dimensions.get('window').width - 40;

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setPriceChartData([
                { time: '9:30', price: 2600 },
                { time: '10:30', price: 2610 },
                { time: '11:30', price: 2595 },
                { time: '12:00', price: 2605 },
                { time: '1:00', price: 2600 },
                { time: '2:00', price: 2615 },
                { time: '3:00', price: 2600 },
            ]);
            setFundamentalsData([
                { label: 'P/E Ratio', value: stock.peRatio },
                { label: 'Volume', value: stock.volume },
                { label: 'Market Cap', value: stock.mcap },
                { label: 'Dividend Yield', value: '1.5%' },
                { label: 'EPS', value: '95.30' },
                { label: 'Beta', value: '1.2' },
            ]);
            setRefreshing(false);
        }, 1000);
    };

    const renderFundamentalItem = ({ item }) => (
        <LinearGradient
            colors={['#2A2A3D', '#1E1E2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fundamentalItem}
        >
            <Text style={styles.fundamentalLabel}>{item.label}</Text>
            <Text style={styles.fundamentalValue}>{item.value}</Text>
        </LinearGradient>
    );

    const openSheet = (type) => {
        setAction(type);
        setQuantity('');
        setOrderType('Market');
        sheetRef.current?.open();
    };

    const handleToggleOrderType = (type) => {
        setOrderType(type);
    };

    const handleConfirm = () => {
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        // Navigate to confirmation screen
        router.push({
            pathname: '/stockdiscovery/confirmorder',
            params: { stock: stock.title, action, quantity: `${quantity} shares`, orderType, price: stock.value, totalValue }
        });
        sheetRef.current?.close();
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={stock.title} />
            <View style={styles.headerSection}>
                <View>
                    <Text style={styles.title}>{stock.title}</Text>
                    <Text style={styles.company}>{stock.company}</Text>
                </View>
                <View style={styles.valueContainer}>
                    <Text style={styles.value}>₹{stock.value}</Text>
                    <Text style={[styles.change, stock.change.includes('-') ? styles.negativeChange : styles.positiveChange]}>
                        {stock.change}
                    </Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Price Chart</Text>
                <LineChart
                    data={chartData}
                    width={screenWidth}
                    height={200}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    yAxisInterval={yAxisInterval}
                    chartConfig={{
                        backgroundGradientFrom: '#2A2A3D',
                        backgroundGradientTo: '#1E1E2F',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    bezier
                    withVerticalLines={false}
                    style={styles.chartLine}
                />
            </View>

            <View style={styles.fundamentalsContainer}>
                <Text style={styles.sectionTitle}>Fundamentals</Text>
                <FlatList
                    data={fundamentalsData}
                    renderItem={renderFundamentalItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.fundamentalsGrid}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.fundamentalsList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#05FF93']} />
                    }
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => openSheet('Buy')}
                    accessibilityLabel={`Buy ${stock.title} stock`}
                    style={[styles.actionButton, styles.buyButton]}
                >
                    <View>
                        <Text style={styles.buttonText}>Buy</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => openSheet('Sell')}
                    accessibilityLabel={`Sell ${stock.title} stock`}
                    style={[styles.actionButton, styles.sellButton]}
                >
                    <View>
                        <Text style={styles.buttonsellText}>Sell</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <RBSheet
                ref={sheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={700}
                customStyles={{
                    container: styles.sheetContainer,
                    draggableIcon: styles.draggableIcon,
                }}
            >
                <View style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>{action} Order - {stock.title}</Text>
                    <Text style={styles.sheetPrice}>Current Price: ₹{stock.value}</Text>

                    <View style={styles.orderContainer}>
                        <Text style={styles.subtitle}>Quantity:</Text>
                        <TextInput
                            style={styles.quantityInput}
                            placeholder="Enter quantity"
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                            placeholderTextColor="#A9A9A9"
                            accessibilityLabel="Quantity input"
                        />

                        <Text style={styles.subtitle}>Order Type:</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, orderType === 'Market' ? styles.toggleButtonActive : null]}
                                onPress={() => handleToggleOrderType('Market')}
                            >
                                <Text style={[styles.orderbuttonText, orderType === 'Market' ? styles.activeButtonText : null]}>
                                    Market
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, orderType === 'Limit' ? styles.toggleButtonActive : null]}
                                onPress={() => handleToggleOrderType('Limit')}
                            >
                                <Text style={[styles.orderbuttonText, orderType === 'Limit' ? styles.activeButtonText : null]}>
                                    Limit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.orderSummary}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Current Price:</Text>
                            <Text style={styles.summaryValue}>₹{stock.value}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Quantity:</Text>
                            <Text style={styles.summaryValue}>{quantity || 0} shares</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.subtitle}>Order Type:</Text>
                            <Text style={styles.summaryValue}>{orderType}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.subtitle}>Total Value:</Text>
                            <Text style={styles.totalValue}>₹{totalValue}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm transaction"
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>
        </View>
    );
};

export default StockDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,

    },
    headerSection: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '400',
        marginBottom: 5,
    },
    company: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 10,
    },
    valueContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    value: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
    },
    change: {
        fontSize: 16,
        fontWeight: '500',
    },
    positiveChange: {
        color: '#05FF93',
    },
    negativeChange: {
        color: '#FF0505',
    },
    chartContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    chartLine: {
        borderRadius: 16,
    },
    fundamentalsContainer: {
        marginBottom: 25,
        flex: 1,
    },
    fundamentalsGrid: {
        justifyContent: 'space-between',
    },
    fundamentalsList: {
        paddingBottom: 10,
    },
    fundamentalItem: {
        borderRadius: 12,
        padding: 15,
        width: '48%',
        justifyContent: 'center',
        marginBottom: 10,
    },
    fundamentalLabel: {
        color: '#A9A9A9',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
    },
    fundamentalValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
        alignItems: 'center',
        width: '48%',
    },
    buyButton: {
        backgroundColor: '#05FF93',
    },
    sellButton: {
        backgroundColor: '#FF0505',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonsellText: {
        color: '#fffc',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#FF0505',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    sheetContainer: {
        backgroundColor: '#1E1E2F',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    draggableIcon: {
        backgroundColor: '#333',
    },
    sheetContent: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    sheetTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    sheetPrice: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    orderContainer: {
        backgroundColor: '#0f0f1b',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    subtitle: {
        color: '#A9A9A9',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'left',
    },
    quantityInput: {
        backgroundColor: '#2A2A3D',
        borderRadius: 10,
        padding: 10,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    toggleButton: {
        backgroundColor: '#181822',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        width: '48%',
    },
    toggleButtonActive: {
        backgroundColor: '#05FF93',
    },
    confirmButton: {
        backgroundColor: '#05FF93',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    orderbuttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    activeButtonText: {
        color: '#000',
        fontWeight: '700',
    },
    orderSummary: {
        backgroundColor: '#0f0f1b',
        padding: 20,
        borderRadius: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#FFF',
        marginTop: 10,
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 16,
    },
    totalValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
    },
});