import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';

export const TradingViewChart = ({
    symbol = 'EURUSD',
    analysisData,
    onLoadComplete,
    onError,
    isLandscape = false
}) => {
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    // Listen to orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
            // Notify WebView of orientation change
            if (webViewRef.current && !isLoading && !error) {
                const orientationScript = `
                    if (window.chart) {
                        window.chart.resize(window.innerWidth, window.innerHeight);
                        setTimeout(() => window.chart.timeScale().fitContent(), 100);
                    }
                `;
                webViewRef.current.injectJavaScript(orientationScript);
            }
        });

        return () => subscription?.remove();
    }, [isLoading, error]);

    const getCandleData = () => {
        if (analysisData?.candles?.length) return analysisData.candles;

        const now = Math.floor(Date.now() / 1000);
        let price = 100;

        return Array.from({ length: 50 }).map((_, i) => {
            const open = price;
            const close = open + (Math.random() - 0.5) * 2;
            const high = Math.max(open, close) + Math.random();
            const low = Math.min(open, close) - Math.random();

            price = close;

            return {
                time: now - (50 - i) * 3600,
                open,
                high,
                low,
                close,
            };
        });
    };

    const getHTML = () => {
        const candles = getCandleData();
        const isLandscapeMode = isLandscape || dimensions.width > dimensions.height;

        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
            body { 
                margin: 0; 
                padding: 0; 
                background: #131722; 
                overflow: hidden;
                position: fixed;
                width: 100%;
                height: 100%;
                touch-action: none;
            }
            #chart { 
                width: 100%; 
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
            @media (orientation: landscape) {
                body {
                    background: #131722;
                }
                #chart {
                    width: 100%;
                    height: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div id="chart"></div>

        <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>

        <script>
            let chart;
            let series;
            let isInitialized = false;

            function getChartDimensions() {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            }

            function initChart() {
                try {
                    if (typeof LightweightCharts === 'undefined') {
                        throw new Error("LightweightCharts library failed to load");
                    }

                    // Remove old chart if exists
                    if (chart) {
                        chart.remove();
                        chart = null;
                    }

                    const container = document.getElementById('chart');
                    const dims = getChartDimensions();

                    chart = LightweightCharts.createChart(container, {
                        width: dims.width,
                        height: dims.height,
                        layout: {
                            background: { color: '#131722' },
                            textColor: '#d1d4dc'
                        },
                        grid: {
                            vertLines: { color: '#2B2B43' },
                            horzLines: { color: '#2B2B43' }
                        },
                        timeScale: {
                            timeVisible: true,
                            secondsVisible: false,
                            borderColor: '#2B2B43',
                            tickMarkFormatter: (time) => {
                                const date = new Date(time * 1000);
                                return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                            }
                        },
                        rightPriceScale: {
                            borderColor: '#2B2B43',
                            scaleMargins: {
                                top: 0.1,
                                bottom: 0.1,
                            }
                        },
                        leftPriceScale: {
                            visible: false,
                        },
                        crosshair: {
                            mode: LightweightCharts.CrosshairMode.Normal,
                            vertLine: { 
                                color: '#758696', 
                                width: 1, 
                                style: LightweightCharts.LineStyle.Dotted,
                                visible: true,
                                labelVisible: true
                            },
                            horzLine: { 
                                color: '#758696', 
                                width: 1, 
                                style: LightweightCharts.LineStyle.Dotted,
                                visible: true,
                                labelVisible: true
                            }
                        },
                        handleScroll: {
                            mouseWheel: true,
                            pressedMouseMove: true,
                            horzTouchDrag: true,
                            vertTouchDrag: true,
                        },
                        handleScale: {
                            axisPressedMouseMove: true,
                            mouseWheel: true,
                            pinch: true,
                        },
                    });

                    series = chart.addSeries(LightweightCharts.CandlestickSeries, {
                        upColor: '#26a69a',
                        downColor: '#ef5350',
                        borderVisible: false,
                        wickUpColor: '#26a69a',
                        wickDownColor: '#ef5350',
                        priceFormat: {
                            type: 'price',
                            precision: 5,
                            minMove: 0.00001,
                        },
                    });

                    series.setData(${JSON.stringify(candles)});

                    // Fit the content nicely
                    chart.timeScale().fitContent();
                    
                    // Store chart globally for resize access
                    window.chart = chart;
                    window.series = series;
                    isInitialized = true;

                    // Force initial resize after a short delay
                    setTimeout(() => {
                        if (window.chart) {
                            window.chart.resize(window.innerWidth, window.innerHeight);
                            window.chart.timeScale().fitContent();
                        }
                    }, 100);

                    // Strong resize handler for orientation change
                    let resizeTimeout;
                    const resizeHandler = () => {
                        if (resizeTimeout) clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(() => {
                            if (window.chart) {
                                window.chart.resize(window.innerWidth, window.innerHeight);
                                window.chart.timeScale().fitContent();
                            }
                        }, 50);
                    };

                    window.addEventListener('resize', resizeHandler);
                    window.addEventListener('orientationchange', resizeHandler);

                    // Notify React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'ready',
                        dimensions: { width: dims.width, height: dims.height }
                    }));

                } catch (err) {
                    console.error('Chart init error:', err);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        error: err.message || err.toString()
                    }));
                }
            }

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

            if (data.type === 'ready') {
                setIsLoading(false);
                setError(null);
                onLoadComplete && onLoadComplete();
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
        setError(null);
        setIsLoading(true);
        setRetryKey(prev => prev + 1);
    };

    // Force landscape orientation on the WebView
    const getWebViewStyle = () => {
        const isLandscapeMode = isLandscape || dimensions.width > dimensions.height;
        return {
            flex: 1,
            opacity: isLoading || error ? 0 : 1,
            transform: isLandscapeMode ? [{ rotate: '0deg' }] : [{ rotate: '0deg' }]
        };
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
                style={getWebViewStyle()}
                onLoad={() => console.log('WebView loaded')}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error:', nativeEvent);
                }}
                onHttpError={(e) => console.log('HTTP error:', e.nativeEvent)}
                scalesPageToFit={true}
                scrollEnabled={false}
                bounces={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131722'
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#131722',
        zIndex: 10
    },
    loadingText: {
        color: '#d1d4dc',
        marginTop: 10,
        fontSize: 14
    },
    error: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#131722',
        zIndex: 10
    },
    errorText: {
        color: '#ef4444',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600'
    },
    errorSub: {
        color: '#6b7280',
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 30
    },
    retryBtn: {
        marginTop: 15,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    retryText: {
        color: '#fff',
        fontWeight: '600'
    }
});