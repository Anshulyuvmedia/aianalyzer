// app/(root)/Backtesting/AIGuidance.jsx
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    ScrollView,  // ← Change this: import from react-native, not react-native-web
    ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router'; // ← Add this
import SectionHeader from '../../../components/UserBacktesting/SectionHeader';
import BacktestParameters from '../../../components/UserBacktesting/BacktestParameters';
import { router } from 'expo-router';
import { useBacktesting } from '../../../context/BacktestingContext';

const AIGuidance = () => {
    const {
        formData,
        loading,
        runBacktest,
        aiSuggestion,
        currentStep,
        goToStep,
        strategyId: contextStrategyId,  // ← Get from context
        setStrategyId  // ← Add this if available in context
    } = useBacktesting();

    const { strategyId: paramStrategyId, preloaded } = useLocalSearchParams();  // ← Get from URL params

    // Load strategy if coming from list
    useEffect(() => {
        if (paramStrategyId && preloaded === 'true') {
            // Set the strategy ID in context
            if (setStrategyId) {
                setStrategyId(paramStrategyId);
            }
        }
    }, [paramStrategyId, preloaded]);

    const handleRunBacktest = async () => {
        try {
            const results = await runBacktest();
            Alert.alert('Success', 'Backtest completed successfully!');
            router.push('/(root)/Backtesting/BacktestingResults');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleBackToStrategy = () => {
        goToStep(1);
        router.back();
    };

    // Show loading while checking
    if (currentStep !== 2) {
        // Don't auto-redirect, just show loading or return null
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#60a5fa" />
                <Text style={styles.loadingText}>Loading strategy parameters...</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <View style={styles.container}>
                {/* Back Button */}
                <TouchableOpacity onPress={handleBackToStrategy} style={styles.backButton}>
                    <Feather name="arrow-left" size={20} color="#60a5fa" />
                    <Text style={styles.backText}>Back to Strategy</Text>
                </TouchableOpacity>

                {/* AI Guidance Section */}
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
                        <SectionHeader icon="alert-circle" title="AI Strategy Recommendations" color="#A855F7" />

                        {aiSuggestion && (
                            <View style={styles.suggestionBox}>
                                <Text style={styles.suggestionTitle}>🤖 AI Analysis</Text>
                                <Text style={styles.suggestionText}>
                                    {aiSuggestion.analysis || "Based on your strategy conditions, here are our recommendations:"}
                                </Text>

                                {aiSuggestion.recommendations && (
                                    <View style={styles.recommendationsList}>
                                        {aiSuggestion.recommendations.map((rec, index) => (
                                            <View key={index} style={styles.recommendationItem}>
                                                <Feather name="check-circle" size={14} color="#22c55e" />
                                                <Text style={styles.recommendationText}>{rec}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <Text style={styles.suggestionFooter}>
                                    The parameters below have been optimized based on your strategy.
                                    Adjust them as needed before running the backtest.
                                </Text>
                            </View>
                        )}

                        <BacktestParameters />

                        <TouchableOpacity
                            style={styles.runButton}
                            onPress={handleRunBacktest}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="play" size={16} color="#FFFFFF" />
                                    <Text style={styles.runButtonText}>Run Backtest</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                </LinearGradient>
            </View>
        </ScrollView>
    );
};

export default AIGuidance;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#A0AEC0',
        marginTop: 12,
        fontSize: 14,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    backText: {
        color: '#60a5fa',
        fontSize: 14,
        marginLeft: 8,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
        marginBottom: 20,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    suggestionBox: {
        backgroundColor: '#1e40af33',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    suggestionTitle: {
        color: '#A855F7',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    suggestionText: {
        color: '#A0AEC0',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    recommendationsList: {
        marginVertical: 12,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    recommendationText: {
        color: '#fff',
        fontSize: 13,
        flex: 1,
    },
    suggestionFooter: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 12,
        fontStyle: 'italic',
    },
    runButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginTop: 16,
    },
    runButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});