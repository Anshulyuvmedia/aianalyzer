import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { Feather, MaterialCommunityIcons, Octicons, Ionicons, FontAwesome } from '@expo/vector-icons';
import AlgoNavigation from '../../components/AlgoNavigation';

const { width, height } = Dimensions.get('window');

const AlgoDashboard = () => {
    const topOversoldData = [
        { id: '1', label: 'Active Strategies', value: '2' },
        { id: '2', label: 'Total P&L', value: '22,066.55' },
        { id: '3', label: 'Avg Win Rate', value: '61.5%' },
        { id: '4', label: 'Free Stocks', value: '2' },
    ];

    const activeStrategies = [
        {
            id: '1',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹15,432.5',
            winRate: '67.3%',
            trades: '245',
            status: 'paused',
        },
        {
            id: '2',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹-2,341.25',
            winRate: '45.2%',
            trades: '89',
            status: 'running',
        },
        {
            id: '3',
            name: 'Momentum Scalper',
            description: 'High-frequency momentum-based trading',
            pnl: '₹9,753.0',
            winRate: '72.1%',
            trades: '156',
            status: 'paused',
        },
    ];

    const dashboardData = [
        {
            id: 'header',
            type: 'header',
        },
        {
            id: 'topOversold',
            type: 'topOversold',
            data: topOversoldData,
        },
        {
            id: 'strategies',
            type: 'strategies',
            data: activeStrategies,
        },
    ];

    const cardMeta = {
        'Active Strategies': {
            icon: <MaterialCommunityIcons name="robot" size={width * 0.05} color="white" />,
            gradient: ['#0155fa', '#000'],
            bgGradient: ['#0155fa', '#181822'],
            iconBg: '#095dff',
        },
        'Total P&L': {
            icon: <Ionicons name="trending-up" size={width * 0.05} color="#000" />,
            gradient: ['#1A2E23', '#0C0C18'],
            bgGradient: ['#05ff93', '#181822'],
            iconBg: '#05ff93',
        },
        'Avg Win Rate': {
            icon: <FontAwesome name="percent" size={width * 0.05} color="white" />,
            gradient: ['#241A2E', '#1B1022'],
            bgGradient: ['#7709ff', '#181822'],
            iconBg: '#7709ff',
        },
        'Free Stocks': {
            icon: <Ionicons name="cube" size={width * 0.05} color="white" />,
            gradient: ['#2E1A1A', '#180C0C'],
            bgGradient: ['#ff0505', '#181822'],
            iconBg: '#ff0505',
        },
    };

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View style={styles.section}>
                        <View style={styles.actionRow}>
                            <Text style={styles.titleText}>Algo Dashboard</Text>
                            <TouchableOpacity style={styles.strategyButton}>
                                <MaterialCommunityIcons name="robot" size={width * 0.05} color="white" />
                                <Text style={styles.actionText}> Create Strategy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'topOversold':
                return (
                    <View style={styles.section}>
                        <FlatList
                            data={item.data}
                            renderItem={renderOversoldCard}
                            keyExtractor={(item) => item.id}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.oversoldList}
                        />
                    </View>
                );
            case 'strategies':
                return (
                    <View style={styles.bottomsection}>
                        <LinearGradient
                            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0, y: 0.5 }}
                            style={styles.strategyCardBorderGradient}
                        >
                            <View style={styles.strategyCard}>
                                <Text style={styles.sectionTitle}>Active Strategies</Text>
                                <FlatList
                                    data={item.data}
                                    renderItem={renderStrategyCard}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.strategyList}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                );
            default:
                return null;
        }
    };

    const renderOversoldCard = ({ item }) => {
        const meta = cardMeta[item.label] || {
            icon: <MaterialCommunityIcons name="robot" size={width * 0.05} color="white" />,
            gradient: ['#0155fa', '#000'],
            bgGradient: ['#0155fa', '#181822'],
            iconBg: '#095dff',
        };

        return (
            <LinearGradient
                colors={meta.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={styles.cardBorderGradient}
            >
                <LinearGradient
                    colors={meta.bgGradient}
                    start={{ x: 2, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={styles.cardBgGradient}
                >
                    <View style={styles.otherCard}>
                        <View style={[styles.iconbox, { backgroundColor: meta.iconBg }]}>
                            {meta.icon}
                        </View>
                        <Text style={styles.cardLabel}>{item.label}</Text>
                        <Text style={styles.cardText}>{item.value}</Text>
                    </View>
                </LinearGradient>
            </LinearGradient>
        );
    };

    const renderStrategyCard = ({ item }) => (
        <LinearGradient
            colors={['#3E3E4580', '#0C0C1800', '#706F72']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.strategyCardBorderGradient}
        >
            <View style={styles.strategyCard}>
                <View style={styles.strategyHeader}>
                    <Text style={styles.strategyName}>{item.name}</Text>
                    <Text style={styles.strategyDescription}>{item.description}</Text>
                </View>
                <View style={styles.strategyStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>P&L</Text>
                        <Text style={[styles.statValue, { color: item.pnl.startsWith('₹-') ? '#FF0505' : '#05FF93' }]}>
                            {item.pnl}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Win Rate</Text>
                        <Text style={styles.statValue}>{item.winRate}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Trades</Text>
                        <Text style={styles.statValue}>{item.trades}</Text>
                    </View>
                    <View style={styles.strategyActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            {item.status === 'paused' ? (
                                <Feather name="play-circle" size={width * 0.06} color="#000" style={styles.actionIcon} />
                            ) : (
                                <Feather name="pause-circle" size={width * 0.06} color="#fff" style={styles.pauseIcon} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Octicons name="gear" size={width * 0.06} color="#fff" style={styles.gearIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerbox}>
                <HomeHeader />
            </View>

            <AlgoNavigation />

            <FlatList
                data={dashboardData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollerbox}
            />
        </View>
    );
};

export default AlgoDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerbox: {
        paddingHorizontal: width * 0.04,
    },
    scrollerbox: {
        paddingBottom: height * 0.025,
    },
    section: {
        marginTop: height * 0.025,
        paddingHorizontal: width * 0.04,
    },
    bottomsection: {
        marginTop: height * 0.025,
        backgroundColor: '#191922',
        borderRadius: 25,
        paddingHorizontal: width * 0.04,
        paddingTop: height * 0.025,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: width * 0.025,
    },
    strategyButton: {
        flexDirection: 'row',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0057FF',
        flexGrow: 1,
        paddingVertical: height * 0.015,
    },
    actionText: {
        color: '#fff',
        fontSize: width * 0.04,
        fontFamily: 'Questrial-Regular',
    },
    titleText: {
        fontFamily: 'Sora-Bold',
        color: '#FFF',
        fontSize: width * 0.05,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        marginBottom: height * 0.01,
    },
    oversoldList: {
        paddingHorizontal: width * 0.04,
    },
    strategyList: {
        paddingBottom: height * 0.02,
    },
    cardBorderGradient: {
        borderRadius: 20,
        padding: 1,
        marginRight: width * 0.03,
    },
    cardBgGradient: {
        borderRadius: 20,
    },
    otherCard: {
        borderRadius: 20,
        padding: width * 0.04,
        width: width * 0.4,
        height: height * 0.15,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    iconbox: {
        borderRadius: 20,
        padding: width * 0.015,
        width: width * 0.08,
    },
    cardLabel: {
        color: '#81818A',
        fontSize: width * 0.04,
        marginTop: height * 0.01,
    },
    cardText: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        fontWeight: 'bold',
        marginTop: height * 0.01,
    },
    strategyCardBorderGradient: {
        borderRadius: 20,
        padding: 1,
        marginBottom: height * 0.02,
    },
    strategyCard: {
        backgroundColor: '#12121c',
        borderRadius: 20,
        padding: width * 0.04,
    },
    strategyHeader: {
        marginBottom: height * 0.015,
    },
    strategyName: {
        color: '#FFF',
        fontSize: width * 0.04,
    },
    strategyDescription: {
        color: '#A9A9A9',
        fontSize: width * 0.035,
    },
    strategyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: height * 0.015,
        flexWrap: 'wrap',
    },
    statItem: {
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#292930',
        padding: width * 0.02,
        borderRadius: 13,
        backgroundColor: '#202029',
        minWidth: width * 0.2,
        marginBottom: height * 0.01,
    },
    statLabel: {
        color: '#A9A9A9',
        fontSize: width * 0.035,
    },
    statValue: {
        color: '#FFF',
        fontSize: width * 0.04,
    },
    strategyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: width * 0.025,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        backgroundColor: '#05ff93',
        padding: width * 0.015,
        borderRadius: 8,
    },
    pauseIcon: {
        backgroundColor: '#FF0505',
        padding: width * 0.015,
        borderRadius: 8,
    },
    gearIcon: {
        backgroundColor: '#242431',
        padding: width * 0.015,
        borderRadius: 8,
    },
});