// app/(root)/Portfolio/TradesScreen.jsx
import React, { useContext, useState, useCallback, useEffect } from "react";
import HomeHeader from '@/components/HomeHeader';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text } from "react-native";
import { BrokerContext } from "@/context/BrokerContext";
import { useInstruments } from "@/context/InstrumentContext";
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';
import { ToastNotification } from '@/components/ToastNotification';
import { DialogModal } from '@/components/DialogModal';
import { PendingOrderCard } from '@/components/orders/PendingOrderCard';
import HistoryOrderCard from '@/components/orders/HistoryOrderCard';
import { EmptyState } from '@/components/orders/EmptyState';
import { TabBar } from '@/components/orders/TabBar';
import { DateRangeSelector } from '@/components/orders/DateRangeSelector';

export default function TradesScreen() {
    const { orders = [], fetchOrders, cancelOrder, getOrderHistory } = useContext(BrokerContext);
    const { symbolSpecs = {} } = useInstruments();
    const { toast, hideToast, showSuccess, showError } = useToast();
    const { dialog, hideDialog, showConfirm } = useDialog();

    const [activeTab, setActiveTab] = useState('pending');
    const [orderHistory, setOrderHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [selectedRange, setSelectedRange] = useState('month');

    const tabs = [
        { key: 'pending', label: 'Pending Orders', count: orders.length },
        { key: 'history', label: 'Order History' }
    ];

    // Load order history when tab changes
    useEffect(() => {
        if (activeTab === 'history') {
            loadOrderHistory();
        }
    }, [activeTab]);

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
            // console.log('Order history loaded:', history || 0, 'orders');
            setOrderHistory(Array.isArray(history) ? history : history);
        } catch (err) {
            console.warn('Failed to load order history:', err);
            setOrderHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const filterHistoryByDateRange = () => {
        let filtered = [...orderHistory];
        // console.log('filtered', filtered);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let startDate = null;

        switch (selectedRange) {
            case 'today':
                startDate = today;
                break;
            case 'yesterday':
                startDate = yesterday;
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
                const orderDate = new Date(order.doneTime || order.time || order.closeTime);
                return orderDate >= startDate;
            });
        }

        // Sort by date descending (newest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.doneTime || a.time || a.closeTime || 0);
            const dateB = new Date(b.doneTime || b.time || b.closeTime || 0);
            return dateB - dateA;
        });

        setFilteredHistory(filtered);
    };

    const handleCancelOrder = (order) => {
        showConfirm(
            'Cancel Order',
            `Are you sure you want to cancel ${order.symbol} ${order.type?.replace("ORDER_TYPE_", "")} order?`,
            async () => {
                setCancellingOrder(order.id);
                try {
                    await cancelOrder(order.id);
                    showSuccess('Success', 'Order cancelled successfully');
                    await fetchOrders();
                } catch (error) {
                    showError('Error', error.message || 'Failed to cancel order');
                } finally {
                    setCancellingOrder(null);
                }
            }
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'pending') {
            await fetchOrders();
        } else {
            await loadOrderHistory();
        }
        setRefreshing(false);
    };

    const formatPrice = (price, symbol) => {
        const digits = symbolSpecs?.[symbol]?.digits ?? 5;
        return Number(price || 0).toFixed(digits);
    };

    const renderPendingOrder = ({ item }) => (
        <PendingOrderCard
            order={item}
            onCancel={handleCancelOrder}
            isCancelling={cancellingOrder === item.id}
            formatPrice={formatPrice}
        />
    );

    const renderHistoryOrder = ({ item }) => (
        <HistoryOrderCard
            order={item}
            formatPrice={formatPrice}
        />
    );

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
        />
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Orders'} />

            <TabBar
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Pending Orders Tab */}
            {activeTab === 'pending' && (
                <>
                    {orders.length === 0 ? (
                        <EmptyState
                            icon="document-text-outline"
                            title="No Pending Orders"
                            message="Your pending orders will appear here"
                        />
                    ) : (
                        <FlatList
                            data={orders}
                            renderItem={renderPendingOrder}
                            keyExtractor={(item) => item.id?.toString()}
                            // refreshControl={refreshControl}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </>
            )}

            {/* Order History Tab */}
            {activeTab === 'history' && (
                <>
                    <DateRangeSelector
                        selectedRange={selectedRange}
                        onRangeChange={setSelectedRange}
                    />

                    {loadingHistory && orderHistory.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#22c55e" />
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
                                renderItem={renderHistoryOrder}
                                keyExtractor={(item) => item.id?.toString()}
                                // refreshControl={refreshControl}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        </>
                    )}
                </>
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
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 4
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    historyHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#0D1117",
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8
    },
    historyCount: {
        color: "#8B949E",
        fontSize: 12,
        textAlign: "center"
    }
});