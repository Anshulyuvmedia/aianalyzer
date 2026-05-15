// app/components/UserBacktesting/StrategyImageUpload.jsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useBacktesting } from '../../context/BacktestingContext';
import * as Haptics from 'expo-haptics';

const StrategyImageUpload = () => {
    const { formData, updateFormData } = useBacktesting();
    const [uploading, setUploading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Please grant gallery access to upload strategy diagrams');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setUploading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                updateFormData('strategyImage', {
                    uri: asset.uri,
                    name: asset.fileName || `strategy_${Date.now()}.png`,
                    mimeType: asset.mimeType || 'image/png',
                    width: asset.width,
                    height: asset.height,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateFormData('strategyImage', null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Strategy Diagram (Optional)</Text>
            <Text style={styles.description}>
                Upload a chart or diagram to help AI understand your strategy better
            </Text>

            {formData.strategyImage ? (
                <View style={styles.imagePreviewContainer}>
                    <Image
                        source={{ uri: formData.strategyImage.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageActions}>
                        <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                            <Feather name="edit-2" size={16} color="#60a5fa" />
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                            <Feather name="trash-2" size={16} color="#ef4444" />
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.uploadBox, uploading && styles.uploadBoxDisabled]}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Feather name="loader" size={32} color="#60a5fa" />
                            <Text style={styles.uploadText}>Processing...</Text>
                        </>
                    ) : (
                        <>
                            <Feather name="image" size={32} color="#60a5fa" />
                            <Text style={styles.uploadText}>Tap to upload diagram</Text>
                            <Text style={styles.browseText}>PNG, JPG up to 5MB</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
    description: {
        color: '#A0AEC0',
        fontSize: 12,
        marginBottom: 12,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#4A5568',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#2D374833',
    },
    uploadBoxDisabled: {
        opacity: 0.6,
    },
    uploadText: {
        color: '#A0AEC0',
        fontSize: 14,
        marginTop: 12,
    },
    browseText: {
        color: '#60a5fa',
        fontSize: 12,
        marginTop: 4,
    },
    imagePreviewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1e293b',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    imageActions: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    changeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#3b82f620',
        gap: 6,
    },
    changeText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '500',
    },
    removeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#ef444420',
        gap: 6,
    },
    removeText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default StrategyImageUpload;