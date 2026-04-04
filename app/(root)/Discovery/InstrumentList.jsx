// screens/InstrumentList.js
import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import { useInstruments } from '@/context/InstrumentContext';
import { useRouter } from 'expo-router';

const TAB_TYPES = [
    { key: 'forex', label: 'Forex', icon: 'currency-usd' },
    { key: 'crypto', label: 'Crypto', icon: 'bitcoin' },
    { key: 'commodities', label: 'Commodities', icon: 'oil' },
    { key: 'stocks', label: 'Stocks', icon: 'chart-line' },
    { key: 'indices', label: 'Indices', icon: 'chart-bar' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal' }
];

const InstrumentList = () => {
    const {
        instrumentsByType,
        loading,
        error,
        fetchInstruments,
        setSelectedInstrument,
        getLogoUrl
    } = useInstruments();

    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('forex');

    const handleTypeChange = useCallback((type) => {
        setSelectedType(type);
        if (!instrumentsByType[type]?.length && !loading[type]) {
            fetchInstruments(type);
        }
    }, [fetchInstruments, instrumentsByType, loading]);

    const instruments = instrumentsByType[selectedType] || [];

    const filteredInstruments = instruments.filter(item =>
        item.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    const renderItem = ({ item }) => {
        if (!item?.symbol) return null;

        const logoUrl = getLogoUrl(item.symbol);
        const displayName = item.symbol;

        // Dynamic meta text
        let metaText = 'Instrument';
        if (selectedType === 'forex') {
            metaText = item.symbol.includes('JPY') ? 'Cross Pair' : 'Major/Minor Pair';
        } else if (selectedType === 'crypto') metaText = 'Cryptocurrency';
        else if (selectedType === 'commodities') metaText = 'Commodity';
        else if (selectedType === 'indices') metaText = 'Market Index';
        else if (selectedType === 'stocks') metaText = 'Equity';

        return (
            <TouchableOpacity
                style={styles.instrumentCard}
                activeOpacity={0.92}
                onPress={() => {
                    setSelectedInstrument(item);
                    router.push(`/Discovery/${encodeURIComponent(item.symbol)}`);
                }}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: logoUrl }}
                        style={styles.logo}
                        resizeMode="contain"
                        onError={() => console.log(`Logo failed for ${item.symbol}`)}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.symbol}>{item.symbol}</Text>
                        <Text style={styles.name} numberOfLines={1}>
                            {displayName}
                        </Text>
                    </View>

                    <View style={styles.metaContainer}>
                        <Text style={styles.metaText}>{metaText}</Text>
                    </View>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#64748b"
                    style={styles.chevron}
                />
            </TouchableOpacity>
        );
    };

    const isLoading = loading[selectedType];

    return (
        <View style={styles.container}>
            <HomeHeader
                page="discovery"
                title="Instrument Discovery"
                subtitle="Explore global trading symbols"
            />

            {/* Category Tabs */}
            <View style={styles.tabsContainer}>
                <FlatList
                    horizontal
                    data={TAB_TYPES}
                    keyExtractor={(item) => item.key}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                selectedType === item.key && styles.tabButtonActive,
                            ]}
                            onPress={() => handleTypeChange(item.key)}
                        >
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={18}
                                color={selectedType === item.key ? '#000' : '#94a3b8'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[
                                styles.tabText,
                                selectedType === item.key && styles.tabTextActive
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search symbols..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#22c55e" />
                        <Text style={styles.loadingText}>
                            Loading {selectedType} instruments...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => fetchInstruments(selectedType, { forceRefresh: true })}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredInstruments}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.symbol}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={48} color="#475569" />
                                <Text style={styles.emptyTitle}>
                                    {searchQuery.trim()
                                        ? `No results for "${searchQuery}"`
                                        : `No ${selectedType} instruments found`}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {searchQuery.trim()
                                        ? "Try a different keyword"
                                        : "New instruments may be added soon"}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={<View style={{ height: 100 }} />}
                        initialNumToRender={12}
                        maxToRenderPerBatch={20}
                        windowSize={15}
                    />
                )}
            </View>
        </View>
    );
};

export default InstrumentList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    tabsContainer: {
        backgroundColor: '#000',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1e2937',
    },
    tabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 10,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e2937',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    tabButtonActive: {
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    tabTextActive: {
        color: '#000',
        fontWeight: '700',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e2937',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: '#f1f5f9',
        fontSize: 16,
        paddingVertical: 14,
    },
    contentArea: {
        flex: 1,
    },
    instrumentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#334155',
    },
    logoContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mainInfo: {
        flex: 1,
    },
    symbol: {
        color: '#22c55e',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    name: {
        color: '#94a3b8',
        fontSize: 14.5,
        marginTop: 3,
    },
    metaContainer: {
        alignItems: 'flex-end',
    },
    metaText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '500',
        backgroundColor: '#0f172a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    chevron: {
        marginLeft: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
    },
    retryText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: '#e2e8f0',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
});