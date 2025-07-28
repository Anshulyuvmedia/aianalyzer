import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import React from 'react';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const trades = [
    {
        type: 'BUY',
        color: ['#0c151c', '#0a3e31'],
        border: ['#05FF93', '#0C0C1800', '#3C3B4066'],
        boxborder: ['#016137', '#04744400', '#04744466'],
        tagBg: '#1de9b6',
        tagText: '#000',
        label: 'TCS',
        labelBg: '#1de9b6',
        labelText: '#000',
        time: '2 min ago',
        timeframe: '4H',
        price: '175.25',
        confidence: '87%',
        target: '182.5',
        stoploss: '168.75',
        analysis: 'Strong bullish divergence detected with RSI oversold bounce. Volume surge confirms institutional buying.',
        analysisColor: '#05FF93',
        btnBg: '#0fef8e',
        btnText: '#000',
        detailsBg: '#222',
        detailsText: '#fff',
        textColor: '#05FF93',
    },
    {
        type: 'SELL',
        color: ['#1a0c17', '#400a14'],
        border: ['#FF0505', '#0C0C1800', '#3C3B4066'],
        boxborder: ['#620101', '#62010100', '#62010166'],
        tagBg: '#FF0505',
        tagText: '#fff',
        label: 'TCS',
        labelBg: '#ff8a80',
        labelText: '#000',
        time: '2 min ago',
        timeframe: '4H',
        price: '175.25',
        confidence: '87%',
        target: '182.5',
        stoploss: '168.75',
        analysis: 'Strong bullish divergence detected with RSI oversold bounce. Volume surge confirms institutional buying.',
        analysisColor: '#FF0505',
        btnBg: '#ff2d2d',
        btnText: '#fff',
        detailsBg: '#222',
        detailsText: '#fff',
        textColor: '#FF0505',
    },
];

const TradeCard = ({
    type, color, border, boxborder, tagBg, tagText, label, labelBg, labelText, time, timeframe, price, confidence, target, stoploss, analysis, analysisColor, btnBg, btnText, detailsBg, detailsText, textColor,
}) => (
    <LinearGradient colors={border} style={styles.cardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
    >
        <LinearGradient colors={color} style={styles.cardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.labelContainer}>
                    <View style={[styles.label, { backgroundColor: labelBg }]}>
                        <Text style={[styles.labelText, { color: labelText }]}>{label}</Text>
                    </View>
                    <View>
                        <View style={styles.headerTags}>
                            <View style={[styles.tag, { backgroundColor: tagBg, borderColor: tagBg }]}>
                                <Text style={[styles.tagText, { color: tagText }]}>{type}</Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: '#222', borderColor: textColor }]}>
                                <Text style={[styles.tagText, { color: '#fff' }]}>{timeframe}</Text>
                            </View>
                        </View>
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                </View>
                <View style={styles.priceBlock}>
                    <Text style={[styles.price, { color: textColor }]}>₹ {price}</Text>
                    <Text style={styles.entryLabel}>Entry Price</Text>
                </View>
            </View>

            <LinearGradient colors={boxborder} style={styles.boxBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
            >
                <View style={styles.analysisBox}>
                    <Text style={[styles.analysisTitle, { color: analysisColor }]}>AI Analysis</Text>
                    <Text style={styles.analysisText}>{analysis}</Text>
                </View>
            </LinearGradient>

            <View style={styles.cardStats}>
                <LinearGradient colors={boxborder} style={styles.boxBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{confidence}</Text>
                        <Text style={styles.statLabel}>Confidence</Text>
                    </View>
                </LinearGradient>
                <LinearGradient colors={boxborder} style={styles.boxBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#1de9b6' }]}>₹ {target}</Text>
                        <Text style={styles.statLabel}>Target</Text>
                    </View>
                </LinearGradient>
                <LinearGradient colors={boxborder} style={styles.boxBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#ff8a80' }]}>₹ {stoploss}</Text>
                        <Text style={styles.statLabel}>Stop Loss</Text>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.executeBtn, { backgroundColor: btnBg, borderColor: textColor }]}>
                    <Text style={[styles.executeBtnText, { color: btnText }]}>Execute Trade</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.detailsBtn, { backgroundColor: detailsBg, borderColor: textColor }]}>
                    <Text style={[styles.detailsBtnText, { color: detailsText }]}>Details</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    </LinearGradient>
);

