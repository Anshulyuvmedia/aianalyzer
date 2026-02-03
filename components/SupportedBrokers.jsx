import { Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useContext } from "react";
import { ConnectionContext } from "../app/context/ConnectionContext";


const SupportedBrokers = () => {
    const { connectionStatus } = useContext(ConnectionContext);
    console.log("Broker connection:", connectionStatus);
    const brokers = [
        {
            icon: 'box',
            name: 'Delta Exchange',
            description: 'Crypto derivatives trading',
            commission: '0.005%',
            status: 'Connected',
            connection_status: connectionStatus,
            apiType: 'DELTA_EXCHANGE',
        }
    ];

    const handleConnect = (apiType) => {
        router.push({ pathname: '/brokerapiconnect', params: { apiType } });
        console.log(`Connecting to ${apiType}`);
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
                        <View className='flex-row'>
                            <MaterialCommunityIcons name="transit-connection-variant" size={24} color="#60a5fa" />
                            <Text style={styles.header}>Supported Brokers</Text>
                        </View>
                        {brokers.map((broker, index) => (
                            <View key={index} style={[styles.brokerCard, { borderColor: (broker.connection_status ? '#22c55e' : '#2563eb') }]}>
                                <View style={styles.brokerItem}>
                                    <Feather
                                        name={broker.icon}
                                        size={24}
                                        color={broker.connection_status ? '#22c55e' : '#60a5fa'}
                                        style={styles.brokerIcon}
                                    />
                                    <View style={styles.brokerInfo}>
                                        <Text style={styles.brokerName}>{broker.name}</Text>
                                        <Text style={styles.brokerDescription}>{broker.description}</Text>
                                        <View className='flex-row'>
                                            <Feather name="dollar-sign" size={12} color="#A0AEC0" />
                                            <Text style={styles.brokerCommission}>Commission: {broker.commission}</Text>
                                        </View>
                                    </View>
                                    {broker.connection_status ? (
                                        <TouchableOpacity
                                            style={[styles.connectButton, { backgroundColor: '#22c55e' }]}
                                            onPress={() => handleConnect(broker.apiType)}
                                        >
                                            <Text style={styles.connectedStatus}>Connected</Text>
                                        </TouchableOpacity>
                                    ) : broker.status === 'Coming Soon' ? (
                                        <Text style={styles.comingSoonStatus}>{broker.status}</Text>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.connectButton}
                                            onPress={() => handleConnect(broker.apiType)}
                                        >
                                            <Text style={styles.connectText}>Connect</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {broker.connected && (
                                    <View className="flex-row border-t border-[#22c55e33] w-[100%] pt-3">
                                        <Octicons name="dot-fill" size={16} color="#4ade80" />
                                        <Text className="text-[#4ade80]"> Ready for auto-trading</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default SupportedBrokers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        // padding: 20,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        marginStart: 5,
    },
    brokerCard: {
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
    },
    brokerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    brokerIcon: {
        marginRight: 15,
    },
    brokerInfo: {
        flex: 1,
    },
    brokerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    brokerDescription: {
        color: '#A0AEC0',
        fontSize: 12,
        marginBottom: 5,
    },
    brokerCommission: {
        color: '#A0AEC0',
        fontSize: 12,
        marginStart: 3,
    },
    connectedStatus: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    comingSoonStatus: {
        color: '#facc15',
        fontSize: 14,
        fontWeight: '500',
    },
    connectButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    connectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});