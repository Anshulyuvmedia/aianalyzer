// app/(root)/Portfolio/TradesScreen.jsx
import React, { useContext, useState, useCallback, useEffect, useMemo } from "react";
import HomeHeader from '@/components/HomeHeader';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar as RNTabBar } from 'react-native-tab-view';
import { BrokerContext } from "@/context/BrokerContext";
import { useInstruments } from "@/context/InstrumentContext";
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';
import { ToastNotification } from '@/components/ToastNotification';
import { DialogModal } from '@/components/DialogModal';
import PendingOrderCard from '@/components/orders/PendingOrderCard';
import HistoryOrderCard from '@/components/orders/HistoryOrderCard';
import { EmptyState } from '@/components/orders/EmptyState';
import { DateRangeSelector } from '@/components/orders/DateRangeSelector';

export default function TradesScreen() {
    const layout = useWindowDimensions();
    const {
        orders = [],
        fetchOrders,
        cancelOrder,
        getOrderHistory,
        modifyOrder,
        loading
    } = useContext(BrokerContext);
    const { symbolSpecs = {} } = useInstruments();
    const { toast, hideToast, showSuccess, showError } = useToast();
    const { dialog, hideDialog, showConfirm } = useDialog();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'pending', title: 'Pending Orders' },
        { key: 'history', title: 'Order History' },
    ]);

    const [orderHistory, setOrderHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [selectedRange, setSelectedRange] = useState('month');
    const [modifyingOrderId, setModifyingOrderId] = useState(null);

    // Load order history when switching to history tab
    useEffect(() => {
        if (index === 1) {
            loadOrderHistory();
        }
    }, [index]);

    // Filter history when date range changes
    useEffect(() => {
        if (orderHistory.length > 0) {
            filterHistoryByDateRange();
        }
    }, [selectedRange, orderHistory]);

    const loadOrderHistory = async () => {
        setLoadingHistory(true);
        try {
            const history = await getOrderHistory();
            const historyArray = Array.isArray(history) ? history : [];
            setOrderHistory(historyArray);
        } catch (err) {
            console.warn('Failed to load order history:', err);
            setOrderHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const filterHistoryByDateRange = () => {
        if (!orderHistory.length) {
            setFilteredHistory([]);
            return;
        }

        let filtered = [...orderHistory];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate = null;

        switch (selectedRange) {
            case 'today':
                startDate = today;
                break;
            case 'yesterday':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 30);
                break;
            default:
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 30);
        }

        if (startDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.doneTime || order.time || order.closeTime || order.closedAt);
                return orderDate >= startDate;
            });
        }

        // Sort by date descending (newest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.doneTime || a.time || a.closeTime || a.closedAt || 0);
            const dateB = new Date(b.doneTime || b.time || b.closeTime || b.closedAt || 0);
            return dateB - dateA;
        });

        setFilteredHistory(filtered);
    };

    const handleCancelOrder = useCallback(async (order) => {
        if (!order || !order.id) {
            showError('Error', 'Invalid order');
            return;
        }

        showConfirm(
            'Cancel Order',
            `Are you sure you want to cancel ${order.symbol || 'order'} ${order.type?.replace("ORDER_TYPE_", "") || ''} order?`,
            async () => {
                setCancellingOrderId(order.id);
                try {
                    await cancelOrder(order.id);
                    showSuccess('Success', 'Order cancelled successfully');
                    await fetchOrders();
                } catch (error) {
                    showError('Error', error.message || 'Failed to cancel order');
                } finally {
                    setCancellingOrderId(null);
                }
            }
        );
    }, [cancelOrder, fetchOrders, showConfirm, showSuccess, showError]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (index === 0) {
                await fetchOrders();
            } else {
                await loadOrderHistory();
            }
        } catch (error) {
            console.warn('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatPrice = useCallback((price, symbol) => {
        if (!price && price !== 0) return '0.00';
        const digits = symbolSpecs?.[symbol]?.digits ?? 5;
        return Number(price).toFixed(digits);
    }, [symbolSpecs]);

    const handleModifyOrder = useCallback(async (orderId, modifications) => {
        setModifyingOrderId(orderId);
        try {
            await modifyOrder(orderId, modifications);
            showSuccess('Success', 'Order modified successfully');
            await fetchOrders();
        } catch (error) {
            showError('Error', error.message || 'Failed to modify order');
            throw error;
        } finally {
            setModifyingOrderId(null);
        }
    }, [modifyOrder, fetchOrders, showSuccess, showError]);

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
        />
    );

    // Pending Orders Scene
    const PendingOrdersScene = () => (
        <View style={styles.sceneContainer}>
            {loading && orders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : orders.length === 0 ? (
                <EmptyState
                    icon="document-text-outline"
                    title="No Pending Orders"
                    message="Your pending orders will appear here"
                />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item }) => (
                        <PendingOrderCard
                            key={item.id}
                            order={item}
                            onCancel={handleCancelOrder}
                            onModify={handleModifyOrder}
                            isCancelling={cancellingOrderId === item.id}
                            isModifying={modifyingOrderId === item.id}
                            formatPrice={formatPrice}
                            symbolSpecs={symbolSpecs}
                        />
                    )}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    refreshControl={refreshControl}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )

    // Order History Scene
    const OrderHistoryScene = useCallback(() => (
        <View style={styles.sceneContainer}>
            <DateRangeSelector
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
            />

            {loadingHistory && orderHistory.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : filteredHistory.length === 0 ? (
                <EmptyState
                    icon="time-outline"
                    title="No Order History"
                    message="No orders found for the selected date range"
                />
            ) : (
                <>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyCount}>
                            {filteredHistory.length} order{filteredHistory.length !== 1 ? 's' : ''} found
                        </Text>
                    </View>
                    <FlatList
                        data={filteredHistory}
                        renderItem={({ item }) => (
                            <HistoryOrderCard
                                order={item}
                                formatPrice={formatPrice}
                            />
                        )}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        refreshControl={refreshControl}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </View>
    ), [filteredHistory, loadingHistory, orderHistory.length, selectedRange, formatPrice, refreshControl]);

    const renderScene = SceneMap({
        pending: PendingOrdersScene,
        history: OrderHistoryScene,
    });

    const renderTabBar = (props) => (
        <RNTabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            activeColor="#22c55e"
            inactiveColor="#8B949E"
            pressColor="transparent"
            renderLabel={({ route, focused, color }) => (
                <View style={styles.tabLabelContainer}>
                    <Text style={[styles.tabLabelText, { color }]}>
                        {route.title}
                        {route.key === 'pending' && orders.length > 0 && (
                            <Text style={styles.tabBadge}> ({orders.length})</Text>
                        )}
                    </Text>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'All Trades'} subtitle={'View all trades'} />

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                swipeEnabled={true}
                animationEnabled={true}
            />

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
    sceneContainer: {
        flex: 1,
        backgroundColor: "#000"
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 4
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12
    },
    loadingText: {
        color: "#8B949E",
        fontSize: 14
    },
    historyHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#0D1117",
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8
    },
    historyCount: {
        color: "#8B949E",
        fontSize: 12,
        textAlign: "center"
    },
    tabBar: {
        backgroundColor: "#0D1117",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
    },
    tabIndicator: {
        backgroundColor: "#22c55e",
        height: 3,
        borderRadius: 3,
    },
    tabLabel: {
        fontWeight: "600",
        fontSize: 14,
    },
    tabLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    tabLabelText: {
        fontSize: 14,
        fontWeight: "600",
    },
    tabBadge: {
        fontSize: 12,
        fontWeight: "500",
    },
});