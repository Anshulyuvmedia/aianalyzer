// SavedAccounts.jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import HomeHeader from '@/components/HomeHeader';

const SavedAccounts = () => {
    const router = useRouter();
    const [accounts, setAccounts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const deleteSheetRef = useRef(null);

    // Load saved accounts
    const loadAccounts = async () => {
        try {
            const saved = await AsyncStorage.getItem('mt5_accounts');
            if (saved) {
                const parsedAccounts = JSON.parse(saved);
                // Sort by most recently connected
                parsedAccounts.sort((a, b) =>
                    new Date(b.connectedAt) - new Date(a.connectedAt)
                );
                setAccounts(parsedAccounts);
            } else {
                setAccounts([]);
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
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

    const handleDelete = (account) => {
        setSelectedAccount(account);
        deleteSheetRef.current?.open();
    };

    const confirmDelete = async () => {
        if (!selectedAccount) return;

        try {
            const updatedAccounts = accounts.filter(
                acc => acc.id !== selectedAccount.id
            );

            await AsyncStorage.setItem('mt5_accounts', JSON.stringify(updatedAccounts));
            setAccounts(updatedAccounts);
            deleteSheetRef.current?.close();

            // Optional: Show success feedback
            // You can replace with RBSheet success if you prefer
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const handleUseAccount = (account) => {
        // Navigate back to connect screen and pre-fill the form
        router.push({
            pathname: '/brokerapiconnect',
            params: {
                apiType: 'MT5',
                prefill: JSON.stringify({
                    server: account.server,
                    login: account.login,
                    name: account.name || '',
                    password: account.password || '' // Never prefill password for security
                })
            }
        });
    };

    const renderAccount = ({ item }) => (
        <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
                <View style={styles.iconWrapper}>
                    <Feather name="server" size={28} color="#60a5fa" />
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
                        {new Date(item.connectedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => handleUseAccount(item)}
                >
                    <Feather name="arrow-right" size={18} color="#fff" />
                    <Text style={styles.useButtonText}>Use This Account</Text>
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
                    keyExtractor={(item) => item.id}
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
    useButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
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
        fontSize: 16,
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
});

export default SavedAccounts;