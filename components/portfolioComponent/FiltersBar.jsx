import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FiltersBar = ({
    searchQuery,
    onSearchChange,
    onToggleFilters,
    showFilters,
    selectedFilter,
    onFilterChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    totalCount
}) => {
    const [localShowFilters, setLocalShowFilters] = useState(showFilters);

    const handleToggleFilters = () => {
        setLocalShowFilters(!localShowFilters);
        onToggleFilters(!localShowFilters);
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#8B949E" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by symbol..."
                        placeholderTextColor="#8B949E"
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                    {searchQuery !== "" && (
                        <TouchableOpacity onPress={() => onSearchChange("")}>
                            <Ionicons name="close-circle" size={20} color="#8B949E" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={handleToggleFilters}
                >
                    <Ionicons name="options-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {localShowFilters && (
                <View style={styles.filtersPanel}>
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Filter by:</Text>
                        <View style={styles.filterChips}>
                            {[
                                { id: 'all', label: `All (${totalCount})` },
                                { id: 'profit', label: 'Profit (+)', activeClass: 'profit' },
                                { id: 'loss', label: 'Loss (-)', activeClass: 'loss' }
                            ].map(filter => (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[
                                        styles.chip,
                                        selectedFilter === filter.id && styles.chipActive,
                                        selectedFilter === filter.id && filter.activeClass === 'profit' && styles.chipActiveProfit,
                                        selectedFilter === filter.id && filter.activeClass === 'loss' && styles.chipActiveLoss
                                    ]}
                                    onPress={() => onFilterChange(filter.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedFilter === filter.id && styles.chipTextActive
                                    ]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Sort by:</Text>
                        <View style={styles.sortContainer}>
                            {[
                                { id: 'pnl', label: 'PnL' },
                                { id: 'symbol', label: 'Symbol' },
                                { id: 'volume', label: 'Volume' }
                            ].map(sort => (
                                <TouchableOpacity
                                    key={sort.id}
                                    style={styles.sortButton}
                                    onPress={() => {
                                        if (sortBy === sort.id) {
                                            onSortOrderChange(sortOrder === "desc" ? "asc" : "desc");
                                        } else {
                                            onSortChange(sort.id);
                                            onSortOrderChange("desc");
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.sortText,
                                        sortBy === sort.id && styles.sortTextActive
                                    ]}>
                                        {sort.label}
                                    </Text>
                                    {sortBy === sort.id && (
                                        <Ionicons
                                            name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
                                            size={14}
                                            color="#22c55e"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 12
    },
    searchContainer: {
        flexDirection: "row",
        gap: 12
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#161B22",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        marginLeft: 8
    },
    filterButton: {
        width: 44,
        height: 44,
        backgroundColor: "#161B22",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    filtersPanel: {
        backgroundColor: "#161B22",
        marginTop: 12,
        borderRadius: 12,
        padding: 16
    },
    filterSection: {
        marginBottom: 16
    },
    filterLabel: {
        color: "#8B949E",
        fontSize: 14,
        marginBottom: 8
    },
    filterChips: {
        flexDirection: "row",
        gap: 8
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#0D1117"
    },
    chipActive: {
        backgroundColor: "#30363D"
    },
    chipActiveProfit: {
        backgroundColor: "#22c55e20"
    },
    chipActiveLoss: {
        backgroundColor: "#ef444420"
    },
    chipText: {
        color: "#8B949E",
        fontSize: 14
    },
    chipTextActive: {
        color: "#fff"
    },
    sortContainer: {
        flexDirection: "row",
        gap: 16
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    sortText: {
        color: "#8B949E",
        fontSize: 14
    },
    sortTextActive: {
        color: "#22c55e",
        fontWeight: "600"
    }
});
