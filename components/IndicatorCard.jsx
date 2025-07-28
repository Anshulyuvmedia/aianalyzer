import { Image, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 40) / 2; // Account for container padding (10 on each side) and card margin (5 on each side)

const IndicatorCard = ({ id, name, imageuri }) => {
    return (
        <TouchableOpacity>
            <LinearGradient
                colors={['#D2BDFF', '#0C0C1800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 0.3 }}
                style={{ borderRadius: 25, padding: 1, margin: 5 }}
            >
                <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                    <View className="flex-col justify-between items-center">
                        <Image source={imageuri} style={styles.graphimg} resizeMode="contain" />
                        {/* Algorithm Name */}
                        <Text className="text-white font-sora text-lg mb-3" numberOfLines={2}>
                            {name}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default IndicatorCard;

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#000',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    graphimg: {
        width: 130,
        height: 130,
    },
});