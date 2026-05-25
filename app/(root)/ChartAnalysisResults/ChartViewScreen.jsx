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
    const rawAnalysisData = params.analysisData ? JSON.parse(params.analysisData) : null;

    // Normalize: handle both API response (flat) and DB document (nested) structures
    const analysisData = useMemo(() => {
        if (!rawAnalysisData) return null;
        // DB document structure: { _id, userId, analysisData: { request, overallAnalysis, ... } }
        // API response structure: { success, request, overallAnalysis, ... }
        if (rawAnalysisData.analysisData && typeof rawAnalysisData.analysisData === 'object') {
            return rawAnalysisData.analysisData;
        }
        // Raw API response: wrap it so downstream code always accesses via .analysisData
        return rawAnalysisData;
    }, [rawAnalysisData]);

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

        const overallAnalysis = analysisData.overallAnalysis || [];
        const chartAnnotations = analysisData.chartAnnotations || [];

        // Find pair-specific analysis
        const pairAnalysis = overallAnalysis.find(a => a.pair === pair.pair);
        const pairAnnotations = chartAnnotations.find(a => a.pair === pair.pair);

        console.log('🔍 MERGING DATA:', {
            hasPairAnalysis: !!pairAnalysis,
            hasPairAnnotations: !!pairAnnotations,
            pairAnalysisKeys: pairAnalysis ? Object.keys(pairAnalysis) : [],
            annotationKeys: pairAnnotations ? Object.keys(pairAnnotations) : []
        });

        // Log SMC-specific data if available
        if (pairAnnotations) {
            console.log('📊 SMC Data from Annotations:', {
                orderBlocks: pairAnnotations.orderBlocks?.length || 0,
                fairValueGaps: pairAnnotations.fairValueGaps?.length || 0,
                liquidityLevels: pairAnnotations.liquidityLevels?.length || 0,
                breakOfStructure: pairAnnotations.breakOfStructure?.length || 0,
                changeOfCharacter: pairAnnotations.changeOfCharacter?.length || 0,
            });
        }

        // For SMC, prioritize annotation data which contains all the SMC-specific fields
        const isSMC = analysisData?.request?.analysisStyle === 'Smart Money Concept (SMC)';

        if (isSMC && pairAnnotations) {
            return {
                pair: pair.pair,
                timeframe: analysisData?.request?.timeframe || '1h',
                analysisStyle: 'Smart Money Concept (SMC)',
                lastPrice: pairAnalysis?.lastPrice || pair.lastPrice,
                candles: pairAnalysis?.candles || [],
                trendAnalysis: pairAnalysis?.trendAnalysis || { direction: 'Neutral', strength: 'Low' },

                // SMC-specific fields from annotations
                orderBlocks: pairAnnotations.orderBlocks || [],
                fairValueGaps: pairAnnotations.fairValueGaps || [],
                liquidityLevels: pairAnnotations.liquidityLevels || [],
                breakOfStructure: pairAnnotations.breakOfStructure || [],
                changeOfCharacter: pairAnnotations.changeOfCharacter || [],
                swingPoints: pairAnnotations.swingPoints || [],
                premiumDiscountZones: pairAnnotations.premiumDiscountZones || pairAnalysis?.premiumDiscountZones || [],
                equalHighs: pairAnnotations.equalHighs || pairAnalysis?.equalHighs || [],
                equalLows: pairAnnotations.equalLows || pairAnalysis?.equalLows || [],
                marketStructure: pairAnalysis?.marketStructure || 'Unknown',

                // Also include patterns/keyLevels if they exist
                patterns: pairAnnotations.patterns || pairAnalysis?.patterns || [],
                keyLevels: pairAnnotations.keyLevels || pairAnalysis?.keyLevels || [],
            };
        }

        // Build comprehensive chart data covering all 7 analysis styles
        const a = pairAnnotations;
        const p = pairAnalysis;

        // Utility: get value from annotations first, fallback to analysis, then default
        const f = (field, def = []) => a?.[field] ?? p?.[field] ?? def;
        const fv = (field, def) => a?.[field] !== undefined ? a[field] : (p?.[field] !== undefined ? p[field] : def);

        return {
            pair: pair.pair,
            timeframe: analysisData?.request?.timeframe || '1h',
            analysisStyle: analysisData?.request?.analysisStyle || 'Price Action',
            lastPrice: p?.lastPrice || pair.lastPrice,
            candles: p?.candles || [],

            // === Common across all styles ===
            trendAnalysis: p?.trendAnalysis || { direction: 'Neutral', strength: 'Low' },
            patterns: f('patterns'),
            keyLevels: f('keyLevels'),
            swingPoints: f('swingPoints'),
            breakouts: f('breakouts'),
            marketStructure: p?.marketStructure || 'Unknown',

            // === Price Action / Classic TA ===
            trendlines: f('trendlines'),
            supportResistance: f('supportResistance', {}),

            // === SMC ===
            orderBlocks: f('orderBlocks'),
            fairValueGaps: f('fairValueGaps'),
            liquidityLevels: f('liquidityLevels'),
            breakOfStructure: f('breakOfStructure'),
            changeOfCharacter: f('changeOfCharacter'),
            equalHighs: f('equalHighs'),
            equalLows: f('equalLows'),

            // === ICT ===
            pdArrays: f('pdArrays'),
            sessionRanges: f('sessionRanges'),
            liquidityPools: f('liquidityPools'),
            killzones: f('killzones'),
            breakerBlocks: f('breakerBlocks'),
            marketStructureShifts: f('marketStructureShifts'),
            activeKillzones: f('activeKillzones'),
            currentKillzone: p?.currentKillzone || null,

            // === Order Flow ===
            volumeProfile: f('volumeProfile'),
            delta: f('delta'),
            deltaProfile: f('deltaProfile'),
            fibonacciProjections: f('fibonacciProjections'),
            deltaHistory: f('deltaHistory'),
            cumulativeDelta: fv('cumulativeDelta', 0),
            netDelta: fv('netDelta', 0),
            deltaPercent: fv('deltaPercent', 0),
            volumeConfirmation: fv('volumeConfirmation', null),
            bidAskImbalance: f('bidAskImbalance'),
            absorption: f('absorption'),
            imbalances: f('imbalances'),
            pocPrice: p?.pocPrice || null,
            pocVolume: p?.pocVolume || null,

            // === Supply & Demand ===
            supplyZones: f('supplyZones'),
            demandZones: f('demandZones'),
            freshZones: f('freshZones'),
            nearestSupply: a?.nearestSupply ?? p?.nearestSupply ?? null,
            nearestDemand: a?.nearestDemand ?? p?.nearestDemand ?? null,
            zoneRetests: f('zoneRetests'),
            zoneBreaks: f('zoneBreaks'),
            sdSummary: f('summary', {}),

            // === CRT ===
            htfCandles: f('htfCandles'),
            po3Patterns: f('po3Patterns'),
            runningDelta: fv('runningDelta', 0),

            // === Indicators / Misc ===
            indicators: f('indicators', {}),
            vwap: fv('vwap', null),
            ote: fv('ote', null),
        };
    }, [pair, analysisData]);

    useEffect(() => {
        if (chartData) {
            const requiredForRendering = ['candles'];
            const missing = requiredForRendering.filter(f => !chartData[f]?.length);

            if (missing.length) {
                console.warn('⚠️ Missing data for chart rendering:', missing);
            } else {
                console.log('✅ Chart has all required data');
            }
        }
    }, [chartData]);

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
    const levelInfo = chartData.keyLevels?.filter(l => l.isMajorLevel).slice(0, 2) || [];
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
                        {levelInfo.length > 0 && ` • H:${levelInfo.find(l => l.type === 'Resistance')?.price?.toFixed(4)} L:${levelInfo.find(l => l.type === 'Support')?.price?.toFixed(4)}`}
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
        paddingTop: Platform.OS === 'ios' ? 50 : 8,
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