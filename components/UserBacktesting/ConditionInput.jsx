// app/components/UserBacktesting/ConditionInput.jsx
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ConditionInput = (props) => {
    const {
        title,
        value,
        onChangeText,
        placeholder,
        color,
        example,
        error,
        required,
        optional
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const [showExample, setShowExample] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={[styles.title, { color }]}>{title}</Text>
                    {required && <Text style={styles.required}>*</Text>}
                    {/* {optional && <Text style={styles.optional}>(optional)</Text>} */}
                </View>
                <TouchableOpacity onPress={() => setShowExample(!showExample)}>
                    <Feather name="help-circle" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            {showExample && (
                <View style={styles.exampleBox}>
                    <Feather name="lightbulb" size={12} color="#eab308" />
                    <Text style={styles.exampleText}>{example}</Text>
                </View>
            )}

            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    { borderLeftColor: color, borderLeftWidth: 3 }
                ]}
                placeholder={placeholder}
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                textAlignVertical="top"
            />

            {error && (
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={12} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    required: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    optional: {
        color: '#64748b',
        fontSize: 12,
    },
    exampleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
        gap: 8,
    },
    exampleText: {
        color: '#94a3b8',
        fontSize: 12,
        flex: 1,
    },
    input: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        padding: 12,
        color: '#FFFFFF',
        fontSize: 14,
        minHeight: 100,
    },
    inputFocused: {
        borderColor: '#60a5fa',
        borderWidth: 1,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
    },
});

export default ConditionInput;