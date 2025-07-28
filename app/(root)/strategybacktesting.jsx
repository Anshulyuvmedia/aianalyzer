import { StyleSheet, View, FlatList, Text, TextInput, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, Foundation } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const StrategyBacktesting = () => {
    const [parameters, setParameters] = useState({
        timePeriod: '1',
        initialCapital: '10000',
        commission: '0.1',
    });
    const [results, setResults] = useState({
        totalReturn: 15.5,
        sharpeRatio: 1.8,
        maxDrawdown: -8.3,
        winRate: 65,
    });
    const [log, setLog] = useState([
        { id: '1', date: '2025-07-25 06:27 PM', event: 'Backtest Started', status: 'Success' },
    ]);

    const handleParameterChange = (key, value) => {
        setParameters((prev) => ({ ...prev, [key]: value }));
    };

    const handleRunBacktest = () => {
        setResults({
            totalReturn: (Math.random() * 20).toFixed(1),
            sharpeRatio: (Math.random() * 2).toFixed(1),
            maxDrawdown: -(Math.random() * 10).toFixed(1),
            winRate: (Math.random() * 100).toFixed(0),
        });
        setLog([...log, { id: `${Date.now()}`, date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), event: 'Backtest Ran', status: 'Success' }]);
    };

    const renderConfigItem = ({ item }) => (
        <View style={styles.configItem}>
            <Text style={styles.configLabel}>
                {item.key === 'timePeriod' ? 'Time Period' : item.key === 'initialCapital' ? 'Initial Capital' : 'Commission'}
            </Text>
            <TextInput
                style={styles.configInput}
                value={parameters[item.key]}
                onChangeText={(text) => handleParameterChange(item.key, text)}
                keyboardType={item.key === 'initialCapital' || item.key === 'commission' ? 'numeric' : 'default'}
                placeholder={
                    item.key === 'timePeriod'
                        ? '1 Year'
                        : item.key === 'initialCapital'
                            ? '10000'
                            : '0.1'
                }
                placeholderTextColor="#A9A9A9"
            />
        </View>
    );

    const renderCardItem = ({ item }) => {
        const cardMeta = {
            totalReturn: {
                icon: <Ionicons name="trending-up" size={width * 0.06} color="#000" />,
                gradient: ['#1A2E23', '#0C0C18'],
                iconBg: '#05ff93',
                valueColor: '#05FF93',
                format: (v) => parseFloat(v).toFixed(2),
            },
            sharpeRatio: {
                icon: <Ionicons name="bar-chart-outline" size={width * 0.06} color="#fff" />,
                gradient: ['#1A1A2E', '#16213E'],
                iconBg: '#0057ff',
                valueColor: '#4F8CFF',
                format: (v) => parseFloat(v).toFixed(2),
            },
            maxDrawdown: {
                icon: <Ionicons name="trending-down" size={width * 0.06} color="#fff" />,
                gradient: ['#2E1A1A', '#180C0C'],
                iconBg: '#ff0505',
                valueColor: '#FF3B3B',
                format: (v) => `${parseFloat(v).toFixed(1)}%`,
            },
            winRate: {
                icon: <Foundation name="target-two" size={width * 0.06} color="#fff" />,
                gradient: ['#241A2E', '#1B1022'],
                iconBg: '#7709ff',
                valueColor: '#B97AFF',
                format: (v) => `${parseFloat(v).toFixed(1)}%`,
            },
        };
        const meta = cardMeta[item.key] || {};

        return (
            <View style={styles.card}>
                <LinearGradient
                    colors={meta.gradient || ['#23233A', '#181824']}
                    start={{ x: 0.1, y: 0.8 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardContent}>
                        <View>
                            <Text style={styles.cardTitle}>{item.key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                            <Text style={[styles.cardValue, { color: meta.valueColor || '#FFF' }]}>
                                {meta.format ? meta.format(item.value) : item.value}
                            </Text>
                        </View>
                        <View style={[styles.cardIcon, { backgroundColor: meta.iconBg || '#333' }]}>
                            {meta.icon || <Text>Icon Missing</Text>}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Strategy Backtesting'} />
            <View style={styles.gradientBackground}>
                <FlatList
                    data={[
                        { type: 'configs' },
                        { type: 'cards' },
                        { type: 'chart' },
                    ]}
                    renderItem={({ item }) => {
                        switch (item.type) {
                            case 'configs':
                                return (
                                    <View style={styles.configsContainer}>
                                        <Text style={styles.sectionTitle}>Backtest Configurations</Text>
                                        <FlatList
                                            data={Object.entries(parameters).map(([key, value]) => ({ key, value }))}
                                            renderItem={renderConfigItem}
                                            keyExtractor={(item) => item.key}
                                            contentContainerStyle={styles.configsList}
                                            numColumns={2}
                                            columnWrapperStyle={styles.cardsGrid}
                                        />
                                        <TouchableOpacity style={styles.runButton} onPress={handleRunBacktest}>
                                            <LinearGradient
                                                colors={['#0057ff', '#003087']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.runButtonGradient}
                                            >
                                                <Ionicons name="play-outline" size={width * 0.06} color="white" style={styles.runButtonIcon} />
                                                <Text style={styles.runButtonText}>Run Backtest</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                );
                            case 'cards':
                                return (
                                    <View style={styles.cardsContainer}>
                                        <Text style={styles.sectionTitle}>Key Metrics</Text>
                                        <FlatList
                                            data={Object.entries(results).map(([key, value]) => ({ key, value }))}
                                            renderItem={renderCardItem}
                                            keyExtractor={(item) => item.key}
                                            numColumns={2}
                                            columnWrapperStyle={styles.cardsGrid}
                                            contentContainerStyle={styles.cardsList}
                                        />
                                    </View>
                                );
                            case 'chart':
                                return (
                                    <View style={styles.chartContainer}>
                                        <Text style={styles.sectionTitle}>Performance vs Benchmark</Text>
                                        <LineChart
                                            data={{
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                                                datasets: [{ data: [10, 20, 15, 25, 22, 30, 18] }],
                                            }}
                                            width={width * 0.9} // Responsive chart width
                                            height={height * 0.25} // Responsive chart height
                                            yAxisLabel=""
                                            chartConfig={{
                                                decimalPlaces: 0,
                                                color: (opacity = 1) => `rgba(5, 255, 147, ${opacity})`,
                                                labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                                                style: { borderRadius: 16 },
                                                propsForDots: { r: '4', strokeWidth: '1', stroke: '#05FF93' },
                                            }}
                                            bezier
                                            style={styles.chart}
                                        />
                                    </View>
                                );
                            default:
                                return null;
                        }
                    }}
                    keyExtractor={(item) => item.type}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default StrategyBacktesting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: width * 0.025,
    },
    gradientBackground: {
        flex: 1,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    content: {
        padding: width * 0.05,
        paddingBottom: height * 0.025,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: width * 0.05,
        fontWeight: '600',
        marginBottom: height * 0.015,
    },
    configsContainer: {
        marginBottom: height * 0.025,
    },
    configsList: {
        paddingBottom: height * 0.015,
    },
    configItem: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: height * 0.015,
        width: '48%',
        minWidth: width * 0.4,
    },
    configLabel: {
        color: '#A9A9A9',
        fontSize: width * 0.04,
        textTransform: 'capitalize',
        marginBottom: height * 0.01,
    },
    configInput: {
        color: '#FFF',
        fontSize: width * 0.04,
        borderWidth: 1,
        borderColor: 'gray',
        width: '100%',
        borderRadius: 15,
        paddingLeft: width * 0.025,
        paddingVertical: height * 0.01,
    },
    runButton: {
        marginTop: height * 0.02,
        borderRadius: 12,
        overflow: 'hidden',
    },
    runButtonGradient: {
        paddingVertical: height * 0.015,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    runButtonIcon: {
        marginRight: width * 0.02,
    },
    runButtonText: {
        color: '#FFF',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    cardsContainer: {
        marginBottom: height * 0.025,
    },
    cardsGrid: {
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    cardsList: {
        paddingBottom: height * 0.015,
    },
    card: {
        width: '48%',
        minWidth: width * 0.4,
        marginBottom: height * 0.02,
    },
    cardGradient: {
        borderRadius: 20,
        padding: width * 0.04,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        color: '#A9A9A9',
        fontSize: width * 0.035,
        marginBottom: height * 0.01,
        textTransform: 'capitalize',
    },
    cardValue: {
        color: '#FFF',
        fontSize: width * 0.07,
        fontWeight: '400',
    },
    cardIcon: {
        borderRadius: 12,
        padding: width * 0.015,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    chartContainer: {
        marginBottom: height * 0.025,
    },
    chart: {
        borderRadius: 16,
    },
});