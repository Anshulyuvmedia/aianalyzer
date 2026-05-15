// SavedAccounts.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import HomeHeader from '@/components/HomeHeader';
import { BrokerContext } from '@/context/BrokerContext';
import api from '@/lib/axios';

const SavedAccounts = () => {
    const { connectMT5, loading, switchAccount, getUserAccounts, isConnected, brokerConnection } = useContext(BrokerContext);

    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [switchingId, setSwitchingId] = useState(null);

    const deleteSheetRef = useRef(null);
    const switchSheetRef = useRef(null);
    const [pendingSwitchAccount, setPendingSwitchAccount] = useState(null);

    // Load accounts from backend
    const loadAccounts = async () => {
        try {
            // Try to get from backend first
            const backendAccounts = await getUserAccounts();

            if (backendAccounts && backendAccounts.length > 0) {
                // Enhance with password from local storage if needed
                const localAccounts = await AsyncStorage.getItem('mt5_accounts');
                const localMap = localAccounts ? new Map(JSON.parse(localAccounts).map(acc => [acc.login, acc])) : new Map();

                const enrichedAccounts = backendAccounts.map(acc => ({
                    ...acc,
                    id: acc._id || acc.metaApiAccountId,
                    password: localMap.get(acc.login)?.password || '',
                    connectedAt: acc.lastUsed || acc.createdAt,
                }));

                setAccounts(enrichedAccounts);
            } else {
                // Fallback to local storage
                const saved = await AsyncStorage.getItem('mt5_accounts');
                if (saved) {
                    const parsedAccounts = JSON.parse(saved);
                    parsedAccounts.sort((a, b) => new Date(b.connectedAt) - new Date(a.connectedAt));
                    setAccounts(parsedAccounts);
                } else {
                    setAccounts([]);
                }
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
            // Fallback to local storage
            const saved = await AsyncStorage.getItem('mt5_accounts');
            if (saved) {
                setAccounts(JSON.parse(saved));
            }
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccounts();
        setRefreshing(false);
    };

    const handleSwitchAccount = (account) => {
        setPendingSwitchAccount(account);
        switchSheetRef.current?.open();
    };

    const confirmSwitch = async () => {
        if (!pendingSwitchAccount) return;

        setSwitchingId(pendingSwitchAccount.metaApiAccountId || pendingSwitchAccount.id);

        try {
            await switchAccount(pendingSwitchAccount.metaApiAccountId);

            // Update local accounts to show active status
            setAccounts(prev => prev.map(acc => ({
                ...acc,
                isActive: acc.metaApiAccountId === pendingSwitchAccount.metaApiAccountId
            })));

            switchSheetRef.current?.close();
            Alert.alert('Success', `Switched to ${pendingSwitchAccount.name || pendingSwitchAccount.login}`);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to switch accounts');
        } finally {
            setSwitchingId(null);
            setPendingSwitchAccount(null);
        }
    };

    const handleDelete = (account) => {
        setSelectedAccount(account);
        deleteSheetRef.current?.open();
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;

        try {
            // Delete from backend
            await api.delete(`/api/appdata/account/${selectedAccount.metaApiAccountId}`);

            // Remove from local storage
            const updatedAccounts = accounts.filter(acc => acc.metaApiAccountId !== selectedAccount.metaApiAccountId);
            await AsyncStorage.setItem('mt5_accounts', JSON.stringify(updatedAccounts));
            setAccounts(updatedAccounts);

            // If deleting the active account, clear connection
            if (brokerConnection?.metaApiAccountId === selectedAccount.metaApiAccountId) {
                await AsyncStorage.removeItem('brokerConnection');
            }

            deleteSheetRef.current?.close();
            Alert.alert('Success', 'Account deleted successfully');
        } catch (error) {
            console.error('Failed to delete account:', error);
            Alert.alert('Error', 'Failed to delete account');
        }
    };

    const handleUseAccount = (account) => {
        router.push({
            pathname: 'Broker/brokerapiconnect',
            params: {
                apiType: 'MT5',
                prefill: JSON.stringify({
                    server: account.server,
                    login: account.login,
                    name: account.name || '',
                    metaApiAccountId: account.metaApiAccountId,
                })
            }
        });
    };

    const renderAccount = ({ item }) => {
        const isActiveAccount = brokerConnection?.metaApiAccountId === item.metaApiAccountId;
        const isSwitching = switchingId === item.metaApiAccountId;

        return (
            <View style={[styles.accountCard, isActiveAccount && styles.activeCard]}>
                {isActiveAccount && (
                    <View style={styles.activeBadge}>
                        <Feather name="check-circle" size={14} color="#22c55e" />
                        <Text style={styles.activeText}>Active</Text>
                    </View>
                )}

                <View style={styles.accountHeader}>
                    <View style={[styles.iconWrapper, isActiveAccount && styles.activeIconWrapper]}>
                        <Feather name="server" size={28} color={isActiveAccount ? "#22c55e" : "#60a5fa"} />
                    </View>

                    <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>
                            {item.name || 'MT5 Account'}
                        </Text>
                        <Text style={styles.loginText}>Login: {item.login}</Text>
                        <Text style={styles.serverText} numberOfLines={1}>
                            {item.server}
                        </Text>
                    </View>

                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>
                            {new Date(item.connectedAt || item.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {!isActiveAccount && (
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => handleSwitchAccount(item)}
                            disabled={isSwitching}
                        >
                            {isSwitching ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Feather name="refresh-cw" size={18} color="#fff" />
                                    <Text style={styles.switchButtonText}>Switch</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.useButton}
                        onPress={() => handleUseAccount(item)}
                    >
                        <Feather name="arrow-right" size={18} color="#fff" />
                        <Text style={styles.useButtonText}>Use</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                    >
                        <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader
                page="broker"
                title="Saved Accounts"
                subtitle="Manage your connected MT5 accounts"
            />

            {accounts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="wallet-outline" size={90} color="#334155" />
                    <Text style={styles.emptyTitle}>No Saved Accounts</Text>
                    <Text style={styles.emptySubtitle}>
                        Your connected MT5 accounts will appear here
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.addButtonText}>Connect New Account</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.metaApiAccountId || item.id}
                    renderItem={renderAccount}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#60a5fa']}
                            tintColor="#60a5fa"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Switch Confirmation Sheet */}
            <RBSheet
                ref={switchSheetRef}
                height={260}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: styles.bottomSheet,
                    draggableIcon: { backgroundColor: '#475569' },
                }}
            >
                <View style={styles.sheetContent}>
                    <Feather name="refresh-cw" size={48} color="#60a5fa" />
                    <Text style={styles.sheetTitle}>Switch Account?</Text>
                    <Text style={styles.sheetMessage}>
                        Switch to {pendingSwitchAccount?.name || pendingSwitchAccount?.login}?{'\n'}
                        Your current positions will remain open.
                    </Text>

                    <View style={styles.sheetActions}>
                        <TouchableOpacity
                            style={styles.cancelSheetButton}
                            onPress={() => switchSheetRef.current?.close()}
                        >
                            <Text style={styles.cancelSheetText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchSheetButton}
                            onPress={confirmSwitch}
                        >
                            <Text style={styles.switchSheetText}>Switch</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>

            {/* Delete Confirmation Bottom Sheet */}
            <RBSheet
                ref={deleteSheetRef}
                height={260}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: styles.bottomSheet,
                    draggableIcon: { backgroundColor: '#475569' },
                }}
            >
                <View style={styles.sheetContent}>
                    <Feather name="alert-triangle" size={48} color="#f59e0b" />
                    <Text style={styles.sheetTitle}>Delete Account?</Text>
                    <Text style={styles.sheetMessage}>
                        This will remove the saved credentials for:{'\n'}
                        <Text style={{ fontWeight: '600' }}>
                            {selectedAccount?.name || 'MT5 Account'} ({selectedAccount?.login})
                        </Text>
                    </Text>

                    <View style={styles.sheetActions}>
                        <TouchableOpacity
                            style={styles.cancelSheetButton}
                            onPress={() => deleteSheetRef.current?.close()}
                        >
                            <Text style={styles.cancelSheetText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteSheetButton}
                            onPress={confirmDelete}
                        >
                            <Text style={styles.deleteSheetText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    accountCard: {
        backgroundColor: '#0f172a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1e2937',
        position: 'relative',
    },
    activeCard: {
        borderColor: '#22c55e',
        borderWidth: 2,
    },
    activeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22c55e20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    activeText: {
        color: '#22c55e',
        fontSize: 11,
        fontWeight: '600',
    },
    accountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    iconWrapper: {
        width: 56,
        height: 56,
        backgroundColor: '#1e2937',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activeIconWrapper: {
        backgroundColor: '#22c55e20',
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    loginText: {
        color: '#94a3b8',
        fontSize: 15,
        marginBottom: 2,
    },
    serverText: {
        color: '#64748b',
        fontSize: 14,
    },
    dateContainer: {
        alignItems: 'flex-end',
    },
    dateText: {
        color: '#64748b',
        fontSize: 13,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    switchButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    switchButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    useButton: {
        flex: 1,
        backgroundColor: '#10b981',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    useButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    deleteButton: {
        width: 52,
        height: 52,
        backgroundColor: '#1e2937',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    addButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    bottomSheet: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    sheetContent: {
        padding: 28,
        alignItems: 'center',
    },
    sheetTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        marginVertical: 16,
    },
    sheetMessage: {
        color: '#cbd5e1',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    sheetActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        width: '100%',
    },
    cancelSheetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#1e2937',
        alignItems: 'center',
    },
    deleteSheetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    switchSheetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
    },
    cancelSheetText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteSheetText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    switchSheetText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default SavedAccounts;