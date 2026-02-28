// screens/InstrumentList.js
import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { useInstruments } from '@/context/InstrumentContext';
import { useRouter } from 'expo-router';

const TAB_TYPES = ['stocks', 'forex_pairs', 'cryptocurrencies', 'commodities'];

const InstrumentList = () => {
    const {
        instrumentsByType,
        loading,
        error,
        fetchInstruments,
        setSelectedInstrument,
        getLogoUrl,
    } = useInstruments();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('stocks');
    const scrollViewRef = useRef(null);

    const handleTypeChange = useCallback(
        (type) => {
            setSelectedType(type);
            fetchInstruments(type);
        },
        [fetchInstruments]
    );

    const instruments = instrumentsByType[selectedType] || [];

    const filtered = instruments.filter(
        (item) =>
            item.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.name || item.instrument_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => {
        const logoUrl = getLogoUrl(item);
        // console.log('getLogoUrl', logoUrl);

        return (
            <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => {
                    setSelectedInstrument(item);  // from context
                    router.push(`/Discovery/${encodeURIComponent(item.symbol)}`);
                }}
            >
                <Image
                    source={{ uri: logoUrl }}
                    style={styles.logo}
                    defaultSource={{ uri: logoUrl }}
                    resizeMode="contain"
                    onError={(e) => {
                        const errMsg = e.nativeEvent.error || 'Unknown image error';
                        console.log(`Image failed for ${item.symbol}: ${logoUrl} → ${errMsg}`);
                    }}
                />

                <View style={styles.itemContent}>
                    <View style={styles.itemMain}>
                        <Text style={styles.symbol}>{item.symbol || '—'}</Text>
                        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                            {(() => {
                                // Crypto & Forex: use base/quote pair
                                if (selectedType === 'cryptocurrencies' || selectedType === 'forex_pairs') {
                                    const base = (item.currency_base || '?')
                                    const quote = (item.currency_quote || '?')
                                    return `${base}/${quote}`;
                                }

                                // Commodities & Stocks: prefer name
                                return item.name || item.instrument_name || 'Unknown';
                            })()}
                        </Text>
                    </View>

                    <View style={styles.itemMeta}>
                        <Text style={styles.metaText}>
                            {(() => {
                                // Forex: show group (Major/Minor/Exotic)
                                if (selectedType === 'forex_pairs') {
                                    return item.currency_group || '—';
                                }

                                // Crypto: show primary exchange
                                if (selectedType === 'cryptocurrencies' && item.available_exchanges?.length > 0) {
                                    return item.available_exchanges[0] + (item.available_exchanges.length > 1 ? '+' : '');
                                }

                                // Commodities: show category (very useful!)
                                if (selectedType === 'commodities') {
                                    return item.category || '—';
                                }

                                // Stocks/default: exchange or country
                                return item.exchange || item.country || '—';
                            })()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity >
        );
    };

    const isLoading = loading[selectedType];

    return (
        <View style={styles.container}>
            <HomeHeader
                page="discovery"
                title="Instrument Discovery"
                subtitle="Explore stocks, forex, crypto & more"
            />

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.segmentScrollContent}
                style={styles.segmentScroll}
            >
                {TAB_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.segmentButton,
                            selectedType === type && styles.segmentButtonActive,
                        ]}
                        onPress={() => handleTypeChange(type)}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                selectedType === type && styles.segmentTextActive,
                            ]}
                        >
                            {type.replace('_', ' ').toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ flex: 1 }}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search symbol or name..."
                        placeholderTextColor="#777"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#00ff9d" />
                        <Text style={styles.loadingText}>
                            Loading {selectedType.replace('_', ' ')}...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => fetchInstruments(selectedType, { forceRefresh: true })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={filtered}
                        renderItem={renderItem}
                        keyExtractor={(item) =>
                            item.symbol ||
                            `${item.name || 'item'}-${item.exchange || item.currency_base || 'ex'}`
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery.trim()
                                        ? `No results for "${searchQuery}"`
                                        : `No ${selectedType.replace('_', ' ')} available`}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={<View style={{ height: 60 }} />}
                        initialNumToRender={12}
                        maxToRenderPerBatch={16}
                        windowSize={15}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    segmentScroll: {
        backgroundColor: '#000',
        paddingVertical: 6,
        maxHeight: 50,
    },

    segmentScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 10,
    },

    segmentButton: {
        borderRadius: 18,
        height: 34,
        backgroundColor: '#161A1F',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },

    segmentButtonActive: {
        backgroundColor: '#1F8B4C',
    },

    segmentText: {
        color: '#8B949E',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    segmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    searchWrapper: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 12,
    },

    searchInput: {
        backgroundColor: '#161A1F',
        color: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        fontSize: 15,
    },

    itemContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 60,
    },

    itemCard: {
        backgroundColor: '#12161C',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },

    logo: {
        width: 56,                    // match your placeholder width
        height: 56,
        borderRadius: 28,             // perfect circle
        marginRight: 16,
        backgroundColor: '#1E252E',   // fallback color if image fails to load
        borderWidth: 1,               // subtle outline
        borderColor: '#22C55E33',     // faint green border (with opacity)
    },

    itemMain: {
        flex: 1,
    },

    symbol: {
        color: '#22C55E',
        fontSize: 17,
        fontWeight: '700',
    },

    name: {
        color: '#AAB2BD',
        fontSize: 14,
        marginTop: 3,
    },

    itemMeta: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },

    metaText: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },

    center: {
        paddingTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 20,
    },

    emptyText: {
        color: '#6B7280',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },

    loadingText: {
        color: '#8B949E',
        fontSize: 15,
        marginTop: 18,
    },

    errorText: {
        color: '#EF4444',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },

    retryButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 10,
    },

    retryText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default InstrumentList;