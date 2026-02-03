import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ActiveStrategies = ({ data }) => {
    const [strategies, setStrategies] = useState([]);

    useEffect(() => {
        if (data) {
            setStrategies(data);
        }
    }, [data]);

    const toggleStatus = (index) => {
        setStrategies(prevStrategies => {
            const updatedStrategies = [...prevStrategies];
            const strategy = updatedStrategies[index];
            if (strategy.status === 'Active') {
                strategy.status = 'Paused';
                strategy.statusColor = '#713f12';
            } else if (strategy.status === 'Paused') {
                strategy.status = 'Active';
                strategy.statusColor = '#14532d';
            }
            return updatedStrategies;
        });
    };

    return (
        <View style={styles.container}>
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
                    {/* Header Section */}
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.headerLeft}>
                                <MaterialCommunityIcons name="brain" size={24} color="#34C759" />
                                <View style={styles.headerText}>
                                    <Text style={styles.cardChange}>Active Strategies</Text>
                                </View>
                            </View>
                        </View>

                        {/* Strategies List */}
                        {strategies.map((strategy, index) => (
                            <View key={index} style={styles.strategyCard}>
                                <View style={styles.strategyHeader}>
                                    <View style={styles.strategyInfo}>
                                        <Text style={styles.strategyName}>{strategy.name}</Text>
                                    </View>
                                    <View style={styles.strategyStatus}>
                                        <TouchableOpacity
                                            style={[styles.statusButton, { backgroundColor: strategy.statusColor }]}
                                            onPress={() => toggleStatus(index)}
                                        >
                                            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                                                {strategy.status}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.controlIcon}
                                            onPress={() => {
                                                if (strategy.status !== 'Inactive') toggleStatus(index);
                                            }}
                                        >
                                            <Ionicons
                                                name={strategy.status === 'Active' ? 'pause-outline' : 'play-outline'}
                                                size={24}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.menuIcon}>
                                            <MaterialCommunityIcons name="cog-outline" size={18} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.strategyDescription}>{strategy.description}</Text>

                                <View style={styles.strategyMetrics}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricValue, { color: String(strategy.pnl).startsWith('-') ? '#FF3B15' : '#34C759' }]}>
                                            {strategy.pnl}
                                        </Text>
                                        <Text style={styles.metricLabel}>P&L</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricWinValue}>{strategy.winRate}</Text>
                                        <Text style={styles.metricLabel}>Win Rate</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricValue}>{strategy.trades}</Text>
                                        <Text style={styles.metricLabel}>Trades</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 10,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    cardContent: {},
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%',
    },
    headerText: {
        marginLeft: 8,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#22c55e',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    activeText: {
        color: '#22c55e',
        marginHorizontal: 5,
        fontSize: 12,
    },
    cardChange: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    subText: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 5,
        width: '60%',
    },
    strategyCard: {
        backgroundColor: '#2d3748',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    strategyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    strategyInfo: {
        flex: 1,
    },
    strategyName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    strategyDescription: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 10,
    },
    strategyStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusButton: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    controlIcon: {
        marginLeft: 10,
    },
    menuIcon: {
        marginLeft: 10,
    },
    strategyMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#c07ee1',
    },
    metricWinValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#419dfa',
    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 5,
    },
});

export default ActiveStrategies;