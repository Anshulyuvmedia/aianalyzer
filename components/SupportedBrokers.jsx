import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useContext } from 'react';
import { BrokerContext } from '@/context/BrokerContext';

const SupportedBrokers = () => {
    const { isConnected, accountInfo, brokerConnection, disconnectBroker, loading, error, refreshStatus } = useContext(BrokerContext);

    const broker = {
        icon: 'server',
        name: 'MetaTrader 5',
        description: 'Forex, CFDs, Stocks, Futures',
        commission: 'Depends on your broker',
        connection_status: isConnected,
        metaApiAccountId: brokerConnection?.metaApiAccountId,
        // brokerName: brokerConnection?.name || 'My MT5 Account',
    };
    // console.log("accountInfo", accountInfo);
    const handleConnect = () => {
        router.push({ pathname: '/brokerapiconnect', params: { apiType: 'MT5' } });
    };

    const handleDisconnect = () => {
        Alert.alert('Disconnect', 'Are you sure you want to unlink your MT5 account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Disconnect',
                style: 'destructive',
                onPress: async () => {
                    await disconnectBroker();
                },
            },
        ]);
    };

    const handleRetryStatus = () => {
        refreshStatus?.(); // safe call – it's optional in context
    };

    return (
        <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBoxBorder}
        >
            <LinearGradient
                colors={['#1e2836', '#111827', '#1e2836']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
            >
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View className="flex-row items-center mb-5">
                            <MaterialCommunityIcons
                                name="transit-connection-variant"
                                size={24}
                                color="#60a5fa"
                            />
                            <Text style={styles.header}>Broker Connection</Text>
                        </View>

                        <View
                            style={[
                                styles.brokerCard,
                                {
                                    borderColor: broker.connection_status ? '#22c55e' : '#2563eb',
                                },
                            ]}
                        >
                            <View style={styles.brokerItem}>
                                <Feather
                                    name={broker.icon}
                                    size={32}
                                    color={broker.connection_status ? '#22c55e' : '#60a5fa'}
                                    style={styles.brokerIcon}
                                />

                                <View style={styles.brokerInfo}>
                                    <Text style={styles.brokerName}>{broker.name}</Text>
                                    <Text style={styles.brokerDescription}>{broker.description}</Text>

                                    {broker.connection_status && broker.brokerName && (
                                        <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
                                            {broker.brokerName}
                                        </Text>
                                    )}

                                    {/* Polling / connection status feedback */}
                                    {loading && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                            <ActivityIndicator size="small" color="#60a5fa" />
                                            <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                                                Checking connection...
                                            </Text>
                                        </View>
                                    )}

                                    {error && !loading && (
                                        <View style={{ marginTop: 6 }}>
                                            <Text style={{ color: '#ef4444', fontSize: 12 }}>
                                                Status check failed •{' '}
                                                <Text
                                                    onPress={handleRetryStatus}
                                                    style={{ color: '#60a5fa', textDecorationLine: 'underline' }}
                                                >
                                                    Retry
                                                </Text>
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {loading ? (
                                    <ActivityIndicator size="small" color="#60a5fa" />
                                ) : broker.connection_status ? (
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <TouchableOpacity
                                            style={[styles.connectButton, { backgroundColor: '#22c55e' }]}
                                            onPress={handleDisconnect}
                                        >
                                            <Text style={styles.connectedStatus}>Connected</Text>
                                        </TouchableOpacity>
                                        {broker.metaApiAccountId && (
                                            <Text style={{ color: '#4ade80', fontSize: 12, marginTop: 4 }}>
                                                MT5 linked
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
                                        <Text style={styles.connectText}>Connect MT5</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {broker.connection_status && accountInfo && (
                                <View style={styles.accountSection}>


                                    {/* Account Identity */}
                                    <View style={styles.accountHeader}>
                                        <Text style={styles.accountName}>{accountInfo.accountName}</Text>
                                        <Text style={styles.accountSub}>
                                            {accountInfo.broker} • {accountInfo.server}
                                        </Text>
                                        <Text style={styles.accountSub}>
                                            Login: {accountInfo.login} • Leverage 1:{accountInfo.leverage}
                                        </Text>
                                    </View>

                                    {/* Financial Metrics */}
                                    <View style={styles.accountGrid}>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Balance</Text>
                                            <Text style={styles.metricValue}>
                                                $ {accountInfo.balance}
                                            </Text>
                                        </View>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Equity</Text>
                                            <Text style={styles.metricValue}>
                                                {accountInfo.equity}
                                            </Text>
                                        </View>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Margin</Text>
                                            <Text style={styles.metricValue}>
                                                {accountInfo.margin}
                                            </Text>
                                        </View>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Free Margin</Text>
                                            <Text style={styles.metricValue}>
                                                {accountInfo.freeMargin}
                                            </Text>
                                        </View>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Credit</Text>
                                            <Text style={styles.metricValue}>
                                                {accountInfo.credit}
                                            </Text>
                                        </View>

                                        <View style={styles.metricBox}>
                                            <Text style={styles.metricLabel}>Trading</Text>
                                            <Text style={[
                                                styles.metricValue,
                                                { color: accountInfo.tradeAllowed ? "#4ade80" : "#ef4444" }
                                            ]}>
                                                {accountInfo.tradeAllowed ? "Enabled" : "Disabled"}
                                            </Text>
                                        </View>

                                    </View>


                                    <View style={styles.statusRow}>
                                        <Octicons name="dot-fill" size={14} color="#4ade80" />
                                        <Text style={styles.statusText}>
                                            Ready for signals & auto-trading
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default SupportedBrokers;

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 4 },
    gradientBoxBorder: { borderRadius: 16, padding: 1.5 },
    innerGradient: { borderRadius: 14.5, padding: 16 },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    brokerCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 16,
    },
    brokerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brokerIcon: { marginRight: 16 },
    brokerInfo: { flex: 1 },
    brokerName: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    brokerDescription: {
        color: '#94a3b8',
        fontSize: 13,
        marginBottom: 6,
    },
    connectButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    connectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    connectedStatus: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    accountHeader: {
        marginBottom: 14,
    },

    accountName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    accountSub: {
        color: "#94a3b8",
        fontSize: 12,
        marginTop: 2,
    },

    accountSection: {
        borderTopWidth: 1,
        borderTopColor: "#22c55e33",
        marginTop: 14,
        paddingTop: 14,
    },

    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },

    statusText: {
        color: "#4ade80",
        marginLeft: 6,
        fontSize: 13,
    },

    accountGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    metricBox: {
        width: "48%",
        backgroundColor: "#0f172a",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#334155",
    },

    metricLabel: {
        color: "#94a3b8",
        fontSize: 12,
    },

    metricValue: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});