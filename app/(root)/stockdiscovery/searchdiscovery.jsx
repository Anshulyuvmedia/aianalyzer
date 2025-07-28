// app/SearchDiscovery.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SearchDiscovery = () => {
    const insets = useSafeAreaInsets(); // Get safe area insets

    // Data for NIFTY 50 (4 instances as shown in the image)
    const niftyData = [
        { id: '1', title: 'NIFTY', value: '19,674.25', change: '+23.45 (0.96%)' },
        { id: '2', title: 'BANKNIFTY', value: '19,674.25', change: '+23.45 (0.96%)' },
        { id: '3', title: 'FINNIFTY', value: '19,674.25', change: '-23.45 (0.96%)' },
        { id: '4', title: 'MIDCPNIFTY', value: '19,674.25', change: '+23.45 (0.96%)' },
    ];

    // Data for stocks
    const stockData = [
        { id: '1', title: 'RELIANCE', company: 'Reliance Industries Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)' },
        { id: '2', title: 'TCS', company: 'Tata Consultancy Services Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)' },
        { id: '3', title: 'HDFCBANK', company: 'HDFC Bank Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)' },
        { id: '4', title: 'INFY', company: 'Infosys Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)' },
        { id: '5', title: 'ICICIBANK', company: 'ICICI Bank Ltd', value: '2456.75', volume: '1,234,567', mcap: '16.6L Cr', change: '+23.45 (0.96%)' },
    ];

    const [searchQuery, setSearchQuery] = useState('');

    // Filter stock data based on search query
    const filteredStockData = stockData.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderNiftyItem = ({ item }) => (
        <TouchableOpacity style={styles.niftyBox}>
            <LinearGradient
                colors={['#33333380', '#000', '#666666']}
                start={{ x: 0.3, y: 0.6 }}
                end={{ x: 0, y: 0 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#191922', '#4D447B']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    <View style={styles.niftyCard}>
                        <Text style={styles.niftyTitle}>{item.title}</Text>
                        <MaskedView
                            maskElement={<Text style={styles.niftyValue}>{item.value}</Text>}
                        >
                            <LinearGradient
                                colors={['#C6DBF8', '#609DF9']}
                                start={{ x: 1, y: 0.5 }}
                                end={{ x: 0, y: 0 }}
                            >
                                <Text style={[styles.niftyValue, { opacity: 0 }]}>{item.value}</Text>
                            </LinearGradient>
                        </MaskedView>
                        <View style={styles.niftyChangeContainer}>
                            <Feather
                                name={item.change.includes('-') ? 'arrow-down-right' : 'arrow-up-right'}
                                size={16}
                                color={item.change.includes('-') ? '#FF0505' : '#05FF93'}
                                style={styles.iconMargin}
                            />
                            <Text
                                style={[
                                    styles.niftyChangePositive,
                                    item.change.includes('-') && { color: '#FF0505' },
                                ]}
                            >
                                {item.change}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderStockItem = ({ item }) => (
        <TouchableOpacity
            style={styles.stockBox}
            onPress={() => router.push(`/stockdiscovery/${item.id}`)}
        >
            <LinearGradient
                colors={['#3C3B40', '#0C0C1800', '#3C3B4066']}
                start={{ x: 0.3, y: 0.6 }}
                end={{ x: 0, y: 0 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#22222B', '#22222B']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    <View style={styles.stockCard}>
                        <View style={styles.stockHeader}>
                            <View>
                                <Text style={styles.stockTitle}>{item.title}</Text>
                                <Text style={styles.companyText}>{item.company}</Text>
                            </View>
                            <View>
                                <Text style={styles.stockValue}>{item.value}</Text>
                                <View style={styles.stockChangeContainer}>
                                    <Feather
                                        name={item.change.includes('-') ? 'arrow-down-right' : 'arrow-up-right'}
                                        size={16}
                                        color={item.change.includes('-') ? '#FF0505' : '#05FF93'}
                                        style={styles.iconMargin}
                                    />
                                    <Text
                                        style={[
                                            styles.stockChangePositive,
                                            item.change.includes('-') && { color: '#FF0505' },
                                        ]}
                                    >
                                        {item.change}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.stockDetails}>
                            <Text style={styles.detailText}>Vol: {item.volume}</Text>
                            <Text style={styles.detailText}>MCap: {item.mcap}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <HomeHeader page={'chatbot'} title={'NSE'} />

            {/* NIFTY 50 Section (2x2 Grid) */}
            <View style={styles.niftyGrid}>
                <FlatList
                    data={niftyData}
                    renderItem={renderNiftyItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.niftySection}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>

            <View style={[styles.bottomsection, { paddingBottom: insets.bottom }]}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                    <Text style={styles.title}>Stock Search & Discovery</Text>
                    <LinearGradient
                        colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                        start={{ x: 0.2, y: 1.2 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.searchGradientBorder}
                    >
                        <View style={styles.inputbox}>
                            <Ionicons name="search" size={24} color="#C0C0CA" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search stocks by symbol or name..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#A9A9A9"
                            />
                        </View>
                    </LinearGradient>
                </View>

                {/* Stock List Section */}
                <FlatList
                    data={filteredStockData}
                    renderItem={renderStockItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.stockListContent]}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyText}>No stocks found</Text>
                    )}
                />
            </View>
        </View>
    );
};

