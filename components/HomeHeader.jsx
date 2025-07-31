import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import images from '@/constants/images';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather } from '@expo/vector-icons';
import SearchBar from '@/components/SearchBar';
import { useRouter, useNavigation } from 'expo-router'; // Import useNavigation

const HomeHeader = ({ page, title, action, subtitle }) => {
    const router = useRouter();
    const navigation = useNavigation(); // Get navigation object

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
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#444', '#AEAED4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.coinContainer}>
                                <Image source={images.rupee} style={styles.coinImage} resizeMode="contain" />
                                <Text style={styles.coinText}>400</Text>
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
        marginBottom: 10,
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
});