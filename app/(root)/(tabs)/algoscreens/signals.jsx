import { Text, View, Animated, Dimensions, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import { Feather } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import SwingTrade from './signaltabview/swingtrade';
import StockOption from './signaltabview/stockoption';
import IndexStrategies from './signaltabview/indexstrategies';
import IndexOption from './signaltabview/indexoption';

const initialLayout = { width: Dimensions.get('window').width - 20 }; // Account for paddingHorizontal: 10

const Signals = () => {
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'swingtrade', title: 'Swing Trade' },
        { key: 'stockoption', title: 'Stock Option' },
        { key: 'indexstrategies', title: 'Index Strategies' },
        { key: 'indexoption', title: 'Index Option' },
    ]);

    const renderScene = SceneMap({
        swingtrade: SwingTrade,
        stockoption: StockOption,
        indexstrategies: IndexStrategies,
        indexoption: IndexOption,
    });

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const inputRange = routes.map((_, i) => i);

        return (
            <TabBar
                {...props}
                scrollEnabled
                indicatorStyle={styles.tabIndicator}
                style={styles.tabBar}
                renderTab={({ route, focused }) => (
                    <View style={styles.tabContainer}>
                        <View style={[styles.tab, focused ? styles.activeTab : styles.inactiveTab]}>
                            <Text style={[styles.tabLabel, focused ? styles.activeTabLabel : null]}>
                                {route.title}
                            </Text>
                        </View>
                    </View>
                )}
                renderIndicator={(indicatorProps) => {
                    const { getTabWidth } = indicatorProps;
                    const tabWidths = routes.map((_, i) => getTabWidth(i));
                    const maxTabWidth = Math.max(...tabWidths, 1);

                    const translateX = position.interpolate({
                        inputRange,
                        outputRange: tabWidths.map((_, i) => {
                            return tabWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
                        }),
                    });

                    const scaleX = position.interpolate({
                        inputRange,
                        outputRange: tabWidths.map((width) => width / maxTabWidth),
                    });

                    const adjustedTranslateX = Animated.add(
                        translateX,
                        Animated.multiply(
                            Animated.subtract(1, scaleX),
                            maxTabWidth / 2
                        )
                    );

                    return (
                        <Animated.View
                            style={[
                                styles.pillIndicator,
                                {
                                    width: maxTabWidth,
                                    transform: [
                                        { translateX: adjustedTranslateX },
                                        { scaleX },
                                    ],
                                },
                            ]}
                        />
                    );
                }}
            />
        );
    };

    return (
        <View style={styles.Container}>
            <HomeHeader page={'algo'} />

            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-white text-lg font-bold">Signals</Text>
                    <Text className="text-gray-500 text-sm">Real-time trading signals by SEBI registered analysts</Text>
                </View>
                <View>
                    <Feather name="menu" size={24} color="white" />
                </View>
            </View>

            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={initialLayout}
                    lazy
                    renderTabBar={renderTabBar}
                />
            </View>
        </View>
    );
};

export default Signals;

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    tabViewContainer: {
        flex: 1, // Use flex: 1 for better responsiveness instead of fixed minHeight
    },
    tabBar: {
        backgroundColor: '#000000',
        borderRadius: 24,
        position: 'relative',
    },
    tabContainer: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        
    },
    tab: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 15,
    },
    activeTab: {
        backgroundColor: '#000000',
    },
    inactiveTab: {
        backgroundColor: '#000000',
    },
    tabIndicator: {
        height: 4,
        backgroundColor: '#00FF00',
        borderRadius: 2,
    },
    pillIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 4,
        backgroundColor: '#00FF00',
        borderRadius: 2,
        zIndex: -1,
    },
    tabLabel: {
        color: '#FFF',
        fontFamily: 'Sora-BOld',
        fontSize: 14,
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: 'bold',
    },
});
