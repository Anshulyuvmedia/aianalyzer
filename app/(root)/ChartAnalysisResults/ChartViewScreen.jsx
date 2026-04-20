// app/ChartAnalysisResults/ChartViewScreen.jsx
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, Platform, BackHandler } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { TradingViewChart } from '@/components/chartAnalysisComponents/TradingViewChart';

export default function ChartViewScreen() {
    const params = useLocalSearchParams();
    const pair = params.pair ? JSON.parse(params.pair) : null;
    const analysisData = params.analysisData ? JSON.parse(params.analysisData) : null;

    useEffect(() => {
        const lockToLandscape = async () => {
            if (Platform.OS !== 'web') {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            }
        };
        lockToLandscape();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });

        return () => {
            const restoreOrientation = async () => {
                if (Platform.OS !== 'web') {
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
                }
            };
            restoreOrientation();
            backHandler.remove();
        };
    }, []);

    const handleBack = async () => {
        if (Platform.OS !== 'web') {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        }
        router.back();
    };

    // Build complete chart data from the analysis
    const chartData = useMemo(() => {
        if (!pair || !analysisData) return null;

        const overallAnalysis = analysisData.analysisData?.overallAnalysis || [];
        const pairAnalysis = overallAnalysis.find(a => a.pair === pair.pair);
        const annotations = analysisData.analysisData?.chartAnnotations?.find(a => a.pair === pair.pair);

        // Debug: Log the actual structure of your data
        // console.log('🔍 Full pairAnalysis structure:', JSON.stringify(pairAnalysis, null, 2));
        // console.log('🔍 Full annotations structure:', JSON.stringify(annotations, null, 2));

        return {
            pair: pair.pair,
            timeframe: analysisData.analysisData?.request?.timeframe || '1h',
            analysisStyle: analysisData.analysisData?.request?.analysisStyle || 'Smart Money Concept (SMC)',
            lastPrice: pairAnalysis?.lastPrice || pair.lastPrice,
            candles: pairAnalysis?.candles || [],

            // Use nullish coalescing to ensure arrays exist
            patterns: pairAnalysis?.patterns ?? annotations?.patterns ?? [],
            keyLevels: pairAnalysis?.keyLevels ?? annotations?.levels ?? [],
            orderBlocks: pairAnalysis?.orderBlocks ?? annotations?.orderBlocks ?? [],
            fairValueGaps: pairAnalysis?.fairValueGaps ?? annotations?.fairValueGaps ?? [],
            pdArrays: pairAnalysis?.pdArrays ?? annotations?.pdArrays ?? [],
            sessionRanges: pairAnalysis?.sessionRanges ?? annotations?.sessionRanges ?? [],
            liquidityLevels: pairAnalysis?.liquidityLevels ?? annotations?.liquidityLevels ?? [],
            liquidityPools: pairAnalysis?.liquidityPools ?? annotations?.liquidityPools ?? [],
            supplyZones: pairAnalysis?.supplyZones ?? annotations?.supplyZones ?? [],
            demandZones: pairAnalysis?.demandZones ?? annotations?.demandZones ?? [],
            entry: annotations?.entry ?? pairAnalysis?.entry,
            stopLoss: annotations?.stopLoss ?? pairAnalysis?.stopLoss,
            takeProfit: annotations?.takeProfit ?? pairAnalysis?.takeProfit,
            breaks: pairAnalysis?.breaks ?? annotations?.breaks ?? [],
            rejections: pairAnalysis?.rejections ?? annotations?.rejections ?? [],
            indicators: pairAnalysis?.indicators ?? annotations?.indicators ?? {},
        };
    }, [pair, analysisData]);

    if (!chartData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No chart data available</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // FIXED: Log chartData instead of analysisData
    console.log('📊 Final chartData before passing to chart:', {
        hasPatterns: chartData?.patterns?.length,
        hasKeyLevels: chartData?.keyLevels?.length,
        hasOrderBlocks: chartData?.orderBlocks?.length,
        hasFairValueGaps: chartData?.fairValueGaps?.length,
        hasSupplyZones: chartData?.supplyZones?.length,
        hasDemandZones: chartData?.demandZones?.length,
        hasLiquidityLevels: chartData?.liquidityLevels?.length,
        hasPdArrays: chartData?.pdArrays?.length,
        hasSessions: chartData?.sessionRanges?.length,
        analysisStyle: chartData?.analysisStyle,
        hasEntry: !!chartData?.entry,
        hasStopLoss: !!chartData?.stopLoss,
        hasTakeProfit: !!chartData?.takeProfit,
    });

    // Log sample data if available
    if (chartData.pdArrays?.length > 0) {
        console.log('📊 Sample PD Array:', chartData.pdArrays[0]);
    }
    if (chartData.sessionRanges?.length > 0) {
        console.log('📊 Sample Session Range:', chartData.sessionRanges[0]);
    }
    if (chartData.patterns?.length > 0) {
        console.log('📊 Sample Pattern:', chartData.patterns[0]);
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{chartData.pair}</Text>
                    <Text style={styles.subtitle}>
                        {chartData.analysisStyle} • {chartData.timeframe}
                        {chartData.marketStructure && ` • ${chartData.marketStructure}`}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.chartContainer}>
                <TradingViewChart
                    symbol={chartData.pair}
                    analysisData={chartData}
                    isLandscape={true}
                    onLoadComplete={(stats) => {
                        console.log('✅ Chart loaded with stats:', stats);
                        // Verify data was passed correctly
                        if (stats.pdArrays === 0 && chartData.pdArrays?.length > 0) {
                            console.warn('⚠️ PD Arrays not rendering! Expected:', chartData.pdArrays.length);
                        }
                        if (stats.sessions === 0 && chartData.sessionRanges?.length > 0) {
                            console.warn('⚠️ Session Ranges not rendering! Expected:', chartData.sessionRanges.length);
                        }
                    }}
                    onError={(err) => console.error('Chart error:', err)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    errorText: { color: '#ef4444', fontSize: 16, marginBottom: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 12 : 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    closeButton: { padding: 8, zIndex: 1 },
    headerInfo: { flex: 1, alignItems: 'center' },
    title: { color: '#fff', fontSize: 18, fontWeight: '600' },
    subtitle: { color: '#6b7280', fontSize: 11, marginTop: 2 },
    chartContainer: { flex: 1, backgroundColor: '#131722' },
    backButton: { padding: 8, backgroundColor: '#151515', borderRadius: 10 },
    backButtonText: { color: '#60a5fa', fontSize: 14, fontWeight: '500' },
});