// components/TabNavigationHeader.jsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';

const TabNavigationHeader = ({ activeTab }) => {
    const router = useRouter();
    const handleNavigation = (targetRoute) => {
        const currentPath = router.pathname;
        if (currentPath !== targetRoute) {
            router.push(targetRoute);
        } else {
            console.log('Already on route:', targetRoute);
        }
    };

    return (
        <View style={styles.tabNavContainer}>
            {/* Paid Signal */}
            <TouchableOpacity
                onPress={() => handleNavigation('/chatbot/paidsignal')}
                disabled={activeTab === 'PaidSignal'}
            >
                <View style={styles.tabNavItem}>
                    <Feather
                        name="bar-chart-2"
                        size={22}
                        color={activeTab === 'PaidSignal' ? '#E0BDFF' : '#83838D'}
                    />
                    <Text
                        style={[
                            styles.tabNavText,
                            activeTab === 'PaidSignal' ? styles.activeTabText : null,
                        ]}
                    >
                        Paid Signal
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Free Signal */}
            <TouchableOpacity
                onPress={() => handleNavigation('/chatbot/freesignal')}
                disabled={activeTab === 'FreeSignal'}
            >
                <View style={styles.tabNavItem}>
                    <Feather
                        name="bar-chart-2"
                        size={22}
                        color={activeTab === 'FreeSignal' ? '#E0BDFF' : '#83838D'}
                    />
                    <Text
                        style={[
                            styles.tabNavText,
                            activeTab === 'FreeSignal' ? styles.activeTabText : null,
                        ]}
                    >
                        Free Signal
                    </Text>
                </View>
            </TouchableOpacity>

            {/* AI Chart Patterns */}
            <TouchableOpacity
                onPress={() => handleNavigation('/chatbot/aichartpatterns')}
                disabled={activeTab === 'AIChartPatterns'}
            >
                <View style={styles.tabNavItem}>
                    <FontAwesome
                        name="line-chart"
                        size={18}
                        color={activeTab === 'AIChartPatterns' ? '#E0BDFF' : '#83838D'}
                    />
                    <Text
                        style={[
                            styles.tabNavText,
                            activeTab === 'AIChartPatterns' ? styles.activeTabText : null,
                        ]}
                    >
                        AI Chart Patterns
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    tabNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tabNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabNavText: {
        marginLeft: 4,
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
        color: '#83838D',
    },
    activeTabText: {
        color: '#E0BDFF',
    },
};

export default TabNavigationHeader;