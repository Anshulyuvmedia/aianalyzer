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

        if (!analysisData?.patterns && !analysisData?.keyLevels) {
            console.warn('⚠️ No pattern or level data available');
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
                    
                    let chart = null;
                    let candleSeries = null;
                    let volumeSeries = null;
                    let isInitialized = false;
                    let lastPrice = null;
                    let drawnMarkers = [];
                    let addedPrices = new Set();
                    
                    function addHorizontalLine(price, color, lineWidth, lineStyle, title, axisLabelVisible) {
                        if (!candleSeries || !price) return;
                        const roundedPrice = Math.round(price * 100000) / 100000;
                        const key = \`\${roundedPrice}_\${color}\`;
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
                        if (!candleSeries) return;
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
                            } else if (pattern.type === 'Inside Bar') {
                                shape = 'square';
                                text = 'IB';
                            } else {
                                text = pattern.type?.substring(0, 2) || '●';
                            }
                            
                            addMarker(timestamp, pattern.price, text, isBullish ? '#22c55e' : '#ef4444', shape, 
                                     isBullish ? 'belowBar' : 'aboveBar');
                        });
                    }
                    
                    function addKeyLevels() {
                        const significantLevels = keyLevelsData
                            .filter(level => {
                                if (level.strength !== 'Strong' && level.strength !== 'Very Strong') return false;
                                const price = level.price;
                                const approxKey = 'approx_' + (Math.round(price * 2000) / 2000);
                                if (addedPrices.has(approxKey)) return false;
                                addedPrices.add(approxKey);
                                return true;
                            })
                            .sort((a, b) => b.price - a.price)
                            .slice(0, 8);
                        
                        significantLevels.forEach(level => {
                            const color = level.type === 'Resistance' ? '#ef4444' : '#22c55e';
                            const width = level.strength === 'Very Strong' ? 2 : 1;
                            addHorizontalLine(level.price, color, width, 0, level.type, true);
                        });
                    }
                    
                    function addTradingSetup() {
                        if (tradingSetupData.entry) {
                            addHorizontalLine(tradingSetupData.entry, '#3b82f6', 2, 1, 'Entry', true);
                        }
                        if (tradingSetupData.stopLoss) {
                            addHorizontalLine(tradingSetupData.stopLoss, '#ef4444', 1, 1, 'Stop Loss', true);
                        }
                        if (tradingSetupData.takeProfit) {
                            addHorizontalLine(tradingSetupData.takeProfit, '#22c55e', 1, 1, 'Take Profit', true);
                        }
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
                    
                    function initChart() {
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
                        
                        addPatternMarkers();
                        addKeyLevels();
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
                key={retryKey}
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: getHTML() }}
                javaScriptEnabled
                domStorageEnabled
                allowFileAccess
                allowUniversalAccessFromFileURLs
                mixedContentMode="always"
                onMessage={handleMessage}
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