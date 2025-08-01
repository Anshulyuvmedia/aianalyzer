import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SupportedBrokers = () => {
    const brokers = [
        {
            icon: 'zap',
            name: 'Exness',
            description: 'Ready for auto-trading',
            commission: '0%',
            status: 'Connected',
            connected: true,
        },
        {
            icon: 'box',
            name: 'Delta Exchange',
            description: 'Crypto derivatives trading',
            commission: '0.005%',
            status: 'Connect',
            connected: false,
        },
        {
            icon: 'globe',
            name: 'Coindex',
            description: 'Multi-asset trading platform',
            commission: '0%',
            status: 'Connect',
            connected: false,
        },
        {
            icon: 'disc',
            name: 'Charles Schwab',
            description: 'Traditional brokerage',
            commission: '0%',
            status: 'Connect',
            connected: false,
        },
        {
            icon: 'bar-chart-2',
            name: 'Fidelity',
            description: 'Investment services',
            commission: '0%',
            status: 'Connect',
            connected: false,
        },
        {
            icon: 'arrow-up-circle',
            name: 'Robinhood',
            description: 'Commission-free trading',
            commission: '0%',
            status: 'Coming Soon',
            connected: false,
        },
    ];

    const handleConnect = (brokerName) => {
        // Add connect logic here
        console.log(`Connecting to ${brokerName}`);
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
                            <View key={index} style={[styles.brokerCard, { borderColor: (broker.connected ? '#22c55e' : '#2563eb') }]}>
                                <View style={styles.brokerItem}>
                                    <Feather
                                        name={broker.icon}
                                        size={24}
                                        color={broker.connected ? '#22c55e' : '#60a5fa'}
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
                                    {broker.connected ? (
                                        <TouchableOpacity
                                            style={[styles.connectButton, { backgroundColor: 'green' }]}
                                            onPress={() => handleConnect(broker.name)}
                                        >
                                            <Text style={styles.connectedStatus}>{broker.status}</Text>
                                        </TouchableOpacity>
                                    ) : broker.status === 'Coming Soon' ? (
                                        <Text style={styles.comingSoonStatus}>{broker.status}</Text>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.connectButton}
                                            onPress={() => handleConnect(broker.name)}
                                        >
                                            <Text style={styles.connectText}>{broker.status}</Text>
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