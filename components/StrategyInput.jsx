import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const StrategyInput = () => {
    const [symbol, setSymbol] = useState('');
    const [timeframe, setTimeframe] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('6');
    const [fileData, setFileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Conditions for each rule block
    const [entryConditions, setEntryConditions] = useState([{ indicator: '', operator: '', value: '' }]);
    const [stopLossConditions, setStopLossConditions] = useState([{ indicator: '', operator: '', value: '' }]);
    const [targetConditions, setTargetConditions] = useState([{ indicator: '', operator: '', value: '' }]);
    const [exitConditions, setExitConditions] = useState([{ indicator: '', operator: '', value: '' }]);

    const [aiGuidanceInput, setAiGuidanceInput] = useState('');
    const [selectedDays, setSelectedDays] = useState({
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false,
    });

    const indicators = ['RSI', 'EMA', 'SMA', 'MACD', 'VWAP', 'Bollinger Bands', 'Stochastic'];
    const operators = ['>', '<', '>=', '<=', '==', 'Cross Above', 'Cross Below'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setFileData({
                uri: asset.uri,
                name: asset.fileName || 'strategy.png',
                mimeType: asset.mimeType || 'image/png',
            });
        }
    };

    const addCondition = (setter, conditions) => {
        setter([...conditions, { indicator: '', operator: '', value: '' }]);
    };

    const updateCondition = (setter, conditions, index, field, value) => {
        const updated = [...conditions];
        updated[index][field] = value;
        setter(updated);
    };

    const handleDayToggle = (day) => {
        setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const submitStrategy = async () => {
        if (!fileData) {
            Alert.alert('Missing Image', 'Please upload your strategy diagram!');
            return;
        }
        if (!symbol || !timeframe) {
            Alert.alert('Missing Fields', 'Please fill Symbol and Timeframe!');
            return;
        }

        setIsLoading(true);

        try {
            const stored = await AsyncStorage.getItem('userData');
            const userData = stored ? JSON.parse(stored) : {};
            const userId = userData.userid;

            const formData = new FormData();
            formData.append('file', {
                uri: fileData.uri,
                name: fileData.name,
                type: fileData.mimeType,
            });

            formData.append('symbol', symbol);
            formData.append('timeframe', timeframe);
            formData.append('duration', selectedDuration);
            formData.append('tradingDays', JSON.stringify(Object.keys(selectedDays).filter(d => selectedDays[d])));
            formData.append('aiGuidance', aiGuidanceInput);
            formData.append('userId', userId || 'guest');

            formData.append('entryRules', JSON.stringify(entryConditions.filter(c => c.indicator && c.operator)));
            formData.append('stopLossRules', JSON.stringify(stopLossConditions.filter(c => c.indicator && c.operator)));
            formData.append('targetRules', JSON.stringify(targetConditions.filter(c => c.indicator && c.operator)));
            formData.append('exitRules', JSON.stringify(exitConditions.filter(c => c.indicator && c.operator)));

            const response = await axios.post(
                'http://192.168.1.27:3000/api/appdata/run-backtest',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            Alert.alert('Success!', 'Backtest started. Results coming soon!');
            console.log(response.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to submit strategy. Check console.');
        } finally {
            setIsLoading(false);
        }
    };

    const ConditionBlock = ({ title, color, conditions, setConditions }) => (
        <LinearGradient colors={['#AEAED4', '#000', '#AEAED4']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradientBoxBorder}>
            <LinearGradient colors={['#1e2836', '#111827', '#1e2836']} style={styles.innerGradient}>
                <View style={[styles.inputBox, { borderLeftColor: color, backgroundColor: color + '15' }]}>
                    <Text style={[styles.blockTitle, { color }]}>{title}</Text>

                    {conditions.map((cond, i) => (
                        <View key={i} style={styles.conditionRow}>
                            <View style={styles.dropdown}>
                                <Picker
                                    selectedValue={cond.indicator}
                                    style={{ color: '#fff' }}
                                    dropdownIconColor="#888"
                                    onValueChange={(v) => updateCondition(setConditions, conditions, i, 'indicator', v)}
                                >
                                    <Picker.Item label="Indicator" value="" />
                                    {indicators.map(ind => <Picker.Item key={ind} label={ind} value={ind} />)}
                                </Picker>
                            </View>

                            <View style={styles.dropdown}>
                                <Picker
                                    selectedValue={cond.operator}
                                    style={{ color: '#fff' }}
                                    dropdownIconColor="#888"
                                    onValueChange={(v) => updateCondition(setConditions, conditions, i, 'operator', v)}
                                >
                                    <Picker.Item label="Operator" value="" />
                                    {operators.map(op => <Picker.Item key={op} label={op} value={op} />)}
                                </Picker>
                            </View>

                            <TextInput
                                style={styles.valueInput}
                                placeholder="Value"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={cond.value}
                                onChangeText={(t) => updateCondition(setConditions, conditions, i, 'value', t)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity onPress={() => addCondition(setConditions, conditions)}>
                        <Text style={[styles.addButton, { color }]}>+ Add Condition</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </LinearGradient>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Upload Strategy Image */}
            <LinearGradient colors={['#AEAED4', '#000', '#AEAED4']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradientBoxBorder}>
                <LinearGradient colors={['#1e2836', '#111827', '#1e2836']} style={styles.innerGradient}>
                    <View style={styles.uploadContainer}>
                        <Text style={styles.uploadLabel}>Upload Strategy Diagram (Required)</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                            {fileData ? (
                                <Text style={styles.uploadText}>Selected: {fileData.name}</Text>
                            ) : (
                                <>
                                    <Feather name="image" size={40} color="#60a5fa" />
                                    <Text style={styles.uploadText}>Tap to upload image</Text>
                                    <Text style={styles.browseText}>Browse from gallery</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </LinearGradient>

            {/* Symbol & Timeframe */}
            <View style={styles.inputGrid}>
                <View style={styles.inputBox}>
                    <Text style={styles.inputTitle}>Symbol</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="e.g. BTCUSD, XAUUSD"
                        placeholderTextColor="#888"
                        value={symbol}
                        onChangeText={setSymbol}
                    />
                </View>
                <View style={styles.inputBox}>
                    <Text style={styles.inputTitle}>Timeframe</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="e.g. 15m, 1H, 4H, 1D"
                        placeholderTextColor="#888"
                        value={timeframe}
                        onChangeText={setTimeframe}
                    />
                </View>
            </View>

            {/* Rule Blocks */}
            <ConditionBlock title="Entry Rules" color="#22c55e" conditions={entryConditions} setConditions={setEntryConditions} />
            <ConditionBlock title="Stop Loss Rules" color="#ef4444" conditions={stopLossConditions} setConditions={setStopLossConditions} />
            <ConditionBlock title="Take Profit Rules" color="#3b82f6" conditions={targetConditions} setConditions={setTargetConditions} />
            <ConditionBlock title="Exit Rules" color="#a855f7" conditions={exitConditions} setConditions={setExitConditions} />

            {/* AI Guidance & Duration */}
            <LinearGradient colors={['#AEAED4', '#000', '#AEAED4']} style={styles.gradientBoxBorder}>
                <LinearGradient colors={['#1e2836', '#111827', '#1e2836']} style={styles.innerGradient}>
                    <View style={styles.aiguideContainer}>
                        <View style={styles.headerRow}>
                            <Feather name="zap" size={22} color="#a855f7" />
                            <Text style={styles.header}>AI Guidance & Settings</Text>
                        </View>

                        <TextInput
                            style={[styles.inputField, { height: 100 }]}
                            placeholder="Any extra instructions for AI? (optional)"
                            placeholderTextColor="#888"
                            multiline
                            value={aiGuidanceInput}
                            onChangeText={setAiGuidanceInput}
                        />

                        <Text style={styles.sectionTitle}>Backtest Duration</Text>
                        <View style={styles.durationOptions}>
                            {['1', '3', '6', '12'].map(months => (
                                <TouchableOpacity
                                    key={months}
                                    style={[styles.durationButton, selectedDuration === months && styles.selectedDuration]}
                                    onPress={() => setSelectedDuration(months)}
                                >
                                    <Text style={styles.durationText}>{months} month{months !== '1' ? 's' : ''}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Trading Days</Text>
                        <View style={styles.daysWrapper}>
                            {Object.keys(selectedDays).map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayItem, selectedDays[day] && styles.selectedDay]}
                                    onPress={() => handleDayToggle(day)}
                                >
                                    <Text style={styles.dayText}>{day.slice(0, 3)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.runButton} onPress={submitStrategy} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather name="play-circle" size={20} color="#fff" />
                                    <Text style={styles.runButtonText}>Run AI Backtest</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </LinearGradient>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 15 },
    gradientBoxBorder: { borderRadius: 15, padding: 1, marginBottom: 20 },
    innerGradient: { borderRadius: 14, padding: 15 },
    uploadContainer: { alignItems: 'center' },
    uploadLabel: { color: '#fff', fontSize: 16, marginBottom: 12, fontWeight: '600' },
    uploadBox: { width: '100%', padding: 40, borderWidth: 2, borderColor: '#4b5563', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', backgroundColor: '#1e293b22' },
    uploadText: { color: '#94a3b8', marginTop: 10 },
    browseText: { color: '#60a5fa', fontWeight: '600', marginTop: 5 },
    inputGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    inputBox: { width: '48%' },
    inputTitle: { color: '#e2e8f0', fontSize: 14, marginBottom: 8, fontWeight: '600' },
    inputField: { backgroundColor: '#1e293b', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#374151' },
    blockTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    conditionRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
    dropdown: { flex: 1, backgroundColor: '#1e293b', borderRadius: 8, borderWidth: 1, borderColor: '#374151' },
    valueInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, color: '#fff', borderWidth: 1, borderColor: '#374151' },
    addButton: { fontWeight: '600', marginTop: 8, alignSelf: 'flex-start' },
    aiguideContainer: { paddingVertical: 10 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    header: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 8 },
    sectionTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '600', marginTop: 15, marginBottom: 10 },
    durationOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    durationButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1e293b', borderRadius: 10, borderWidth: 1, borderColor: '#374151' },
    selectedDuration: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    durationText: { color: '#fff', fontWeight: '500' },
    daysWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    dayItem: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1e293b', borderRadius: 20, borderWidth: 1, borderColor: '#374151' },
    selectedDay: { backgroundColor: '#8b5cf6', borderColor: '#a855f7' },
    dayText: { color: '#fff' },
    runButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', padding: 16, borderRadius: 12, marginTop: 20 },
    runButtonText: { color: '#fff', fontSize: 17, fontWeight: '600', marginLeft: 8 },
});

export default StrategyInput;