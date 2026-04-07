// hooks/useDialog.js
import { useState, useCallback } from 'react';

export const useDialog = () => {
    const [dialog, setDialog] = useState({
        visible: false,
        type: 'confirm',
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null,
        singleButton: false,
    });

    const showDialog = useCallback((options) => {
        setDialog({
            visible: true,
            type: options.type || 'confirm',
            title: options.title || '',
            message: options.message || '',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            singleButton: options.singleButton || false,
        });
    }, []);

    const hideDialog = useCallback(() => {
        setDialog(prev => ({ ...prev, visible: false }));
    }, []);

    const showSuccess = useCallback((title, message, onConfirm) => {
        showDialog({
            type: 'success',
            title,
            message,
            confirmText: 'OK',
            onConfirm: () => {
                onConfirm?.();
                hideDialog();
            },
            singleButton: true,
        });
    }, [showDialog, hideDialog]);

    const showError = useCallback((title, message, onConfirm) => {
        showDialog({
            type: 'error',
            title,
            message,
            confirmText: 'OK',
            onConfirm: () => {
                onConfirm?.();
                hideDialog();
            },
            singleButton: true,
        });
    }, [showDialog, hideDialog]);

    const showWarning = useCallback((title, message, onConfirm, onCancel) => {
        showDialog({
            type: 'warning',
            title,
            message,
            confirmText: 'Proceed',
            cancelText: 'Cancel',
            onConfirm: () => {
                onConfirm?.();
                hideDialog();
            },
            onCancel: () => {
                onCancel?.();
                hideDialog();
            },
        });
    }, [showDialog, hideDialog]);

    const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
        showDialog({
            type: 'confirm',
            title,
            message,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: () => {
                onConfirm?.();
                hideDialog();
            },
            onCancel: () => {
                onCancel?.();
                hideDialog();
            },
        });
    }, [showDialog, hideDialog]);

    return {
        dialog,
        hideDialog,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
    };
};