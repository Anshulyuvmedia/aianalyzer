import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather, Octicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { ProgressCircle } from 'react-native-svg-charts'; // Assuming a library for the circular progress

const AiTrading = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBoxBorder}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradient}
                >
                    {/* Header Section */}
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.headerLeft}>
                                <MaterialCommunityIcons name="brain" size={24} color="#34C759" />
                                <View style={styles.headerText}>
                                    <Text style={styles.cardChange}>AI Trading</Text>
                                    <Text style={styles.subText}>Automated decision-making powered by AI models</Text>
                                </View>
                            </View>
                            <View style={styles.headerRight}>
                                <View style={styles.activeBadge}>
                                    <Feather name="check-circle" size={18} color="#22c55e" />
                                    <Text style={styles.activeText}>Active</Text>
                                    <Octicons name="dot-fill" size={18} color="#22c55e" />
                                </View>
                            </View>
                        </View>

                        {/* Strategy Information */}
                        <View style={styles.infoSection}>
                            <View style={styles.headerLeft}>
                                <MaterialCommunityIcons name="robot-excited-outline" size={24} color="#5897e5" />
                                <Text style={styles.sectionTitle}>Strategy Information</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Model Name:</Text>
                                <Text style={styles.infoValue}>AI Scalper X1</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Timeframe:</Text>
                                <Text style={styles.infoValue}>5min</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Market:</Text>
                                <Text style={styles.infoValue}>BTCUSD</Text>
                            </View>
                        </View>

                        {/* Performance Snapshot and AI Sentiment */}
                        <View style={styles.performanceSection}>
                            <View style={styles.performanceLeft}>
                                <View style={styles.header}>
                                    <FontAwesome name="line-chart" size={20} color="#22c55e" />
                                    <Text style={styles.sectionTitle}>Performance Snapshot</Text>
                                </View>

                                <View style={[styles.performanceItem, styles.performanceGreenItem]}>
                                    <Text style={[styles.performanceValue, styles.greenValue]}>72%</Text>
                                    <Text style={styles.performanceLabel}>Win Rate</Text>
                                </View>
                                <View style={[styles.performanceItem, styles.performanceBlueItem]}>
                                    <Text style={[styles.performanceValue, styles.blueValue]}>+18.4%</Text>
                                    <Text style={styles.performanceLabel}>ROI</Text>
                                </View>
                                <View style={[styles.performanceItem, styles.performancePurpleItem]}>
                                    <Text style={[styles.performanceValue, styles.purpleValue]}>132</Text>
                                    <Text style={styles.performanceLabel}>Trades Executed</Text>
                                </View>
                            </View>

                            <View style={styles.sentimentSection}>
                                <View style={styles.progressContainer}>
                                    <Text style={[styles.sectionTitle, styles.sentimentTitle]}>AI Sentiment</Text>
                                    <Text style={styles.sentimentText}>BULLISH</Text>
                                    <ProgressCircle
                                        style={styles.progressCircle}
                                        progress={0.85}
                                        progressColor="#22c55e"
                                        backgroundColor="#2d3748"
                                        strokeWidth={10}
                                    // startAngle={-Math.PI * 0.8}
                                    // endAngle={Math.PI * 0.8}
                                    >
                                        <Text style={styles.progressText}>85%</Text>
                                        <Text style={styles.progressLabel}>Confidence</Text>
                                    </ProgressCircle>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.detailsButton}>
                                <Octicons name="book" size={18} color="#FFFFFF" />
                                <Text style={styles.buttonText}>View Strategy Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.activeBotButton}>
                                <MaterialCommunityIcons name="rocket" size={18} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Active AI Bot</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 10,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    cardContent: {},
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%',
    },
    headerText: {
        marginLeft: 8,
    },
    headerRight: {
        alignItems: 'flex-end',
        // width: '25%',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#22c55e',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    activeText: {
        color: '#22c55e',
        marginHorizontal: 5,
        fontSize: 12,
    },
    cardChange: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    subText: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 5,
        width: '60%',
    },
    infoSection: {
        marginBottom: 15,
        padding: 10,
        border: 1,
        borderColor: '#1e2836',
        backgroundColor: '#1e2836',
        borderRadius: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 10,
        marginStart: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    infoLabel: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    infoValue: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    performanceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    performanceLeft: {
        width: '50%',
    },
    performanceItem: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    performanceGreenItem: {
        backgroundColor: '#14532d33',
        borderColor: '#14532d',
    },
    performanceBlueItem: {
        backgroundColor: '#1e40af1a',
        borderColor: '#0033d7',
    },
    performancePurpleItem: {
        backgroundColor: '#6b21a81a',
        borderColor: '#6b21a8',
    },
    performanceValue: {
        fontSize: 20,
        fontWeight: '600',
    },
    greenValue: {
        color: '#4ade80',
    },
    blueValue: {
        color: '#5c9eef',
    },
    purpleValue: {
        color: '#c084fc',
    },
    performanceLabel: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    sentimentSection: {
        width: '40%',
        alignItems: 'center',
    },
    sentimentTitle: {
        alignSelf: 'center',
    },
    sentimentText: {
        color: '#22c55e',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    progressContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 'auto',
    },
    progressCircle: {
        height: 100,
        width: 100,
    },
    progressText: {
        color: '#22c55e',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        position: 'absolute',
        top: 50,
        left: 5,
        right: 0,
    },
    progressLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        textAlign: 'center',
        position: 'absolute',
        top: 35,
        left: 0,
        right: 0,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailsButton: {
        flex: 1,
        backgroundColor: '#2461ea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10,
        marginRight: 5,
    },
    activeBotButton: {
        flex: 1,
        backgroundColor: '#169e48',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 5,
    },
});

export default AiTrading;