// app/discovery/[symbol].tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstruments } from '@/context/InstrumentContext';
import HomeHeader from '@/components/HomeHeader';
import TradingChart from "@/components/TradingChart";

export default function InstrumentDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
    const { selectedInstrument, fetchQuote, quoteData, quoteLoading, quoteError, fetchSymbolSpecification, symbolSpecs } = useInstruments();

    useEffect(() => {
        if (!symbol) return;
        // console.log('symbol', symbol);
        fetchQuote(symbol);
        fetchSymbolSpecification(symbol);
    }, [symbol]);

    if (!selectedInstrument) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.errorText}>No instrument selected</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
                        <Text style={styles.actionButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    const spec = symbolSpecs?.[symbol] || {};
    const item = selectedInstrument;
    const displayData = { ...item, ...quoteData };
    const isDummy = quoteError && quoteError.includes('credit limit');
    // console.log('spec', JSON.stringify(spec, null, 3))
    const changeValue = Number(displayData.change || 0);
    const isPositive = changeValue >= 0;

    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader
                page="discovery"
                title={symbol || 'Instrument'}
                subtitle={spec.description || 'Unknown Instrument'}
            />

            {isDummy && (
                <View style={styles.dummyBanner}>
                    <Text style={styles.dummyTitle}>Demo Mode Active</Text>
                    <Text style={styles.dummyText}>
                        Daily API credit limit reached. Showing sample data. Upgrade for live quotes.
                    </Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Chart Placeholder */}
                <View style={styles.chartCard}>
                    {/* <Text style={styles.chartTitle}>Price History</Text> */}
                    <TradingChart symbol={symbol} />
                </View>
                {/* Price Card – Hero Section */}
                {quoteLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00ff9d" />
                        <Text style={styles.loadingText}>Loading latest quote...</Text>
                    </View>
                ) : quoteData || quoteError ? (
                    <View style={styles.priceCard}>

                        <Text style={styles.symbol}>{symbol}</Text>

                        <Text style={styles.price}>
                            {quoteData?.bid ?? '—'}
                        </Text>

                        <Text style={styles.priceLabel}>Bid Price</Text>

                        <View style={styles.priceRow}>
                            <View style={styles.priceBox}>
                                <Text style={styles.boxLabel}>Bid</Text>
                                <Text style={styles.boxValue}>{quoteData?.bid ?? '—'}</Text>
                            </View>

                            <View style={styles.priceBox}>
                                <Text style={styles.boxLabel}>Ask</Text>
                                <Text style={styles.boxValue}>{quoteData?.ask ?? '—'}</Text>
                            </View>

                            <View style={styles.priceBox}>
                                <Text style={styles.boxLabel}>Spread</Text>
                                <Text style={styles.boxValue}>
                                    {quoteData?.bid && quoteData?.ask
                                        ? (quoteData.ask - quoteData.bid).toFixed(spec.digits)
                                        : '—'}
                                </Text>
                            </View>
                        </View>

                    </View>
                ) : (
                    <View style={styles.center}>
                        <Text style={styles.noDataText}>No quote data available</Text>
                    </View>
                )}


                {/* Instrument Meta */}
                <View style={styles.metaCard}>
                    <Text style={styles.sectionTitle}>Trading Specifications</Text>
                    <MetaRow label="Contract Size" value={spec.contractSize} />
                    <MetaRow label="Min Lot" value={spec.minVolume} />
                    <MetaRow label="Max Lot" value={spec.maxVolume} />
                    <MetaRow label="Lot Step" value={spec.volumeStep} />
                    <MetaRow label="Pip Size" value={spec.pipSize} />
                    <MetaRow label="Digits" value={spec.digits} />
                    <MetaRow label="Base Currency" value={spec.baseCurrency} />
                    <MetaRow label="Profit Currency" value={spec.profitCurrency} />
                </View>
            </ScrollView>

            {/* Fixed Buy/Sell Buttons */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.sellButton]}
                    onPress={() => {
                        router.push({
                            pathname: `/Discovery/placeOrder`,
                            params: {
                                symbol: symbol,
                                transactionType: 'sell',  // pass as param
                            },
                        });
                    }}
                >
                    <Text style={styles.actionButtonText}>Sell | Short</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.buyButton]}
                    onPress={() => {
                        router.push({
                            pathname: `/Discovery/placeOrder`,
                            params: {
                                symbol: symbol,
                                transactionType: 'buy',  // pass as param
                            },
                        });
                    }}
                >
                    <Text style={styles.actionButtonText}>Buy | Long</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const MetaRow = ({ label, value }) => (
    <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value ?? '—'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0E11',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120, // space for bottom bar
    },

    // Dummy banner
    dummyBanner: {
        backgroundColor: '#3B2F00',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#665700',
    },
    dummyTitle: {
        color: '#FFCC00',
        fontSize: 16,
        fontWeight: '700',
    },
    dummyText: {
        color: '#E0D6A8',
        fontSize: 13,
        marginTop: 4,
    },

    // Price Card (Hero)
    priceCard: {
        backgroundColor: '#12161C',
        borderRadius: 20,
        padding: 24,
        marginVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    price: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '700',
    },
    currency: {
        color: '#AAB2BD',
        fontSize: 24,
        fontWeight: '500',
    },
    changeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    changeText: {
        fontSize: 24,
        fontWeight: '700',
    },
    percentChange: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    timestamp: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 16,
    },

    // Meta Card
    metaCard: {
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E252E',
    },
    metaLabel: {
        color: '#8B949E',
        fontSize: 16,
    },
    metaValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
        flexShrink: 1,
    },

    // Chart Placeholder
    chartCard: {
        marginVertical: 16,
    },
    chartTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    chartPlaceholder: {
        height: 280,
        backgroundColor: '#1A1F2E',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A3344',
    },
    chartPlaceholderText: {
        color: '#6B7280',
        fontSize: 16,
    },

    // Bottom Action Bar
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 24,
        backgroundColor: '#0B0E11',
        borderTopWidth: 1,
        borderTopColor: '#1E252E',
    },
    actionButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buyButton: {
        backgroundColor: '#22C55E',
    },
    sellButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    // Other styles
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#8B949E',
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 18,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
    },
    retryText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    symbol: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },

    priceLabel: {
        color: '#6B7280',
        fontSize: 13,
        marginBottom: 16,
    },

    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    priceBox: {
        backgroundColor: '#1A1F2E',
        padding: 12,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },

    boxLabel: {
        color: '#6B7280',
        fontSize: 12,
    },

    boxValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
});