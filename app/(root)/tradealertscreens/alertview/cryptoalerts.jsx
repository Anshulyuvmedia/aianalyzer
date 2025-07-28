import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import icons from '@/constants/icons';

const CryptoAlerts = () => {
    const [lowValue, setLowValue] = useState(70);

    return (
        <ScrollView className="mt-8 px-3">
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-white font-sora-bold">BTC/USD</Text>
                    <Text className="text-[#83838D] font-questrial">2 days ago</Text>
                </View>
                <View className="bg-[#05FF92] rounded-full px-4 py-2">
                    <Text className="text-black">Buy Market</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
                <View>
                    <Text className="text-white font-sora">BTC/USD CHART</Text>
                    <View className="flex-row mt-1">
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                        <FontAwesome name="star" size={18} color="#FFD700" className="ms-1" />
                    </View>

                </View>
            </View>
            <View className="flex-row justify-between items-center p-3 my-3">
                <View>
                    <Text className="text-[#83838D] font-sora">Entry</Text>
                    <Text className="text-white font-questrial text-xl">35000</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-sora">TP1</Text>
                    <Text className="text-white font-questrial text-xl">36000</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-sora">TP2</Text>
                    <Text className="text-white font-questrial text-xl">37000</Text>
                </View>
                <View>
                    <Text className="text-[#83838D] font-sora">TP3</Text>
                    <Text className="text-white font-questrial text-xl">38000</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
                <View>
                    <Text className="text-white font-sora text-2xl">38000</Text>
                    <Text className="text-[#05FF92] font-sora">+500.00</Text>
                </View>
            </View>
            <View className="items-start my-3">
                <Text className="text-white font-sora mb-1 text-xl">AI Confidence</Text>
                <View className="flex-row justify-between items-center">
                    <View style={styles.sliderContainer}>
                        {/* Custom track to increase height */}
                        <View style={styles.customTrack} />
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            value={lowValue}
                            onValueChange={(value) => { setLowValue(Math.round(value)) }}
                            minimumTrackTintColor="#1F65FF"
                            maximumTrackTintColor="#AEAED4"
                            thumbTintColor="#1F65FF" // Fallback color if thumbImage fails
                            thumbImage={icons.ellipse} // Path to your custom thumb image
                        />
                    </View>
                    <Text className="text-white font-sora ml-2">{lowValue}%</Text>
                </View>
            </View>

            <View>
                <Text className="text-white text-xl font-sora mb-3">Analysis</Text>
                <Text className="text-gray-400 font-questrial text-lg">Bitcoin is showing signs of recovery after a recent dip. The overall trend remains bullish with strong support levels.</Text>
                <View className='flex-row justify-between mt-3'>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Trade Type</Text>
                        <Text className="text-white text-xl font-sora ">Spot</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Strategy</Text>
                        <Text className="text-white text-xl font-sora ">Breakout</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-lg font-questrial">Sector</Text>
                        <Text className="text-white text-xl font-sora ">Cryptocurrency</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default CryptoAlerts

const styles = StyleSheet.create({
    sliderContainer: {
        position: 'relative',
        width: "90%",
        height: 40,
    },
    slider: {
        width: '100%',
        height: 40,
        position: 'absolute',
    },
    // customTrack: {
    //     position: 'absolute',
    //     top: 15,
    //     width: '100%',

    //     height: 10,
    //     // backgroundColor: '#1F65FF',
    //     borderRadius: 4,
    // },
    thumb: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1F65FF',
        top: -10,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
})