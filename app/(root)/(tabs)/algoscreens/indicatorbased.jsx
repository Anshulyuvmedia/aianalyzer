// app/(root)/algoscreens/IndicatorBased.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import IndicatorCard from '@/components/IndicatorCard';
import images from '@/constants/images';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TABS = ['Neutral', 'Bullish', 'Bearish', 'Others'];

const IndicatorBased = () => {
    const [activeTab, setActiveTab] = useState('Neutral');

    const Pattern_Data = [
        { id: '1', name: 'Short Straddle', imageuri: images.shortstraddle, type: 'Neutral' },
        { id: '2', name: 'Iron Butterfly', imageuri: images.ironbutterfly, type: 'Neutral' },
        { id: '3', name: 'Short Strangle', imageuri: images.shortstrangle, type: 'Neutral' },
        { id: '4', name: 'Bull Call Spread', imageuri: images.shortstraddle, type: 'Bullish' },
        { id: '5', name: 'Bear Put Spread', imageuri: images.ironbutterfly, type: 'Bearish' },
        { id: '6', name: 'Long Straddle', imageuri: images.shortstrangle, type: 'Others' },
        { id: '7', name: 'Call Option', imageuri: images.shortstraddle, type: 'Bullish' },
        { id: '8', name: 'Put Option', imageuri: images.ironbutterfly, type: 'Bearish' },
    ];

    const filteredData = Pattern_Data.filter((item) => item.type === activeTab);

    const renderTabItem = ({ item }) => (
        <TouchableOpacity onPress={() => setActiveTab(item)}>
            <LinearGradient
                colors={activeTab === item ? ['#9E68E4', '#723CDF'] : ['#0C0C18', '#B0B0B0']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.gradientBorder}
            >
                <View className="bg-black rounded-full">
                    <View style={styles.tabBox}>
                        <Text className="text-white font-questrial text-base">{item}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black pt-3">
            {/* Fixed Header and Tabs */}
            <View style={styles.fixedContainer}>
                <HomeHeader page="algo" />

                <FlatList
                    data={TABS}
                    renderItem={renderTabItem}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabList}
                />
            </View>

            {/* Scrollable Indicator Cards */}
            <FlatList
                data={filteredData}
                renderItem={({ item }) => (
                    <IndicatorCard id={item.id} name={item.name} imageuri={item.imageuri} />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    );
};

export default IndicatorBased;

const styles = StyleSheet.create({
    fixedContainer: {
        paddingHorizontal: 10,
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
        marginRight: 10,
    },
    tabBox: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
        minWidth: 100,
        alignItems: 'center',
    },
    tabList: {
        paddingVertical: 5,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
});