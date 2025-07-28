import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AlgoNavigation from '../../components/AlgoNavigation';

const { width, height } = Dimensions.get('window');

const AlgoStrategyBuilder = () => {
    const indicators = ['RSI', 'Moving Average', 'MACD', 'Bollinger Bands', 'Stochastic Oscillator'];
    const operators = ['>', '<', '>=', '<=', '='];
    const values = ['30', '50', '70', '100', '200'];
    const [entryRules, setEntryRules] = useState([
        { id: 1, indicator: 'RSI', operator: '>', value: '30' },
        { id: 2, indicator: 'Moving Average', operator: '>', value: '50' },
    ]);
    const [exitRules, setExitRules] = useState([
        { id: 1, indicator: 'RSI', operator: '>', value: '70' },
    ]);
    const [strategyName, setStrategyName] = useState('Rsi with EMA');
    const [description, setDescription] = useState('RSI');
    const [stopLoss, setStopLoss] = useState('2');
    const [takeProfit, setTakeProfit] = useState('5');
    const [maxPositionSize, setMaxPositionSize] = useState('10');
    const [maxDailyLoss, setMaxDailyLoss] = useState('5');

    const addEntryRule = () => {
        const newId = entryRules.length > 0 ? Math.max(...entryRules.map(rule => rule.id)) + 1 : 1;
        setEntryRules([...entryRules, { id: newId, indicator: 'RSI', operator: '>', value: '30' }]);
    };

    const deleteEntryRule = (id) => {
        setEntryRules(entryRules.filter(rule => rule.id !== id));
    };

    const addExitRule = () => {
        const newId = exitRules.length > 0 ? Math.max(...exitRules.map(rule => rule.id)) + 1 : 1;
        setExitRules([...exitRules, { id: newId, indicator: 'RSI', operator: '>', value: '70' }]);
    };

    const deleteExitRule = (id) => {
        setExitRules(exitRules.filter(rule => rule.id !== id));
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerbox}>
                <HomeHeader />
            </View>

            <AlgoNavigation />

            <ScrollView style={styles.scollerbox} showsVerticalScrollIndicator={false}>
                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.algobox}>
                            <Text style={styles.titleText}>
                                Algo Strategy Builder
                            </Text>
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.backtextButton} onPress={() => router.push('strategybacktesting')}>
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

                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsTitle}>Strategy Details</Text>
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
                                            value={strategyName}
                                            onChangeText={setStrategyName}
                                            placeholder="Enter strategy name"
                                            placeholderTextColor="#A9A9A9"
                                        />
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <TextInput
                                            style={styles.inputText}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Enter description"
                                            placeholderTextColor="#A9A9A9"
                                        />
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.gradientBorder, { padding: 1 }]}
                    >
                        <View style={styles.detailsContainer}>
                            <View style={styles.ruleHeader}>
                                <Text style={styles.detailsTitle}>Entry Rules</Text>
                                <TouchableOpacity style={styles.addRuleButton} onPress={addEntryRule}>
                                    <Text style={styles.addRuleText}>+ Add Rule</Text>
                                </TouchableOpacity>
                            </View>
                            {entryRules.map((rule) => (
                                <LinearGradient
                                    colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                    start={{ x: 0.2, y: 1.2 }}
                                    end={{ x: 0, y: 0 }}
                                    style={[styles.gradientBorder, { padding: 1, marginBottom: width * 0.025 }]}
                                    key={rule.id}
                                >
                                    <View style={styles.ruleRow}>
                                        <View style={styles.conditionGroup}>
                                            <Text style={styles.label}>{rule.id === 1 ? 'IF' : 'AND'}</Text>
                                            <View style={styles.dropdownWrapper}>
                                                <View style={styles.dropdownRow}>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.indicator}
                                                                onValueChange={(itemValue) => {
                                                                    setEntryRules(entryRules.map(r =>
                                                                        r.id === rule.id ? { ...r, indicator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {indicators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.operator}
                                                                onValueChange={(itemValue) => {
                                                                    setEntryRules(entryRules.map(r =>
                                                                        r.id === rule.id ? { ...r, operator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {operators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                                <View style={styles.dropdownRow}>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.value}
                                                                onValueChange={(itemValue) => {
                                                                    setEntryRules(entryRules.map(r =>
                                                                        r.id === rule.id ? { ...r, value: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {values.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEntryRule(rule.id)}>
                                                            <Feather name="trash-2" size={width * 0.05} color="white" />
                                                            <Text className="text-white"> Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.gradientBorder, { padding: 1 }]}
                    >
                        <View style={styles.detailsContainer}>
                            <View style={styles.ruleHeader}>
                                <Text style={styles.detailsTitle}>Exit Rules</Text>
                                <TouchableOpacity style={styles.addRuleButtonRed} onPress={addExitRule}>
                                    <Text style={styles.exitRuleText}>+ Add Rule</Text>
                                </TouchableOpacity>
                            </View>
                            {exitRules.map((rule) => (
                                <LinearGradient
                                    colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                    start={{ x: 0.2, y: 1.2 }}
                                    end={{ x: 0, y: 0 }}
                                    style={[styles.gradientBorder, { padding: 1, marginBottom: width * 0.025 }]}
                                    key={rule.id}
                                >
                                    <View style={styles.ruleRow}>
                                        <View style={styles.conditionGroup}>
                                            <Text style={styles.label}>{rule.id === 1 ? 'IF' : 'AND'}</Text>
                                            <View style={styles.dropdownWrapper}>
                                                <View style={styles.dropdownRow}>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.indicator}
                                                                onValueChange={(itemValue) => {
                                                                    setExitRules(exitRules.map(r =>
                                                                        r.id === rule.id ? { ...r, indicator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {indicators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.operator}
                                                                onValueChange={(itemValue) => {
                                                                    setExitRules(exitRules.map(r =>
                                                                        r.id === rule.id ? { ...r, operator: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {operators.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                                <View style={styles.dropdownRow}>
                                                    <View style={styles.dropdownContainer}>
                                                        <LinearGradient
                                                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                                            start={{ x: 0.2, y: 1.2 }}
                                                            end={{ x: 0, y: 0 }}
                                                            style={styles.gradientBorderInput}
                                                        >
                                                            <Picker
                                                                selectedValue={rule.value}
                                                                onValueChange={(itemValue) => {
                                                                    setExitRules(exitRules.map(r =>
                                                                        r.id === rule.id ? { ...r, value: itemValue } : r
                                                                    ));
                                                                }}
                                                                style={styles.picker}
                                                                itemStyle={styles.pickerItem}
                                                            >
                                                                {values.map((item) => (
                                                                    <Picker.Item label={item} value={item} key={item} />
                                                                ))}
                                                            </Picker>
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.dropdownContainer}>
                                                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExitRule(rule.id)}>
                                                            <Feather name="trash-2" size={width * 0.05} color="white" />
                                                            <Text className="text-white"> Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.mainbox}>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsTitle}>Risk Management</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Stop Loss (%)</Text>
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
                                            placeholder="Enter stop loss"
                                            placeholderTextColor="#A9A9A9"
                                            keyboardType="numeric"
                                        />
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Take Profit (%)</Text>
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
                                            placeholder="Enter take profit"
                                            placeholderTextColor="#A9A9A9"
                                            keyboardType="numeric"
                                        />
                                    </LinearGradient>
                                </View>
                            </View>
                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Max Position Size (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <TextInput
                                            style={styles.inputText}
                                            value={maxPositionSize}
                                            onChangeText={setMaxPositionSize}
                                            placeholder="Enter max position size"
                                            placeholderTextColor="#A9A9A9"
                                            keyboardType="numeric"
                                        />
                                    </LinearGradient>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Max Daily Loss (%)</Text>
                                    <LinearGradient
                                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                                        start={{ x: 0.2, y: 1.2 }}
                                        end={{ x: 0, y: 0 }}
                                        style={styles.gradientBorder}
                                    >
                                        <TextInput
                                            style={styles.inputText}
                                            value={maxDailyLoss}
                                            onChangeText={setMaxDailyLoss}
                                            placeholder="Enter max daily loss"
                                            placeholderTextColor="#A9A9A9"
                                            keyboardType="numeric"
                                        />
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView >
        </View >
    );
};

export default AlgoStrategyBuilder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerbox: {
        paddingHorizontal: width * 0.04,
    },
    scollerbox: {
        paddingHorizontal: width * 0.04,
        marginBottom: height * 0.03,
    },
    mainbox: {
        marginTop: height * 0.025,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    gradientBorderInput: {
        borderRadius: 0,
        padding: 1,
    },
    algobox: {
        backgroundColor: '#12121c',
        padding: width * 0.04,
        borderRadius: 20,
    },
    titleText: {
        fontFamily: 'Sora-Bold',
        marginBottom: height * 0.015,
        color: '#FFF',
        fontSize: width * 0.05,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: width * 0.025,
    },
    backtextButton: {
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
        fontFamily: 'Questrial-Regular',
    },
    actionButtonText: {
        color: '#000',
        fontSize: width * 0.04,
        fontFamily: 'Questrial-Regular',
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
    inputGroup: {
        width: '48%',
        minWidth: width * 0.4,
    },
    label: {
        color: '#A9A9A9',
        fontSize: width * 0.035,
        marginBottom: height * 0.01,
        marginRight: width * 0.01,
    },
    inputText: {
        color: '#FFF',
        fontSize: width * 0.04,
        backgroundColor: '#1d1d26',
        padding: width * 0.025,
        borderRadius: 20,
        textAlign: 'center',
    },
    ruleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.015,
    },
    addRuleButton: {
        backgroundColor: '#05FF93',
        borderRadius: 12,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.025,
    },
    addRuleButtonRed: {
        backgroundColor: '#ff0505',
        borderRadius: 12,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.025,
    },
    addRuleText: {
        color: '#000',
        fontSize: width * 0.035,
        fontWeight: 'bold',
    },
    exitRuleText: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: 'bold',
    },
    ruleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1d1d26',
        padding: width * 0.025,
        borderRadius: 20,
    },
    conditionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.015,
        flex: 1,
    },
    dropdownWrapper: {
        flexDirection: 'column',
        flex: 1,
    },
    dropdownRow: {
        flexDirection: 'row',
        gap: width * 0.015,
        marginBottom: height * 0.01,
    },
    dropdownContainer: {
        flex: 1,
        minWidth: width * 0.25,
        // alignItems: 'center',
        // flexDirection: 'row'
    },
    picker: {
        backgroundColor: '#1d1d26',
        color: '#FFF',
        borderRadius: 0,
        paddingHorizontal: width * 0.025,
    },
    pickerItem: {
        color: '#FFF',
        fontSize: width * 0.035,
    },
    deleteButton: {
        borderColor: '#ff0505',
        borderWidth: 1,
        borderRadius: 10,
        padding: width * 0.015,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 'auto',
    },
});