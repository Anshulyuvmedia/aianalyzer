// app/(root)/chatbotscreens/tabview/IndexTab.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import icons from '@/constants/icons';

const GradientCard = ({ children, style }) => (
    <LinearGradient
        colors={['#000', '#AEAED4']}
        start={{ x: 0.3, y: 0.6 }}
        end={{ x: 0, y: 0 }}
        style={[styles.gradientBoxBorder, style]}
    >
        <View style={[styles.card, { backgroundColor: '#000' }]}>{children}</View>
    </LinearGradient>
);

const InfoItem = ({ label, value, color = 'text-white' }) => (
    <View className="items-start">
        <Text className="text-gray-400 text-lg font-questrial">{label}</Text>
        <Text className={`text-xl font-sora ${color}`}>{value}</Text>
    </View>
);

const IndexTab = () => {
    const [lowValue, setLowValue] = useState(70);

    const priceLevels = [
        { id: '1', label: 'Entry', value: '₹ 4200', color: 'text-white' },
        { id: '2', label: 'Target', value: '₹ 4250', color: 'text-green-400' },
        { id: '3', label: 'Stop-Loss', value: '₹ 4150', color: 'text-red-600' },
        { id: '4', label: 'Exit', value: '₹ 4230', color: 'text-white' },
    ];

    const renderPriceLevel = ({ item }) => (
        <GradientCard style={styles.priceCard}>
            <Text className="text-gray-400 text-xl font-questrial">{item.label}</Text>
            <Text className={`text-4xl font-sora ${item.color}`}>{item.value}</Text>
        </GradientCard>
    );

    return (
        <View className="flex-1 bg-black">
            <FlatList
                data={[{ key: 'content' }]} // Single item to render the main content
                renderItem={() => (
                    <>
                        <GradientCard style={styles.indexBox}>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-sora-bold text-xl">Bank Nifty</Text>
                                <LinearGradient
                                    colors={['#AEAED4', '#000']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientBorder}
                                >
                                    <TouchableOpacity className="flex-row items-center bg-black px-4 py-2 rounded-full">
                                        <Feather name="refresh-cw" size={16} color="#999" />
                                        <Text className="text-white font-questrial ml-2">Refresh data</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                            <View className="flex-row justify-between mt-4">
                                <View>
                                    <Text className="text-white font-questrial mb-1 text-xl">Signal</Text>
                                    <View className="flex-row items-center p-2 px-5 bg-red-500 rounded-full">
                                        <Feather name="arrow-down-right" size={16} color="#fff" />
                                        <Text className="text-white font-questrial ml-2">Signal</Text>
                                    </View>
                                </View>
                                <View className="items-end px-2">
                                    <Text className="text-white font-questrial mb-1 text-xl">AI Confidence</Text>
                                    <View className="flex-row justify-between items-center">
                                        <View style={styles.sliderContainer}>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={0}
                                                maximumValue={100}
                                                value={lowValue}
                                                onValueChange={(value) => setLowValue(Math.round(value))}
                                                minimumTrackTintColor="#1F65FF"
                                                maximumTrackTintColor="#AEAED4"
                                                thumbTintColor="#1F65FF"
                                                thumbImage={icons.ellipse}
                                            />
                                        </View>
                                        <Text className="text-white font-sora ml-2">{lowValue}%</Text>
                                    </View>
                                </View>
                            </View>
                        </GradientCard>

                        <View className="">
                            <Text className="text-xl font-sora-bold text-white mb-3">Price Levels</Text>
                            <FlatList
                                data={priceLevels}
                                renderItem={renderPriceLevel}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                columnWrapperStyle={styles.priceRow}
                                scrollEnabled={false}
                            />

                            <Text className="text-xl font-sora-bold text-white mb-3 mt-4">Analysis</Text>
                            <Text className="text-gray-400 font-questrial">
                                Bearish signal detected. Short-Term traders may look for selling opportunities.
                            </Text>
                            <View className="flex-row justify-between mt-3">
                                <InfoItem label="Trade Type" value="Options" />
                                <InfoItem label="Strategy" value="Momentum" />
                                <InfoItem label="Sector" value="Index" />
                            </View>

                            <View className="flex-row items-center p-2 px-5 mt-3">
                                <Feather name="arrow-down-right" size={16} color="red" />
                                <Text className="text-gray-400 font-questrial ml-2">
                                    Market Sentiment: <Text className="text-white font-questrial">Bearish</Text>
                                </Text>
                            </View>
                        </View>
                    </>
                )}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default IndexTab;

const styles = StyleSheet.create({
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
    card: {
        borderRadius: 25,
        padding: 15,
    },
    indexBox: {
        padding: 1,
    },
    sliderContainer: {
        width: 150,
        height: 40,
    },
    slider: {
        width: 150,
        height: 40,
    },
    priceCard: {
        flex: 1,
        // paddingVertical: 1,
        // paddingBottom: 20,
    },
    priceRow: {
        justifyContent: 'space-between',
        // marginHorizontal: -5,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 50,
    },
});