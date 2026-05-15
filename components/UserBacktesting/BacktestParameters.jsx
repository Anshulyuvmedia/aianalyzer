// app/components/UserBacktesting/BacktestParameters.jsx
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useBacktesting } from '../../context/BacktestingContext';

const BacktestParameters = () => {
    const { formData, updateFormData, updateDays, aiSuggestion } = useBacktesting();

    const durations = [
        { value: '1', label: '1 Month' },
        { value: '3', label: '3 Months' },
        { value: '6', label: '6 Months' },
        { value: '12', label: '1 Year' },
        { value: '24', label: '2 Years' },
    ];

    const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
    const sessions = ['All', 'London', 'New York', 'Asia', 'Sydney'];
    const directions = ['Both', 'Long', 'Short'];
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const ParameterField = ({ label, children, suggested }) => (
        <View style={styles.parameterGroup}>
            <View style={styles.parameterHeader}>
                <Text style={styles.label}>{label}</Text>
                {suggested && (
                    <View style={styles.suggestedBadge}>
                        <Feather name="star" size={10} color="#eab308" />
                        <Text style={styles.suggestedText}>AI Suggested</Text>
                    </View>
                )}
            </View>
            {children}
        </View>
    );

    return (
        <View>
            {/* Duration */}
            <ParameterField
                label="Backtest Duration"
                suggested={aiSuggestion?.recommendedDuration === formData.duration}
            >
                <View style={styles.durationContainer}>
                    {durations.map((dur) => (
                        <TouchableOpacity
                            key={dur.value}
                            style={[
                                styles.durationButton,
                                formData.duration === dur.value && styles.selectedDuration
                            ]}
                            onPress={() => updateFormData('duration', dur.value)}
                        >
                            <Text style={[
                                styles.durationText,
                                formData.duration === dur.value && styles.selectedDurationText
                            ]}>{dur.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ParameterField>

            {/* Timeframe */}
            <ParameterField label="Timeframe">
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.timeframe}
                        onValueChange={(value) => updateFormData('timeframe', value)}
                        style={styles.picker}
                        dropdownIconColor="#A0AEC0"
                    >
                        {timeframes.map((tf) => (
                            <Picker.Item key={tf} label={tf} value={tf} />
                        ))}
                    </Picker>
                </View>
            </ParameterField>

            {/* Two-column layout for risk parameters */}
            <View style={styles.row}>
                <View style={styles.halfWidth}>
                    <ParameterField label="Initial Capital ($)">
                        <TextInput
                            style={styles.input}
                            value={formData.capital}
                            onChangeText={(value) => updateFormData('capital', value)}
                            keyboardType="numeric"
                            placeholder="10000"
                            placeholderTextColor="#6B7280"
                        />
                    </ParameterField>
                </View>
                <View style={styles.halfWidth}>
                    <ParameterField label="Risk per Trade (%)">
                        <TextInput
                            style={styles.input}
                            value={formData.riskPerTrade}
                            onChangeText={(value) => updateFormData('riskPerTrade', value)}
                            keyboardType="numeric"
                            placeholder="2"
                            placeholderTextColor="#6B7280"
                        />
                    </ParameterField>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.halfWidth}>
                    <ParameterField label="Lot Size">
                        <TextInput
                            style={styles.input}
                            value={formData.lotSize}
                            onChangeText={(value) => updateFormData('lotSize', value)}
                            keyboardType="numeric"
                            placeholder="0.01"
                            placeholderTextColor="#6B7280"
                        />
                    </ParameterField>
                </View>
                <View style={styles.halfWidth}>
                    <ParameterField label="Max Trades">
                        <TextInput
                            style={styles.input}
                            value={formData.maxTrades}
                            onChangeText={(value) => updateFormData('maxTrades', value)}
                            keyboardType="numeric"
                            placeholder="10"
                            placeholderTextColor="#6B7280"
                        />
                    </ParameterField>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.halfWidth}>
                    <ParameterField label="Direction">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.direction}
                                onValueChange={(value) => updateFormData('direction', value)}
                                style={styles.picker}
                                dropdownIconColor="#A0AEC0"
                            >
                                {directions.map((dir) => (
                                    <Picker.Item key={dir} label={dir} value={dir} />
                                ))}
                            </Picker>
                        </View>
                    </ParameterField>
                </View>
                <View style={styles.halfWidth}>
                    <ParameterField label="Slippage (pips)">
                        <TextInput
                            style={styles.input}
                            value={formData.slippage}
                            onChangeText={(value) => updateFormData('slippage', value)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#6B7280"
                        />
                    </ParameterField>
                </View>
            </View>

            {/* Trading Days */}
            <ParameterField label="Trading Days">
                <View style={styles.daysContainer}>
                    {weekDays.map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                formData.days[day] && styles.selectedDay
                            ]}
                            onPress={() => updateDays(day, !formData.days[day])}
                        >
                            <Text style={[
                                styles.dayText,
                                formData.days[day] && styles.selectedDayText
                            ]}>{day.slice(0, 3)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ParameterField>
        </View>
    );
};

const styles = StyleSheet.create({
    parameterGroup: {
        marginBottom: 20,
    },
    parameterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    suggestedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eab30820',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    suggestedText: {
        color: '#eab308',
        fontSize: 10,
        fontWeight: '600',
    },
    durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    durationButton: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    selectedDuration: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    durationText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    selectedDurationText: {
        color: '#fff',
    },
    pickerContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    picker: {
        color: '#fff',
        height: 50,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 0,
    },
    halfWidth: {
        flex: 1,
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayButton: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    selectedDay: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    dayText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    selectedDayText: {
        color: '#fff',
    },
});

export default BacktestParameters;