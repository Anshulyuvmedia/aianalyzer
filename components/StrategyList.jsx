// components/StrategyList.jsx 
import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';

const StrategyList = () => {
    const { strategies, toggleFollow } = useContext(CopyStrategyContext);
    const [selectedAssetClass, setSelectedAssetClass] = useState('ALL');

    // console.log('strategies', strategies);

    const handleToggle = (strategy) => {
        toggleFollow(strategy._id, !strategy.isFollowing);
    };

    const assetClasses = [
        { key: 'ALL', label: 'All', icon: 'apps' },
        { key: 'FOREX', label: 'Forex', icon: 'currency-usd' },
        { key: 'CRYPTO', label: 'Crypto', icon: 'bitcoin' },
        { key: 'COMMODITIES', label: 'Commodities', icon: 'chart-line' },
        { key: 'INDICES', label: 'Indices', icon: 'trending-up' },
        { key: 'STOCKS', label: 'Stocks', icon: 'finance' },
        { key: 'OTHERS', label: 'Others', icon: 'dots-horizontal' }
    ];

    // Filter strategies based on selected asset class
    const filteredStrategies = strategies?.filter(strategy => {
        if (selectedAssetClass === 'ALL') return true;
        return strategy.assetClass === selectedAssetClass;
    });

    const renderStrategyItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push(`/StrategyDetail/${item._id}`)}
            style={styles.strategyCard}
        >
            <LinearGradient
                colors={['rgba(16,185,129,0.12)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.accentGradient}
            />

            <View style={styles.cardContent}>
                <View style={styles.topRow}>
                    <Text style={styles.strategyName}>{item.name}</Text>

                    <TouchableOpacity
                        style={[
                            styles.followBtn,
                            item.isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                        ]}
                        onPress={() => handleToggle(item)}
                    >
                        <SimpleLineIcons
                            name={item.isFollowing ? 'user-unfollow' : 'user-follow'}
                            size={16}
                            color="white"
                        />
                        <Text style={styles.followText}>
                            {item.followerCount || 0} {item.isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagsContainer}>
                    <View style={[styles.tag, getAssetClassStyle(item.assetClass)]}>
                        <Text style={styles.tagText}>{item.assetClass}</Text>
                    </View>
                    <View style={[styles.tag, styles.tagType]}>
                        <Text style={styles.tagText}>{item.strategyType}</Text>
                    </View>
                    <View style={[styles.tag, styles.symbols]}>
                        <Text style={styles.tagText}>{item.symbols?.join(', ')}</Text>
                    </View>
                    {item.timeframes?.slice(0, 2).map((tf, i) => (
                        <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{tf}</Text>
                        </View>
                    ))}
                    {item.tags?.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Helper function to get asset class specific styles
    const getAssetClassStyle = (assetClass) => {
        switch (assetClass) {
            case 'FOREX': return styles.tagForex;
            case 'CRYPTO': return styles.tagCrypto;
            case 'COMMODITIES': return styles.tagCommodities;
            case 'INDICES': return styles.tagIndices;
            case 'STOCKS': return styles.tagStocks;
            default: return styles.tagOthers;
        }
    };

    // Render tab item
    const renderTab = (tab) => (
        <TouchableOpacity
            key={tab.key}
            style={[
                styles.tab,
                selectedAssetClass === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedAssetClass(tab.key)}
        >
            <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={selectedAssetClass === tab.key ? '#10B981' : '#9CA3AF'}
            />
            <Text style={[
                styles.tabText,
                selectedAssetClass === tab.key && styles.activeTabText
            ]}>
                {tab.label}
            </Text>
        </TouchableOpacity>
    );

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
                    <View>
                        <View style={styles.headerRow}>
                            <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
                            <Text style={styles.headerText}>Public Strategies</Text>
                        </View>

                        {/* Tabs Section */}
                        <View style={styles.tabsContainer}>
                            <FlatList
                                horizontal
                                data={assetClasses}
                                renderItem={({ item }) => renderTab(item)}
                                keyExtractor={(item) => item.key}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabsList}
                            />
                        </View>

                        {/* Count of filtered strategies */}
                        <View style={styles.countContainer}>
                            <Text style={styles.countText}>
                                {filteredStrategies?.length || 0} {filteredStrategies?.length === 1 ? 'Strategy' : 'Strategies'}
                            </Text>
                        </View>

                        {filteredStrategies?.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No {selectedAssetClass !== 'ALL' ? selectedAssetClass.toLowerCase() : ''} strategies available
                            </Text>
                        ) : (
                            <FlatList
                                data={filteredStrategies}
                                renderItem={renderStrategyItem}
                                keyExtractor={(item) => item._id}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        flex: 1,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
        flex: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 10,
        flex: 1,
    },
    cardContent: {
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    tabsContainer: {
        marginBottom: 12,
    },
    tabsList: {
        paddingHorizontal: 4,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#374151',
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#10B981',
    },
    tabText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#10B981',
    },
    countContainer: {
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    countText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '500',
    },
    strategyCard: {
        backgroundColor: '#1f2937',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    accentGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    strategyName: {
        flex: 1,
        color: '#F3F4F6',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Sora-Bold',
        marginRight: 12,
        textTransform: 'capitalize',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    tag: {
        backgroundColor: '#374151',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    tagAsset: { backgroundColor: '#6D28D9' },
    tagType: { backgroundColor: '#059669' },
    symbols: { backgroundColor: '#6A28A9' },
    tagText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    followBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 100,
        justifyContent: 'center',
    },
    followingBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    notFollowingBtn: {
        backgroundColor: '#3B82F6',
    },
    followText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 30,
    },
    tagCrypto: { backgroundColor: '#8B5CF6' },
    tagForex: { backgroundColor: '#059669' },
    tagCommodities: { backgroundColor: '#D97706' },
    tagIndices: { backgroundColor: '#DC2626' },
    tagStocks: { backgroundColor: '#0891B2' },
    tagOthers: { backgroundColor: '#6B7280' },
});

export default StrategyList;