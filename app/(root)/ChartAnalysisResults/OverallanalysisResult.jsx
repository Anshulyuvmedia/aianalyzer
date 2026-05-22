// app/ChartAnalysisResults/OverallanalysisResult.jsx (FIXED)

import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';
import { SectionList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAnalysis } from '@/context/ChartAnalysisContext';
import FilterBar from '@/components/chartAnalysisComponents/FilterBar';
import { AnalysisCard } from '@/components/chartAnalysisComponents/AnalysisCard';
import { SectionHeader } from '@/components/chartAnalysisComponents/SectionHeader';
import { EmptyState } from '@/components/chartAnalysisComponents/EmptyState';
import { LoadingState } from '@/components/chartAnalysisComponents/LoadingState';
import { ListFooter } from '@/components/chartAnalysisComponents/ListFooter';
import { DeleteConfirmationModal } from '@/components/chartAnalysisComponents/DeleteConfirmationModal';

const ITEMS_PER_PAGE = 10;

const OverallanalysisResult = () => {
    const {
        analysisHistory,
        getFilteredAnalyses,
        isLoadingHistory,
        fetchAnalysisHistory,
        filters,
        updateFilters,
        deleteAnalysis,
        deleteMultipleAnalyses
    } = useAnalysis();

    const [expandedAnalysis, setExpandedAnalysis] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedAnalyses, setSelectedAnalyses] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get filtered analyses
    const filteredAnalyses = useMemo(() => {
        return getFilteredAnalyses();
    }, [getFilteredAnalyses]);

    // Handle single delete
    const handleDeleteAnalysis = async (analysisId) => {
        const result = await deleteAnalysis(analysisId);
        if (result.success) {
            setExpandedAnalysis(null);
            // Also remove from selection if present
            if (selectedAnalyses.has(analysisId)) {
                const newSelection = new Set(selectedAnalyses);
                newSelection.delete(analysisId);
                setSelectedAnalyses(newSelection);
            }
        }
        return result;
    };

    // Handle batch delete
    const handleBatchDelete = async () => {
        setIsDeleting(true);
        const analysisIds = Array.from(selectedAnalyses);
        const result = await deleteMultipleAnalyses(analysisIds);
        if (result.success) {
            setSelectedAnalyses(new Set());
            setIsSelectionMode(false);
            setExpandedAnalysis(null);
        }
        setIsDeleting(false);
        setShowDeleteModal(false);
    };

    // Toggle selection for batch delete
    const toggleSelection = (analysisId) => {
        const newSelection = new Set(selectedAnalyses);
        if (newSelection.has(analysisId)) {
            newSelection.delete(analysisId);
        } else {
            newSelection.add(analysisId);
        }
        setSelectedAnalyses(newSelection);
    };

    // Select/Deselect all visible analyses
    const toggleSelectAll = () => {
        const visibleIds = filteredAnalyses.map(a => a._id);
        if (selectedAnalyses.size === visibleIds.length) {
            setSelectedAnalyses(new Set());
        } else {
            setSelectedAnalyses(new Set(visibleIds));
        }
    };

    // Exit selection mode
    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedAnalyses(new Set());
    };

    // Group analyses by date
    const groupedAnalyses = useMemo(() => {
        const groups = new Map();

        filteredAnalyses.forEach(analysis => {
            const date = new Date(analysis.createdAt || analysis.requestedAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let groupKey;
            let groupTitle;

            if (date.toDateString() === today.toDateString()) {
                groupKey = 'today';
                groupTitle = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                groupKey = 'yesterday';
                groupTitle = 'Yesterday';
            } else {
                groupKey = date.toISOString().split('T')[0];
                groupTitle = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    title: groupTitle,
                    key: groupKey,
                    data: []
                });
            }
            groups.get(groupKey).data.push(analysis);
        });

        // Sort groups by date (newest first)
        const sortedGroups = Array.from(groups.values()).sort((a, b) => {
            if (a.key === 'today') return -1;
            if (b.key === 'today') return 1;
            if (a.key === 'yesterday') return -1;
            if (b.key === 'yesterday') return 1;
            return b.key.localeCompare(a.key);
        });

        // Paginate the groups
        const paginatedGroups = sortedGroups.map(group => ({
            ...group,
            data: group.data.slice(0, currentPage * ITEMS_PER_PAGE)
        }));

        return paginatedGroups;
    }, [filteredAnalyses, currentPage]);

    const totalDisplayed = groupedAnalyses.reduce((sum, group) => sum + group.data.length, 0);
    const hasMore = totalDisplayed < filteredAnalyses.length;

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
    }, [hasMore, isLoadingMore]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
        setExpandedAnalysis(null);
        exitSelectionMode();
    }, [filters]);

    // Render each analysis card with checkbox in selection mode
    const renderAnalysisCard = ({ item }) => {
        const isExpanded = expandedAnalysis === item._id;
        const isSelected = selectedAnalyses.has(item._id);

        return (
            <View style={styles.cardContainer}>
                {/* Checkbox overlay for selection mode */}
                {isSelectionMode && (
                    <TouchableOpacity
                        style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                        onPress={() => toggleSelection(item._id)}
                        activeOpacity={0.7}
                    >
                        {isSelected && <Feather name="check" size={12} color="#fff" />}
                    </TouchableOpacity>
                )}

                <AnalysisCard
                    analysis={item}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedAnalysis(isExpanded ? null : item._id)}
                    onDelete={handleDeleteAnalysis}
                    isSelectionMode={isSelectionMode}
                    isSelected={isSelected}
                />
            </View>
        );
    };

    const renderSectionHeader = ({ section }) => (
        <SectionHeader title={section.title} count={section.data.length} />
    );

    return (
        <View style={styles.container}>
            <HomeHeader
                page="Home"
                title="Analysis Dashboard"
                subtitle="AI-powered technical analysis & trading insights"
            />

            {isLoadingHistory && analysisHistory.length === 0 && <LoadingState />}

            <FilterBar />

            {/* Empty state */}
            {filteredAnalyses.length === 0 && !isLoadingHistory && (
                <EmptyState
                    hasSearchQuery={!!filters.searchQuery}
                    searchQuery={filters.searchQuery}
                    onClearSearch={() => updateFilters({ searchQuery: '' })}
                    onRefresh={() => fetchAnalysisHistory()}
                />
            )}


            {/* Batch Delete Bar */}
            {filteredAnalyses.length > 0 && (
                <View style={styles.batchBar}>
                    {isSelectionMode ? (
                        <>
                            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                                <Text style={styles.selectAllText}>
                                    {selectedAnalyses.size === filteredAnalyses.length ? 'Deselect All' : 'Select All'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.selectedCount}>
                                {selectedAnalyses.size} selected
                            </Text>

                            {selectedAnalyses.size > 0 && (
                                <TouchableOpacity
                                    onPress={() => setShowDeleteModal(true)}
                                    style={styles.batchDeleteButton}
                                >
                                    <Feather name="trash-2" size={16} color="#ef4444" />
                                    <Text style={styles.batchDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={exitSelectionMode} style={styles.cancelSelectionButton}>
                                <Text style={styles.cancelSelectionText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={() => setIsSelectionMode(true)} style={styles.selectModeButton}>
                            <Feather name="check-square" size={16} color="#60a5fa" />
                            <Text style={styles.selectModeText}>Select</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            {/* Results list */}
            {filteredAnalyses.length > 0 && (
                <>
                    <View style={styles.resultsCount}>
                        <Text style={styles.resultsCountText}>
                            Showing {totalDisplayed} of {filteredAnalyses.length} analyses
                            {filters.searchQuery && ` matching "${filters.searchQuery}"`}
                        </Text>
                    </View>

                    <SectionList
                        sections={groupedAnalyses}
                        renderItem={renderAnalysisCard}
                        renderSectionHeader={renderSectionHeader}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        stickySectionHeadersEnabled={false}
                        ListFooterComponent={
                            <ListFooter
                                isLoadingMore={isLoadingMore}
                                hasMore={hasMore}
                                totalDisplayed={totalDisplayed}
                            />
                        }
                    />
                </>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleBatchDelete}
                itemCount={selectedAnalyses.size}
                itemName="analyses"
                isDeleting={isDeleting}
            />
        </View>
    );
};

export default OverallanalysisResult;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 10,
    },
    resultsCount: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        marginBottom: 4,
    },
    resultsCountText: {
        color: '#6b7280',
        fontSize: 12,
    },
    listContainer: {
        paddingBottom: 20,
    },
    batchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    selectModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    selectModeText: {
        color: '#60a5fa',
        fontSize: 14,
    },
    selectAllButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    selectAllText: {
        color: '#60a5fa',
        fontSize: 12,
    },
    selectedCount: {
        color: '#fff',
        fontSize: 12,
    },
    batchDeleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    batchDeleteText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '500',
    },
    cancelSelectionButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cancelSelectionText: {
        color: '#6b7280',
        fontSize: 12,
    },
    cardContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    checkbox: {
        position: 'absolute',
        left: 0,
        top: -5,
        width: 25,
        height: 25,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#6b7280',
        backgroundColor: '#151515',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    checkboxSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
});