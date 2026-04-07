// hooks/useToast.js
import { useState, useCallback } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState({
        visible: false,
        type: 'info',
        message: '',
    });

    const showToast = useCallback((type, message) => {
        setToast({ visible: true, type, message });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    const showSuccess = useCallback((message) => {
        showToast('success', message);
    }, [showToast]);

    const showError = useCallback((message) => {
        showToast('error', message);
    }, [showToast]);

    const showWarning = useCallback((message) => {
        showToast('warning', message);
    }, [showToast]);

    const showInfo = useCallback((message) => {
        showToast('info', message);
    }, [showToast]);

    return {
        toast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
};