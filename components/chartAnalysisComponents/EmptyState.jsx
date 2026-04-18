// components/chartAnalysisComponents/EmptyState.jsx
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const EmptyState = ({
    hasSearchQuery,
    searchQuery,
    onClearSearch,
    onRefresh
}) => {
    return (
        <View style={styles.noDataContainer}>
            <Feather name="inbox" size={48} color="#4b5563" />
            <Text style={styles.noDataTitle}>
                {hasSearchQuery ? 'No matching analyses found' : 'No Analysis Data'}
            </Text>
            <Text style={styles.noDataText}>
                {hasSearchQuery
                    ? `No results for "${searchQuery}"`
                    : 'Run a new analysis to see results here'}
            </Text>
            {hasSearchQuery && (
                <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={onClearSearch}
                >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
            >
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noDataTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    noDataText: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    refreshButton: {
        marginTop: 20,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    clearSearchButton: {
        marginTop: 12,
        backgroundColor: '#151515',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    clearSearchText: {
        color: '#9ca3af',
        fontSize: 14,
    },
});