export default SearchDiscovery;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    niftyGrid: {
        marginBottom: 20,
    },
    niftySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    niftyBox: {
        width: '48%',
        marginBottom: 10,
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 2,
        flex: 1,
    },
    innerGradient: {
        borderRadius: 24,
        padding: 1,
    },
    niftyCard: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'flex-start', // Changed from 'start' to 'flex-start' for consistency
    },
    niftyTitle: {
        color: '#83838D',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: '600',
        marginBottom: 5,
    },
    niftyValue: {
        color: '#FFF',
        fontSize: 24,
        fontFamily: 'Questrial-Regular',
        textAlign: 'left', // Changed from 'start' to 'left' for clarity
    },
    niftyChangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 5,
    },
    niftyChangePositive: {
        color: '#05FF93',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
    stockBox: {
        width: '100%',
        marginBottom: 10,
    },
    stockCard: {
        padding: 15,
        alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment
    },
    stockHeader: {
        width: '100%',
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stockTitle: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        fontWeight: '600',
    },
    companyText: {
        color: '#A9A9A9',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
    stockValue: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        textAlign: 'right',
    },
    stockDetails: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        marginVertical: 5,
        gap: 15, // Increased gap for better spacing
    },
    detailText: {
        color: '#A9A9A9',
        fontSize: 12,
        fontFamily: 'Questrial-Regular',
    },
    stockChangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockChangePositive: {
        color: '#05FF93',
        fontSize: 12,
        fontFamily: 'Questrial-Regular',
    },
    iconMargin: {
        marginHorizontal: 5,
    },
    flatListContent: {
        // paddingBottom: 10,
    },
    searchSection: {
        marginBottom: 10,
    },
    searchGradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    inputbox: {
        backgroundColor: '#1d1d26',
        paddingHorizontal: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        color: '#FFF',
        fontSize: 16,
        backgroundColor: '#1d1d26',
        padding: 10,
        borderRadius: 20,
        flex: 1, // Allow TextInput to take remaining space
    },
    stockListContent: {
        // paddingBottom: 20, // Increased default padding
    },
    emptyText: {
        color: '#A9A9A9',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    bottomsection: {
        backgroundColor: '#191922',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 20,
        flex: 1, // Ensure bottomsection takes remaining space
    },
    title: {
        fontSize: 18,
        color: 'white',
        marginBottom: 10,
        fontWeight: 'bold',
    },
});