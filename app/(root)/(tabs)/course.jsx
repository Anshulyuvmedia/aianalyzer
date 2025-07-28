// app/(root)/course.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import images from '@/constants/images';
import HomeHeader from '@/components/HomeHeader';
import ReanimatedCarousel from 'react-native-reanimated-carousel';

// Dummy data for courses
const COURSES = [
    {
        id: '1',
        title: 'Introduction to Stock Trading',
        category: 'Course',
        tag: 'Beginner',
        thumbnail: images.courseimg,
    },
    {
        id: '2',
        title: 'Live Market Analysis',
        category: 'Live Session',
        tag: 'Advanced',
        thumbnail: images.courseimg,
    },
    {
        id: '3',
        title: 'Crypto Investing 101',
        category: 'Stock',
        tag: 'Crypto',
        thumbnail: images.courseimg,
    },
    {
        id: '4',
        title: 'Technical Analysis Basics',
        category: 'Course',
        tag: 'Beginner',
        thumbnail: images.courseimg,
    },
    {
        id: '5',
        title: 'Live Q&A with Experts',
        category: 'Live Session',
        tag: 'Advanced',
        thumbnail: images.courseimg,
    },
];

// Dummy data for banner carousel
const BANNERS = [
    { id: '1', image: images.courseimg },
    { id: '2', image: images.courseimg },
    { id: '3', image: images.courseimg },
];

// Filter options
const FILTERS = ['All', 'Course', 'Live Session', 'Stock'];

const Course = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
    const screenWidth = Dimensions.get('window').width;

    // Filter courses based on selected filter
    const filteredCourses = selectedFilter === 'All'
        ? COURSES
        : COURSES.filter(course => course.category === selectedFilter);

    const renderBannerItem = ({ item }) => (
        <View style={styles.bannerContainer}>
            <Image
                source={item.image}
                style={styles.bannerImage}
                resizeMode="cover"
            />
        </View>
    );

    const renderFilterItem = ({ item }) => (
        <LinearGradient
            colors={['#723CDF', '#9E68E4', '#723CDF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFilter}
        >
            <TouchableOpacity
                onPress={() => setSelectedFilter(item)}
                style={[styles.filterItem, selectedFilter === item && styles.activeFilter]}
            >
                <Text
                    className={`font-questrial text-base ${selectedFilter === item ? 'text-white' : 'text-white'}`}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );

    const renderCourseCard = ({ item }) => (
        <LinearGradient
            colors={['#AEAED4', '#000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={styles.cardGradientBorder}
        >
            <TouchableOpacity
                style={styles.courseCard}
                onPress={() => router.push(`../coursescreen/${item.id}`)}
            >
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={item.thumbnail}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                    <View style={styles.playButton}>
                        <FontAwesome name="play" size={20} color="#FFF" />
                    </View>
                    <View style={[styles.tagContainer, { backgroundColor: '#733DDF' }]}>
                        <Text className="text-white font-questrial text-xs">{item.tag}</Text>
                    </View>
                </View>
                <View style={styles.courseInfo}>
                    <Text className="text-white font-questrial text-sm flex-1 mr-2" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-[#AEAED4] font-questrial text-xs">{item.category}</Text>
                </View>
            </TouchableOpacity>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            {/* Fixed Header, Carousel, and Filters */}
            <View style={styles.fixedContainer}>
                <View style={styles.header}>
                    <HomeHeader page="course" />
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white font-sora-bold text-xl">Courses</Text>
                        <Feather name="bell" size={24} color="#fff" />
                    </View>
                </View>

                <ReanimatedCarousel
                    width={screenWidth - 20}
                    height={200}
                    data={BANNERS}
                    renderItem={renderBannerItem}
                    autoPlay
                    autoPlayInterval={3000}
                    loop
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                        parallaxAdjacentItemScale: 0.75,
                    }}
                    style={styles.carousel}
                />

                <FlatList
                    data={FILTERS}
                    renderItem={renderFilterItem}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Scrollable Course Cards */}
            <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.courseList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default Course;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
        paddingBottom: 0,
    },
    carousel: {
        borderRadius: 10,
        marginBottom: 10,
    },
    bannerContainer: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    gradientFilter: {
        borderRadius: 100,
        padding: 1,
        marginRight: 10,
    },
    filterList: {
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    filterItem: {
        alignItems: 'center',
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#000',
    },
    activeFilter: {
        backgroundColor: '#723CDF',
    },
    cardGradientBorder: {
        borderRadius: 10,
        padding: 1,
        width: (Dimensions.get('window').width - 40) / 2,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    courseList: {
        paddingHorizontal: 5,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    courseCard: {
        borderRadius: 10,
        backgroundColor: '#000',
        overflow: 'hidden',

    },
    thumbnailContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -16 }, { translateY: -16 }],
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        padding: 8,
        paddingBottom: 10,
    },
    tagContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 10,
    },
});