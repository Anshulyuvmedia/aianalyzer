import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


const StrategyInput = () => {
    const router = useRouter();
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [market, setMarket] = useState("");
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [fileData, setFileData] = useState(null);
    const [entryText, setEntryText] = useState("");
    const [stopLossText, setStopLossText] = useState("");
    const [targetText, setTargetText] = useState("");
    const [exitText, setExitText] = useState("");
    const [loading, setLoading] = useState(false);

    const [entryConditions, setEntryConditions] = useState([
        { indicator: "", operator: "", value: "" }
    ]);

    const SYMBOLS = {
        stocks: [
            "AAPL", "MSFT", "GOOGL", "AMZN", "META",
            "TSLA", "NFLX", "NVDA", "INTC", "ORCL"
        ],
        forex: {
            major: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD"],
            minor: ["EUR/GBP", "EUR/JPY", "GBP/JPY", "NZD/USD", "USD/CAD"]
        },
        crypto: [
            "BTC/USD", "ETH/USD", "ADA/USD", "XRP/USD", "SOL/USD",
            "BNB/USD", "DOGE/USD", "MATIC/USD", "LTC/USD", "DOT/USD"
        ],
        commodities: [
            "XAU/USD", "XAG/USD", "WTI/USD", "BRENT/USD", "NG/USD",
            "CORN", "SOYBEAN", "WHEAT", "COFFEE", "SUGAR"
        ]
    };

    const [selectedDays, setSelectedDays] = useState({
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
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

    const handleRunBacktest = async () => {
        setLoading(true);
        try {
            if (!market || !selectedSymbol) {
                alert("Please select Market and Symbol");
                return;
            }

            if (!entryText || !stopLossText || !targetText) {
                alert("Please fill Entry, Stop Loss, and Target conditions");
                return;
            }

            if (!selectedDuration) {
                alert("Please select a backtest duration");
                return;
            }

            const savedUser = await AsyncStorage.getItem("userData");
            const { _id } = JSON.parse(savedUser);

            // Convert text to array
            const entryArray = entryText.split("\n").filter(line => line.trim() !== "");
            const stopLossArray = stopLossText.split("\n").filter(line => line.trim() !== "");
            const targetArray = targetText.split("\n").filter(line => line.trim() !== "");
            const exitArray = exitText ? exitText.split("\n").filter(line => line.trim() !== "") : [];


            // Create FormData
            const formData = new FormData();
            formData.append("userId", _id);
            formData.append("market", market);
            formData.append("symbol", selectedSymbol);
            formData.append("duration", selectedDuration);
            formData.append("days", JSON.stringify(selectedDays));

            formData.append("entryConditions", JSON.stringify(entryArray));
            formData.append("stopLossConditions", JSON.stringify(stopLossArray));
            formData.append("targetConditions", JSON.stringify(targetArray));
            formData.append("exitConditions", JSON.stringify(exitArray));

            if (fileData) {
                formData.append("strategyImage", {
                    uri: fileData.uri,
                    type: fileData.mimeType || "image/png",
                    name: fileData.name || "strategy.png",
                });
            }

            const formDataEntries = {};
            for (let pair of formData.entries()) {
                formDataEntries[pair[0]] = pair[1];
            }
            // console.log("Submitting backtest with FormData:", JSON.stringify(formDataEntries,null,3));

            const response = await axios.post(
                "http://192.168.1.28:3000/api/appdata/run-backtest",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 20000 // important for large formData or slow network
                }
            );


            const result = response.data;
            console.log("Data:", JSON.stringify(result, null, 3));
            alert("Backtest Complete!");
            router.push('../../(root)/BacktestingResultsPage');

        } catch (error) {
            console.error("Submit Error:", error);
            const targetUrl = error.config?.url || "unknown address";
            alert(`Network or server error. Check console. Attempted to reach: ${targetUrl}`);
        } finally {
            setLoading(false); // Stop Loader
        }
    };

    const handleBackTestResults = () => {
        router.push('../../(root)/BacktestingResultsPage');
    };


    return (
        <>
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
                        {/* MARKET PICKER */}
                        <Text style={styles.uploadLabel}>Market Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={market}
                                onValueChange={(itemValue) => setMarket(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="#A0AEC0"
                            >
                                <Picker.Item label="Choose Market" value="" />
                                <Picker.Item label="Stocks" value="stocks" />
                                <Picker.Item label="Forex" value="forex" />
                                <Picker.Item label="Crypto" value="crypto" />
                                <Picker.Item label="Commodities" value="commodities" />
                            </Picker>
                        </View>

                        {/* SYMBOL PICKER */}
                        <Text style={[styles.uploadLabel, { marginTop: 12 }]}>Select Symbol</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedSymbol}
                                onValueChange={(itemValue) => setSelectedSymbol(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="#A0AEC0"
                                enabled={market !== ""}
                            >
                                <Picker.Item label="Select Symbol" value="" />

                                {market === "forex" ? (
                                    [...SYMBOLS.forex.major, ...SYMBOLS.forex.minor].map((symbol, index) => (
                                        <Picker.Item key={index} label={symbol} value={symbol} />
                                    ))
                                ) : (
                                    (SYMBOLS[market] ?? []).map((symbol, index) => (
                                        <Picker.Item key={index} label={symbol} value={symbol} />
                                    ))
                                )}
                            </Picker>
                        </View>

                        {/* STRATEGY INPUT HEADER */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18 }}>
                            <Feather name="upload" size={20} color="#60a5fa" />
                            <Text style={styles.header}>Strategy Input</Text>
                        </View>

                        {/* STRATEGY DIAGRAM UPLOAD */}
                        <View style={styles.uploadContainer}>
                            <Text style={styles.uploadLabel}>Strategy Diagram</Text>
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
                        <View style={styles.inputGrid}>
                            <View style={[styles.inputBox, { borderStartColor: '#22c55e', backgroundColor: '#22c55e0d' }]}>
                                <Text style={[styles.inputTitle, { color: '#22c55e' }]}>Entry Conditions</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Define your entry conditions..."
                                    placeholderTextColor="#B0B0B0"
                                    multiline
                                    value={entryText}
                                    onChangeText={setEntryText}
                                />
                                <Text style={styles.demoConditionText}>Eg: RSI less than 30</Text>
                            </View>
                            <View style={[styles.inputBox, { borderStartColor: '#ef4444', backgroundColor: '#ef44440d' }]}>
                                <Text style={[styles.inputTitle, { color: '#ef4444' }]}>Stop Loss Conditions</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Define your stop loss conditions..."
                                    placeholderTextColor="#B0B0B0"
                                    multiline
                                    value={stopLossText}
                                    onChangeText={setStopLossText}
                                />
                                <Text style={styles.demoConditionText}>Eg: 1% below entry</Text>
                            </View>
                            <View style={[styles.inputBox, { borderStartColor: '#3b82f6', backgroundColor: '#3b82f60d' }]}>
                                <Text style={[styles.inputTitle, { color: '#3b82f6' }]}>Target Conditions</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Define your target conditions..."
                                    placeholderTextColor="#B0B0B0"
                                    multiline
                                    value={targetText}
                                    onChangeText={setTargetText}
                                />
                                <Text style={styles.demoConditionText}>Eg: 2% above entry</Text>
                            </View>
                            <View style={[styles.inputBox, { borderStartColor: '#eab308', backgroundColor: '#eab3080d' }]}>
                                <Text style={[styles.inputTitle, { color: '#eab308' }]}>Exit Conditions</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Define your exit conditions..."
                                    placeholderTextColor="#B0B0B0"
                                    multiline
                                    value={exitText}
                                    onChangeText={setExitText}
                                />
                                <Text style={styles.demoConditionText}>Eg: Price hits TP1</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </LinearGradient>

            <LinearGradient
                colors={['#AEAED4', '#000', '#AEAED4']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBoxBorderaiguide}
            >
                <LinearGradient
                    colors={['#1e2836', '#111827', '#1e2836']}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.innerGradientaiguide}
                >
                    <View style={styles.containeraiguide}>
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
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="play" size={16} color="#FFFFFF" />
                                    <Text style={styles.runButtonText}>Run Backtest</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleBackTestResults}>
                        <Text style={styles.viewAllAnalysisText}>View Results</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </LinearGradient>
        </>

    );
};

export default StrategyInput;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // marginBottom: 10,
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
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        marginStart: 5,
    },
    uploadContainer: {
        marginBottom: 20,
    },
    uploadLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#4A5568',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#2D374833',
    },
    uploadText: {
        color: '#A0AEC0',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    browseText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
    inputGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    inputBox: {
        width: '48%',
        marginBottom: 20,
        borderStartWidth: 2,
        padding: 10,
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10,
    },
    inputTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    inputField: {
        height: 120,
        backgroundColor: '#111827cc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4b5563',
        padding: 10,
        color: '#FFFFFF',
        textAlignVertical: 'top',
    },


    containeraiguide: {
        flex: 1,
        padding: 10,
    },
    gradientBoxBorderaiguide: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradientaiguide: {
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
    dropdownButton: {
        width: "100%",
        backgroundColor: "#1e293b",
        borderRadius: 8,
        borderColor: "#475569",
        borderWidth: 1,
        paddingVertical: 10,
    },
    dropdownText: {
        color: "#E5E7EB",
        fontSize: 14,
        textAlign: "left"
    },
    dropdownList: {
        backgroundColor: "#111827",
        borderRadius: 8
    },
    pickerContainer: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginLeft: 0,
        flex: 1 / 2,
    },
    picker: {
        color: '#fff',
    },
    demoConditionText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        marginTop: 10
    },
    viewAllAnalysisText: {
        color: '#A0AEC0',
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 15,
    }

});