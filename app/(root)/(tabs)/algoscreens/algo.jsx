// app/(root)/algoscreens/Algo.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import AlgoCard from '@/components/AlgoCard';
import { router } from 'expo-router';

const ALGO_DATA = [
    { id: '1', name: 'BTC Momentum', subtitle: 'Trend Following', date: '2023-06-10  |  14:30', status: 'Active' },
    { id: '2', name: 'ETH Scalping', subtitle: 'Scalping', date: '2023-06-09  |  22:15', status: 'Inactive' },
    { id: '3', name: 'BTC Momentum', subtitle: 'Trend Following', date: '2023-06-10  |  14:30', status: 'Active' },
    { id: '4', name: 'ETH Scalping', subtitle: 'Scalping', date: '2023-06-09  |  22:15', status: 'Active' },
    { id: '5', name: 'BTC Momentum', subtitle: 'Trend Following', date: '2023-06-10  |  14:30', status: 'Active' },
];

const Algo = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const filteredAlgoData = isEnabled
        ? ALGO_DATA
        : ALGO_DATA.filter(item => item.status === 'Active');

    return (
        <View className="flex-1 bg-black pt-3">
            {/* Fixed Content */}
            <View style={styles.fixedContainer}>
                <HomeHeader page="algo" />

                <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.push('/algoscreens/signals')}>
                        <LinearGradient
                            colors={['#0C0C18', '#B0B0B0']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={[styles.tabBox, { backgroundColor: '#000' }]}>
                                <Text className="text-white font-questrial">Signals</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/algoscreens/indicatorbased')}>
                        <LinearGradient
                            colors={['#0C0C18', '#B0B0B0']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={[styles.tabBox, { backgroundColor: '#000' }]}>
                                <Text className="text-white font-questrial">Indicator based</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#9E68E4', '#723CDF']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBox}
                        >
                            <View style={styles.tabBox}>
                                <Text className="text-white font-questrial">Algorithmic Trading</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View className="my-7">
                    <Text className="text-white text-xl font-sora-extrabold">Algorithmic Trading</Text>
                    <Text className="text-[#AEAEB9] text-base font-questrial mt-4">Your Trading Algorithms</Text>
                    <Text className="text-[#83838D] text-base font-questrial">
                        Manage and monitor your active trading algorithms
                    </Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <Switch
                        trackColor={{ false: '#444', true: '#444' }}
                        thumbColor={isEnabled ? '#05FF93' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                    <Text className="text-[#AEAEB9] font-questrial">Show Paused Algorithms</Text>
                    <LinearGradient
                        colors={['#AEAED4', '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <TouchableOpacity className="flex-row items-center bg-black px-4 py-2 rounded-full">
                            <Feather name="refresh-cw" size={16} color="#999" />
                            <Text className="text-white font-questrial ml-2">Refresh data</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>

            {/* Vertically Scrollable Container */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Horizontally Scrollable FlatList */}
                <FlatList
                    data={filteredAlgoData}
                    renderItem={({ item }) => (
                        <AlgoCard
                            id={item.id}
                            name={item.name}
                            subtitle={item.subtitle}
                            date={item.date}
                            status={item.status}
                        />
                    )}
                    horizontal
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsHorizontalScrollIndicator={false}
                />

                {/* Optional: Add more horizontal FlatLists or other content */}
                {/* Example placeholder for additional sections */}
                <View style={styles.placeholderSection}>
                    <Text className="text-white font-sora-bold text-lg mb-2">More Algorithms</Text>
                    <FlatList
                        data={filteredAlgoData}
                        renderItem={({ item }) => (
                            <AlgoCard
                                id={item.id}
                                name={item.name}
                                subtitle={item.subtitle}
                                date={item.date}
                                status={item.status}
                            />
                        )}
                        horizontal
                        keyExtractor={(item) => item.id + '-more'}
                        contentContainerStyle={styles.listContainer}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Algo;

const styles = StyleSheet.create({
    fixedContainer: {
        paddingHorizontal: 10,
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
        marginRight: 10,
    },
    gradientBox: {
        borderRadius: 100,
        marginRight: 10,
    },
    tabBox: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 50,
    },
    listContainer: {
        paddingVertical: 10,
    },
    placeholderSection: {
        marginTop: 20,
    },
});