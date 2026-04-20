// components/chartAnalysisComponents/TradingViewChart.jsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';

export const TradingViewChart = ({ symbol = 'EURUSD', analysisData, onLoadComplete, onError, isLandscape = false }) => {
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const chartReadyRef = useRef(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.log('⚠️ Loading timeout - forcing chart visibility');
                setIsLoading(false);
                chartReadyRef.current = true;
            }
        }, 8000);

        return () => clearTimeout(timeout);
    }, [isLoading]);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
            if (webViewRef.current && !isLoading && !error) {
                webViewRef.current.injectJavaScript(`
                    if (window.chart && !window.chartRemoved) {
                        window.chart.resize(window.innerWidth, window.innerHeight);
                        setTimeout(() => window.chart.timeScale().fitContent(), 100);
                    }
                `);
            }
        });
        return () => subscription?.remove();
    }, [isLoading, error]);

    const getPricePrecision = (sym) => {
        const crypto = ['BTCUSD', 'ETHUSD', 'SOLUSD'];
        if (crypto.includes(sym)) return 2;
        const jpy = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'];
        if (jpy.includes(sym)) return 3;
        const indices = ['US30', 'NAS100', 'SPX500'];
        if (indices.some(i => sym.includes(i))) return 2;
        if (sym === 'XAUUSD') return 2;
        return 5;
    };

    const getCandleData = () => {
        if (analysisData?.candles?.length) {
            return analysisData.candles.map(c => ({
                time: typeof c.time === 'string' ? new Date(c.time).getTime() / 1000 : c.time,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                volume: c.volume || Math.random() * 1000,
            }));
        }
        const now = Math.floor(Date.now() / 1000);
        let price = analysisData?.lastPrice || 1.0920;
        return Array.from({ length: 50 }).map((_, i) => {
            const open = price;
            const close = open + (Math.random() - 0.5) * 0.002;
            const high = Math.max(open, close) + Math.random() * 0.001;
            const low = Math.min(open, close) - Math.random() * 0.001;
            price = close;
            return { time: now - (50 - i) * 3600, open, high, low, close, volume: Math.random() * 1000 };
        });
    };

    const getPatternMarkers = () => {
        if (!analysisData?.patterns || !Array.isArray(analysisData.patterns)) {
            console.log('No patterns data available');
            return [];
        }

        console.log('Processing patterns:', analysisData.patterns.length);

        const markers = [];

        for (const pattern of analysisData.patterns) {
            // Get timestamp
            let timestamp = null;
            if (pattern.time) {
                if (typeof pattern.time === 'string') {
                    timestamp = new Date(pattern.time).getTime() / 1000;
                } else if (typeof pattern.time === 'number') {
                    timestamp = pattern.time;
                }
            }

            // If no time, try to find from price (fallback)
            if (!timestamp && pattern.price && analysisData.candles) {
                const closestCandle = analysisData.candles.find(c =>
                    Math.abs(c.close - pattern.price) < 0.001
                );
                if (closestCandle) {
                    timestamp = typeof closestCandle.time === 'string'
                        ? new Date(closestCandle.time).getTime() / 1000
                        : closestCandle.time;
                }
            }

            if (!timestamp || isNaN(timestamp)) {
                console.log('⚠️ Could not determine time for pattern:', pattern);
                continue;
            }

            const isBullish = pattern.direction === 'Bullish';
            const isPinBar = pattern.type?.toLowerCase().includes('pin');

            let shape = 'circle';
            let text = '';

            if (pattern.type === 'Pin Bar') {
                shape = isBullish ? 'arrowUp' : 'arrowDown';
                text = 'PB';
            } else if (pattern.type === 'Engulfing') {
                shape = 'circle';
                text = 'ENG';
            } else if (pattern.type) {
                text = pattern.type.substring(0, 2);
            }

            markers.push({
                time: timestamp,
                position: isBullish ? 'belowBar' : 'aboveBar',
                color: isBullish ? '#22c55e' : '#ef4444',
                shape: shape,
                text: text,
                size: pattern.confidence === 'High' ? 2 : 1,
            });
        }

        console.log(`✅ Created ${markers.length} pattern markers`);
        if (markers.length > 0) {
            console.log('Sample marker:', markers[0]);
        }

        return markers;
    };

    const getHTML = () => {
        const candles = getCandleData();
        const patternMarkers = getPatternMarkers();
        const analysisStyle = analysisData?.analysisStyle || 'Price Action';
        const precision = getPricePrecision(symbol);

        // Extract all style-specific data
        const keyLevels = analysisData?.keyLevels || [];
        const orderBlocks = analysisData?.orderBlocks || [];
        const fairValueGaps = analysisData?.fairValueGaps || [];
        const supplyZones = analysisData?.supplyZones || [];
        const demandZones = analysisData?.demandZones || [];
        const indicators = analysisData?.indicators || {};
        const sessionRanges = analysisData?.sessionRanges || [];
        const liquidityLevels = analysisData?.liquidityLevels || [];
        const pdArrays = analysisData?.pdArrays || [];
        const liquidityPools = analysisData?.liquidityPools || [];
        const breaks = analysisData?.breaks || [];
        const rejections = analysisData?.rejections || [];
        const currentPrice = analysisData?.lastPrice || candles[candles.length - 1]?.close;

        // Trading setup data
        const tradingSetup = {
            entry: analysisData?.entry || analysisData?.recommendation?.entry,
            stopLoss: analysisData?.stopLoss || analysisData?.recommendation?.stopLoss,
            takeProfit: analysisData?.takeProfit || analysisData?.recommendation?.takeProfit,
            bsl: analysisData?.bsl,
            ssl: analysisData?.ssl,
        };

        console.log(`📊 [${analysisStyle}] Chart Data:`, {
            patterns: patternMarkers.length,
            levels: keyLevels.length,
            orderBlocks: orderBlocks.length,
            fvgs: fairValueGaps.length,
            supplyZones: supplyZones.length,
            demandZones: demandZones.length,
            liquidity: liquidityLevels.length,
            pdArrays: pdArrays.length,
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { margin: 0; padding: 0; background: #131722; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                    #chart { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
                    .custom-tooltip {
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
                        backdrop-filter: blur(4px);
                    }
                    .annotation-label {
                        position: absolute;
                        background: rgba(0,0,0,0.7);
                        border-radius: 4px;
                        padding: 2px 6px;
                        font-size: 10px;
                        font-weight: 500;
                        pointer-events: none;
                        z-index: 200;
                        white-space: nowrap;
                    }
                </style>
            </head>
            <body>
                <div id="chart"></div>
                <div id="tooltip" class="custom-tooltip" style="display: none;"></div>
                <div id="annotations" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 200;"></div>
                
                <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
                
                <script>
                    // Send debug message to confirm WebView communication
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: 'WebView ready' }));
                    }
                    
                    let chart = null;
                    let series = null;
                    let volumeSeries = null;
                    let lastPrice = null;
                    let isInitialized = false;
                    
                    const candlesData = ${JSON.stringify(candles)};
                    const patternMarkersData = ${JSON.stringify(patternMarkers)};
                    const analysisStyleName = "${analysisStyle}";
                    const currentPriceValue = ${currentPrice || 'null'};
                    const pricePrecision = ${precision};
                    
                    const keyLevelsData = ${JSON.stringify(keyLevels)};
                    const orderBlocksData = ${JSON.stringify(orderBlocks)};
                    const fairValueGapsData = ${JSON.stringify(fairValueGaps)};
                    const supplyZonesData = ${JSON.stringify(supplyZones)};
                    const demandZonesData = ${JSON.stringify(demandZones)};
                    const indicatorsData = ${JSON.stringify(indicators)};
                    const sessionRangesData = ${JSON.stringify(sessionRanges)};
                    const liquidityLevelsData = ${JSON.stringify(liquidityLevels)};
                    const pdArraysData = ${JSON.stringify(pdArrays)};
                    const liquidityPoolsData = ${JSON.stringify(liquidityPools)};
                    const breaksData = ${JSON.stringify(breaks)};
                    const rejectionsData = ${JSON.stringify(rejections)};
                    const tradingSetupData = ${JSON.stringify(tradingSetup)};
                    
                    const chartConfig = {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        layout: { background: { color: '#131722' }, textColor: '#d1d4dc', fontSize: 11 },
                        grid: { vertLines: { visible: false }, horzLines: { color: '#2B2B43' } },
                        timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2B2B43' },
                        rightPriceScale: { borderColor: '#2B2B43', scaleMargins: { top: 0.12, bottom: 0.08 } },
                        crosshair: { mode: 0, vertLine: { color: '#758696', width: 1, style: 3 }, horzLine: { color: '#758696', width: 1, style: 3 } },
                    };
                    
                    console.log('🔍 Chart data received:', {
                        patternsCount: patternMarkersData.length,
                        keyLevelsCount: keyLevelsData.length,
                        orderBlocksCount: orderBlocksData.length,
                        liquidityCount: liquidityLevelsData.length,
                        candlesCount: candlesData.length,
                    });
                    
                    function addPriceLine(price, color, lineWidth, lineStyle, title, axisLabelVisible) {
                        if (!series || !price) return;
                        try {
                            series.createPriceLine({
                                price: price,
                                color: color,
                                lineWidth: lineWidth || 1,
                                lineStyle: lineStyle || 0,
                                axisLabelVisible: axisLabelVisible || false,
                                title: title || '',
                            });
                        } catch(e) {
                            console.log('Error adding price line:', e);
                        }
                    }
                    
                    function addShadedZone(priceFrom, priceTo, color, opacity, title) {
                        if (!chart || !priceFrom || !priceTo) return;
                        try {
                            if (typeof chart.addPriceZone === 'function') {
                                chart.addPriceZone({
                                    from: candlesData[0]?.time,
                                    to: candlesData[candlesData.length - 1]?.time,
                                    priceFrom: priceFrom,
                                    priceTo: priceTo,
                                    color: color + opacity,
                                    borderColor: color,
                                    borderWidth: 1,
                                    title: title || '',
                                });
                            }
                        } catch(e) {
                            console.log('Error adding zone:', e);
                        }
                    }
                    
                    function addMovingAverage(data, color, lineWidth, title) {
                        if (!chart || !data || data.length === 0) return;
                        try {
                            const maSeries = chart.addSeries(LightweightCharts.LineSeries, {
                                color: color,
                                lineWidth: lineWidth || 1,
                                title: title || '',
                            });
                            maSeries.setData(data.map((value, idx) => ({ time: candlesData[idx]?.time, value: value })));
                        } catch(e) {
                            console.log('Error adding MA:', e);
                        }
                    }
                    
                    function addVerticalLine(time, color, title) {
                        if (!chart) return;
                        try {
                            const lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
                                color: color,
                                lineWidth: 1,
                                lineStyle: 2,
                                priceLineVisible: false,
                            });
                            lineSeries.setData([{ time: time, value: currentPriceValue || candlesData[0]?.close }]);
                        } catch(e) {
                            console.log('Error adding vertical line:', e);
                        }
                    }
                    
                    function sendReadyMessage() {
                        if (window.ReactNativeWebView && !window.messageSent) {
                            window.messageSent = true;
                            const stats = {
                                patterns: patternMarkersData.length,
                                levels: keyLevelsData.length,
                                orderBlocks: orderBlocksData.length,
                                fvgs: fairValueGapsData.length,
                                supplyZones: supplyZonesData.length,
                                demandZones: demandZonesData.length,
                                liquidity: liquidityLevelsData.length,
                                pdArrays: pdArraysData.length,
                                sessions: sessionRangesData.length,
                                volume: !!volumeSeries,
                            };
                            console.log('📤 Sending ready message with stats:', stats);
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', stats: stats }));
                        }
                    }
                    
                    // ============ INIT CHART ============
                    function initChart() {
                        try {
                            if (isInitialized) {
                                console.log('Chart already initialized');
                                sendReadyMessage();
                                return;
                            }
                            
                            if (typeof LightweightCharts === 'undefined') {
                                setTimeout(initChart, 100);
                                return;
                            }
                            
                            const container = document.getElementById('chart');
                            if (!container) {
                                console.error('Chart container not found');
                                return;
                            }
                            
                            console.log('Creating chart...');
                            chart = LightweightCharts.createChart(container, chartConfig);
                            
                            series = chart.addSeries(LightweightCharts.CandlestickSeries, {
                                upColor: '#26a69a', downColor: '#ef5350',
                                borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
                                priceFormat: { type: 'price', precision: pricePrecision, minMove: 1 / Math.pow(10, pricePrecision) },
                            });
                            series.setData(candlesData);
                            
                            if (patternMarkersData.length > 0 && typeof series.setMarkers === 'function') {
                                series.setMarkers(patternMarkersData);
                                console.log('Added pattern markers:', patternMarkersData.length);
                            }
                            
                            // ============ 1. PRICE ACTION ============
                            if (keyLevelsData.length > 0) {
                                console.log('📊 Adding', keyLevelsData.length, 'key levels');
                                keyLevelsData.forEach(level => {
                                    const price = level.price || level.level;
                                    const type = level.type || (level.isSupport ? 'Support' : 'Resistance');
                                    const strength = level.strength || 'Medium';
                                    
                                    if (!price) return;
                                    
                                    const color = type === 'Support' ? '#22c55e' : '#ef4444';
                                    const width = strength === 'Strong' ? 2 : 1;
                                    addPriceLine(price, color, width, 0, type, strength === 'Strong');
                                });
                            }
                            
                            // ============ 2. SMART MONEY CONCEPT ============
                            if (orderBlocksData.length > 0) {
                                console.log('📊 Adding', orderBlocksData.length, 'order blocks');
                                orderBlocksData.forEach(ob => {
                                    const color = ob.type === 'Bullish' ? '#00ff9d' : '#ff4466';
                                    addPriceLine(ob.price, color, 2, 0, ob.type + ' OB', true);
                                });
                            }
                            
                            // ============ 3. ICT - LIQUIDITY LEVELS ============
                            if (liquidityLevelsData.length > 0) {
                                console.log('📊 Adding', liquidityLevelsData.length, 'liquidity levels');
                                liquidityLevelsData.forEach(ll => {
                                    const color = ll.type === 'Liquidity High' ? '#ef4444' : '#22c55e';
                                    addPriceLine(ll.price, color, 1, 1, ll.type, true);
                                });
                            }
                            
                            // ============ 4. ORDER FLOW - VOLUME ============
                            try {
                                volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
                                    color: '#26a69a',
                                    priceFormat: { type: 'volume' },
                                    priceScaleId: 'volume',
                                });
                                const volumeData = candlesData.map(c => ({ 
                                    time: c.time, 
                                    value: c.volume || 500, 
                                    color: c.close > c.open ? '#26a69a80' : '#ef535080' 
                                }));
                                volumeSeries.setData(volumeData);
                                chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 }, borderColor: '#2B2B43' });
                            } catch(e) { console.log('Volume series not supported'); }
                            
                            // ============ CURRENT PRICE ============
                            if (currentPriceValue) {
                                addPriceLine(currentPriceValue, '#3b82f6', 1, 1, 'Current', true);
                            }
                            
                            // ============ TOOLTIP ============
                            function setTooltip(price) {
                                const tooltip = document.getElementById('tooltip');
                                if (!tooltip) return;
                                if (price === null) { tooltip.style.display = 'none'; return; }
                                tooltip.style.display = 'block';
                                tooltip.innerHTML = '<span style="color:#60a5fa">Price:</span> ' + price.toFixed(pricePrecision);
                            }
                            
                            chart.subscribeCrosshairMove((param) => {
                                if (!param || !param.seriesPrices || param.seriesPrices.size === 0) {
                                    if (lastPrice !== null) setTooltip(null);
                                    lastPrice = null;
                                    return;
                                }
                                const price = param.seriesPrices.get(series);
                                if (price !== undefined && price !== lastPrice) {
                                    setTooltip(price);
                                    lastPrice = price;
                                    if (param.point && document.getElementById('tooltip')) {
                                        document.getElementById('tooltip').style.left = (param.point.x + 20) + 'px';
                                        document.getElementById('tooltip').style.top = (param.point.y - 30) + 'px';
                                    }
                                }
                            });
                            
                            chart.timeScale().fitContent();
                            window.chart = chart;
                            isInitialized = true;
                            
                            console.log('Chart initialization complete');
                            sendReadyMessage();
                            
                        } catch (err) {
                            console.error('Chart init error:', err);
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: err.message }));
                            }
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
                    
                    // Start initialization
                    initChart();
                </script>
            </body>
            </html>
        `;
    };

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('📨 Received message:', data.type);

            if (data.type === 'debug') {
                console.log('🐛 Debug:', data.message);
                return;
            }

            if (data.type === 'ready') {
                if (!chartReadyRef.current) {
                    chartReadyRef.current = true;
                    setIsLoading(false);
                    setError(null);
                    console.log('✅ Chart loaded with stats:', data.stats);
                    onLoadComplete && onLoadComplete(data.stats);
                }
            }
            if (data.type === 'error') {
                setIsLoading(false);
                setError(data.error);
                onError && onError(data.error);
            }
        } catch (e) {
            console.log('Message parse error:', e);
        }
    };

    const retry = () => {
        chartReadyRef.current = false;
        setError(null);
        setIsLoading(true);
        setRetryKey(prev => prev + 1);
    };

    return (
        <View style={styles.container}>
            {isLoading && !error && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading chart...</Text>
                </View>
            )}

            {error && (
                <View style={styles.error}>
                    <Feather name="alert-circle" size={40} color="#ef4444" />
                    <Text style={styles.errorText}>Chart failed</Text>
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
                    // Fallback: if no message received after 3 seconds, force hide loading
                    setTimeout(() => {
                        if (isLoading && !chartReadyRef.current) {
                            console.log('⚠️ No ready message received, forcing chart visibility');
                            chartReadyRef.current = true;
                            setIsLoading(false);
                        }
                    }, 3000);
                }}
            />
        </View>
    );
};

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