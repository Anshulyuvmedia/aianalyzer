// components/SupportedBrokers.jsx
import React, { useContext, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';
import { BrokerContext } from '@/context/BrokerContext';
import RBSheet from 'react-native-raw-bottom-sheet';

const SupportedBrokers = () => {
    const {
        isConnected,
        accountInfo,
        brokerConnection,
        disconnectBroker,
        loading,
        error,
        refreshStatus
    } = useContext(BrokerContext);

    const disconnectSheetRef = useRef(null);

    const handleConnect = () => {
        router.push({ pathname: 'Broker/brokerapiconnect', params: { apiType: 'MT5' } });
    };

    const handleDisconnectPress = () => {
        disconnectSheetRef.current?.open();
    };

    const confirmDisconnect = async () => {
        disconnectSheetRef.current?.close();
        await disconnectBroker();
    };

    const handleRetry = () => {
        refreshStatus?.();
    };

    const isConnectedStatus = isConnected && !loading;

    return (
        <>
            <LinearGradient
                colors={['#1e2937', '#0f172a']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <MaterialCommunityIcons
                            name="transit-connection-variant"
                            size={28}
                            color="#22c55e"
                        />
                        <Text style={styles.title}>Broker Connection</Text>
                    </View>

                    {isConnectedStatus && (
                        <View style={styles.connectedBadge}>
                            <Octicons name="dot-fill" size={10} color="#22c55e" />
                            <Text style={styles.connectedBadgeText}>Connected</Text>
                        </View>
                    )}
                </View>

                <View style={styles.brokerCard}>
                    {/* Broker Header */}
                    <View style={styles.brokerHeader}>
                        <View style={styles.brokerInfo}>
                            <Text style={styles.brokerName}>MetaTrader 5</Text>
                            <Text style={styles.brokerDescription}>
                                Forex • CFDs • Stocks • Futures
                            </Text>

                            {brokerConnection?.metaApiAccountId && (
                                <Text style={styles.accountId}>
                                    Account ID: {brokerConnection.metaApiAccountId}
                                </Text>
                            )}
                        </View>

                        {/* Action Button */}
                        {loading ? (
                            <ActivityIndicator size="small" color="#60a5fa" />
                        ) : isConnectedStatus ? (
                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnectPress}
                            >
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.connectButton}
                                onPress={handleConnect}
                            >
                                <Text style={styles.connectText}>Connect MT5</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Connection Status Messages */}
                    {loading && (
                        <View style={styles.statusMessage}>
                            <ActivityIndicator size="small" color="#60a5fa" />
                            <Text style={styles.loadingText}>Checking broker connection...</Text>
                        </View>
                    )}

                    {error && !loading && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                Failed to check connection status
                            </Text>
                            <TouchableOpacity onPress={handleRetry}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Account Details - Only show when connected */}
                    {isConnectedStatus && accountInfo && (
                        <View style={styles.accountSection}>
                            <View style={styles.accountHeader}>
                                <Text style={styles.accountTitle}>
                                    {accountInfo.accountName || 'Trading Account'}
                                </Text>
                                <Text style={styles.accountSubtitle}>
                                    {accountInfo.broker} • {accountInfo.server}
                                </Text>
                                <Text style={styles.accountSubtitle}>
                                    Login: {accountInfo.login} • Leverage: 1:{accountInfo.leverage || '—'}
                                </Text>
                            </View>

                            {/* Financial Metrics Grid */}
                            <View style={styles.metricsGrid}>
                                {[
                                    { label: 'Balance', value: `$${Number(accountInfo.balance || 0).toLocaleString()}` },
                                    { label: 'Equity', value: `$${Number(accountInfo.equity || 0).toLocaleString()}` },
                                    { label: 'Margin', value: `$${Number(accountInfo.margin || 0).toLocaleString()}` },
                                    { label: 'Free Margin', value: `$${Number(accountInfo.freeMargin || 0).toLocaleString()}` },
                                    { label: 'Credit', value: `$${Number(accountInfo.credit || 0).toLocaleString()}` },
                                    {
                                        label: 'Trading',
                                        value: accountInfo.tradeAllowed ? 'Enabled' : 'Disabled',
                                        color: accountInfo.tradeAllowed ? '#22c55e' : '#ef4444'
                                    },
                                ].map((item, index) => (
                                    <View key={index} style={styles.metricBox}>
                                        <Text style={styles.metricLabel}>{item.label}</Text>
                                        <Text style={[
                                            styles.metricValue,
                                            item.color && { color: item.color }
                                        ]}>
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Ready Status */}
                            <View style={styles.readyStatus}>
                                <Octicons name="dot-fill" size={14} color="#22c55e" />
                                <Text style={styles.readyText}>
                                    Ready for signals & automated trading
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Disconnect Confirmation Bottom Sheet */}
            <RBSheet
                ref={disconnectSheetRef}
                height={380}
                openDuration={280}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    container: styles.bottomSheetContainer,
                    draggableIcon: { backgroundColor: '#475569' },
                }}
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningIconContainer}>
                        <Feather name="alert-triangle" size={52} color="#f59e0b" />
                    </View>

                    <Text style={styles.sheetTitle}>Disconnect MT5 Account?</Text>

                    <Text style={styles.sheetDescription}>
                        This will unlink your MetaTrader 5 account and stop all automated trading signals.
                    </Text>

                    <Text style={styles.warningText}>
                        You can reconnect anytime later.
                    </Text>

                    <View style={styles.sheetActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => disconnectSheetRef.current?.close()}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmDisconnectButton}
                            onPress={confirmDisconnect}
                        >
                            <Text style={styles.confirmDisconnectText}>Yes, Disconnect</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>
        </>
    );
};

export default SupportedBrokers;

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        color: '#f8fafc',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    connectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#22c55e33',
    },
    connectedBadgeText: {
        color: '#22c55e',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 5,
    },
    brokerCard: {
        backgroundColor: '#1e2937',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#334155',
    },
    brokerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brokerInfo: {
        flex: 1,
    },
    brokerName: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
    },
    brokerDescription: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 2,
    },
    accountId: {
        color: '#64748b',
        fontSize: 12.5,
        marginTop: 4,
    },
    connectButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    connectText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    disconnectButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    disconnectText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    statusMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderRadius: 12,
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 13.5,
        marginLeft: 10,
    },
    errorContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        color: '#f87171',
        fontSize: 13.5,
    },
    retryText: {
        color: '#60a5fa',
        fontSize: 13.5,
        fontWeight: '600',
    },
    accountSection: {
        marginTop: 20,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    accountHeader: {
        marginBottom: 16,
    },
    accountTitle: {
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: '700',
    },
    accountSubtitle: {
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 3,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    metricBox: {
        flex: 1,
        minWidth: '48%',
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#334155',
    },
    metricLabel: {
        color: '#94a3b8',
        fontSize: 12.5,
        marginBottom: 4,
    },
    metricValue: {
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: '700',
    },
    readyStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22c55e22',
    },
    readyText: {
        color: '#4ade80',
        fontSize: 13.5,
        marginLeft: 8,
        fontWeight: '500',
    },

    /* Bottom Sheet Styles */
    bottomSheetContainer: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    sheetContent: {
        padding: 28,
        alignItems: 'center',
    },
    warningIconContainer: {
        marginBottom: 20,
    },
    sheetTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    sheetDescription: {
        color: '#cbd5e1',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 8,
    },
    warningText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
    },
    sheetActions: {
        flexDirection: 'row',
        gap: 14,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#1e2937',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmDisconnectButton: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    confirmDisconnectText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});