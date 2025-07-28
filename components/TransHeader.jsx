import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React from 'react'
import images from '@/constants/images';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather } from '@expo/vector-icons';
import SearchBar from '@/components/SearchBar';
import { router } from 'expo-router';

const TransHeader = ({ page, title, action }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <LinearGradient
                    colors={['#D49DEA', '#D9C4FC', '#D49DEA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBorder}
                >
                    <LinearGradient
                        colors={['#824ce0', '#965fe2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientBox}
                    >
                        <View style={styles.innerContainer}>
                            {page === 'home' ?
                                <FontAwesome name="user-circle" size={26} color="#FFD700" />
                                :
                                <Feather name="arrow-left" size={26} color="#D49DEA" />
                            }
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.searchBarContainer}>
                {page === 'chatbot' ?
                    <Text style={styles.title}>{title}</Text>
                    :
                    <SearchBar color={'transparent'} />
                }
            </View>

            {action === 'refresh' ?
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#AEAED4', '#000', '#AEAED4']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.coinContainer}>
                            <Feather name="refresh-cw" size={26} color="#999" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                :
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#D49DEA', '#D9C4FC']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientBorder}
                    >
                        <LinearGradient
                            colors={['#824ce0', '#965fe2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.gradientBox}
                        >
                            <View style={styles.coinContainer}>
                                <Image source={images.rupee} style={styles.coinImage} resizeMode="contain" />
                                <Text style={styles.coinText}>400</Text>
                            </View>
                        </LinearGradient>
                    </LinearGradient>
                </TouchableOpacity>
            }
        </View>
    )
}

export default TransHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
    },
    gradientBox: {
        borderRadius: 100,
    },
    innerContainer: {
        backgroundColor: 'transparent',
        borderRadius: 100,
        padding: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBarContainer: {
        flex: 1,
        // marginHorizontal: 5,
    },
    coinContainer: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 100,
        // backgroundColor: '#000',
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
        fontSize: 24,
        fontFamily: 'Sora-Bold',
        textAlign: 'center',
    },
})