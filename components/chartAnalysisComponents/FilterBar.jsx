// components/chartAnalysisComponents/FilterBar.jsx
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAnalysis } from '@/context/ChartAnalysisContext';

const FilterBar = () => {
    const { filters, updateFilters, statistics } = useAnalysis();
    const [modalVisible, setModalVisible] = useState(false);
    const [localSearch, setLocalSearch] = useState(filters.searchQuery);

    const handleSearch = () => {
        updateFilters({ searchQuery: localSearch });
    };
    const handleClearSearch = () => {
        setLocalSearch('');
        updateFilters({ searchQuery: '' });
    };

    const timeframes = [
        { label: 'All', value: 'all' },
        { label: '1m', value: '1m' },
        { label: '5m', value: '5m' },
        { label: '15m', value: '15m' },
        { label: '1h', value: '1h' },
        { label: '4h', value: '4h' },
        { label: '1d', value: '1d' },
    ];

    const biases = [
        { label: 'All', value: 'all', color: '#3b82f6' },
        { label: 'Bullish', value: 'bullish', color: '#22c55e' },
        { label: 'Bearish', value: 'bearish', color: '#ef4444' },
        { label: 'Neutral', value: 'neutral', color: '#f59e0b' },
    ];

    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
    ];

    return (
        <>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={18} color="#9ca3af" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by instrument..."
                        placeholderTextColor="#6b7280"
                        value={localSearch}
                        onChangeText={setLocalSearch}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {localSearch.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Feather name="x" size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Feather name="sliders" size={18} color="#60a5fa" />
                    <Text style={styles.filterButtonText}>Filters</Text>
                    {(filters.selectedTimeframe !== 'all' || filters.selectedBias !== 'all') && (
                        <View style={styles.activeDot} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Statistics Summary */}
            {statistics && statistics.totalAnalyses > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{statistics.totalAnalyses}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#22c55e' }]}>{statistics.totalBullish}</Text>
                        <Text style={styles.statLabel}>Bullish</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#ef4444' }]}>{statistics.totalBearish}</Text>
                        <Text style={styles.statLabel}>Bearish</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{statistics.successRate}%</Text>
                        <Text style={styles.statLabel}>Win Rate</Text>
                    </View>
                </View>
            )}

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Analysis</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSectionTitle}>Timeframe</Text>
                        <View style={styles.optionsGrid}>
                            {timeframes.map(tf => (
                                <TouchableOpacity
                                    key={tf.value}
                                    style={[
                                        styles.optionButton,
                                        filters.selectedTimeframe === tf.value && styles.optionActive
                                    ]}
                                    onPress={() => updateFilters({ selectedTimeframe: tf.value })}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        filters.selectedTimeframe === tf.value && styles.optionTextActive
                                    ]}>{tf.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalSectionTitle}>Market Bias</Text>
                        <View style={styles.optionsRow}>
                            {biases.map(bias => (
                                <TouchableOpacity
                                    key={bias.value}
                                    style={[
                                        styles.biasButton,
                                        filters.selectedBias === bias.value && { borderColor: bias.color, backgroundColor: `${bias.color}20` }
                                    ]}
                                    onPress={() => updateFilters({ selectedBias: bias.value })}
                                >
                                    <View style={[styles.biasDot, { backgroundColor: bias.color }]} />
                                    <Text style={styles.biasText}>{bias.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalSectionTitle}>Sort By</Text>
                        <View style={styles.optionsRow}>
                            {sortOptions.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        filters.sortBy === option.value && styles.optionActive
                                    ]}
                                    onPress={() => updateFilters({ sortBy: option.value })}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        filters.sortBy === option.value && styles.optionTextActive
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    updateFilters({
                                        searchQuery: '',
                                        selectedTimeframe: 'all',
                                        selectedBias: 'all',
                                        sortBy: 'newest'
                                    });
                                    setLocalSearch('');
                                }}
                            >
                                <Text style={styles.resetText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 2,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 6,
        position: 'relative',
    },
    filterButtonText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
    activeDot: {
        position: 'absolute',
        top: 6,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#151515',
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#374151',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#101010',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    modalSectionTitle: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 15,
        marginBottom: 10,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    optionButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    optionActive: {
        backgroundColor: '#3b82f6',
    },
    optionText: {
        color: '#d1d5db',
        fontSize: 14,
    },
    optionTextActive: {
        color: '#fff',
    },
    biasButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    biasDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    biasText: {
        color: '#fff',
        fontSize: 14,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 25,
        marginBottom: 10,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#151515',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    resetText: {
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '500',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    applyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default FilterBar;