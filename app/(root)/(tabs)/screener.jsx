import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const Screener = () => {
    const possibleBreakoutsData = [
        { id: '1', count: '2 Stocks' },
        { id: '2', count: 'Free Stocks' },
        { id: '3', count: 'Free Stocks' },
        { id: '4', count: 'Free Stocks' },
    ];

    const topOversoldData = [
        { id: '1', label: 'High Delivery' },
        { id: '2', label: 'Free Stocks' },
        { id: '3', label: 'Free Stocks' },
        { id: '4', label: 'Free Stocks' },
    ];

    const topCrossersData = [
        { id: '1', label: 'Top Gainers' },
        { id: '2', label: 'Free Stocks' },
        { id: '3', label: 'Free Stocks' },
        { id: '4', label: 'Free Stocks' },
    ];

    const renderBreakoutCard = ({ item }) => (
        <LinearGradient
            colors={['#FFA4E9', '#1D28FC']} // Purple-blue gradient for background
            start={{ x: 1, y: 1.3 }}
            end={{ x: 0, y: 0 }}
            style={styles.breakoutCard}
        >
            <Text style={styles.cardTitle} className="font-sora">Possible Breakouts</Text>
            <Text style={styles.cardCount}>{item.count}</Text>
            <TouchableOpacity>
                <LinearGradient
                    colors={['#EDEBFF', '#00000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.freeStocksButton}
                >
                    <View style={styles.freebutton}>
                        <Text style={styles.freeStocksText}>
                            Free Stocks
                        </Text>
                        <Feather name="arrow-up-right" size={16} color="white" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );

    const renderOversoldCard = ({ item }) => (
        <LinearGradient
            colors={['#EDEBFF', '#00000000']} // Green gradient for border
            start={{ x: 5, y: 0.5 }}
            end={{ x: 0, y: 0 }}
            style={styles.cardBorderGradient}
        >
            <View style={styles.otherCard}>
                <FontAwesome5 name="rocket" size={24} color="#FFFFFF" />
                <Text style={styles.cardLabel}>{item.label}</Text>
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#31314D', '#0C0C1800']}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.freeStocksButton}
                    >
                        <View style={styles.overboughtbutton}>
                            <Text style={styles.freeStocksText}>
                                Free Stocks
                            </Text>
                            <Feather name="arrow-up-right" size={16} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );

    const renderCrossersCard = ({ item }) => (
        <LinearGradient
            colors={['#EDEBFF', '#00000000']}
            start={{ x: 5, y: 0.5 }}
            end={{ x: 0, y: 0 }}
            style={styles.cardBorderGradient}
        >
            <View style={styles.otherCard}>
                <FontAwesome5 name="tachometer-alt" size={24} color="#FFFFFF" />
                <Text style={styles.cardLabel}>{item.label}</Text>
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#31314D', '#0C0C1800']}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.freeStocksButton}
                    >
                        <View style={styles.overboughtbutton}>
                            <Text style={styles.freeStocksText}>
                                Free Stocks
                            </Text>
                            <Feather name="arrow-up-right" size={16} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'algo'} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Signal-Based Screeners (Existing Cards)</Text>
            </View>

            <View style={styles.section}>
                <FlatList
                    data={possibleBreakoutsData}
                    renderItem={renderBreakoutCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Overbought</Text>
                <FlatList
                    data={topOversoldData}
                    renderItem={renderOversoldCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Crossers</Text>
                <FlatList
                    data={topCrossersData}
                    renderItem={renderCrossersCard}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default Screener;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Black background to match theme
        padding: 10,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
        marginBottom: 8,
    },
    breakoutCard: {
        borderRadius: 16,
        padding: 16,
        width: 200,
        height: 150,
        justifyContent: 'space-between',
        marginRight: 12,
        alignItems: 'center',
    },
    otherCard: {
        backgroundColor: '#000', // Dark gray to match theme
        borderRadius: 16,
        padding: 16,
        width: 200,
        height: 150,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    cardBorderGradient: {
        borderRadius: 16,
        padding: 1, // Acts as border width
        marginRight: 12,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    cardCount: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
    },
    cardLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
        marginTop: 8,
    },
    freebutton: {
        backgroundColor: '#000',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    overboughtbutton: {
        // backgroundColor: '#000',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    freeStocksButton: {
        borderRadius: 16,
        padding: 1,
    },
    freeStocksText: {
        color: '#fff', // Black for contrast on green gradient
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
});