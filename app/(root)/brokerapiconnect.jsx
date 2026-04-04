// Brokerapiconnect.jsx
import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BrokerContext } from '@/context/BrokerContext';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';

const Brokerapiconnect = () => {
    const { apiType, prefill } = useLocalSearchParams();
    const isMT5 = apiType === 'MT5';

    const { connectMT5, loading, error: contextError, searchMT5Servers, serverSuggestions, searchLoading } = useContext(BrokerContext);
    // console.log('serverSuggestions', serverSuggestions);
    const [form, setForm] = useState({ server: '', login: '', password: '', name: '' });

    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const errorSheetRef = useRef(null);
    const successSheetRef = useRef(null);

    // Prefill logic
    useEffect(() => {
        if (prefill) {
            try {
                const data = JSON.parse(prefill);
                setForm(prev => ({
                    ...prev,
                    server: data.server || prev.server,
                    login: data.login || prev.login,
                    name: data.name || prev.name,
                }));
            } catch (e) {
                console.warn('Failed to parse prefill');
            }
        }
    }, [prefill]);

    // Show error
    useEffect(() => {
        if (localError || contextError) {
            setLocalError(contextError || localError);
            errorSheetRef.current?.open();
        }
    }, [contextError, localError]);

    // Debounced server search
    const debouncedSearch = useCallback(
        debounce(async (text) => {
            if (text.length < 2) {
                setShowSuggestions(false);
                return;
            }
            await searchMT5Servers(text);
            setShowSuggestions(true);
        }, 350),
        [searchMT5Servers]
    );

    const handleSubmit = async () => {
        if (!form.server || !form.login || !form.password) {
            setLocalError('Server, Login, and Password are required');
            errorSheetRef.current?.open();
            return;
        }

        try {
            await connectMT5(form);
            await saveCredentials(form);

            setSuccessMessage('MT5 account connected successfully!');
            successSheetRef.current?.open();

            setTimeout(() => {
                router.push('brokerconnection');
            }, 1800);
        } catch (err) {
            setLocalError(err.message);
            errorSheetRef.current?.open();
        }
    };

    const saveCredentials = async (credentials) => {
        try {
            const saved = await AsyncStorage.getItem('mt5_accounts');
            let accounts = saved ? JSON.parse(saved) : [];

            const existingIndex = accounts.findIndex(
                acc => acc.login === credentials.login && acc.server === credentials.server
            );

            const accountToSave = {
                ...credentials,
                connectedAt: new Date().toISOString(),
                id: existingIndex !== -1 ? accounts[existingIndex].id : Date.now().toString(),
            };

            if (existingIndex !== -1) {
                accounts[existingIndex] = accountToSave;
            } else {
                accounts.push(accountToSave);
            }

            await AsyncStorage.setItem('mt5_accounts', JSON.stringify(accounts));
        } catch (e) {
            console.warn('Failed to save credentials:', e);
        }
    };

    const selectSuggestion = (suggestion) => {
        setForm(prev => ({ ...prev, server: suggestion.server }));
        setShowSuggestions(false);
    };

    if (!isMT5) {
        return (
            <View style={styles.container}>
                <HomeHeader page="broker" title="Broker API" subtitle="Coming soon..." />
                <View style={styles.centerContent}>
                    <Ionicons name="construct-outline" size={80} color="#4b5563" />
                    <Text style={styles.comingSoonText}>Implementation coming soon...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <HomeHeader
                    page="broker"
                    title="Connect Broker"
                    subtitle="Securely link your MetaTrader 5 account"
                />

                <View style={styles.mainContent}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Feather name="server" size={28} color="#60a5fa" />
                            </View>
                            <View>
                                <Text style={styles.title}>MetaTrader 5</Text>
                                <Text style={styles.subtitle}>Enter your account details</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.viewButton} onPress={() => router.push('saved-accounts')}>
                            <Text style={styles.viewText}>View Saved Accounts</Text>
                        </TouchableOpacity>

                        {/* Account Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Name (Optional)</Text>
                            <TextInput
                                style={[styles.input, loading && styles.inputDisabled]}
                                placeholder="e.g. My Demo Account"
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                                editable={!loading}
                            />
                        </View>

                        {/* Server Search */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Server <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, loading && styles.inputDisabled]}
                                placeholder="Search servers"
                                value={form.server}
                                onChangeText={(text) => {
                                    setForm({ ...form, server: text });
                                    debouncedSearch(text);
                                }}
                                autoCapitalize="none"
                                editable={!loading}
                            />

                            {searchLoading && <ActivityIndicator size="small" color="#60a5fa" style={{ marginTop: 8 }} />}

                            {showSuggestions && serverSuggestions.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    <FlatList
                                        data={serverSuggestions}
                                        keyExtractor={(item, i) => `sug-${i}`}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.suggestionItem}
                                                onPress={() => selectSuggestion(item)}
                                            >
                                                <Text style={styles.suggestionServer}>{item.server}</Text>
                                                <Text style={styles.suggestionBroker}>{item.broker}</Text>
                                            </TouchableOpacity>
                                        )}
                                        nestedScrollEnabled
                                    />
                                </View>
                            )}
                        </View>

                        {/* Login & Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Login (Account Number) <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, loading && styles.inputDisabled]}
                                placeholder="Enter account no."
                                value={form.login}
                                onChangeText={(text) => setForm({ ...form, login: text })}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, loading && styles.inputDisabled]}
                                placeholder="Enter your MT5 password"
                                value={form.password}
                                onChangeText={(text) => setForm({ ...form, password: text })}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.hintContainer}>
                            <Feather name="shield" size={16} color="#22c55e" />
                            <Text style={styles.hint}>
                                Credentials are sent securely to MetaApi.cloud{'\n'}
                                Never stored on our servers • Use demo first
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Connect Button */}
            <View style={styles.bottomCard}>
                <TouchableOpacity
                    style={[styles.connectButton, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.buttonText}>Connecting to MT5...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Connect MT5 Account</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Error & Success Sheets */}
            <RBSheet ref={errorSheetRef} height={240} closeOnDragDown customStyles={{ container: styles.bottomSheet }}>
                <View style={styles.sheetContent}>
                    <Feather name="alert-circle" size={48} color="#ef4444" />
                    <Text style={styles.sheetTitle}>Connection Failed</Text>
                    <Text style={styles.sheetMessage}>{localError}</Text>
                    <TouchableOpacity style={styles.sheetButton} onPress={() => errorSheetRef.current?.close()}>
                        <Text style={styles.sheetButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>

            <RBSheet ref={successSheetRef} height={260} closeOnDragDown customStyles={{ container: styles.bottomSheet }}>
                <View style={styles.sheetContent}>
                    <Feather name="check-circle" size={56} color="#22c55e" />
                    <Text style={styles.sheetTitle}>Connected Successfully!</Text>
                    <Text style={styles.sheetMessage}>{successMessage}</Text>
                    <Text style={styles.sheetSubMessage}>Your MT5 account has been saved for quick reuse.</Text>
                </View>
            </RBSheet>
        </KeyboardAvoidingView>
    );
};

