import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Switch, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AlgoNavigation from '@/components/AlgoNavigation';
import RBSheet from 'react-native-raw-bottom-sheet';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const FoxStrategyBuilder = () => {
    const [strategyName, setStrategyName] = useState('');
    const [riskLevel, setRiskLevel] = useState(50);
    const [indicators, setIndicators] = useState({
        movingAverage: false,
        relativeStrengthIndex: false,
        MACD: false,
        bollingerBands: false,
        stochastic: false,
        volumeProfile: false,
        supportResistance: false,
        fibonacciRetracement: false,
    });
    const [entryConditions, setEntryConditions] = useState('');
    const [exitConditions, setExitConditions] = useState('');
    const [stopLoss, setStopLoss] = useState('2.5');
    const [takeProfit, setTakeProfit] = useState('5.0');
    const refRBSheet = useRef(null);

    const toggleIndicator = (indicator) => {
        setIndicators((prev) => ({ ...prev, [indicator]: !prev[indicator] }));
    };

    const sections = [
        {
            id: 'header',
            type: 'header',
        },
        {
            id: 'configuration',
            type: 'configuration',
        },
        {
            id: 'entryExit',
            type: 'entryExit',
        },
        {
            id: 'preview',
            type: 'preview',
        },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View style={styles.section}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.algobox}>
                                <Text style={styles.headerText}>FOX Strategy Builder</Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.backtestButton}
                                        onPress={() => refRBSheet.current?.open()}
                                    >
                                        <Feather name="play" size={width * 0.05} color="black" />
                                        <Text style={styles.actionButtonText}> Backtest</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.strategyButton}>
                                        <Feather name="save" size={width * 0.05} color="white" />
                                        <Text style={styles.actionText}> Save Strategy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                );
            case 'configuration':
                return (
                    <View style={styles.section}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailsTitle}>Strategy Configuration</Text>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Strategy Name</Text>
                                        <LinearGradient
                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                            start={{ x: 0.2, y: 1.2 }}
                                            end={{ x: 0, y: 0 }}
                                            style={styles.gradientBorder}
                                        >
                                            <TextInput
                                                style={styles.inputText}
                                                placeholder="Enter Strategy Name..."
                                                value={strategyName}
                                                onChangeText={setStrategyName}
                                            />
                                        </LinearGradient>
                                    </View>
                                </View>
                                <Text style={styles.label}>Risk Level {riskLevel}%</Text>
                                <View style={styles.slider}>
                                    <View style={[styles.sliderTrack, { width: `${riskLevel}%` }]} />
                                </View>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>Conservative</Text>
                                    <Text style={styles.sliderLabel}>Moderate</Text>
                                    <Text style={styles.sliderLabel}>Aggressive</Text>
                                </View>
                                <Text style={styles.title}>Technical Indicators</Text>
                                {Object.keys(indicators).map((indicator) => (
                                    <View key={indicator} style={styles.checkboxRow}>
                                        <Switch
                                            onValueChange={() => toggleIndicator(indicator)}
                                            value={indicators[indicator]}
                                            trackColor={{ false: '#767676', true: '#05FF93' }}
                                            thumbColor={indicators[indicator] ? '#05FF93' : '#fff'} // Fixed thumb color to green when active
                                        />
                                        <Text style={styles.checkboxLabel}>
                                            {indicator
                                                .split(/(?=[A-Z])/)
                                                .join(' ')
                                                .replace(/^\w/, (c) => c.toUpperCase())}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>
                );
            case 'entryExit':
                return (
                    <View style={styles.section}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailsTitle}>Entry/Exit Rules</Text>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Entry Conditions</Text>
                                        <LinearGradient
                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                            start={{ x: 0.2, y: 1.2 }}
                                            end={{ x: 0, y: 0 }}
                                            style={styles.gradientBorder}
                                        >
                                            <TextInput
                                                style={styles.textarea}
                                                placeholder="Define your entry conditions..."
                                                value={entryConditions}
                                                onChangeText={setEntryConditions}
                                                multiline
                                                numberOfLines={4}
                                                textAlignVertical="top"
                                            />
                                        </LinearGradient>
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Exit Conditions</Text>
                                        <LinearGradient
                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                            start={{ x: 0.2, y: 1.2 }}
                                            end={{ x: 0, y: 0 }}
                                            style={styles.gradientBorder}
                                        >
                                            <TextInput
                                                style={styles.textarea}
                                                placeholder="Define your exit conditions..."
                                                value={exitConditions}
                                                onChangeText={setExitConditions}
                                                multiline
                                                numberOfLines={4}
                                                textAlignVertical="top"
                                            />
                                        </LinearGradient>
                                    </View>
                                </View>
                                <View style={styles.profitRow}>
                                    <View style={styles.inputBox}>
                                        <Text style={styles.label}>Stop Loss %</Text>
                                        <LinearGradient
                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                            start={{ x: 0.2, y: 1.2 }}
                                            end={{ x: 0, y: 0 }}
                                            style={styles.gradientBorder}
                                        >
                                            <TextInput
                                                style={styles.inputText}
                                                value={stopLoss}
                                                onChangeText={setStopLoss}
                                                keyboardType="numeric"
                                            />
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.inputBox}>
                                        <Text style={styles.label}>Take Profit %</Text>
                                        <LinearGradient
                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                            start={{ x: 0.2, y: 1.2 }}
                                            end={{ x: 0, y: 0 }}
                                            style={styles.gradientBorder}
                                        >
                                            <TextInput
                                                style={styles.inputText}
                                                value={takeProfit}
                                                onChangeText={setTakeProfit}
                                                keyboardType="numeric"
                                            />
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                );
            case 'preview':
                return (
                    <View style={styles.section}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailsTitle}>Strategy Preview</Text>
                                <View style={styles.previewBox}>
                                    <Text style={styles.previewText}>{strategyName || 'Untitled Strategy'}</Text>
                                    <Text style={styles.previewSubText}>Risk Level: {riskLevel}% ({riskLevel < 33 ? 'Conservative' : riskLevel < 66 ? 'Moderate' : 'Aggressive'})</Text>
                                    <Text style={styles.previewSubText}>Selected Indicators: {Object.values(indicators).filter(Boolean).length}</Text>
                                    <Text style={styles.previewSubText}>Status: Draft</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerbox}>
                <HomeHeader />
            </View>

            <AlgoNavigation />

            <FlatList
                data={sections}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerbox}
            />

            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    container: {
                        backgroundColor: '#12121c',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: width * 0.05,
                    },
                }}
            >
                <Text style={styles.detailsTitle}>Strategy Backtesting</Text>
                <Text style={styles.previewText}>{strategyName || 'Untitled Strategy'} - AI Strategy</Text>
                <View style={styles.inputRow}>
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Time Period</Text>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <TextInput
                                style={styles.inputText}
                                placeholder="1 Year"
                                defaultValue="1 Year"
                            />
                        </LinearGradient>
                    </View>
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Initial Capital</Text>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 1.2 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <TextInput
                                style={styles.inputText}
                                placeholder="100000"
                                defaultValue="100000"
                                keyboardType="numeric"
                            />
                        </LinearGradient>
                    </View>
                </View>
                <View style={styles.inputRow}>
                    <View style={styles.inputBox}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Commission</Text>
                            <LinearGradient
                                colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                start={{ x: 0.2, y: 1.2 }}
                                end={{ x: 0, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <TextInput
                                    style={styles.inputText}
                                    placeholder="0.1"
                                    defaultValue="0.1"
                                    keyboardType="numeric"
                                />
                            </LinearGradient>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.backtestRunButton} onPress={() => router.push('strategybacktesting')}>
                        <Feather name="play" size={width * 0.05} color="#000" />
                        <Text style={styles.actionButtonText}> Run Backtest</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default FoxStrategyBuilder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerbox: {
        paddingHorizontal: width * 0.04,
    },
    scrollerbox: {
        paddingHorizontal: width * 0.04,
        marginBottom: height * 0.03,
        paddingBottom: height * 0.025,
    },
    section: {
        marginTop: height * 0.025,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.04,
        borderBottomColor: '#3C3B40',
        borderWidth: 1,
        paddingBottom: height * 0.02,
        borderRadius: 20,
    },
    buttonGradientBorder: {
        borderRadius: 100,
        width: '48%',
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: height * 0.02,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: width * 0.04,
        fontFamily: 'Questrial-Regular',
        fontWeight: '500',
    },
    algobox: {
        backgroundColor: '#12121c',
        padding: width * 0.04,
        borderRadius: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: width * 0.025,
    },
    backtestButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05FF93',
        flexGrow: 1,
        paddingVertical: height * 0.015,
    },
    strategyButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0057FF',
        flexGrow: 1,
        paddingVertical: height * 0.015,
    },
    actionText: {
        color: '#fff',
        fontSize: width * 0.04,
    },
    actionButtonText: {
        color: '#000',
        fontSize: width * 0.04,
    },
    headerText: {
        fontFamily: 'Sora-Bold',
        color: '#FFF',
        fontSize: width * 0.05,
        marginBottom: height * 0.015,
    },
    detailsContainer: {
        padding: width * 0.04,
        backgroundColor: '#12121c',
        borderRadius: 20,
    },
    detailsTitle: {
        color: '#FFF',
        fontSize: width * 0.045,
        fontWeight: 'light',
        marginBottom: height * 0.015,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height * 0.015,
        flexWrap: 'wrap',
    },
    profitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: height * 0.015,
    },
    inputGroup: {
        width: '100%',
    },
    inputBox: {
        width: '48%',
        minWidth: width * 0.4,
    },
    title: {
        color: '#fff',
        fontSize: width * 0.035,
        marginBottom: height * 0.015,
        marginRight: width * 0.015,
    },
    label: {
        color: '#A9A9A9',
        fontSize: width * 0.035,
        marginBottom: height * 0.015,
        marginRight: width * 0.015,
    },
    inputText: {
        color: '#FFF',
        fontSize: width * 0.04,
        backgroundColor: '#1d1d26',
        padding: width * 0.025,
        borderRadius: 20,
        textAlign: 'start',
    },
    textarea: {
        color: '#FFF',
        fontSize: width * 0.04,
        backgroundColor: '#1d1d26',
        padding: width * 0.025,
        borderRadius: 20,
        textAlignVertical: 'top',
        textAlign: 'start',
        height: height * 0.15,
        width: '100%',
    },
    sliderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height * 0.015,
    },
    sliderLabel: {
        color: '#A9A9A9',
        fontSize: width * 0.03,
    },
    slider: {
        width: '100%',
        height: height * 0.012,
        backgroundColor: '#1d1d26',
        borderRadius: 5,
        marginBottom: height * 0.015,
    },
    sliderTrack: {
        height: '100%',
        backgroundColor: '#05FF93',
        borderRadius: 5,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.01,
    },
    checkboxLabel: {
        color: '#FFF',
        fontSize: width * 0.035,
        marginLeft: width * 0.025,
    },
    previewBox: {
        padding: width * 0.025,
        backgroundColor: '#1d1d26',
        borderRadius: 10,
    },
    previewText: {
        color: '#FFF',
        fontSize: width * 0.035,
        fontWeight: 'bold',
    },
    previewSubText: {
        color: '#A9A9A9',
        fontSize: width * 0.03,
        marginTop: height * 0.01,
    },
    backtestRunButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#05FF93',
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.025,
        marginTop: height * 0.03,
    },
});