// components/chartAnalysisComponents/TradingViewChart.jsx (FIXED)

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';

export const TradingViewChart = React.memo(function TradingViewChart({ symbol = 'EURUSD', analysisData, onLoadComplete, onError, isLandscape = false }) {
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const chartReadyRef = useRef(false);
    const messageTimeoutRef = useRef(null);
    const [htmlKey, setHtmlKey] = useState(0);
    const prevAnalysisRef = useRef(null);

    useEffect(() => {
        const d = analysisData || {};
        const a = (arr) => arr?.length || 0;
        const currentKey = `${d?.analysisStyle}_${a(d?.candles)}_${a(d?.orderBlocks)}_${a(d?.pdArrays)}_${a(d?.patterns)}_${a(d?.keyLevels)}_${a(d?.fairValueGaps)}_${a(d?.supplyZones)}_${a(d?.demandZones)}_${a(d?.premiumDiscountZones)}_${a(d?.killzones)}_${a(d?.breakerBlocks)}_${a(d?.absorption)}_${a(d?.fibonacciProjections)}_${a(d?.htfCandles)}_${a(d?.po3Patterns)}_${a(d?.breakouts)}_${a(d?.equalHighs)}_${d?.vwap ? 1 : 0}`;
        if (prevAnalysisRef.current !== currentKey) {
            prevAnalysisRef.current = currentKey;
            setHtmlKey(prev => prev + 1);
        }
    }, [analysisData]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.log('⚠️ Loading timeout - forcing chart visibility');
                setIsLoading(false);
                chartReadyRef.current = true;
            }
        }, 12000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, []);

    const getPricePrecision = useCallback((sym) => {
        const crypto = ['BTCUSD', 'ETHUSD', 'SOLUSD'];
        if (crypto.includes(sym)) return 2;
        const jpy = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'NZDJPY', 'CADJPY'];
        if (jpy.some(j => sym.includes(j))) return 3;
        const indices = ['US30', 'NAS100', 'SPX500', 'UK100', 'GER30'];
        if (indices.some(i => sym.includes(i))) return 2;
        if (sym === 'XAUUSD') return 2;
        if (sym === 'XAGUSD') return 3;
        return 5;
    }, []);

    // Downsample function
    const downsampleCandles = useCallback((candles, maxCandles = 300) => {
        if (!candles || candles.length <= maxCandles) return candles;

        const step = Math.ceil(candles.length / maxCandles);
        const downsampled = [];

        for (let i = 0; i < candles.length; i += step) {
            const chunk = candles.slice(i, Math.min(i + step, candles.length));
            if (chunk.length === 0) continue;

            if (i === 0 || i + step >= candles.length) {
                downsampled.push(chunk[chunk.length - 1]);
            } else {
                const maxVolumeCandle = chunk.reduce((max, c) =>
                    (c.volume || 0) > (max.volume || 0) ? c : max, chunk[0]);
                downsampled.push(maxVolumeCandle);
            }
        }

        console.log(`📉 Downsampled candles: ${candles.length} → ${downsampled.length}`);
        return downsampled;
    }, []);

    // Optimized candles - computed once
    const optimizedCandles = useMemo(() => {
        const maxCandles = isLandscape ? 300 : 200;
        return downsampleCandles(analysisData?.candles, maxCandles);
    }, [analysisData?.candles, isLandscape, downsampleCandles]);

    const getHTML = useCallback(() => {
        // Validate required data
        if (!optimizedCandles?.length) {
            console.error('❌ No candle data available for chart');
            return getErrorHTML('No candle data available');
        }

        const usesPatterns = ['Price Action', 'Classic TA'].some(s => (analysisData?.analysisStyle || '').includes(s));
        if (usesPatterns && !analysisData?.patterns?.length) {
            console.warn('⚠️ No pattern data available for', analysisData?.analysisStyle);
        }

        // Use optimized candles
        const candles = optimizedCandles.map(c => ({
            time: typeof c.time === 'string' ? new Date(c.time).getTime() / 1000 : c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume || c.tickVolume || Math.random() * 1000,
        }));

        console.log('📊 Building chart with:', {
            candles: candles.length,
            patterns: analysisData.patterns?.length || 0,
            keyLevels: analysisData.keyLevels?.length || 0,
            swingPoints: analysisData.swingPoints?.length || 0
        });

        const analysisStyle = analysisData?.analysisStyle || 'Price Action';
        const precision = getPricePrecision(symbol);
        const currentPrice = analysisData?.lastPrice || candles[candles.length - 1]?.close;

        const patterns = analysisData?.patterns || [];
        const keyLevels = analysisData?.keyLevels || [];
        const orderBlocks = analysisData?.orderBlocks || [];
        const fairValueGaps = analysisData?.fairValueGaps || [];
        const supplyZones = analysisData?.supplyZones || [];
        const demandZones = analysisData?.demandZones || [];
        const liquidityLevels = analysisData?.liquidityLevels || [];
        const liquidityPools = analysisData?.liquidityPools || [];
        const pdArrays = analysisData?.pdArrays || [];
        const sessionRanges = analysisData?.sessionRanges || [];
        const breakOfStructure = analysisData?.breakOfStructure || [];
        const changeOfCharacter = analysisData?.changeOfCharacter || [];
        const swingPoints = analysisData?.swingPoints || [];
        const vwap = analysisData?.vwap;
        const ote = analysisData?.ote;
        const rawPDZ = analysisData?.premiumDiscountZones;
        const premiumDiscountZones = Array.isArray(rawPDZ) ? rawPDZ : (rawPDZ ? [rawPDZ] : []);
        const rawVP = analysisData?.volumeProfile;
        const volumeProfile = Array.isArray(rawVP) ? rawVP : (rawVP ? [rawVP] : []);
        const pocPrice = analysisData?.pocPrice;
        const pocVolume = analysisData?.pocVolume;
        const rawTL = analysisData?.trendlines;
        const trendlines = Array.isArray(rawTL) ? rawTL : (rawTL ? [rawTL] : []);
        const rawBreaks = analysisData?.breakOfStructure || analysisData?.breaks;
        const breaks = Array.isArray(rawBreaks) ? rawBreaks : (rawBreaks ? [rawBreaks] : []);
        const killzones = analysisData?.killzones || [];
        const breakerBlocks = analysisData?.breakerBlocks || [];
        const absorption = analysisData?.absorption || [];
        const imbalances = analysisData?.imbalances || [];
        const fibonacciProjections = Array.isArray(analysisData?.fibonacciProjections) ? analysisData.fibonacciProjections : [];
        const htfCandles = analysisData?.htfCandles || [];
        const po3Patterns = analysisData?.po3Patterns || [];
        const deltaProfile = analysisData?.deltaProfile || [];
        const equalHighs = analysisData?.equalHighs || [];
        const equalLows = analysisData?.equalLows || [];
        const breakouts = analysisData?.breakouts || [];

        const tradingSetup = {
            entry: analysisData?.entry || analysisData?.recommendation?.entry,
            stopLoss: analysisData?.stopLoss || analysisData?.recommendation?.stopLoss,
            takeProfit: analysisData?.takeProfit || analysisData?.recommendation?.takeProfit,
        };

        const recentHighs = candles.slice(-20).map(c => c.high);
        const recentLows = candles.slice(-20).map(c => c.low);
        const actualHighest = Math.max(...recentHighs);
        const actualLowest = Math.min(...recentLows);

        console.log(`📊 [${analysisStyle}] Chart Data Summary:`, {
            candles: candles.length,
            patterns: patterns.length,
            keyLevels: keyLevels.length,
            orderBlocks: orderBlocks.length,
            fvgs: fairValueGaps.length,
            supplyZones: supplyZones.length,
            demandZones: demandZones.length,
            pdArrays: pdArrays.length,
            liquidityLevels: liquidityLevels.length,
            liquidityPools: liquidityPools.length,
            premiumDiscountZones: premiumDiscountZones.length,
            killzones: killzones.length,
            breakerBlocks: breakerBlocks.length,
            absorption: absorption.length,
            imbalances: imbalances.length,
            fibProjections: fibonacciProjections.length,
            htfCandles: htfCandles.length,
            po3Patterns: po3Patterns.length,
            breakouts: breakouts.length,
            equalHighsLows: equalHighs.length + equalLows.length,
            vwap: vwap ? 1 : 0,
            ote: ote ? 1 : 0,
        });

        return `<!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { margin: 0; padding: 0; background: #131722; overflow: hidden; }
                        #chart { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
                        .tooltip {
                            position: absolute;
                            background: rgba(0, 0, 0, 0.9);
                            border-radius: 6px;
                            padding: 6px 12px;
                            font-size: 11px;
                            color: #d1d4dc;
                            pointer-events: none;
                            z-index: 1000;
                            font-family: monospace;
                            border: 1px solid rgba(255,255,255,0.1);
                            white-space: nowrap;
                        }
                    </style>
                </head>
                <body>
                    <div id="chart"></div>
                    <div id="tooltip" class="tooltip" style="display: none;"></div>
                    
                    <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
                    
                    <script>
                        (function() {
                            const candlesData = ${JSON.stringify(candles)};
                            const analysisStyle = "${analysisStyle}";
                            const precision = ${precision};
                            const currentPrice = ${currentPrice || 'null'};
                            const patternsData = ${JSON.stringify(patterns)};
                            const keyLevelsData = ${JSON.stringify(keyLevels)};
                            const orderBlocksData = ${JSON.stringify(orderBlocks)};
                            const fairValueGapsData = ${JSON.stringify(fairValueGaps)};
                            const supplyZonesData = ${JSON.stringify(supplyZones)};
                            const demandZonesData = ${JSON.stringify(demandZones)};
                            const liquidityLevelsData = ${JSON.stringify(liquidityLevels)};
                            const liquidityPoolsData = ${JSON.stringify(liquidityPools)};
                            const pdArraysData = ${JSON.stringify(pdArrays)};
                            const sessionRangesData = ${JSON.stringify(sessionRanges)};
                            const breakOfStructureData = ${JSON.stringify(breakOfStructure)};
                            const changeOfCharacterData = ${JSON.stringify(changeOfCharacter)};
                            const swingPointsData = ${JSON.stringify(swingPoints)};
                            const vwapData = ${JSON.stringify(vwap)};
                            const oteData = ${JSON.stringify(ote)};
                            const tradingSetupData = ${JSON.stringify(tradingSetup)};
                            const marketStructureShiftsData = ${JSON.stringify(changeOfCharacter)};
                            const premiumDiscountZonesData = ${JSON.stringify(premiumDiscountZones)};
                            const volumeProfileData = ${JSON.stringify(volumeProfile)};
                            const pocPriceData = ${pocPrice || 'null'};
                            const pocVolumeData = ${pocVolume || 'null'};
                            const killzonesData = ${JSON.stringify(killzones)};
                            const breakerBlocksData = ${JSON.stringify(breakerBlocks)};
                            const absorptionData = ${JSON.stringify(absorption)};
                            const imbalancesData = ${JSON.stringify(imbalances)};
                            const fibonacciProjectionsData = ${JSON.stringify(fibonacciProjections)};
                            const htfCandlesData = ${JSON.stringify(htfCandles)};
                            const po3PatternsData = ${JSON.stringify(po3Patterns)};
                            const deltaProfileData = ${JSON.stringify(deltaProfile)};
                            const equalHighsData = ${JSON.stringify(equalHighs)};
                            const equalLowsData = ${JSON.stringify(equalLows)};
                            const breakoutsData = ${JSON.stringify(breakouts)};
                            const trendlinesData = ${JSON.stringify(trendlines)};
                            const breaksData = ${JSON.stringify(breaks)};
                            
                            // === COMPUTED FIB DATA FROM PROJECTION ===
                            function computeFibData(projData) {
                                if (!projData || projData.length === 0) return null;
                                const fp = projData[0];
                                if (!fp || !fp.currentPrice) return null;
                                const t1 = fp.targets && fp.targets.target100;
                                if (!t1) return null;
                                const isBullish = t1 > fp.currentPrice;
                                const swingRange = isBullish ? (t1 - fp.currentPrice) : (fp.currentPrice - t1);
                                if (swingRange <= 0) return null;
                                const fibLevels = [0.000, 0.236, 0.382, 0.500, 0.618, 0.786, 1.000];
                                const fibPrices = fibLevels.map(r =>
                                    isBullish
                                        ? (fp.currentPrice + swingRange * 0.618) - swingRange * r
                                        : (fp.currentPrice - swingRange * 0.618) + swingRange * r
                                );
                                return {
                                    isBullish,
                                    swingRange,
                                    swingHigh: isBullish ? fp.currentPrice + swingRange * 0.618 : fp.currentPrice + swingRange * 0.382,
                                    swingLow: isBullish ? fp.currentPrice - swingRange * 0.382 : fp.currentPrice - swingRange * 0.618,
                                    fibLevels,
                                    fibPrices,
                                    cPrice: fp.currentPrice,
                                    target100: t1,
                                    target1272: fp.targets.target1272 || null,
                                    target1618: fp.targets.target1618 || null,
                                };
                            }
                            const fibData = computeFibData(fibonacciProjectionsData);
                            
                            let chart = null;
                            let candleSeries = null;
                            let swingProjectionSeries = null;
                            let deltaHistogramSeries = null;
                            let isInitialized = false;
                            let lastPrice = null;
                            let drawnMarkers = [];
                            let addedPrices = new Set();

                            console.log('=== WEBVIEW SCRIPT STARTED ===');
                            console.log('LightweightCharts loaded?', typeof LightweightCharts !== 'undefined');

                            // Check if library loaded, if not, wait for it
                            function waitForLibrary() {
                                if (typeof LightweightCharts === 'undefined') {
                                    console.log('Waiting for LightweightCharts...');
                                    setTimeout(waitForLibrary, 100);
                                    return;
                                }
                                console.log('LightweightCharts loaded successfully!');
                                initChart();
                            }

                            // Start the process
                            if (typeof LightweightCharts !== 'undefined') {
                                initChart();
                            } else {
                                console.log('Library not loaded yet, waiting...');
                                setTimeout(waitForLibrary, 100);
                            }
                            
                            function addHorizontalLine(price, color, lineWidth, lineStyle, title, axisLabelVisible) {
                                if (!candleSeries || !price || isNaN(price)) return;
                                const key = Math.round(price * 10000) + '_' + color;
                                if (addedPrices.has(key)) return;
                                addedPrices.add(key);
                                try {
                                    candleSeries.createPriceLine({
                                        price: price,
                                        color: color,
                                        lineWidth: lineWidth || 1,
                                        lineStyle: lineStyle || 0,
                                        axisLabelVisible: axisLabelVisible || false,
                                        title: title || '',
                                    });
                                } catch(e) { console.log('Error adding line:', e); }
                            }
                            
                            function addMarker(time, price, text, color, shape, position) {
                                if (!candleSeries || !time || isNaN(time) || !price) return;
                                drawnMarkers.push({
                                    time: time,
                                    position: position || 'belowBar',
                                    color: color,
                                    shape: shape || 'circle',
                                    text: text,
                                });
                            }
                            
                            function applyMarkers() {
                                if (candleSeries && drawnMarkers.length > 0 && typeof candleSeries.setMarkers === 'function') {
                                    candleSeries.setMarkers(drawnMarkers);
                                    console.log('✅ Applied', drawnMarkers.length, 'markers');
                                }
                            }
                            
                            // ========== PRICE ACTION STYLE ==========
                            function addPatternMarkers() {
                                patternsData.forEach((pattern) => {
                                    let timestamp = pattern.time;
                                    if (typeof timestamp === 'string') timestamp = new Date(timestamp).getTime() / 1000;
                                    if (!timestamp || isNaN(timestamp)) return;
                                    
                                    const isBullish = pattern.direction === 'Bullish';
                                    let shape = 'circle';
                                    let text = '';
                                    
                                    if (pattern.type === 'Pin Bar') {
                                        shape = isBullish ? 'arrowUp' : 'arrowDown';
                                        text = 'PB';
                                    } else if (pattern.type === 'Engulfing') {
                                        shape = 'circle';
                                        text = 'ENG';
                                    } else {
                                        text = pattern.type?.substring(0, 2) || '●';
                                    }
                                    
                                    addMarker(timestamp, pattern.price, text, isBullish ? '#22c55e' : '#ef4444', shape, 
                                            isBullish ? 'belowBar' : 'aboveBar');
                                });
                            }
                            
                            function addKeyLevels() {
                                const sortedLevels = [...keyLevelsData]
                                    .sort((a, b) => b.price - a.price)
                                    .slice(0, 12);
                                
                                sortedLevels.forEach(level => {
                                    let color, width, lineStyle;
                                    
                                    switch(level.strength) {
                                        case 'Very Strong':
                                            color = level.type === 'Resistance' ? '#ff4444' : '#44ff44';
                                            width = 2;
                                            lineStyle = 0;
                                            break;
                                        case 'Strong':
                                            color = level.type === 'Resistance' ? '#ef4444' : '#22c55e';
                                            width = 2;
                                            lineStyle = 0;
                                            break;
                                        case 'Medium':
                                            color = level.type === 'Resistance' ? '#f97316' : '#eab308';
                                            width = 1;
                                            lineStyle = 1;
                                            break;
                                        default:
                                            color = level.type === 'Resistance' ? '#6b7280' : '#6b7280';
                                            width = 1;
                                            lineStyle = 2;
                                            break;
                                    }
                                    
                                    let title = level.subtype || level.type;
                                    if (level.strength !== 'Very Strong' && level.strength !== 'Strong') {
                                        title += ' (' + level.strength + ')';
                                    }
                                    
                                    addHorizontalLine(level.price, color, width, lineStyle, title, level.strength === 'Very Strong');
                                });
                            }
                            
                            // ========== SMART MONEY CONCEPT (SMC) STYLE ==========
                            function addOrderBlocks() {
                            console.log('🔴🔴🔴 ORDER BLOCKS FUNCTION CALLED 🔴🔴🔴');
                                if (!orderBlocksData || orderBlocksData.length === 0) return;
                                console.log('📊 Adding order blocks:', orderBlocksData.length);
                                
                                orderBlocksData.forEach(ob => {
                                    if (ob.mitigated) return;
                                    
                                    const color = ob.type === 'Bullish' ? '#22c55e' : '#ef4444';
                                    
                                    // Add horizontal lines at OB levels
                                    addHorizontalLine(ob.barHigh, color, 1, 1, ob.type + ' OB High', false);
                                    addHorizontalLine(ob.barLow, color, 1, 1, ob.type + ' OB Low', false);
                                    
                                    // Add marker at OB time
                                    let timestamp = typeof ob.startTime === 'string' ? new Date(ob.startTime).getTime() / 1000 : ob.startTime;
                                    if (timestamp && !isNaN(timestamp)) {
                                        addMarker(timestamp, ob.barHigh, 'OB', color, 'circle', 'aboveBar');
                                    }
                                });
                            }
                            
                            function addFairValueGaps() {
                                if (!fairValueGapsData || fairValueGapsData.length === 0) return;
                                console.log('📊 Adding FVGs:', fairValueGapsData.length);
                                
                                fairValueGapsData.forEach(fvg => {
                                    if (fvg.isMitigated) return;
                                    
                                    const color = fvg.type === 'Bullish' ? '#22c55e' : '#ef4444';
                                    
                                    // Add FVG boundaries as horizontal lines
                                    addHorizontalLine(fvg.upper, color, 1, 1, 'FVG Upper', false);
                                    addHorizontalLine(fvg.lower, color, 1, 1, 'FVG Lower', false);
                                    
                                    // Add marker at start time
                                    let timestamp = typeof fvg.startTime === 'string' ? new Date(fvg.startTime).getTime() / 1000 : fvg.startTime;
                                    if (timestamp && !isNaN(timestamp)) {
                                        addMarker(timestamp, fvg.upper, 'FVG', color, 'square', 'aboveBar');
                                    }
                                });
                            }
                            
                            function addLiquidityLevels() {
                                if (!liquidityLevelsData || liquidityLevelsData.length === 0) return;
                                console.log('📊 Adding liquidity levels:', liquidityLevelsData.length);
                                
                                liquidityLevelsData.forEach(level => {
                                    const color = level.type === 'Resistance Liquidity' ? '#ef4444' : '#22c55e';
                                    const title = level.subtype || (level.type === 'Resistance Liquidity' ? 'Liq High' : 'Liq Low');
                                    addHorizontalLine(level.price, color, 1, 1, title, false);
                                });
                            }
                            
                            function addBreaksAndShifts() {
                                if (breakOfStructureData && breakOfStructureData.length > 0) {
                                    breakOfStructureData.forEach(bos => {
                                        let timestamp = bos.time;
                                        if (typeof timestamp === 'string') timestamp = new Date(timestamp).getTime() / 1000;
                                        if (!timestamp || isNaN(timestamp)) return;
                                        const isBullish = bos.type.includes('Bullish');
                                        addMarker(timestamp, bos.price, 'BOS', isBullish ? '#22c55e' : '#ef4444', 
                                                isBullish ? 'arrowUp' : 'arrowDown', isBullish ? 'belowBar' : 'aboveBar');
                                    });
                                }
                                
                                if (changeOfCharacterData && changeOfCharacterData.length > 0) {
                                    changeOfCharacterData.forEach(choch => {
                                        let timestamp = choch.time;
                                        if (typeof timestamp === 'string') timestamp = new Date(timestamp).getTime() / 1000;
                                        if (!timestamp || isNaN(timestamp)) return;
                                        const isBullish = choch.type.includes('Bullish');
                                        addMarker(timestamp, choch.price, 'CHoCH', isBullish ? '#22c55e' : '#ef4444',
                                                'circle', isBullish ? 'belowBar' : 'aboveBar');
                                    });
                                }
                            }
                            
                            function addPremiumDiscountZones() {
                                if (!premiumDiscountZonesData || premiumDiscountZonesData.length === 0) return;
                                const zones = premiumDiscountZonesData[premiumDiscountZonesData.length - 1];
                                if (!zones) return;
                                
                                if (zones.premium && zones.premium.price) {
                                    addHorizontalLine(zones.premium.price, '#ef4444', 1, 1, 'Premium Zone', true);
                                }
                                if (zones.discount && zones.discount.price) {
                                    addHorizontalLine(zones.discount.price, '#22c55e', 1, 1, 'Discount Zone', true);
                                }
                                if (zones.equilibrium && zones.equilibrium.price) {
                                    addHorizontalLine(zones.equilibrium.price, '#6b7280', 1, 2, 'Equilibrium', false);
                                }
                            }
                            
                            // ========== ICT STYLE ==========
                            function addPDArrays() {
                                if (!pdArraysData || pdArraysData.length === 0) return;
                                console.log('📊 Adding PD Arrays:', pdArraysData.length);
                                
                                pdArraysData.forEach(pd => {
                                    const color = pd.level === 'Premium' ? '#ef4444' : pd.level === 'Discount' ? '#22c55e' : '#6b7280';
                                    const title = pd.type + (pd.description ? ' - ' + pd.description : '');
                                    const lineStyle = pd.level === 'Premium' ? 1 : (pd.level === 'Discount' ? 1 : 2);
                                    addHorizontalLine(pd.price, color, 1, lineStyle, title, true);
                                });
                            }
                            
                            function addKillzones() {
                                if (!sessionRangesData || sessionRangesData.length === 0) return;
                                console.log('📊 Adding Killzones:', sessionRangesData.length);
                                
                                // Just add high/low lines for killzones
                                sessionRangesData.forEach(kz => {
                                    const color = kz.color || (kz.name === 'Asian' ? '#e91e63' : kz.name === 'London' ? '#00bcd4' : '#ff5d00');
                                    addHorizontalLine(kz.high, color, 1, 1, kz.name + ' High', false);
                                    addHorizontalLine(kz.low, color, 1, 1, kz.name + ' Low', false);
                                });
                            }
                            
                            function addMarketStructureShifts() {
                                const shiftsData = changeOfCharacterData && changeOfCharacterData.length > 0 ? changeOfCharacterData : marketStructureShiftsData;
                                if (!shiftsData || shiftsData.length === 0) return;
                                console.log('📊 Adding Market Structure Shifts:', shiftsData.length);
                                
                                shiftsData.forEach(shift => {
                                    let timestamp = shift.time;
                                    if (typeof timestamp === 'string') timestamp = new Date(timestamp).getTime() / 1000;
                                    if (!timestamp || isNaN(timestamp)) return;
                                    const isBullish = shift.type && shift.type.includes('Bullish');
                                    addMarker(timestamp, shift.price, 'CHoCH', isBullish ? '#22c55e' : '#ef4444',
                                            'circle', isBullish ? 'belowBar' : 'aboveBar');
                                });
                            }
                            
                            function addOTE() {
                                if (!oteData) return;
                                if (oteData.high) addHorizontalLine(oteData.high, '#f97316', 1, 1, 'OTE High', false);
                                if (oteData.low) addHorizontalLine(oteData.low, '#f97316', 1, 1, 'OTE Low', false);
                            }
                            
                            function addLiquidityPools() {
                                if (!liquidityPoolsData || liquidityPoolsData.length === 0) return;
                                liquidityPoolsData.forEach(pool => {
                                    const color = pool.type === 'Liquidity High' ? '#ef4444' : '#22c55e';
                                    addHorizontalLine(pool.price, color, 1, 1, pool.type, false);
                                });
                            }
                            
                            // ========== SUPPLY & DEMAND STYLE ==========
                            function addSupplyDemandZones() {
                                if (supplyZonesData && supplyZonesData.length > 0) {
                                    supplyZonesData.forEach(zone => {
                                        if (zone.isValid) {
                                            addHorizontalLine(zone.top, '#ef4444', 1, 1, 'Supply Zone Top', false);
                                            addHorizontalLine(zone.bottom, '#ef4444', 1, 1, 'Supply Zone Bottom', false);
                                        }
                                    });
                                }
                                if (demandZonesData && demandZonesData.length > 0) {
                                    demandZonesData.forEach(zone => {
                                        if (zone.isValid) {
                                            addHorizontalLine(zone.top, '#22c55e', 1, 1, 'Demand Zone Top', false);
                                            addHorizontalLine(zone.bottom, '#22c55e', 1, 1, 'Demand Zone Bottom', false);
                                        }
                                    });
                                }
                            }
                            
                            // ========== CLASSIC TA STYLE ==========
                            function addTrendlines() {
                                if (trendlinesData && trendlinesData.length > 0) {
                                    trendlinesData.forEach(tl => {
                                        if (tl.lineValue && tl.type) {
                                            const color = tl.type === 'upper' ? '#ef4444' : '#22c55e';
                                            addHorizontalLine(tl.lineValue, color, 1, 2, tl.type + ' Trend', false);
                                        }
                                        if (tl.pivotPrice && tl.pivotTime) {
                                            let ts = typeof tl.pivotTime === 'string' ? new Date(tl.pivotTime).getTime() / 1000 : tl.pivotTime;
                                            if (ts && !isNaN(ts)) {
                                                addMarker(ts, tl.pivotPrice, 'PVT', '#f59e0b', 'diamond', 'aboveBar');
                                            }
                                        }
                                    });
                                }
                            }
                            
                            // ========== ORDER FLOW STYLE ==========
                            function addVolumeDeltaHistogram() {
                                let histData = [];
                                if (deltaProfileData && deltaProfileData.length > 0) {
                                    deltaProfileData.forEach(d => {
                                        const v = d.value !== undefined ? d.value : ((d.buy || 0) - (d.sell || 0));
                                        if (d.time && !isNaN(v)) {
                                            histData.push({ time: d.time, value: Math.abs(v), color: v >= 0 ? '#22c55e' : '#ef4444' });
                                        }
                                    });
                                } else if (candlesData && candlesData.length > 0) {
                                    const chunk = 5;
                                    for (let i = 0; i < candlesData.length; i += chunk) {
                                        let buyV = 0, sellV = 0;
                                        for (let j = i; j < Math.min(i + chunk, candlesData.length); j++) {
                                            const c = candlesData[j];
                                            if (c.close >= c.open) buyV += (c.volume || 0); else sellV += (c.volume || 0);
                                        }
                                        const delta = buyV - sellV;
                                        histData.push({ time: candlesData[Math.min(i + Math.floor(chunk/2), candlesData.length-1)].time, value: Math.abs(delta), color: delta >= 0 ? '#22c55e' : '#ef4444' });
                                    }
                                }
                                if (histData.length === 0) return;
                                try {
                                    deltaHistogramSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
                                        priceFormat: { type: 'volume' },
                                        priceScaleId: 'delta',
                                        color: '#22c55e',
                                    });
                                    chart.priceScale('delta').applyOptions({
                                        scaleMargins: { top: 0.82, bottom: 0 },
                                        visible: true,
                                        borderVisible: false,
                                    });
                                    deltaHistogramSeries.setData(histData);
                                    console.log('✅ Delta histogram:', histData.length, 'bars');
                                } catch(e) { console.log('Delta hist error:', e); }
                            }

                            function addPOCLine() {
                                if (pocPriceData === null || pocPriceData === undefined) return;
                                addHorizontalLine(pocPriceData, '#eab308', 2, 2, 'POC', true);
                            }
                            function addVWAPLine() {
                                if (!vwapData) return;
                                const vwapPrice = vwapData.value || vwapData.price || vwapData;
                                if (vwapPrice) addHorizontalLine(vwapPrice, '#8b5cf6', 1, 1, 'VWAP', true);
                            }
                            
                            // ========== CRT STYLE ==========
                            function addCRTElements() {
                                if (breaksData && breaksData.length > 0) {
                                    breaksData.forEach(brk => {
                                        let timestamp = brk.time;
                                        if (typeof timestamp === 'string') timestamp = new Date(timestamp).getTime() / 1000;
                                        if (timestamp && !isNaN(timestamp)) {
                                            const breakPrice = brk.level || brk.price;
                                            if (breakPrice) {
                                                addMarker(timestamp, breakPrice, 'Break', '#f59e0b', 'square', 'aboveBar');
                                            }
                                        }
                                    });
                                }
                            }
                            
                            // ========== ICT KILLZONES ==========
                            function addKillzoneData() {
                                if (killzonesData && killzonesData.length > 0) {
                                    killzonesData.forEach(kz => {
                                        if (kz.high && kz.low) {
                                            addHorizontalLine(kz.high, kz.color || '#e91e63', 1, 2, kz.name + ' High', false);
                                            addHorizontalLine(kz.low, kz.color || '#e91e63', 1, 2, kz.name + ' Low', false);
                                            const mid = (kz.high + kz.low) / 2;
                                            addHorizontalLine(mid, kz.color || '#e91e63', 1, 2, kz.name + ' Mid', false);
                                        }
                                    });
                                }
                            }

                            // ========== ICT BREAKER BLOCKS ==========
                            function addBreakerBlocks() {
                                if (breakerBlocksData && breakerBlocksData.length > 0) {
                                    breakerBlocksData.forEach(bb => {
                                        const color = bb.type && bb.type.includes('Bullish') ? '#22c55e' : '#ef4444';
                                        addHorizontalLine(bb.barHigh, color, 1, 1, 'Breaker High', false);
                                        addHorizontalLine(bb.barLow, color, 1, 1, 'Breaker Low', false);
                                        if (bb.time) {
                                            let ts = typeof bb.time === 'string' ? new Date(bb.time).getTime() / 1000 : bb.time;
                                            if (ts && !isNaN(ts)) addMarker(ts, bb.barHigh, 'BB', color, 'square', 'aboveBar');
                                        }
                                    });
                                }
                            }

                            // ========== SMC EQUAL HIGHS / LOWS ==========
                            function addEqualLevels() {
                                (equalHighsData || []).forEach(eh => {
                                    if (eh.price) addHorizontalLine(eh.price, '#f97316', 1, 1, 'EQH', false);
                                });
                                (equalLowsData || []).forEach(el => {
                                    if (el.price) addHorizontalLine(el.price, '#f97316', 1, 1, 'EQL', false);
                                });
                            }

                            // ========== ORDER FLOW EXTRA ==========
                            function addSwingRangeLines() {
                                if (!fibData) return;
                                const sc = fibData.isBullish ? '#22c55e' : '#ef4444';
                                addHorizontalLine(fibData.swingHigh, sc, 1, 2, 'Swing H', false);
                                addHorizontalLine(fibData.swingLow, sc, 1, 2, 'Swing L', false);
                            }

                            function addFibRetracementLines() {
                                if (!fibData) return;
                                const fibTexts = ['0.000', '0.236', '0.382', '0.500', '0.618', '0.786', '1.000'];
                                fibData.fibLevels.forEach((level, i) => {
                                    const isKey = Math.abs(level - 0.618) < 0.001 || level === 0 || level === 1;
                                    addHorizontalLine(fibData.fibPrices[i], isKey ? '#94a3b8' : '#475569', 1, isKey ? 2 : 1, fibTexts[i], isKey);
                                });
                            }

                            function addForwardProjection() {
                                if (!fibData || !candlesData || candlesData.length < 3) return;
                                const lastCandle = candlesData[candlesData.length - 1];
                                const lastTime = lastCandle.time;
                                const projColor = fibData.isBullish ? '#22c55e' : '#ef4444';
                                const n = Math.min(10, candlesData.length - 1);
                                let total = 0;
                                for (let i = candlesData.length - n; i < candlesData.length; i++) {
                                    total += candlesData[i].time - candlesData[i-1].time;
                                }
                                const avgStep = total / n;
                                const step = Math.max(avgStep * 12, 3600);

                                const pts = [{ time: lastTime, price: lastCandle.close }];
                                pts.push({ time: Math.round(lastTime + avgStep * 2), price: fibData.cPrice });
                                if (fibData.target100) pts.push({ time: Math.round(lastTime + avgStep * 2 + step), price: fibData.target100 });
                                if (fibData.target1272) pts.push({ time: Math.round(lastTime + avgStep * 2 + step * 2), price: fibData.target1272 });
                                if (fibData.target1618) pts.push({ time: Math.round(lastTime + avgStep * 2 + step * 3), price: fibData.target1618 });

                                try {
                                    swingProjectionSeries = chart.addSeries(LightweightCharts.LineSeries, {
                                        color: projColor,
                                        lineWidth: 2,
                                        lineStyle: 0,
                                        crosshairMarkerVisible: false,
                                        priceLineVisible: false,
                                        lastValueVisible: false,
                                    });
                                    swingProjectionSeries.setData(pts);
                                    console.log('✅ Projection zigzag:', pts.length, 'points');
                                } catch(e) { console.log('Proj line error:', e); }
                            }

                            function addTargetZones() {
                                if (!fibData) return;
                                const projColor = fibData.isBullish ? '#22c55e' : '#ef4444';
                                const zoneHalf = Math.max(fibData.swingRange * 0.015, 0.0001);
                                const targets = [
                                    { price: fibData.target100, label: '100%' },
                                    { price: fibData.target1272, label: '127.2%' },
                                    { price: fibData.target1618, label: '161.8%' },
                                ];
                                targets.forEach(t => {
                                    if (t.price) {
                                        addHorizontalLine(t.price + zoneHalf, projColor, 1, 2, t.label + ' +', false);
                                        addHorizontalLine(t.price - zoneHalf, projColor, 1, 2, t.label + ' -', false);
                                    }
                                });
                            }

                            function addAbsorptionImbalanceMarkers() {
                                (absorptionData || []).forEach(a => {
                                    if (a.time && a.price) {
                                        let ts = typeof a.time === 'string' ? new Date(a.time).getTime() / 1000 : a.time;
                                        if (ts && !isNaN(ts)) addMarker(ts, a.price, 'ABS', '#f59e0b', 'circle', 'aboveBar');
                                    }
                                });
                                (imbalancesData || []).forEach(im => {
                                    if (im.time && im.price) {
                                        let ts = typeof im.time === 'string' ? new Date(im.time).getTime() / 1000 : im.time;
                                        if (ts && !isNaN(ts)) {
                                            const isBull = im.type && im.type.includes('Bullish');
                                            addMarker(ts, im.price, 'IMB', isBull ? '#22c55e' : '#ef4444', 'arrowUp', isBull ? 'belowBar' : 'aboveBar');
                                        }
                                    }
                                });
                            }

                            // ========== CRT ==========
                            function addCRTData() {
                                // HTF Candle highs/lows
                                (htfCandlesData || []).forEach(hc => {
                                    if (hc.high && hc.low) {
                                        addHorizontalLine(hc.high, '#a855f7', 1, 2, 'HTF High', false);
                                        addHorizontalLine(hc.low, '#a855f7', 1, 2, 'HTF Low', false);
                                    }
                                });
                                // PO3 pattern markers
                                (po3PatternsData || []).forEach(po3 => {
                                    if (po3.breakout && po3.endTime) {
                                        let ts = typeof po3.endTime === 'string' ? new Date(po3.endTime).getTime() / 1000 : po3.endTime;
                                        if (ts && !isNaN(ts)) {
                                            const isBull = po3.type && po3.type.includes('Bullish');
                                            addMarker(ts, po3.breakout, 'PO3', isBull ? '#22c55e' : '#ef4444', 'square', isBull ? 'belowBar' : 'aboveBar');
                                        }
                                    }
                                });
                            }

                            // ========== BREAKOUT MARKERS ==========
                            function addBreakoutMarkers() {
                                (breakoutsData || []).forEach(bo => {
                                    if (bo.time && bo.price) {
                                        let ts = typeof bo.time === 'string' ? new Date(bo.time).getTime() / 1000 : bo.time;
                                        if (ts && !isNaN(ts)) {
                                            const isBull = bo.direction === 'Bullish';
                                            addMarker(ts, bo.price, 'BO', isBull ? '#22c55e' : '#ef4444', 'arrowUp', isBull ? 'belowBar' : 'aboveBar');
                                        }
                                    }
                                });
                            }

                            // ========== COMMON ELEMENTS ==========
                            function addTradingSetup() {
                                if (tradingSetupData.entry) addHorizontalLine(tradingSetupData.entry, '#3b82f6', 2, 1, 'Entry', true);
                                if (tradingSetupData.stopLoss) addHorizontalLine(tradingSetupData.stopLoss, '#ef4444', 1, 1, 'Stop Loss', true);
                                if (tradingSetupData.takeProfit) addHorizontalLine(tradingSetupData.takeProfit, '#22c55e', 1, 1, 'Take Profit', true);
                            }
                            
                            function setupTooltip() {
                                const tooltipDiv = document.getElementById('tooltip');
                                if (!tooltipDiv) return;
                                chart.subscribeCrosshairMove((param) => {
                                    if (!param || !param.seriesPrices || param.seriesPrices.size === 0) {
                                        tooltipDiv.style.display = 'none';
                                        return;
                                    }
                                    const price = param.seriesPrices.get(candleSeries);
                                    if (price !== undefined && price !== lastPrice) {
                                        tooltipDiv.style.display = 'block';
                                        tooltipDiv.innerHTML = '<span style="color:#60a5fa">Price:</span> ' + price.toFixed(precision);
                                        if (param.point) {
                                            tooltipDiv.style.left = (param.point.x + 15) + 'px';
                                            tooltipDiv.style.top = (param.point.y - 35) + 'px';
                                        }
                                        lastPrice = price;
                                    }
                                });
                            }

                            console.log('🚀 SCRIPT STARTED');
                            console.log('analysisStyle:', analysisStyle);
                            console.log('orderBlocksData length:', orderBlocksData?.length);
                            console.log('pdArraysData length:', pdArraysData?.length);
                            
                            // ========== INIT CHART ==========
                            function initChart() {
                                console.log('📊 initChart() called');
                                if (isInitialized) {
                                    sendReadyMessage();
                                    return;
                                }
                                
                                if (typeof LightweightCharts === 'undefined') {
                                    setTimeout(initChart, 100);
                                    return;
                                }
                                
                                const container = document.getElementById('chart');
                                if (!container) return;
                                
                                chart = LightweightCharts.createChart(container, {
                                    width: window.innerWidth,
                                    height: window.innerHeight,
                                    layout: { background: { color: '#131722' }, textColor: '#d1d4dc', fontSize: 11 },
                                    grid: { vertLines: { visible: false }, horzLines: { color: '#2B2B43' } },
                                    timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2B2B43' },
                                    rightPriceScale: { borderColor: '#2B2B43', scaleMargins: { top: 0.08, bottom: 0.08 } },
                                    crosshair: { mode: 0, vertLine: { color: '#758696', width: 1, style: 3 }, horzLine: { color: '#758696', width: 1, style: 3 } },
                                });
                                
                                candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
                                    upColor: '#26a69a', downColor: '#ef5350',
                                    borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
                                    priceFormat: { type: 'price', precision: precision, minMove: 1 / Math.pow(10, precision) },
                                });
                                candleSeries.setData(candlesData);
                                
                                // ===== ORDER FLOW / VOLUME DELTA enhancements =====
                                addVolumeDeltaHistogram();
                                addSwingRangeLines();
                                addFibRetracementLines();
                                addForwardProjection();
                                addTargetZones();
                                addPOCLine();
                                addVWAPLine();
                                addAbsorptionImbalanceMarkers();

                                // Call all remaining rendering functions (data will be empty if not present)
                                addPatternMarkers();
                                addKeyLevels();
                                addOrderBlocks();
                                addFairValueGaps();
                                addLiquidityLevels();
                                addBreaksAndShifts();
                                addPremiumDiscountZones();
                                addKillzones();
                                addPDArrays();
                                addMarketStructureShifts();
                                addOTE();
                                addLiquidityPools();
                                addSupplyDemandZones();
                                addKillzoneData();
                                addBreakerBlocks();
                                addEqualLevels();
                                addCRTData();
                                addBreakoutMarkers();
                                addTrendlines();
                                addCRTElements();
                                addTradingSetup();
                                applyMarkers();
                                
                                if (currentPrice) {
                                    addHorizontalLine(currentPrice, '#3b82f6', 1, 1, 'Current', true);
                                }
                                
                                setupTooltip();
                                chart.timeScale().fitContent();
                                window.chart = chart;
                                isInitialized = true;
                                sendReadyMessage();
                            }
                            
                            function sendReadyMessage() {
                                if (window.ReactNativeWebView && !window.messageSent) {
                                    window.messageSent = true;
                                    const stats = {
                                        patterns: patternsData.length,
                                        levels: keyLevelsData.length,
                                        markers: drawnMarkers.length,
                                        orderBlocks: orderBlocksData.length,
                                        fibProjections: fibonacciProjectionsData.length,
                                        hasDeltaHist: deltaHistogramSeries ? 1 : 0,
                                        hasProjection: swingProjectionSeries ? 1 : 0,
                                        pdArrays: pdArraysData.length,
                                        fvgs: fairValueGapsData.length,
                                        killzones: killzonesData.length,
                                        breakerBlocks: breakerBlocksData.length,
                                        breakouts: breakoutsData.length,
                                        htfCandles: htfCandlesData.length,
                                    };
                                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', stats: stats }));
                                }
                            }
                            
                            let resizeTimeout;
                            window.addEventListener('resize', () => {
                                if (resizeTimeout) clearTimeout(resizeTimeout);
                                resizeTimeout = setTimeout(() => {
                                    if (window.chart && isInitialized) {
                                        window.chart.resize(window.innerWidth, window.innerHeight);
                                        window.chart.timeScale().fitContent();
                                    }
                                }, 100);
                            });
                            
                            initChart();
                        })();
                    </script>
                </body>
                </html>`;
    }, [optimizedCandles, analysisData, symbol, getPricePrecision]);

    // Memoize HTML string to prevent WebView reloading identical content
    const htmlString = useMemo(() => getHTML(), [getHTML]);

    const handleMessage = useCallback((event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ready') {
                if (!chartReadyRef.current) {
                    chartReadyRef.current = true;
                    setIsLoading(false);
                    setError(null);
                    if (onLoadComplete) onLoadComplete(data.stats);
                }
            }
            if (data.type === 'error') {
                setIsLoading(false);
                setError(data.error);
                if (onError) onError(data.error);
            }
        } catch (e) {
            console.log('Message parse error:', e);
        }
    }, [onLoadComplete, onError]);

    const retry = useCallback(() => {
        chartReadyRef.current = false;
        setError(null);
        setIsLoading(true);
        setRetryKey(prev => prev + 1);
    }, []);

    function getErrorHTML(errorMessage) {
        return `<!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 20px; background: #131722; color: #ef4444; font-family: monospace; }
                </style>
            </head>
            <body>
                <h3>Chart Error</h3>
                <p>${errorMessage}</p>
                <p>Please try again with different settings.</p>
            </body>
        </html>`;
    }

    return (
        <View style={styles.container}>
            {isLoading && !error && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading {analysisData?.analysisStyle || ''} chart...</Text>
                </View>
            )}
            {error && (
                <View style={styles.error}>
                    <Feather name="alert-circle" size={40} color="#ef4444" />
                    <Text style={styles.errorText}>Chart failed to load</Text>
                    <Text style={styles.errorSub}>{error}</Text>
                    <TouchableOpacity onPress={retry} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
            <WebView
                key={`${retryKey}_${htmlKey}`}
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlString }}
                javaScriptEnabled
                domStorageEnabled
                allowFileAccess
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                onMessage={handleMessage}
                onConsoleLog={(log) => {
                    console.log('📱 WebView Console:', log.message);
                }}
                style={{ flex: 1, opacity: isLoading || error ? 0 : 1 }}
                scrollEnabled={false}
                bounces={false}
                onLoadEnd={() => {
                    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
                    messageTimeoutRef.current = setTimeout(() => {
                        if (isLoading && !chartReadyRef.current) {
                            console.log('⚠️ Force completing chart load');
                            chartReadyRef.current = true;
                            setIsLoading(false);
                        }
                    }, 5000);
                }}
            />
        </View>
    );
}, (prevProps, nextProps) => {
    return prevProps.symbol === nextProps.symbol &&
        prevProps.analysisData?.analysisStyle === nextProps.analysisData?.analysisStyle &&
        prevProps.analysisData?.lastPrice === nextProps.analysisData?.lastPrice;
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#131722' },
    loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131722', zIndex: 10 },
    loadingText: { color: '#d1d4dc', marginTop: 10, fontSize: 14 },
    error: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131722', zIndex: 10 },
    errorText: { color: '#ef4444', marginTop: 10, fontSize: 16, fontWeight: '600' },
    errorSub: { color: '#6b7280', marginTop: 5, fontSize: 12, textAlign: 'center', paddingHorizontal: 30 },
    retryBtn: { marginTop: 15, backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: '600' }
});