// Styles remain mostly same (I kept your existing styles + added new ones)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    mainContent: { paddingHorizontal: 16, paddingTop: 10 },
    card: {
        backgroundColor: '#0f172a',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1e2937',
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    iconContainer: {
        width: 50, height: 50, backgroundColor: '#1e2937', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    title: { color: '#fff', fontSize: 22, fontWeight: '700' },
    subtitle: { color: '#94a3b8', fontSize: 14 },
    viewButton: {
        paddingVertical: 12, backgroundColor: '#1e40af', borderRadius: 12,
        alignItems: 'center', marginBottom: 20,
    },
    viewText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#e2e8f0', fontSize: 15, fontWeight: '600', marginBottom: 8 },
    required: { color: '#f87171' },
    input: {
        backgroundColor: '#1e2937',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: '#334155',
    },
    inputDisabled: { opacity: 0.6 },
    hintContainer: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1e2937',
        padding: 16, borderRadius: 14, marginTop: 8,
    },
    hint: { color: '#94a3b8', fontSize: 13.5, lineHeight: 20, marginLeft: 10, flex: 1 },

    suggestionsContainer: {
        backgroundColor: '#1e2937',
        borderRadius: 12,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#334155',
        maxHeight: 220,
    },
    suggestionItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    suggestionServer: { color: '#fff', fontSize: 16, fontWeight: '600' },
    suggestionBroker: { color: '#94a3b8', fontSize: 13, marginTop: 2 },

    bottomCard: { padding: 16, paddingBottom: 24 },
    connectButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: '#1e40af' },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

    bottomSheet: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    sheetContent: { padding: 24, alignItems: 'center' },
    sheetTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginVertical: 12 },
    sheetMessage: { color: '#cbd5e1', fontSize: 16, textAlign: 'center', lineHeight: 24 },
    sheetSubMessage: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 8 },
    sheetButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 14,
        marginTop: 24,
    },
    sheetButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    comingSoonText: { color: '#64748b', fontSize: 18, marginTop: 20 },
});

export default Brokerapiconnect;