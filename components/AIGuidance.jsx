import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';

const AIGuidance = () => {
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedDays, setSelectedDays] = useState({
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false,
    });

    const handleDurationSelect = (duration) => {
        setSelectedDuration(duration);
    };

    const handleDayToggle = (day) => {
        setSelectedDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const handleRunBacktest = () => {
        // Add backtest logic here
        console.log('Running backtest with duration:', selectedDuration, 'days:', selectedDays);
    };

    return (
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
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <Feather name="alert-circle" size={20} color="#A855F7" />
                        <Text style={styles.header}>AI Guidance</Text>
                    </View>
                    <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionTitle}>AI Suggestion</Text>
                        <Text style={styles.suggestionText}>
                            Based on your strategy, we recommend testing with 6-month duration on weekdays
                            for optimal results.
                        </Text>
                    </View>
                    <View style={styles.durationContainer}>
                        <Text style={styles.sectionTitle}>Recommended Backtest Duration</Text>
                        <View style={styles.durationOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '1' && styles.selectedDuration,
                                ]}
                                onPress={() => handleDurationSelect('1')}
                            >
                                <Text style={styles.durationText}>1 month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '6' && styles.selectedDuration,
                                ]}
                                onPress={() => handleDurationSelect('6')}
                            >
                                <Text style={styles.durationText}>6 months</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.durationButton,
                                    selectedDuration === '12' && styles.selectedDuration,
                                ]}
                                onPress={() => handleDurationSelect('12')}
                            >
                                <Text style={styles.durationText}>12 months</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.daysContainer}>
                        <Text style={styles.sectionTitle}>Select Days to Apply</Text>
                        <View style={styles.daysWrapper}>
                            {Object.keys(selectedDays).map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayItem,
                                        selectedDays[day] && styles.selectedDay,
                                    ]}
                                    onPress={() => handleDayToggle(day)}
                                >
                                    <Text style={styles.dayText}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.runButton} onPress={handleRunBacktest}>
                        <Feather name="play" size={16} color="#FFFFFF" />
                        <Text style={styles.runButtonText}>Run Backtest</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default AIGuidance;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    suggestionBox: {
        backgroundColor: '#1e40af33',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    suggestionTitle: {
        color: '#60a5fa',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    suggestionText: {
        color: '#A0AEC0',
        fontSize: 14,
    },
    durationContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    durationOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    durationButton: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#4B5563',
        flex: 1,
        marginHorizontal: 5,
    },
    selectedDuration: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    durationText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    daysContainer: {
        marginBottom: 20,
    },
    daysWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#1e293b',
        marginBottom: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    selectedDay: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    dayText: {
        color: '#fff',
        fontSize: 14,
    },
    runButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    runButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginStart: 5,
    },
});