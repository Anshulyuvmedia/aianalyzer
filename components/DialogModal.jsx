// components/DialogModal.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const DialogType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    CONFIRM: 'confirm',
};

const DialogConfig = {
    [DialogType.SUCCESS]: {
        icon: 'checkmark-circle',
        iconColor: '#22C55E',
        buttonColor: '#22C55E',
    },
    [DialogType.ERROR]: {
        icon: 'alert-circle',
        iconColor: '#EF4444',
        buttonColor: '#EF4444',
    },
    [DialogType.WARNING]: {
        icon: 'warning',
        iconColor: '#F59E0B',
        buttonColor: '#F59E0B',
    },
    [DialogType.CONFIRM]: {
        icon: 'help-circle',
        iconColor: '#3B82F6',
        buttonColor: '#3B82F6',
    },
};

export const DialogModal = ({
    visible,
    type = DialogType.CONFIRM,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    singleButton = false,
}) => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const config = DialogConfig[type];

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleConfirm = () => {
        onConfirm?.();
    };

    const handleCancel = () => {
        onCancel?.();
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity }]}>
                <Animated.View style={[styles.dialog, { transform: [{ scale }] }]}>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.dialogGradient}
                    >
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={[`${config.iconColor}20`, `${config.iconColor}10`]}
                                style={styles.iconBackground}
                            >
                                <Ionicons name={config.icon} size={48} color={config.iconColor} />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {!singleButton && (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.confirmButton,
                                    { backgroundColor: config.buttonColor },
                                ]}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: width * 0.85,
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
    },
    dialogGradient: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#CBD5E1',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
    },
    cancelButton: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '600',
    },
});