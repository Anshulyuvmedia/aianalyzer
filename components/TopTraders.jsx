import { Feather, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TopTraders = ({ toptradersdata }) => {
    const [toptraders, setTopTraders] = useState([]);

    useEffect(() => {
        if (toptradersdata) {
            setTopTraders(toptradersdata);
        }
    }, [toptradersdata]);

    const toggleFollow = (index) => {
        setTraders(prevTraders => {
            const updatedTraders = [...prevTraders];
            updatedTraders[index].isFollowing = !updatedTraders[index].isFollowing;
            return updatedTraders;
        });
    };

    const renderTraderItem = ({ item, index }) => (
        <View style={styles.traderCard}>
            <View style={styles.traderInfo}>
                <View style={styles.headerRow}>
                    <View style={styles.rankNameContainer}>
                        <View style={styles.traderRank}>
                            <Text style={styles.rankText}>{item.rank}</Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <View style={styles.nameRow}>
                                <Text style={styles.traderName}>{item.name}</Text>
                                {index === 0 && (
                                    <View style={styles.traderIcon}>
                                        <MaterialCommunityIcons name="crown" size={18} color="#FFD700" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.subtitleRow}>
                                <View style={styles.traderIcon}>
                                    <Feather name="star" size={16} color="gold" />
                                </View>
                                <Text style={styles.subtitle}>{item.rating}</Text>
                                <Text style={styles.subtitle}> | </Text>
                                <Text style={styles.subtitle}>{item.followers} followers</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.followButton, { backgroundColor: item.isFollowing ? '#d72424' : '#3B82F6' }]}
                            onPress={() => toggleFollow(index)}
                        >
                            <SimpleLineIcons
                                name={item.isFollowing ? 'user-unfollow' : 'user-follow'}
                                size={14}
                                color="white"
                            />
                            <Text style={styles.buttonText}>
                                {item.isFollowing ? 'Unfollow' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.traderMetrics}>
                    <View style={styles.metricItem}>
                        <Text style={[styles.metricValue, { color: String(item.successRate).startsWith('-') ? '#FF3B15' : '#34C759' }]}>
                            {item.successRate}
                        </Text>
                        <Text style={styles.metricLabel}>Success Rate</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{item.avgDuration}</Text>
                        <Text style={styles.metricLabel}>Avg Duration</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{item.monthlyReturn}</Text>
                        <Text style={styles.metricLabel}>Monthly Return</Text>
                    </View>
                </View>
            </View>
        </View>
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
                    <View style={styles.cardContent}>
                        <View className="flex-row">
                            <View style={styles.traderIcon}>
                                <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
                            </View>
                            <Text style={styles.headerText}>Top Traders</Text>
                        </View>
                        <FlatList
                            data={toptraders}
                            renderItem={renderTraderItem}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                        />
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
    headerText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 15,
    },
    traderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d374833',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    traderInfo: {
        flex: 1,
        paddingLeft: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    rankNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    traderRank: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2055df',
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    rankText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: '600',
    },
    nameContainer: {
        flexDirection: 'column',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    traderName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        color: '#9c9781',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    traderIcon: {
        marginRight: 5,
    },
    buttonContainer: {
        alignItems: 'flex-end',
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 5,
    },
    traderMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',

    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 3,
    },
});

export default TopTraders;