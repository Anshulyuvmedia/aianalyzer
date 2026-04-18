// app/ChartAnalysisResults/OverallanalysisResult.jsx (Refactored)
import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAnalysis } from '@/context/ChartAnalysisContext';
import FilterBar from '@/components/chartAnalysisComponents/FilterBar';
import { AnalysisCard } from '@/components/chartAnalysisComponents/AnalysisCard';
import { SectionHeader } from '@/components/chartAnalysisComponents/SectionHeader';
import { EmptyState } from '@/components/chartAnalysisComponents/EmptyState';
import { LoadingState } from '@/components/chartAnalysisComponents/LoadingState';
import { ListFooter } from '@/components/chartAnalysisComponents/ListFooter';

const ITEMS_PER_PAGE = 10;

const OverallanalysisResult = () => {
    const {
        analysisHistory,
        getFilteredAnalyses,
        isLoadingHistory,
        fetchAnalysisHistory,
        filters,
        updateFilters
    } = useAnalysis();

    const [expandedAnalysis, setExpandedAnalysis] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Get filtered analyses
    const filteredAnalyses = useMemo(() => {
        return getFilteredAnalyses();
    }, [getFilteredAnalyses]);

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
    }, [filters]);

    const renderAnalysisCard = ({ item }) => {
        const isExpanded = expandedAnalysis === item._id;
        return (
            <AnalysisCard
                analysis={item}
                isExpanded={isExpanded}
                onToggle={() => setExpandedAnalysis(isExpanded ? null : item._id)}
            />
        );
    };

    const renderSectionHeader = ({ section }) => (
        <SectionHeader title={section.title} count={section.data.length} />
    );

    // Loading state
    if (isLoadingHistory && analysisHistory.length === 0) {
        return <LoadingState />;
    }

    return (
        <View style={styles.container}>
            <HomeHeader
                page="Home"
                title="Analysis Dashboard"
                subtitle="AI-powered technical analysis & trading insights"
            />
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
        </View>
    );
};

export default OverallanalysisResult;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
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
});