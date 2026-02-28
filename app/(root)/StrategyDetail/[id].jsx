import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecentCopyTrades from '@/components/RecentCopyTrades';

const StrategyDetails = () => {
    const { id } = useLocalSearchParams();
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStrategy = async () => {
            try {
                setLoading(true);
                setError(null);

                const cached = await AsyncStorage.getItem('copyStrategiesCache');
                if (!cached) throw new Error('No cached strategies found');

                const allStrategies = JSON.parse(cached);
                if (!Array.isArray(allStrategies)) throw new Error('Invalid cache format');

                const found = allStrategies.find(s => s._id === id);
                if (!found) throw new Error('Strategy not found');

                setStrategy(found);
            } catch (err) {
                console.error('Strategy load error:', err);
                setError(err.message || 'Failed to load strategy details');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadStrategy();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <HomeHeader page="home" title="Strategy Details" />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Loading strategy details...</Text>
                </View>
            </View>
        );
    }

    if (error || !strategy) {
        return (
            <View style={styles.safeArea}>
                <HomeHeader page="home" title="Strategy Details" />
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Oops!</Text>
                    <Text style={styles.errorText}>{error || 'Strategy not found'}</Text>
                </View>
            </View>
        );
    }

    // ──────────────────────────────────────────────
    // Prepare FlatList data (sections as items)
    // ──────────────────────────────────────────────
    const listData = [
        { type: 'core-info', strategy },
        { type: 'trading-params', strategy },
        { type: 'backtest', strategy },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'core-info':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Core Information</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="calendar-clock"
                                label="Timeframes"
                                value={item.strategy.timeframes?.join(' • ') || 'Not specified'}
                            />
                            <InfoRow
                                icon="chart-line"
                                label="Symbols"
                                value={item.strategy.symbols?.join(', ') || 'Any'}
                            />
                            <InfoRow
                                icon="tag-multiple"
                                label="Tags"
                                value={item.strategy.tags?.join(' • ') || 'None'}
                            />
                        </View>
                    </View>
                );

            case 'trading-params':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trading Parameters</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="shield-check"
                                label="Risk per Trade"
                                value={`${item.strategy.defaultConfig?.riskPerTradePercent || 1}%`}
                                valueStyle={{ color: '#fbbf24' }}
                            />
                            <InfoRow
                                icon="wallet"
                                label="Initial Capital"
                                value={`$${item.strategy.defaultConfig?.initialCapital?.toLocaleString() || 'N/A'}`}
                            />
                        </View>
                    </View>
                );

            case 'backtest':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Backtesting Result</Text>
                        <RecentCopyTrades />
                    </View>
                );

            default:
                return null;
        }
    };

    const HeaderComponent = () => (
        <LinearGradient
            colors={['#000000', '#1e293b']}
            style={styles.headerCard}
        >
            <Text style={styles.strategyName}>{strategy.name}</Text>
            <Text style={styles.strategyDescription}>
                {strategy.description || 'No description available'}
            </Text>

            <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.badgePrimary]}>
                    <MaterialCommunityIcons name="finance" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.strategyType || 'Custom'}</Text>
                </View>
                <View style={[styles.badge, styles.badgeSecondary]}>
                    <MaterialCommunityIcons name="earth" size={16} color="#fff" />
                    <Text style={styles.badgeText}>{strategy.assetClass || 'N/A'}</Text>
                </View>
            </View>
        </LinearGradient>
    );

    const keyExtractor = (_, index) => `section-${index}`;

    return (
        <View style={styles.safeArea}>
            <HomeHeader page="chatbot" title="Strategy Details" subtitle="Complete detail for strategies" />

            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                ListHeaderComponent={HeaderComponent}
                stickyHeaderIndices={[0]}
            />
        </View>
    );
};

// InfoRow component remains unchanged
const InfoRow = ({ icon, label, value, valueStyle }) => (
    <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color="#10B981" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
        </View>
    </View>
);

/* ──────────────────────────────────────────────
Styles
─────────────────────────────────────────────── */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    flatListContent: {
        paddingBottom: 24, // or more if you have bottom tab/nav
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    },
    errorTitle: {
        marginTop: 16,
        color: '#f87171',
        fontSize: 24,
        fontWeight: '700',
    },
    errorText: {
        marginTop: 8,
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },

    // Header Card
    headerCard: {
        padding: 24,
        paddingTop: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    strategyName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    strategyDescription: {
        fontSize: 15,
        color: '#cbd5e1',
        lineHeight: 22,
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    badgePrimary: {
        backgroundColor: '#10B981',
    },
    badgeSecondary: {
        backgroundColor: '#6366f1',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },

    // Sections
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#334155',
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
    },
});

export default StrategyDetails;