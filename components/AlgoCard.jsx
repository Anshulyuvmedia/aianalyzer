// components/AlgoCard.jsx
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Set of colors to choose from
const COLORS = ['#8B8BCC', '#FA8B5C', '#93EFFF', '#93C4EC'];

const AlgoCard = ({ id, name, subtitle, date, status }) => {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = React.useState(status === 'Active');

    // Select a random color from the set when the component mounts
    const randomColor = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * COLORS.length);
        return COLORS[randomIndex];
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <TouchableOpacity>
            <LinearGradient
                colors={['#D2BDFF', '#0C0C1800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 0.3 }}
                style={{ borderRadius: 25, padding: 1, margin: 5 }}
            >
                {/* Background Gradient with Random First Color */}
                <LinearGradient
                    colors={[randomColor, '#000']} // Use the random color
                    start={{ x: 0, y: 3 }}
                    end={{ x: 0, y: 0 }}
                    style={{ borderRadius: 25 }}
                >
                    <View className="rounded-[25px] px-4 py-4 w-[45vw]">
                        <View className="flex-row justify-between items-start">
                            {/* Algorithm Name */}
                            <Text className="text-white font-questrial text-lg mb-3 w-[60%]">{name}</Text>
                            {/* Status Tag */}
                            <View
                                className={`py-1 px-2 rounded-lg mt-2 ${isPlaying ? 'bg-[#05FF93CC]' : 'bg-yellow-500'
                                    }`}
                            >
                                <Text
                                    className={`text-xs px-1 font-sora ${isPlaying ? 'text-white' : 'text-black'
                                        }`}
                                >
                                    {isPlaying ? 'Active' : 'Paused'}
                                </Text>
                            </View>
                        </View>
                        {/* Metrics */}
                        <View className="flex-row justify-between">
                            <View className="flex-1">
                                <Text className="text-[#AEAED4] font-sora-light text-base">{subtitle}</Text>
                                <Text className="text-[#AEAED4] font-sora-light text-base">{date}</Text>
                            </View>
                        </View>
                        <View className="flex-row mt-2 items-center">
                            <Feather name="arrow-up-right" size={24} color="#05FF93" />
                            <Text className="text-[#05FF93] text-xl ml-1">5.2%</Text>
                        </View>
                        <View className="flex-row mt-2 justify-around items-center py-3 border-t border-x border-[#8B8BCC4D] rounded-full">
                            <Feather name="settings" size={24} color={randomColor} />
                            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                                {isPlaying ? (
                                    <Feather name="pause-circle" size={24} color={randomColor} />
                                ) : (
                                    <Feather name="play-circle" size={24} color={randomColor} />
                                )}
                            </TouchableOpacity>
                            <Feather name="trash-2" size={24} color={randomColor} />
                        </View>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default AlgoCard;

const styles = StyleSheet.create({
    cardGradientBorder: {
        borderRadius: 25,
        padding: 1,
        margin: 5,
    },
    cardContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 25,
        paddingHorizontal: 15,
        width: (Dimensions.get('window').width - 20) / 2,
        padding: 15,
    },
    statusTag: {
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 10,
        marginTop: 7,
    },
    statusText: {
        color: '#fff',
        fontFamily: 'Sora',
        fontSize: 10,
        paddingHorizontal: 5,
    },
    algoTitle: {
        color: '#fff',
        fontFamily: 'Questrial-Regular',
        fontSize: 18,
        marginBottom: 12,
        width: '60%',
        flexWrap: 'nowrap',
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metric: {
        flex: 1,
    },
    metricValue: {
        color: '#AEAED4',
        fontFamily: 'Sora-Light',
        fontSize: 14,
    },
});