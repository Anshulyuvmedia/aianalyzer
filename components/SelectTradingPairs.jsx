import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker'; // Ensure this package is installed
import { Feather } from '@expo/vector-icons';

const SelectTradingPairs = () => {
    const [activeTab, setActiveTab] = useState('Forex');
    const [analysisType, setAnalysisType] = useState('Swing');
    const [selectedPairs, setSelectedPairs] = useState([]);
    const [timeframe, setTimeframe] = useState('1H');

    const tabs = {
        Forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'EURCHF', 'AUDCAD', 'GBPCHF', 'NZDJPY', 'CADCHF', 'GBPAUD'],
        Commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS', 'COPPER', 'PLATINUM', 'PALLADIUM', 'WHEAT', 'CORN', 'SOYBEANS', 'SUGAR', 'COFFEE', 'COCOA', 'COTTON', 'LUMBER'],
        Crypto: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD', 'DOTUSD', 'LINKUSD', 'MATICUSD', 'AVAXUSD', 'UNIUSD', 'LTCUSD', 'BCHUSD', 'XLMUSD', 'XRPUSD', 'ALGOUSD', 'ATOMUSD', 'FILUSD', 'MANAUSD', 'SANDUSD'],
    };

    const handleTogglePair = (pair) => {
        setSelectedPairs((prev) =>
            prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
        );
    };

    const handleSelectAll = () => {
        setSelectedPairs([...tabs[activeTab]]);
    };

    const handleClearAll = () => {
        setSelectedPairs([]);
    };

    const handleAnalyzeChart = () => {
        console.log('Analyzing chart for:', { selectedPairs, timeframe, activeTab, analysisType });
    };

    return (
        <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBoxBorder}
        >
            <LinearGradient
                colors={['#1e2836', '#111827', '#1e2836']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
            >
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Feather name="target" size={24} color="#60a5fa" />
                            <Text style={styles.header}>Select Trading Pairs</Text>
                        </View>
                        <View style={styles.tabContainer}>
                            {Object.keys(tabs).length > 0 ? (
                                Object.keys(tabs).map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                                        onPress={() => setActiveTab(tab)}
                                    >
                                        <Text style={styles.tabText}>{tab}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.errorText}>No tabs available</Text>
                            )}
                        </View>
                        <View style={styles.optionsContainer}>
                            {tabs[activeTab] ? (
                                tabs[activeTab].map((pair) => (
                                    <TouchableOpacity
                                        key={pair}
                                        style={[
                                            styles.pairItem,
                                            selectedPairs.includes(pair) && styles.selectedPair,
                                        ]}
                                        onPress={() => handleTogglePair(pair)}
                                    >
                                        <Text
                                            style={[
                                                styles.pairText,
                                                selectedPairs.includes(pair) && styles.selectedPairText,
                                            ]}
                                        >
                                            {pair}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.errorText}>No pairs available</Text>
                            )}
                        </View>
                        <View style={styles.selectionControls}>
                            <Text style={styles.selectedCount}>
                                Selected: {selectedPairs.length} pairs
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.selectButton} onPress={handleSelectAll}>
                                    <Text style={styles.buttonText}>Select All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                                    <Text style={styles.buttonText}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.analysisControls}>
                            <Text style={styles.controlLabel}>Analysis Type</Text>
                            <View style={styles.tabContainer}>
                                {['Swing', 'Intraday', 'Scalping'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.tab, analysisType === type && styles.activeTab]}
                                        onPress={() => setAnalysisType(type)}
                                    >
                                        <Text style={styles.tabText}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.timeframeRow}>
                                <Text style={styles.controlLabel}>Timeframe</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={timeframe}
                                        onValueChange={(itemValue) => setTimeframe(itemValue)}
                                        style={styles.picker}
                                        dropdownIconColor="#A0AEC0"
                                    >
                                        <Picker.Item label="1M" value="1M" />
                                        <Picker.Item label="5M" value="5M" />
                                        <Picker.Item label="15M" value="15M" />
                                        <Picker.Item label="1H" value="1H" />
                                        <Picker.Item label="4H" value="4H" />
                                        <Picker.Item label="1D" value="1D" />
                                    </Picker>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzeChart}>
                                <Text style={styles.analyzeText}>Analyze Chart</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default SelectTradingPairs;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        // padding: 20,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#121928',
        borderRadius: 8,
        padding: 3,
    },
    tab: {
        flex: 1,
        backgroundColor: '#2d3748',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#3b82f6',
    },
    tabText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxHeight: 250,
        marginBottom: 15,
    },
    pairItem: {
        backgroundColor: '#111827',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#6b7280',
        marginRight: 5,
    },
    selectedPair: {
        borderColor: '#3b82f6',
    },
    selectedPairText: {
        color: '#3b82f6',
    },
    pairText: {
        color: '#d1d5db',
        fontSize: 14,
    },
    selectionControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedCount: {
        color: '#A0AEC0',
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
    },
    selectButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    clearButton: {
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    analysisControls: {
        marginBottom: 20,
    },
    controlLabel: {
        color: '#A0AEC0',
        fontSize: 14,
        marginBottom: 10,
    },
    timeframeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    pickerContainer: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4B5563',
        marginLeft: 10,
        flex: 1/2,
    },
    picker: {
        color: '#fff',
    },
    analyzeButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    analyzeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
    },
});