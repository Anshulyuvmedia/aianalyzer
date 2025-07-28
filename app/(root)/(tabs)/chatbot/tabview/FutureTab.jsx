// app/(root)/chatbotscreens/tabview/FutureTab.jsx
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import LineChartComponent from '@/components/charts/LineChartComponent';

const GradientCard = ({ children, style }) => (
    <LinearGradient
        colors={['#AEAED4', '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={[styles.gradientBoxBorder, style]}
    >
        <View style={[styles.card, { backgroundColor: '#000' }]}>{children}</View>
    </LinearGradient>
);

const StockCard = ({ title, pattern, isBullish, formedOn, breakoutPrice, returnPercent }) => (
    <GradientCard style={styles.indexBox}>
        <View className="flex-row items-center mb-1">
            <Text className="text-white font-questrial">
                {pattern} | <Text className={isBullish ? 'text-[#05FF93]' : 'text-[#FF0505]'}>
                    {isBullish ? 'Bullish Pattern' : 'Bearish Pattern'}
                </Text>
            </Text>
            <Feather
                name={isBullish ? 'arrow-up-right' : 'arrow-down-right'}
                size={16}
                color={isBullish ? '#05FF93' : '#FF0505'}
                style={{ marginLeft: 6 }}
            />
        </View>
        <Text className="text-white font-sora-bold text-xl mb-3">{title}</Text>
        <View className="flex-row justify-between mt-3">
            <View>
                <Text className="text-[#B0B0B0] font-questrial text-xs">Formed on</Text>
                <Text className="text-white font-sora text-base">{formedOn}</Text>
            </View>
            <View>
                <Text className="text-[#B0B0B0] font-questrial text-xs">Breakout Price</Text>
                <Text className="text-white font-sora text-base">{breakoutPrice}</Text>
            </View>
            <View>
                <Text className="text-[#B0B0B0] font-questrial text-xs">Return %</Text>
                <View className="flex-row items-center mt-0.5">
                    <Feather
                        name={isBullish ? 'arrow-up-right' : 'arrow-down-right'}
                        size={16}
                        color={isBullish ? '#05FF93' : '#FF0505'}
                    />
                    <Text className={isBullish ? 'text-[#05FF93] font-sora text-base ml-1' : 'text-[#FF0505] font-sora text-base ml-1'}>
                        {returnPercent}
                    </Text>
                </View>
            </View>
        </View>
    </GradientCard>
);

const AnalysisSection = ({ isBullish, description, performanceText, closedText }) => (
    <View className="px-5 mb-3">
        <View className="flex-row items-start mb-4">
            <Feather
                name={isBullish ? 'arrow-up-right' : 'arrow-down-right'}
                size={30}
                color={isBullish ? '#05FF93' : '#FF0505'}
                style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text className="text-[#83838D] font-questrial text-sm flex-1">{description}</Text>
        </View>
        <TouchableOpacity className="py-3">
            <View className="flex-row items-center">
                <Text className="text-[#568BFF] font-questrial text-sm mr-1.5">View Past Performance</Text>
                <Feather name="arrow-right" size={18} color="#568BFF" />
            </View>
        </TouchableOpacity>
        <LinearGradient
            colors={isBullish ? ['#05FF93', '#000'] : ['#FF0505', '#000']}
            start={{ x: 2, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
        >
            <View className="bg-black rounded-full px-4 py-2 flex-row justify-between items-center">
                <Text className={isBullish ? 'text-[#05FF93] font-questrial flex-1' : 'text-[#FF0505] font-questrial flex-1'}>
                    {performanceText}
                </Text>
                <Text className="text-[#B0B0B0] font-questrial text-sm">{closedText}</Text>
            </View>
        </LinearGradient>
    </View>
);

const FutureTab = () => {
    const data = [
        {
            id: '1',
            type: 'stockCard',
            title: 'Magna Electrocastings Ltd.',
            pattern: 'Ascending Triangle',
            isBullish: true,
            formedOn: '05 Nov 9:30 AM',
            breakoutPrice: '₹ 42.00',
            returnPercent: '10%',
        },
        {
            id: '2',
            type: 'chart',
            chartData: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                values: [45000, 45200, 45300, 45500, 45700, 45900, 46000],
            },
            title: 'Bank Nifty Trend',
        },
        {
            id: '3',
            type: 'analysis',
            isBullish: true,
            description:
                'Ascending Triangle Pattern - Stock prices rise 60.40% of the time with an average return of 3.60% within 10 days post-Breakout.',
            performanceText: 'Stock price went up by 1.1% within 4 days of breakout',
            closedText: 'Closed 14 hours ago',
        },
        {
            id: '4',
            type: 'stockCard',
            title: 'Magna Electrocastings Ltd.',
            pattern: 'Ascending Triangle',
            isBullish: false,
            formedOn: '05 Nov 9:30 AM',
            breakoutPrice: '₹ 42.00',
            returnPercent: '10%',
        },
        {
            id: '5',
            type: 'chart',
            chartData: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                values: [46000, 45900, 45700, 45500, 45300, 45200, 45000],
            },
            title: 'Bank Nifty Trend',
        },
        {
            id: '6',
            type: 'analysis',
            isBullish: false,
            description:
                'Ascending Triangle Pattern - Stock prices rise 60.40% of the time with an average return of 3.60% within 10 days post-Breakout.',
            performanceText: 'Stock price went up by 1.1% within 4 days of breakout',
            closedText: 'Closed 14 hours ago',
        },
        {
            id: '7',
            type: 'chart',
            chartData: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                values: [45000, 45200, 44800, 45500, 45300, 45700, 44900],
            },
            title: 'Bank Nifty Trend',
        },
    ];

    const renderItem = ({ item }) => {
        switch (item.type) {
            case 'stockCard':
                return (
                    <StockCard
                        title={item.title}
                        pattern={item.pattern}
                        isBullish={item.isBullish}
                        formedOn={item.formedOn}
                        breakoutPrice={item.breakoutPrice}
                        returnPercent={item.returnPercent}
                    />
                );
            case 'chart':
                return (
                    <View className="mt-3 items-center">
                        <LineChartComponent data={item.chartData} title={item.title} />
                    </View>
                );
            case 'analysis':
                return (
                    <AnalysisSection
                        isBullish={item.isBullish}
                        description={item.description}
                        performanceText={item.performanceText}
                        closedText={item.closedText}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View className="flex-1 bg-black">
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default FutureTab;

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
    scrollContent: {
        padding: 10,
        paddingBottom: 24,
    },
});