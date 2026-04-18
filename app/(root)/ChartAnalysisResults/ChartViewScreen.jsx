// app/ChartAnalysisResults/ChartViewScreen.jsx
import React, { useEffect } from 'react';
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
        // Lock to landscape when screen mounts
        const lockToLandscape = async () => {
            if (Platform.OS !== 'web') {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            }
        };
        lockToLandscape();

        // Handle hardware back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });

        return () => {
            // Restore portrait when screen unmounts
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

    if (!pair || !analysisData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No chart data available</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Find annotations for this pair
    const chartAnnotations = analysisData.analysisData?.chartAnnotations?.find(
        a => a.pair === pair.pair
    );

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            {/* Minimal header for landscape mode */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{pair.pair}</Text>
                    <Text style={styles.subtitle}>
                        {analysisData.analysisData?.request?.analysisStyle || 'Price Action'} • {analysisData.analysisData?.request?.timeframe || '1h'}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Chart takes remaining space */}
            <View style={styles.chartContainer}>
                <TradingViewChart
                    symbol={pair.pair}
                    analysisData={pair}
                    annotations={chartAnnotations}
                    timeframe={analysisData.analysisData?.request?.timeframe || '1h'}
                    isLandscape={true}
                    onLoadComplete={() => console.log('Chart loaded successfully')}
                    onError={(err) => console.error('Chart error:', err)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 16,
    },
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
    closeButton: {
        padding: 8,
        zIndex: 1,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        color: '#6b7280',
        fontSize: 11,
        marginTop: 2,
    },
    chartContainer: {
        flex: 1,
        backgroundColor: '#131722',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#151515',
        borderRadius: 10,
    },
    backButtonText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
});