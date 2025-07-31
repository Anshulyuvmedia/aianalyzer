import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@expo/vector-icons/Feather';

const StrategyInput = () => {
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
                    <View className="flex-row">
                        <Feather name="upload" size={20} color="#60a5fa" />
                        <Text style={styles.header}>Strategy Input</Text>
                    </View>
                    <View style={styles.uploadContainer}>
                        <Text style={styles.uploadLabel}>Strategy Diagram</Text>
                        <TouchableOpacity>
                            <View style={styles.uploadBox}>
                                <Feather name="upload" size={30} color="#A0AEC0" />
                                <Text style={styles.uploadText}>Upload your strategy diagram</Text>
                                <Text style={styles.browseText}>Browse files</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputGrid}>
                        <View style={[styles.inputBox, { borderStartColor: '#22c55e', backgroundColor: '#22c55e0d' }]}>
                            <Text style={[styles.inputTitle, { color: '#22c55e' }]}>Entry Conditions</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Define your entry conditions..."
                                placeholderTextColor="#B0B0B0"
                                multiline={true}
                            />
                        </View>
                        <View style={[styles.inputBox, { borderStartColor: '#ef4444', backgroundColor: '#ef44440d' }]}>
                            <Text style={[styles.inputTitle, { color: '#ef4444' }]}>Stop Loss Conditions</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Define your stop loss conditions..."
                                placeholderTextColor="#B0B0B0"
                                multiline={true}
                            />
                        </View>
                        <View style={[styles.inputBox, { borderStartColor: '#3b82f6', backgroundColor: '#3b82f60d' }]}>
                            <Text style={[styles.inputTitle, { color: '#3b82f6' }]}>Target Conditions</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Define your target conditions..."
                                placeholderTextColor="#B0B0B0"
                                multiline={true}
                            />
                        </View>
                        <View style={[styles.inputBox, { borderStartColor: '#eab308', backgroundColor: '#eab3080d' }]}>
                            <Text style={[styles.inputTitle, { color: '#eab308' }]}>Exit Conditions</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Define your exit conditions..."
                                placeholderTextColor="#B0B0B0"
                                multiline={true}
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
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
});