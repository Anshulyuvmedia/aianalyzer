// app/(root)/(tabs)/chatbot/ai-chart-patterns.jsx
import { StyleSheet, Text, View, ScrollView, Dimensions, Animated } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IndexTab from './tabview/IndexTab';
import StocksTab from './tabview/StocksTab';
import FutureTab from './tabview/FutureTab';
import GraphTab from './tabview/GraphTab';
import TabNavigationHeader from '@/components/TabNavigationHeader';
import HomeHeader from '@/components/HomeHeader';

const initialLayout = { width: Dimensions.get('window').width };

const AIChartPatterns = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'index', title: 'Index' },
        { key: 'stocks', title: 'Stocks' },
        { key: 'futures', title: 'Futures' },
        { key: 'graphs', title: 'Graphs' },
    ]);

    const renderScene = SceneMap({
        index: IndexTab,
        stocks: StocksTab,
        futures: FutureTab,
        graphs: GraphTab,
    });

    const renderTabBar = (props) => {
        const { navigationState, position } = props;
        const inputRange = routes.map((_, i) => i);

        return (
            <LinearGradient
                colors={['#222', '#AEAED4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 2, y: 0 }}
                style={styles.gradientBoxBorder}
            >
                <TabBar
                    {...props}
                    scrollEnabled
                    indicatorStyle={styles.tabIndicator}
                    style={styles.tabBar}
                    renderTab={({ route, focused }) => (
                        <View style={styles.tabContainer}>
                            {focused ? (
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.activeTabGradient}
                                >
                                    <Text style={[styles.tabLabel, styles.activeTabLabel]}>
                                        {route.title}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveTab}>
                                    <Text style={styles.tabLabel}>{route.title}</Text>
                                </View>
                            )}
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
                            >
                                <LinearGradient
                                    colors={['#723CDF', '#9E68E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.pillGradient}
                                />
                            </Animated.View>
                        );
                    }}
                />
            </LinearGradient>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HomeHeader page={'chatbot'} title={'AI Chart Patterns'} action={'refresh'} />

            <TabNavigationHeader activeTab="AIChartPatterns" />

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

export default AIChartPatterns;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Sora-Bold',
        textAlign: 'center',
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    innerContainer: {
        backgroundColor: '#000',
        borderRadius: 100,
        padding: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        flex: 1,
        marginHorizontal: 10,
    },
    coinContainer: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 100,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    tabViewContainer: {
        height: 'auto',
        minHeight: 600,
    },
    tabBar: {
        backgroundColor: '#000',
        borderRadius: 24,
        position: 'relative',
    },
    tabContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    activeTabGradient: {
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inactiveTab: {
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tabIndicator: {
        height: 0,
        backgroundColor: 'transparent',
    },
    pillIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 48,
        zIndex: -1,
    },
    pillGradient: {
        flex: 1,
        borderRadius: 20,
    },
    tabLabel: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
        textAlign: 'center',
    },
    activeTabLabel: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});