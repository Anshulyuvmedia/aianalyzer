import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';

const ASSET_CLASSES = [
    { key: 'ALL', label: 'All', icon: 'apps' },
    { key: 'FOREX', label: 'Forex', icon: 'currency-usd' },
    { key: 'CRYPTO', label: 'Crypto', icon: 'bitcoin' },
    { key: 'COMMODITIES', label: 'Commodities', icon: 'chart-line' },
    { key: 'INDICES', label: 'Indices', icon: 'trending-up' },
    { key: 'STOCKS', label: 'Stocks', icon: 'finance' },
];

const ASSET_STYLES = {
    FOREX: { bg: '#065f46', label: 'FX' },
    CRYPTO: { bg: '#5b21b6', label: 'Crypto' },
    COMMODITIES: { bg: '#92400e', label: 'Comm' },
    INDICES: { bg: '#991b1b', label: 'Index' },
    STOCKS: { bg: '#0e7490', label: 'Stock' },
};

const AssetBadge = ({ assetClass }) => {
    const style = ASSET_STYLES[assetClass] || { bg: '#4b5563', label: assetClass };
    return (
        <View style={[styles.assetBadge, { backgroundColor: style.bg }]}>
            <Text style={styles.assetBadgeText}>{style.label}</Text>
        </View>
    );
};

const FollowButton = ({ isFollowing, followerCount, onPress }) => (
    <TouchableOpacity
        style={[styles.followBtn, isFollowing && styles.followBtnActive]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <MaterialCommunityIcons
            name={isFollowing ? 'check-circle' : 'plus-circle'}
            size={18}
            color={isFollowing ? '#f87171' : '#22c55e'}
        />
        <Text style={[styles.followBtnText, isFollowing && { color: '#f87171' }]}>
            {isFollowing ? 'Following' : 'Follow'}
        </Text>
        <Text style={styles.followerCount}>{followerCount || 0}</Text>
    </TouchableOpacity>
);

const StrategyList = () => {
    const { strategies, toggleFollow } = useContext(CopyStrategyContext);
    const [selectedAsset, setSelectedAsset] = useState('ALL');

    const filtered = strategies?.filter(s =>
        selectedAsset === 'ALL' ? true : s.assetClass === selectedAsset
    ) || [];

    const handleToggle = (strategy) => {
        toggleFollow(strategy._id, !strategy.isFollowing);
    };

    return (
        <View style={styles.container}>
            {/* ── Header ── */}
            <View style={styles.headerRow}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color="#22c55e" />
                <Text style={styles.headerText}>Public Strategies</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{filtered.length}</Text>
                </View>
            </View>

            {/* ── Asset Tabs ── */}
            <FlatList
                horizontal
                data={ASSET_CLASSES}
                keyExtractor={t => t.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.tab, selectedAsset === item.key && styles.tabActive]}
                        onPress={() => setSelectedAsset(item.key)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={18}
                            color={selectedAsset === item.key ? '#22c55e' : '#64748b'}
                        />
                        <Text style={[styles.tabLabel, selectedAsset === item.key && styles.tabLabelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* ── Strategy Cards ── */}
            {filtered.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="database-search" size={40} color="#334155" />
                    <Text style={styles.emptyText}>
                        No {selectedAsset !== 'ALL' ? selectedAsset.toLowerCase() : ''} strategies found
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={s => s._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/StrategyDetail/${item._id}`)}
                            activeOpacity={0.95}
                        >
                            {/* Top gradient accent */}
                            <LinearGradient
                                colors={['rgba(34,197,94,0.08)', 'transparent']}
                                style={styles.cardAccent}
                            />

                            <View style={styles.cardBody}>
                                {/* Row 1: name + follow */}
                                <View style={styles.cardRow}>
                                    <View style={styles.cardTitleBlock}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                                        {(item.symbols?.length > 0 || item.timeframes?.length > 0) && (
                                            <View style={styles.tagsRow}>
                                                <AssetBadge assetClass={item.assetClass} />
                                                {item.symbols?.slice(0, 3).map((s, i) => (
                                                    <View key={`s-${i}`} style={styles.tag}>
                                                        <Text style={styles.tagText}>{s}</Text>
                                                    </View>
                                                ))}
                                                {item.timeframes?.slice(0, 2).map((tf, i) => (
                                                    <View key={`tf-${i}`} style={[styles.tag, styles.tagTimeframe]}>
                                                        <Text style={styles.tagText}>{tf}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    <FollowButton
                                        isFollowing={item.isFollowing}
                                        followerCount={item.followerCount}
                                        onPress={() => handleToggle(item)}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default StrategyList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 10,
    },

    // ── Header ──
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    headerText: {
        color: '#f1f5f9',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 10,
        letterSpacing: -0.3,
    },
    countBadge: {
        marginLeft: 10,
        backgroundColor: '#1e293b',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    countText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Tabs ──
    tabsList: {
        paddingHorizontal: 4,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
    },
    tabActive: {
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderColor: '#22c55e',
    },
    tabLabel: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: '#22c55e',
        fontWeight: '600',
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        color: '#475569',
        fontSize: 15,
        fontWeight: '500',
    },

    // ── List ──
    listContent: {
        paddingBottom: 16,
    },

    // ── Card ──
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 72,
    },
    cardBody: {
        padding: 16,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitleBlock: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        color: '#f1f5f9',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'capitalize',
    },
    cardMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardType: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },

    // ── Asset Badge ──
    assetBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    assetBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // ── Follow Button ──
    followBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
    },
    followBtnActive: {
        borderColor: '#7f1d1d',
        backgroundColor: 'rgba(239,68,68,0.08)',
    },
    followBtnText: {
        color: '#22c55e',
        fontSize: 12,
        fontWeight: '600',
    },
    followerCount: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 2,
    },

    // ── Tags ──
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 6,
    },
    tag: {
        backgroundColor: '#0f172a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    tagTimeframe: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderColor: '#1e3a5f',
    },
    tagText: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '500',
    },

    // ── Description ──
    cardDesc: {
        color: '#fff',
        fontSize: 13,
        marginTop: 8,
        lineHeight: 18,
    },
});
