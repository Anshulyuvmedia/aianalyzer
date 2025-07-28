import { Text, View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '@/components/HomeHeader';
import images from '@/constants/images';
import LinearGradient from 'react-native-linear-gradient';

const NewsListing = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = [
        'All',
        'Stock Market',
        'Crypto',
        'Business',
        'Technology',
        'Finance',
    ];

    const newsData = [
        {
            id: '1',
            category: 'Stock Market',
            title: 'Market Hits Record Highs Amid Tech Surge',
            source: 'Economic Times',
            timestamp: '2h ago',
            image: images.courseimg,
        },
        {
            id: '2',
            category: 'Crypto',
            title: 'Bitcoin Surges Past $70K',
            source: 'CoinDesk',
            timestamp: '3h ago',
            image: images.courseimg,
        },
        {
            id: '3',
            category: 'Business',
            title: 'Major Merger Announced in Retail Sector',
            source: 'Business Insider',
            timestamp: '5h ago',
            image: images.courseimg,
        },
        {
            id: '4',
            category: 'Technology',
            title: 'AI Startup Raises $100M in Funding',
            source: 'TechCrunch',
            timestamp: '1d ago',
            image: images.courseimg,
        },
        {
            id: '5',
            category: 'Finance',
            title: 'Federal Reserve Hints at Rate Cut',
            source: 'Bloomberg',
            timestamp: '2d ago',
            image: images.courseimg,
        },
        {
            id: '6',
            category: 'Stock Market',
            title: 'Tech Stocks Lead Market Rally',
            source: 'Reuters',
            timestamp: '3d ago',
            image: images.courseimg,
        },
    ];

    const filteredNews = selectedFilter === 'All'
        ? newsData
        : newsData.filter(item => item.category === selectedFilter);

    const renderFilter = ({ item }) => (
        <TouchableOpacity
            className={`mr-2 px-5 py-3 rounded-full border  ${selectedFilter === item
                ? 'bg-purple-600'
                : 'bg-gray-900 border-white'
                }`}
            onPress={() => setSelectedFilter(item)}
        >
            <Text className="text-white text-sm">{item}</Text>
        </TouchableOpacity>
    );

    const renderNewsCard = ({ item }) => (
        <LinearGradient
            colors={['#222', '#AEAED4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 2, y: 0 }}
            style={styles.gradientBoxBorder}
        >
            <View style={styles.newsbox} className="flex-row bg-black">
                <Image
                    source={item.image}
                    className="w-20 h-12 rounded mr-3"
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <Text className="text-white text-sm font-bold mb-1">{item.title}</Text>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-xs">{item.source}</Text>
                        <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page={'news'} />

            <View className="mb-4">
                <Text className="text-white text-2xl font-bold">Market News</Text>
            </View>
            <View>
                <FlatList
                    data={filters}
                    renderItem={renderFilter}
                    keyExtractor={(item) => item}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                />
            </View>
            <View className="flex-1">
                <FlatList
                    data={filteredNews}
                    renderItem={renderNewsCard}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    );
};

export default NewsListing;

const styles = StyleSheet.create({ 
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    gradientBoxBorder: {
        borderRadius: 10,
        padding: 1,
        marginHorizontal: 0,
        marginBottom: 15,
    },
    newsbox: {
        padding: 10,
        borderRadius: 10,

    }
})