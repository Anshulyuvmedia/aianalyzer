// screens/InstrumentList.js
import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, ScrollView, } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { useInstruments } from '@/context/InstrumentContext';
import { useRouter } from 'expo-router';

const TAB_TYPES = ['forex', 'crypto', 'commodities', 'stocks', 'indices', 'other'];

const InstrumentList = () => {
    const { instrumentsByType, loading, error, fetchInstruments, setSelectedInstrument, getLogoUrl } = useInstruments();

    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('forex'); // start with forex – most common

    const scrollViewRef = useRef(null);

    const handleTypeChange = useCallback(
        (type) => {
            setSelectedType(type);
            if (!instrumentsByType[type]?.length && !loading[type]) {
                fetchInstruments(type);
            }
        },
        [fetchInstruments, instrumentsByType]
    );

    const instruments = instrumentsByType[selectedType] || [];

    const filtered = instruments.filter(item =>
        item.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    const renderItem = ({ item }) => {
        // console.log('item', item);
        if (!item?.symbol) return null;
        const logoUrl = getLogoUrl(item.symbol);
        // For most broker symbols: symbol is both identifier and display name
        const displayName = item.symbol;

        // Simple meta – can be enhanced later if you add more data from symbol specification
        let metaText = '—';

        if (selectedType === 'forex') {
            metaText = item.symbol.includes('JPY') ? 'Cross' : 'Major/Minor';
        } else if (selectedType === 'crypto') {
            metaText = 'Crypto';
        } else if (selectedType === 'commodities') {
            metaText = 'Commodity';
        } else if (selectedType === 'indices') {
            metaText = 'Index';
        } else if (selectedType === 'stocks') {
            metaText = 'Stock';
        }

        return (
            <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => {
                    setSelectedInstrument(item);
                    router.push(`/Discovery/${encodeURIComponent(item.symbol)}`);
                }}
            >
                <Image
                    source={{ uri: logoUrl }}
                    style={styles.logo}
                    resizeMode="contain"
                    defaultSource={{ uri: logoUrl }}
                    onError={(e) =>
                        console.log(`Logo failed for ${item.symbol}: ${e.nativeEvent.error}`)
                    }
                />

                <View style={styles.itemContent}>
                    <View style={styles.itemMain}>
                        <Text style={styles.symbol}>{item.symbol}</Text>
                        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                            {displayName}
                        </Text>
                    </View>

                    <View style={styles.itemMeta}>
                        <Text style={styles.metaText}>{metaText}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const isLoading = loading[selectedType];

    return (
        <View style={styles.container}>
            <HomeHeader
                page="discovery"
                title="Instrument Discovery"
                subtitle="Explore available trading symbols"
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
                            {type.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ flex: 1 }}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search symbol..."
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
                        <Text style={styles.loadingText}>Loading {selectedType}...</Text>
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
                        keyExtractor={(item) => item.symbol}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery.trim()
                                        ? `No results for "${searchQuery}"`
                                        : `No ${selectedType} symbols available`}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={<View style={{ height: 80 }} />}
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
        maxHeight: 54,
    },

    segmentScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },

    segmentButton: {
        borderRadius: 20,
        height: 38,
        backgroundColor: '#161A1F',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    segmentButtonActive: {
        backgroundColor: '#22C55E',
    },

    segmentText: {
        color: '#8B949E',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    segmentTextActive: {
        color: '#000',
        fontWeight: '700',
    },

    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    searchInput: {
        backgroundColor: '#161A1F',
        color: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 16,
        fontSize: 16,
    },

    itemContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 80,
    },

    itemCard: {
        backgroundColor: '#12161C',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },

    logo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        backgroundColor: '#1E252E',
        borderWidth: 1,
        borderColor: '#22C55E22',
    },

    itemMain: {
        flex: 1,
    },

    symbol: {
        color: '#22C55E',
        fontSize: 18,
        fontWeight: '700',
    },

    name: {
        color: '#A1AEBB',
        fontSize: 14,
        marginTop: 2,
    },

    itemMeta: {
        alignItems: 'flex-end',
    },

    metaText: {
        color: '#6B7280',
        fontSize: 13,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 30,
    },

    emptyText: {
        color: '#6B7280',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },

    loadingText: {
        color: '#A1AEBB',
        fontSize: 16,
        marginTop: 20,
    },

    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: '#22C55E',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },

    retryText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default InstrumentList;