const AIGeneratedTrade = () => {
    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'AI Trades'} />
            <View style={styles.headerRow}>
                <View style={styles.headerTitle}>
                    <MaterialCommunityIcons name="robot" size={width * 0.06} color="#05FF93" />
                    <Text style={styles.headerText}>AI Generated Trades</Text>
                </View>
                <View style={styles.headerTags}>
                    <View style={styles.liveTag}>
                        <Text style={styles.liveTagText}>Live</Text>
                    </View>
                    <View style={styles.dailyTag}>
                        <Text style={styles.dailyTagText}>Daily</Text>
                    </View>
                </View>
            </View>
            <FlatList
                data={trades}
                renderItem={({ item }) => <TradeCard {...item} />}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default AIGeneratedTrade;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: width * 0.03,
        paddingTop: height * 0.015,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.015,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    headerText: {
        color: '#fff',
        fontFamily: 'Sora-Bold',
        fontSize: width * 0.05,
        fontWeight: 'bold',
    },
    headerTags: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    liveTag: {
        backgroundColor: '#05FF93',
        borderRadius: 12,
        paddingHorizontal: width * 0.035,
        paddingVertical: height * 0.005,
    },
    liveTagText: {
        color: '#000',
        fontSize: width * 0.035,
        fontWeight: '600',
    },
    dailyTag: {
        borderColor: '#0057FF',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: width * 0.035,
        paddingVertical: height * 0.005,
    },
    dailyTagText: {
        color: '#7CA9FF',
        fontSize: width * 0.035,
        fontWeight: '600',
    },
    flatListContent: {
        paddingBottom: height * 0.03,
    },
    cardBorder: {
        borderRadius: 18,
        padding: 1,
        marginVertical: height * 0.015,
    },
    cardBg: {
        borderRadius: 16,
        padding: width * 0.04,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: height * 0.015,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    label: {
        borderRadius: 8,
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.015,
    },
    labelText: {
        fontWeight: '600',
        fontSize: width * 0.035,
    },
    tag: {
        borderRadius: 8,
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.005,
        borderWidth: 1,
    },
    tagText: {
        fontWeight: '600',
        fontSize: width * 0.03,
    },
    timeText: {
        color: '#fff',
        fontSize: width * 0.03,
        marginTop: height * 0.005,
    },
    priceBlock: {
        alignItems: 'flex-end',
    },
    price: {
        fontWeight: '700',
        fontSize: width * 0.05,
        marginBottom: height * 0.005,
    },
    entryLabel: {
        color: '#fff',
        fontSize: width * 0.03,
    },
    boxBorder: {
        borderRadius: 12,
        padding: 1,
        marginBottom: height * 0.015,
    },
    analysisBox: {
        backgroundColor: '#181c1e',
        borderRadius: 12,
        padding: width * 0.03,
    },
    analysisTitle: {
        fontWeight: '400',
        fontSize: width * 0.035,
        marginBottom: height * 0.005,
    },
    analysisText: {
        color: '#fff',
        fontSize: width * 0.03,
        lineHeight: width * 0.045,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: width * 0.02,
        flexWrap: 'nowrap', // Ensure stats stay in one line
    },
    statBox: {
        flex: 1,
        backgroundColor: '#181c1e',
        paddingHorizontal: width * 0.03, // Reduced padding for tighter fit
        paddingVertical: height * 0.01,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: width * 0.22, // Slightly reduced minWidth to fit all stats
    },
    statValue: {
        fontWeight: '700',
        fontSize: width * 0.04, // Slightly reduced font size
        marginBottom: height * 0.005,
        color: 'white',
    },
    statLabel: {
        color: '#aaa',
        fontSize: width * 0.028, // Slightly reduced font size
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: width * 0.02,
    },
    executeBtn: {
        flex: 1.2,
        borderRadius: 10,
        paddingVertical: height * 0.015,
        alignItems: 'center',
        borderWidth: 1,
    },
    executeBtnText: {
        fontWeight: '600',
        fontSize: width * 0.04,
    },
    detailsBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: height * 0.015,
        alignItems: 'center',
        borderWidth: 1,
    },
    detailsBtnText: {
        fontWeight: '600',
        fontSize: width * 0.04,
    },
});