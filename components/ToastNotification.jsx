// components/ToastNotification.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ToastType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

const ToastColors = {
    [ToastType.SUCCESS]: { bg: '#22C55E', icon: 'checkmark-circle' },
    [ToastType.ERROR]: { bg: '#EF4444', icon: 'alert-circle' },
    [ToastType.WARNING]: { bg: '#F59E0B', icon: 'warning' },
    [ToastType.INFO]: { bg: '#3B82F6', icon: 'information-circle' },
};

export const ToastNotification = ({ visible, type, message, onHide, duration = 3000 }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, duration);
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onHide());
    };

    const colorConfig = ToastColors[type] || ToastColors[ToastType.INFO];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: colorConfig.bg,
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons name={colorConfig.icon} size={24} color="#FFFFFF" />
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    message: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
        marginRight: 8,
    },
    closeButton: {
        padding: 4,
    },
});