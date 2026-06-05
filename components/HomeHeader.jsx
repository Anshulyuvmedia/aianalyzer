import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { NotificationsContext } from '@/context/NotificationsContext';

const HomeHeader = ({ page, title, action, subtitle }) => {
    const router = useRouter();
    const navigation = useNavigation();
    const { unreadCount } = useContext(NotificationsContext);

    const handleBackPress = () => {
        if (page === 'home') {
            router.push('/(root)/dashboard/');
        } else {
            // Check if there’s a previous screen before going back
            if (navigation.canGoBack()) {
                router.back();
            } else {
                // Fallback: Navigate to home or do nothing
                router.push('/(root)'); // Navigate to home if no back stack
            }
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <LinearGradient
                        colors={['#AEAED4', '#000', '#AEAED4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.innerContainer}>
                            {page === 'home' ? (
                                <FontAwesome name="user-circle" size={24} color="#FFD700" />
                            ) : (
                                <Feather name="arrow-left" size={24} color="#999" />
                            )}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.searchBarContainer}>
                    {/* {page === 'chatbot' ? ( */}
                    <Text style={styles.title}>{title}</Text>
                    {/* ) : (
                    <SearchBar />
                )} */}
                </View>

                {action === 'refresh' ? (
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#AEAED4', '#000', '#AEAED4']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.coinContainer}>
                                <Feather name="refresh-cw" size={20} color="#999" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => router.push('notifications')}>
                        <LinearGradient
                            colors={['#444', '#AEAED4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.coinContainer}>
                                <Ionicons name="notifications-outline" size={24} color="white" style={{ overflow: 'visible' }} />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
            <Text className="text-gray-300 text-center">{subtitle}</Text>
        </View>
    );
};

export default HomeHeader;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
    innerContainer: {
        backgroundColor: '#000',
        borderRadius: 100,
        padding: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBarContainer: {
        flex: 1,
    },
    coinContainer: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 100,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    coinText: {
        color: '#FFD700',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        marginLeft: 5,
    },
    coinImage: {
        width: 16,
        height: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Sora-Bold',
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -1,
        left: -5,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});