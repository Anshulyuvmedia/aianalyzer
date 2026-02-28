// app/discovery/[symbol].tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstruments } from '@/context/InstrumentContext';
import HomeHeader from '@/components/HomeHeader';

export default function InstrumentDetail() {
    const router = useRouter();
    const { symbol } = useLocalSearchParams();
    const {
        selectedInstrument,
        fetchQuote,
        quoteData,
        quoteLoading,
        quoteError,
    } = useInstruments();

    useEffect(() => {
        if (symbol && !quoteData) {
            fetchQuote(symbol);
        }
    }, [symbol, fetchQuote, quoteData]);

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

    const item = selectedInstrument;
    const displayData = { ...item, ...quoteData };
    const isDummy = quoteError && quoteError.includes('credit limit');

    const changeValue = Number(displayData.change || 0);
    const isPositive = changeValue >= 0;

    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader
                page="discovery"
                title={symbol || 'Instrument'}
                subtitle={
                    displayData.name ||
                    (displayData.currency_base && displayData.currency_quote
                        ? `${displayData.currency_base}/${displayData.currency_quote}`
                        : 'Unknown Instrument')
                }
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
                {/* Price Card – Hero Section */}
                {quoteLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00ff9d" />
                        <Text style={styles.loadingText}>Loading latest quote...</Text>
                    </View>
                ) : quoteData || quoteError ? (
                    <View style={styles.priceCard}>
                        <Text style={styles.price}>
                            {displayData.close || displayData.price || '—'}
                            <Text style={styles.currency}> {displayData.currency || 'USD'}</Text>
                        </Text>

                        <View style={styles.changeRow}>
                            <Text
                                style={[
                                    styles.changeText,
                                    { color: isPositive ? '#22C55E' : '#EF4444' },
                                ]}
                            >
                                {isPositive ? '+' : ''}{displayData.change || '—'}
                            </Text>
                            <Text
                                style={[
                                    styles.percentChange,
                                    { color: isPositive ? '#22C55E' : '#EF4444' },
                                ]}
                            >
                                ({isPositive ? '+' : ''}{displayData.percent_change || '—'}%)
                            </Text>
                        </View>

                        <Text style={styles.timestamp}>
                            Updated: {displayData.datetime || 'N/A'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.center}>
                        <Text style={styles.noDataText}>No quote data available</Text>
                    </View>
                )}

                {/* Instrument Meta */}
                <View style={styles.metaCard}>
                    <MetaRow label="Type" value={displayData.type || '—'} />
                    <MetaRow
                        label="Exchange / Category"
                        value={
                            displayData.exchange ||
                            displayData.category ||
                            displayData.currency_group ||
                            '—'
                        }
                    />
                    {displayData.description && (
                        <MetaRow label="Description" value={displayData.description} />
                    )}
                    {displayData.available_exchanges?.length > 0 && (
                        <MetaRow
                            label="Exchanges"
                            value={displayData.available_exchanges.join(', ')}
                        />
                    )}
                </View>

                {/* Chart Placeholder */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Price History</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.chartPlaceholderText}>Interactive chart coming soon</Text>
                    </View>
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
                    <Text style={styles.actionButtonText}>Sell</Text>
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
                    <Text style={styles.actionButtonText}>Buy</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const MetaRow = ({ label, value }) => (
    <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
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
        marginVertical: 8,
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
        color: '#000000',
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
});