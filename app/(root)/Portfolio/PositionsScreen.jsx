import React, { useContext, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { BrokerContext } from "@/context/BrokerContext";
import { useInstruments } from "@/context/InstrumentContext";
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';
import { ToastNotification } from '@/components/ToastNotification';
import { DialogModal } from '@/components/DialogModal';
import { PositionCard } from '@/components/portfolioComponent/PositionCard';
import { SummaryCards } from '@/components/portfolioComponent/SummaryCards';
import { FiltersBar } from '@/components/portfolioComponent/FiltersBar';
import { usePositionsData } from '@/hooks/usePositionsData';
import HomeHeader from '@/components/HomeHeader';
import { useRouter } from 'expo-router';

export default function PositionsScreen() {
    const router = useRouter();
    const { positions, fetchPositions, loading, closePosition, closeMultiplePositions } = useContext(BrokerContext);
    const { quoteData = {}, symbolSpecs = {} } = useInstruments();
    const { toast, hideToast, showSuccess, showError, showWarning } = useToast();
    const { dialog, hideDialog, showConfirm, showError: showDialogError } = useDialog();

    const [refreshing, setRefreshing] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedPositions, setSelectedPositions] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    const {
        positions: filteredPositions,
        totals,
        searchQuery,
        setSearchQuery,
        selectedFilter,
        setSelectedFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        calculatePnL,
        getCurrentPrice,
        formatPrice,
        formatVolume
    } = usePositionsData(positions, quoteData, symbolSpecs);

    const togglePositionSelection = useCallback((positionId) => {
        setSelectedPositions(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(positionId)) {
                newSelection.delete(positionId);
            } else {
                newSelection.add(positionId);
            }
            return newSelection;
        });
    }, []);

    const handleClosePosition = useCallback(async (position, quantity = null) => {
        try {
            await closePosition(position.id, quantity);
            showSuccess('Success', 'Position closed successfully');
            // Refresh positions after closing
            await fetchPositions();
        } catch (error) {
            showError('Error', error.message || 'Failed to close position');
        }
    }, [closePosition, fetchPositions, showSuccess, showError]);

    const handleCloseAllPositions = useCallback(() => {
        if (positions.length === 0) return;

        showConfirm(
            'Close All Positions',
            `Are you sure you want to close all ${positions.length} positions?`,
            async () => {
                try {
                    const positionIds = positions.map(p => p.id);
                    await closeMultiplePositions(positionIds);
                    showSuccess('Success', 'All positions closed successfully');
                    // Clear selection mode if active
                    setSelectionMode(false);
                    setSelectedPositions(new Set());
                } catch (error) {
                    showError('Error', error.message || 'Failed to close positions');
                }
            }
        );
    }, [positions, closeMultiplePositions, showConfirm, showSuccess, showError]);

    const handleBulkClose = useCallback(() => {
        if (selectedPositions.size === 0) return;

        showConfirm(
            'Close Selected Positions',
            `Are you sure you want to close ${selectedPositions.size} position(s)?`,
            async () => {
                try {
                    const positionIds = Array.from(selectedPositions);
                    await closeMultiplePositions(positionIds);
                    setSelectionMode(false);
                    setSelectedPositions(new Set());
                    showSuccess('Success', 'Selected positions closed successfully');
                } catch (error) {
                    showError('Error', error.message || 'Failed to close positions');
                }
            }
        );
    }, [selectedPositions, closeMultiplePositions, showConfirm, showSuccess, showError]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPositions();
        setRefreshing(false);
    };

    const renderPosition = useCallback(({ item }) => {
        const isBuy = item.type === 'POSITION_TYPE_BUY';
        // Calculate PnL percentage safely
        const invested = item.openPrice * (item.volume || 0) * (item.contractSize || 100000);
        const pnlPercentage = invested > 0 ? (item.pnl / invested) * 100 : 0;
        const isSelected = selectedPositions.has(item.id);

        return (
            <PositionCard
                position={item}
                currentPrice={item.currentPrice}
                pnl={item.pnl}
                pnlPercentage={pnlPercentage}
                isBuy={isBuy}
                isSelected={isSelected}
                selectionMode={selectionMode}
                onPress={() => {
                    if (selectionMode) {
                        togglePositionSelection(item.id);
                    } else {
                        router.push(`/Portfolio/PositionDetailScreen?id=${item.id}`);
                    }
                }}
                onLongPress={() => {
                    if (!selectionMode) {
                        setSelectionMode(true);
                        togglePositionSelection(item.id);
                    }
                }}
                onClose={handleClosePosition}
                formatPrice={formatPrice}
                formatVolume={formatVolume}
            />
        );
    }, [selectedPositions, selectionMode, togglePositionSelection, handleClosePosition, formatPrice, formatVolume, router]);

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Positions'} />

            <FiltersBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showFilters={showFilters}
                onToggleFilters={setShowFilters}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                totalCount={positions.length}
            />

            {filteredPositions.length > 0 && (
                <SummaryCards
                    totalPnl={totals.totalPnl}
                    totalProfit={totals.totalProfit}
                    totalLoss={totals.totalLoss}
                    totalVolume={totals.totalVolume}
                />
            )}

            {filteredPositions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="folder-open-outline" size={64} color="#8B949E" />
                    <Text style={styles.emptyTitle}>No positions found</Text>
                    <Text style={styles.emptyText}>
                        {searchQuery ? "Try a different search term" : "Your open positions will appear here"}
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Open Positions ({filteredPositions.length})</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectionMode(!selectionMode);
                                if (selectionMode) setSelectedPositions(new Set());
                            }}
                            style={styles.selectionButton}
                        >
                            <Ionicons
                                name={selectionMode ? "close-outline" : "checkbox-outline"}
                                size={24}
                                color="#22c55e"
                            />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filteredPositions}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={renderPosition}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
                        }
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            {positions.length > 0 && !selectionMode && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCloseAllPositions}
                >
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                    <Text style={styles.fabText}>Close All</Text>
                </TouchableOpacity>
            )}

            {selectionMode && selectedPositions.size > 0 && (
                <View style={styles.bulkActionBar}>
                    <Text style={styles.bulkText}>
                        {selectedPositions.size} position{selectedPositions.size !== 1 ? 's' : ''} selected
                    </Text>
                    <View style={styles.bulkActions}>
                        <TouchableOpacity
                            style={styles.bulkButton}
                            onPress={handleBulkClose}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                            <Text style={[styles.bulkButtonText, { color: '#ef4444' }]}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bulkButton}
                            onPress={() => {
                                setSelectionMode(false);
                                setSelectedPositions(new Set());
                            }}
                        >
                            <Ionicons name="close-outline" size={20} color="#8B949E" />
                            <Text style={[styles.bulkButtonText, { color: '#8B949E' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ToastNotification
                visible={toast.visible}
                type={toast.type}
                message={toast.message}
                onHide={hideToast}
            />

            <DialogModal
                visible={dialog.visible}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                onConfirm={dialog.onConfirm}
                onCancel={dialog.onCancel}
                singleButton={dialog.singleButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: "#000"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8B949E"
    },
    selectionButton: {
        padding: 8,
        backgroundColor: "#161B22",
        borderRadius: 8
    },
    listContent: {
        paddingBottom: 100,
        paddingHorizontal: 16
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8
    },
    emptyText: {
        color: "#8B949E",
        fontSize: 14,
        textAlign: "center"
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#ef4444",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
    },
    fabText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600"
    },
    bulkActionBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#161B22",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#30363D"
    },
    bulkText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600"
    },
    bulkActions: {
        flexDirection: "row",
        gap: 16
    },
    bulkButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6
    },
    bulkButtonText: {
        fontSize: 14
    }
});