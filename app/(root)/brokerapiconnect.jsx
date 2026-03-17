// Brokerapiconnect.jsx (form screen)
import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrokerContext } from '@/context/BrokerContext';

const Brokerapiconnect = () => {
    const { apiType } = useLocalSearchParams();
    const isMT5 = apiType === 'MT5';

    const { connectMT5, loading, error } = useContext(BrokerContext);

    const [form, setForm] = useState({
        server: 'XMGlobal-MT5 9',
        login: '331839513',
        password: 'WSpike555#',
        name: 'XMGlobal-1',
    });

    const handleSubmit = async () => {
        if (!form.server || !form.login || !form.password) {
            Alert.alert('Missing fields', 'Server, Login and Password are required');
            return;
        }

        try {
            await connectMT5(form);
            Alert.alert('Success', 'MT5 account connected successfully!');
            router.back(); // or router.push('/some-screen')
        } catch (err) {
            Alert.alert('Connection Error', err.message || 'Failed to connect. Check credentials.');
            console.error(err);
        }
    };

    if (!isMT5) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Connecting to {apiType}</Text>
                <Text>Implementation coming soon...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <HomeHeader
                page="broker"
                title="Broker API"
                subtitle="Configure your broker API credentials for automated trading"
            />

            <View style={styles.mainbox}>
                <View style={styles.header}>
                    <Feather name="server" size={32} color="#60a5fa" />
                    <Text style={styles.title}>Connect MetaTrader 5 Account</Text>
                </View>

                {error && (
                    <Text style={{ color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>
                        {error}
                    </Text>
                )}

                <Text style={styles.label}>Account Name (optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="My MT5 Account"
                    placeholderTextColor="#6b7280"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                />

                <Text style={styles.label}>Server *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. ICMarketsSC-Demo, Pepperstone-Demo, ..."
                    placeholderTextColor="#6b7280"
                    value={form.server}
                    onChangeText={(text) => setForm({ ...form, server: text })}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Login (Account Number) *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="12345678"
                    placeholderTextColor="#6b7280"
                    value={form.login}
                    onChangeText={(text) => setForm({ ...form, login: text })}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#6b7280"
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                    secureTextEntry
                />

                <Text style={styles.hint}>
                    • Your credentials are sent securely to MetaApi.cloud (never stored on our servers){'\n'}
                    • Use a demo account first if you&apos;re testing
                </Text>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Connecting...' : 'Connect MT5 Account'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default Brokerapiconnect;

// styles remain unchanged

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainbox: {
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 24,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 12,
    },
    label: {
        color: '#d1d5db',
        fontSize: 15,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    hint: {
        color: '#9ca3af',
        fontSize: 13,
        marginTop: 16,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 32,
    },
    buttonDisabled: {
        backgroundColor: '#1e40af',
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancel: {
        marginTop: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#9ca3af',
        fontSize: 15,
    },
})