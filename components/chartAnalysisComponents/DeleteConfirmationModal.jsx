// components/chartAnalysisComponents/DeleteConfirmationModal.jsx

import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const DeleteConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    itemCount = 1,
    itemName = 'analysis',
    isDeleting = false
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.warningIcon}>
                        <Feather name="alert-triangle" size={40} color="#ef4444" />
                    </View>

                    <Text style={styles.modalTitle}>
                        Delete {itemCount > 1 ? `${itemCount} Items` : 'Analysis'}?
                    </Text>

                    <Text style={styles.modalMessage}>
                        {itemCount > 1
                            ? `Are you sure you want to delete ${itemCount} ${itemName}s? This action cannot be undone.`
                            : `Are you sure you want to delete this ${itemName}? This action cannot be undone.`
                        }
                    </Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isDeleting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.deleteButton]}
                            onPress={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#1e1e2e',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
    },
    warningIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        color: '#9ca3af',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#2d3748',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});