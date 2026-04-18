import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAnalysis } from '@/context/ChartAnalysisContext';
import { useInstruments } from '@/context/InstrumentContext';

const SelectTradingPairs = () => {
    const { requestAnalysis, isAnalyzing } = useAnalysis();
    const {
        instrumentsByType,
        fetchInstruments,
        loading: instrumentsLoading,
        searchInstruments,
        searchResults: contextSearchResults,
        isSearchingSymbols,
        clearSearchResults
    } = useInstruments();

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Forex');
    const [analysisType, setAnalysisType] = useState('Swing');
    const [selectedPairs, setSelectedPairs] = useState([]);
    const [timeframe, setTimeframe] = useState('5m');
    const [analysisStyle, setAnalysisStyle] = useState('Price Action');
    const [searchQuery, setSearchQuery] = useState('');
    const [forexSubCategory, setForexSubCategory] = useState('All');
    const [visibleCount, setVisibleCount] = useState(20);
    const [refreshing, setRefreshing] = useState(false);
    const [allInstrumentsList, setAllInstrumentsList] = useState([]);

    const analysisStyles = ['Price Action', 'Smart Money Concept (SMC)', 'ICT', 'Order Flow', 'Supply & Demand', 'Classic TA', 'CRT'];

    const majorPairs = ['AUDUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'NZDUSD'];
    const minorPairs = ['EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD', 'EURSEK', 'EURNOK', 'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD', 'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD', 'CADJPY', 'CADCHF', 'CHFJPY'];

    // Map tabs to instrument types
    const tabToInstrumentType = {
        'Forex': 'forex',
        'Commodities': 'commodities',
        'Crypto': 'crypto'
    };

    // Get the hardcoded pairs for Forex tab
    const getHardcodedForexPairs = useCallback(() => {
        if (forexSubCategory === 'Major') {
            return majorPairs.map(symbol => ({ symbol }));
        } else if (forexSubCategory === 'Minor') {
            return minorPairs.map(symbol => ({ symbol }));
        } else {
            return [...majorPairs, ...minorPairs].map(symbol => ({ symbol }));
        }
    }, [forexSubCategory]);

    // Debounced search using context's search method
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                searchInstruments(searchQuery, { limit: 50 });
            } else {
                clearSearchResults();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, searchInstruments, clearSearchResults]);

    // Fetch instruments for non-Forex tabs
    useEffect(() => {
        const instrumentType = tabToInstrumentType[activeTab];
        if (instrumentType && activeTab !== 'Forex') {
            let isMounted = true;
            const loadInstruments = async () => {
                const instruments = await fetchInstruments(instrumentType, { forceRefresh: false });
                if (isMounted && instruments) {
                    setAllInstrumentsList(instruments);
                }
            };
            loadInstruments();
            return () => {
                isMounted = false;
            };
        } else if (activeTab === 'Forex') {
            // For Forex, use hardcoded pairs
            setAllInstrumentsList(getHardcodedForexPairs());
        }
    }, [activeTab, fetchInstruments, getHardcodedForexPairs]);

    // Get displayed instruments based on search or filter
    const getDisplayedInstruments = useCallback(() => {
        // If searching, show search results from context
        if (searchQuery.trim()) {
            return contextSearchResults;
        }

        // Otherwise, show filtered hardcoded pairs or fetched instruments
        let results = allInstrumentsList;

        // Apply subcategory filter for Forex (only when not searching)
        if (activeTab === 'Forex' && forexSubCategory !== 'All' && !searchQuery.trim()) {
            const targetPairs = forexSubCategory === 'Major' ? majorPairs : minorPairs;
            results = results.filter(inst =>
                targetPairs.includes(inst.symbol)
            );
        }

        return results;
    }, [searchQuery, contextSearchResults, allInstrumentsList, activeTab, forexSubCategory]);

    const displayedInstruments = useMemo(() => {
        const results = getDisplayedInstruments();
        return results.slice(0, visibleCount);
    }, [getDisplayedInstruments, visibleCount]);

    const totalResults = getDisplayedInstruments().length;
    const hasMore = totalResults > visibleCount;

    const loadMore = () => {
        setVisibleCount(prev => prev + 20);
    };

    const handleTogglePair = (pair) => {
        const pairSymbol = typeof pair === 'string' ? pair : pair.symbol;
        setSelectedPairs((prev) =>
            prev.includes(pairSymbol) ? prev.filter((p) => p !== pairSymbol) : [...prev, pairSymbol]
        );
    };

    const handleSelectAll = () => {
        const currentResults = getDisplayedInstruments();
        const allSymbols = currentResults.map(inst => inst.symbol);
        setSelectedPairs(allSymbols);
    };

    const handleClearAll = () => {
        setSelectedPairs([]);
    };

    const handleAnalyzeChart = async () => {
        if (selectedPairs.length === 0) {
            Alert.alert('Error', 'Please select at least one trading pair');
            return;
        }
        console.log('Sending analysisStyle:', analysisStyle);
        console.log('analysisStyle type:', typeof analysisStyle);

        const result = await requestAnalysis({
            activeTab,
            selectedPairs,
            analysisType,
            timeframe,
            analysisStyle,
        });

        if (result && result.success) {
            setSelectedPairs([]);
            setActiveTab('Forex');
            setAnalysisType('Swing');
            setTimeframe('1H');
            setAnalysisStyle('Price Action');
            setSearchQuery('');
            setForexSubCategory('All');
            setVisibleCount(20);
            clearSearchResults();

            // Navigate with the analysis data
            router.push({
                pathname: '../ChartAnalysisResults/OverallanalysisResult',
                params: { analysisData: JSON.stringify(result) }
            });
        }
    };

    const handleViewAllAnalysis = () => {
        router.push('../ChartAnalysisResults/OverallanalysisResult');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab !== 'Forex') {
            const instrumentType = tabToInstrumentType[activeTab];
            if (instrumentType) {
                const instruments = await fetchInstruments(instrumentType, { forceRefresh: true });
                setAllInstrumentsList(instruments || []);
            }
        } else {
            // Refresh hardcoded forex pairs
            setAllInstrumentsList(getHardcodedForexPairs());
        }
        setRefreshing(false);
    };

    const renderInstrumentItem = (instrument) => {
        const symbol = instrument.symbol;
        const isSelected = selectedPairs.includes(symbol);

        return (
            <TouchableOpacity
                key={symbol}
                style={[
                    styles.pairItem,
                    isSelected && styles.selectedPair,
                ]}
                onPress={() => handleTogglePair(instrument)}
            >
                <Text
                    style={[
                        styles.pairText,
                        isSelected && styles.selectedPairText,
                    ]}
                >
                    {symbol}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        nestedScrollEnabled={true}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                        }
                    >
                        <View style={styles.container}>
                            <View style={styles.headerRow}>
                                <Feather name="target" size={24} color="#60a5fa" />
                                <Text style={styles.header}>Select Trading Pairs</Text>
                            </View>

                            {/* Tabs */}
                            <View style={styles.tabContainer}>
                                {Object.keys(tabToInstrumentType).map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                                        onPress={() => {
                                            setActiveTab(tab);
                                            setSearchQuery('');
                                            setForexSubCategory('All');
                                            setVisibleCount(20);
                                            setSelectedPairs([]);
                                            clearSearchResults();
                                        }}
                                    >
                                        <Text style={styles.tabText}>{tab}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Search Bar */}
                            <View style={styles.searchContainer}>
                                <Feather name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={activeTab === 'Forex'
                                        ? "Search any symbol (e.g., EURUSD, BTCUSD)..."
                                        : "Search instruments..."}
                                    placeholderTextColor="#A0AEC0"
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        setVisibleCount(20);
                                    }}
                                    autoCapitalize="characters"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => {
                                        setSearchQuery('');
                                        clearSearchResults();
                                    }}>
                                        <Feather name="x" size={20} color="#A0AEC0" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Search status indicator */}
                            {isSearchingSymbols && (
                                <View style={styles.searchingContainer}>
                                    <ActivityIndicator size="small" color="#3b82f6" />
                                    <Text style={styles.searchingText}>Searching symbols...</Text>
                                </View>
                            )}

                            {/* Forex Subcategories (only for Forex tab and when not searching) */}
                            {activeTab === 'Forex' && !searchQuery.trim() && (
                                <View style={styles.subCategoryContainer}>
                                    {['All', 'Major', 'Minor'].map((category) => {
                                        let count = 0;
                                        if (category === 'All') {
                                            count = majorPairs.length + minorPairs.length;
                                        } else if (category === 'Major') {
                                            count = majorPairs.length;
                                        } else if (category === 'Minor') {
                                            count = minorPairs.length;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={category}
                                                style={[
                                                    styles.subCategoryButton,
                                                    forexSubCategory === category && styles.activeSubCategory
                                                ]}
                                                onPress={() => {
                                                    setForexSubCategory(category);
                                                    setVisibleCount(20);
                                                    setSearchQuery('');
                                                    clearSearchResults();
                                                }}
                                            >
                                                <Text style={[
                                                    styles.subCategoryText,
                                                    forexSubCategory === category && styles.activeSubCategoryText
                                                ]}>
                                                    {category} ({count})
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Results count */}
                            {totalResults > 0 && (
                                <Text style={styles.resultsCount}>
                                    {searchQuery.trim()
                                        ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} matching "${searchQuery}"`
                                        : `${totalResults} instrument${totalResults !== 1 ? 's' : ''} available`
                                    }
                                </Text>
                            )}

                            {/* Instruments List */}
                            {(instrumentsLoading[tabToInstrumentType[activeTab]] && activeTab !== 'Forex' && !searchQuery.trim()) ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3b82f6" />
                                    <Text style={styles.loadingText}>Loading instruments from broker...</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.optionsContainer}>
                                        {displayedInstruments.length > 0 ? (
                                            displayedInstruments.map(renderInstrumentItem)
                                        ) : (
                                            <View style={styles.noResultsContainer}>
                                                <Feather name="alert-circle" size={40} color="#A0AEC0" />
                                                <Text style={styles.noResultsText}>
                                                    {searchQuery.trim()
                                                        ? `No symbols found matching "${searchQuery}"`
                                                        : activeTab === 'Forex'
                                                            ? 'No forex pairs available'
                                                            : 'No instruments available from your broker'
                                                    }
                                                </Text>
                                                {searchQuery.trim() && !isSearchingSymbols && (
                                                    <Text style={styles.availableHint}>
                                                        💡 Try searching for: EURUSD, GBPUSD, USDJPY, BTCUSD, or GOLD
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>

                                    {/* Load More Button */}
                                    {hasMore && displayedInstruments.length > 0 && (
                                        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                                            <Text style={styles.loadMoreText}>
                                                Load More ({totalResults - visibleCount} remaining)
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {/* Selection Controls */}
                            {displayedInstruments.length > 0 && (
                                <View style={styles.selectionControls}>
                                    <Text style={styles.selectedCount}>
                                        Selected: {selectedPairs.length} pair{selectedPairs.length !== 1 ? 's' : ''}
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
                            )}

                            {/* Analysis Controls */}
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

                                <Text style={[styles.controlLabel, { marginTop: 15 }]}>Analysis Style</Text>
                                <View style={styles.analysisStyleContainer}>
                                    {analysisStyles.map((style) => (
                                        <TouchableOpacity
                                            key={style}
                                            style={[
                                                styles.styleItem,
                                                analysisStyle === style && styles.activeStyleItem,
                                            ]}
                                            onPress={() => setAnalysisStyle(style)}
                                        >
                                            <Text
                                                style={[
                                                    styles.styleText,
                                                    analysisStyle === style && styles.activeStyleText,
                                                ]}
                                            >
                                                {style}
                                            </Text>
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
                                            <Picker.Item label="1 Minute" value="1m" />
                                            <Picker.Item label="3 Minutes" value="3m" />
                                            <Picker.Item label="5 Minutes" value="5m" />
                                            <Picker.Item label="15 Minutes" value="15m" />
                                            <Picker.Item label="30 Minutes" value="30m" />
                                            <Picker.Item label="1 Hour" value="1h" />
                                            <Picker.Item label="4 Hours" value="4h" />
                                            <Picker.Item label="1 Day" value="1d" />
                                        </Picker>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.analyzeButton, isAnalyzing && { opacity: 0.7 }]}
                                    onPress={handleAnalyzeChart}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.analyzeText}>Analyze Chart</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={handleViewAllAnalysis}>
                                <Text style={styles.viewAllAnalysisText}>View all analysis</Text>
                            </TouchableOpacity>

                            <View style={styles.bottomPadding} />
                        </View>
                    </ScrollView>
                </LinearGradient>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default SelectTradingPairs;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    gradientBoxBorder: {
        flex: 1,
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        flex: 1,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        paddingVertical: 10,
    },
    subCategoryContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    subCategoryButton: {
        flex: 1,
        backgroundColor: '#2d3748',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    activeSubCategory: {
        backgroundColor: '#3b82f6',
    },
    subCategoryText: {
        color: '#d1d5db',
        fontSize: 12,
        fontWeight: '500',
    },
    activeSubCategoryText: {
        color: '#fff',
    },
    resultsCount: {
        color: '#A0AEC0',
        fontSize: 12,
        marginBottom: 10,
        paddingLeft: 5,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#A0AEC0',
        marginTop: 10,
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
        paddingHorizontal: 6,
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
        fontSize: 13,
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        width: '100%',
    },
    noResultsText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
    availableHint: {
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 12,
    },
    loadMoreButton: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    loadMoreText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '500',
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
    analysisStyleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    styleItem: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    activeStyleItem: {
        backgroundColor: '#3b82f6',
        borderColor: '#60a5fa',
    },
    styleText: {
        color: '#d1d5db',
        fontSize: 13,
        fontWeight: '500',
    },
    activeStyleText: {
        color: '#fff',
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
        flex: 1 / 2,
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
    viewAllAnalysisText: {
        color: '#A0AEC0',
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 15,
    },
    bottomPadding: {
        height: 30,
    },
    searchBadge: {
        fontSize: 10,
        color: '#60a5fa',
    },
    searchingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    searchingText: {
        color: '#3b82f6',
        marginLeft: 8,
        fontSize: 12,
    },
});