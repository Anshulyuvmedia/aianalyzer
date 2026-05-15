// app/components/UserBacktesting/MarketSymbolPicker.jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useInstruments } from '../../context/InstrumentContext';
import { useBacktesting } from '../../context/BacktestingContext';

const MarketSymbolPicker = () => {
    const { formData, updateFormData } = useBacktesting();
    const { instrumentsByType, loading, fetchInstruments, allSymbolsCache } = useInstruments();

    const [availableSymbols, setAvailableSymbols] = useState([]);
    const [isLoadingSymbols, setIsLoadingSymbols] = useState(false);

    const markets = [
        { label: 'Forex', value: 'forex' },
        { label: 'Crypto', value: 'crypto' },
        { label: 'Commodities', value: 'commodities' },
        { label: 'Indices', value: 'indices' },
        { label: 'Stocks', value: 'stocks' },
    ];

    // Fetch symbols when market changes
    useEffect(() => {
        if (formData.market) {
            loadSymbolsForMarket(formData.market);
        } else {
            setAvailableSymbols([]);
        }
    }, [formData.market]);

    const loadSymbolsForMarket = async (market) => {
        setIsLoadingSymbols(true);
        try {
            // Try to get from cache first
            let symbols = [];

            if (allSymbolsCache.types && allSymbolsCache.types[market]) {
                symbols = allSymbolsCache.types[market];
            } else {
                // Fetch from API
                symbols = await fetchInstruments(market, { limit: 'all' });
            }

            setAvailableSymbols(symbols);

            // Reset symbol if current symbol is not in new market
            if (formData.symbol && !symbols.some(s => s.symbol === formData.symbol)) {
                updateFormData('symbol', '');
            }
        } catch (error) {
            console.error('Error loading symbols:', error);
            setAvailableSymbols([]);
        } finally {
            setIsLoadingSymbols(false);
        }
    };

    const handleMarketChange = (value) => {
        updateFormData('market', value);
        updateFormData('symbol', ''); // Reset symbol when market changes
    };

    const handleSymbolChange = (value) => {
        updateFormData('symbol', value);
    };

    return (
        <View style={styles.section}>
            <View style={styles.box}>
                <Text style={styles.label}>Market Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.market}
                        onValueChange={handleMarketChange}
                        style={styles.picker}
                        dropdownIconColor="#A0AEC0"
                    >
                        <Picker.Item label="Select Market" value="" />
                        {markets.map((market) => (
                            <Picker.Item key={market.value} label={market.label} value={market.value} />
                        ))}
                    </Picker>
                </View>
            </View>
            <View style={styles.box}>
                <Text style={[styles.label]}>Select Symbol</Text>
                <View style={styles.pickerContainer}>
                    {isLoadingSymbols ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#60a5fa" />
                            <Text style={styles.loadingText}>Loading symbols...</Text>
                        </View>
                    ) : (
                        <Picker
                            selectedValue={formData.symbol}
                            onValueChange={handleSymbolChange}
                            style={styles.picker}
                            dropdownIconColor="#A0AEC0"
                            enabled={formData.market !== "" && availableSymbols.length > 0}
                        >
                            <Picker.Item label="Select Symbol" value="" />
                            {availableSymbols.map((instrument) => (
                                <Picker.Item
                                    key={instrument.symbol}
                                    label={`${instrument.symbol}`}
                                    value={instrument.symbol}
                                />
                            ))}
                        </Picker>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 10,
        fontWeight: '500',
    },
    section: {
        flexDirection: 'row',
        gap: 5,
    },
    box: {
        flex: 1,
    },
    pickerContainer: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1e293b',
        overflow: 'hidden',
    },
    picker: {
        color: '#fff',
        height: 50,
    },
    loadingContainer: {
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#A0AEC0',
        marginLeft: 10,
    },
});

export default MarketSymbolPicker;