// components/StrategyList.jsx 
import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CopyStrategyContext } from '@/context/CopyStrategyContext';

const StrategyList = () => {  // ← no need to receive strategies as prop anymore
    const { strategies, toggleFollow } = useContext(CopyStrategyContext);
    // console.log('strategies', strategies);
    const handleToggle = (strategy) => {
        toggleFollow(strategy._id, !strategy.isFollowing);
    };

    const renderStrategyItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push(`/strategy/${item._id}`)}
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
                            {item.isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagsContainer}>
                    <View style={[styles.tag, styles.tagAsset]}>
                        <Text style={styles.tagText}>{item.assetClass}</Text>
                    </View>
                    <View style={[styles.tag, styles.tagType]}>
                        <Text style={styles.tagText}>{item.strategyType}</Text>
                    </View>
                    <View style={[styles.tag, styles.symbols]}>
                        <Text style={styles.tagText}>{item.symbols}</Text>
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

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{item.followerCount || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>N/A</Text>
                        <Text style={styles.statLabel}>Avg Return</Text>
                    </View>
                </View>
            </View>
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

                        {strategies?.length === 0 ? (
                            <Text style={styles.emptyText}>No public strategies available yet</Text>
                        ) : (
                            <FlatList
                                data={strategies}           // ← use context value directly
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

// Updated styles (simplified & adapted for strategies)
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 10,
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
    strategyInfo: {
        flex: 1,
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
    description: {
        color: '#9CA3AF',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        fontFamily: 'Sora-Regular',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
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
    tagAsset: { backgroundColor: '#6D28D9' }, // purple
    tagType: { backgroundColor: '#059669' }, // green
    symbols: { backgroundColor: '#6A28A9' }, // green
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '700',
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 4,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 30,
    },
    tagCrypto: { backgroundColor: '#6D28D9' }, // purple for crypto
    tagForex: { backgroundColor: '#059669' }, // green for forex
});

export default StrategyList;