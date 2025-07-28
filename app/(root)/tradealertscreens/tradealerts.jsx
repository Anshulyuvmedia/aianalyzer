import { StyleSheet, Text, View, ScrollView, Dimensions, Animated } from 'react-native';
import React, { useState } from 'react';
import TransHeader from '@/components/TransHeader';
import { Feather } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import LinearGradient from 'react-native-linear-gradient';
import ForexAlerts from './alertview/forexalerts';
import CryptoAlerts from './alertview/cryptoalerts';
import BinaryOptionAlerts from './alertview/binaryoptionalerts';
import CommodityAlerts from './alertview/commodityalerts';

const initialLayout = { width: Dimensions.get('window').width - 20 };

const TradeAlerts = () => {
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'forexalerts', title: 'Forex' },
        { key: 'cryptoalerts', title: 'Crypto' },
        { key: 'binaryoptionalerts', title: 'Binary Option' },
        { key: 'commodityalerts', title: 'Commodity' },
    ]);

    const renderScene = SceneMap({
        forexalerts: ForexAlerts,
        cryptoalerts: CryptoAlerts,
        binaryoptionalerts: BinaryOptionAlerts,
        commodityalerts: CommodityAlerts,
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
        );
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#723CDF', '#FAC1EC']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBoxBanner}
            >
                <TransHeader page={'alerts'} />
                <View style={styles.header}>
                    <Text className="text-white font-sora-bold text-xl">Trade Alerts</Text>
                    <Feather name="bell" size={24} color="#fff" />
                </View>
            </LinearGradient>

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
        </ScrollView>
    );
};

export default TradeAlerts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    gradientBoxBorder: {
        borderRadius: 25,
        padding: 1,
        marginHorizontal: 5,
        marginBottom: 15,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    gradientBoxBanner: {
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        marginBottom: 15,
        padding: 15,
        paddingBottom: 70,
    },
    tabViewContainer: {
        height: 'auto',
        minHeight: 600,
        padding: 10,
        marginTop: -90,
    },
    tabBar: {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderRadius: 24,
        position: 'relative',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderColor: '#D49DEA', // Solid border color
        borderWidth: 2,
        borderRadius: 15,
    },
    tabIndicator: {
        height: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
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
        color: '#fff',
        fontFamily: 'Sora-Bold',
        fontSize: 14,
        textAlign: 'center',
    },
    activeTabLabel: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});