// src/context/NotificationsContext.jsx
import { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (page = 1, append = false) => {
        try {
            if (page === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const res = await axios.get(
                `${API_BASE_URL}/api/appdata/get-notifications?page=${page}&limit=${notifications.limit}`
            );

            // console.log('notifi', res.data.data);
            const { data = [], total = 0, hasMore = false } = res.data || {};
            setNotifications(prev => ({
                data: append ? [...prev.data, ...data] : data,
                page,
                limit: prev.limit,
                total,
                hasMore,
            }));
        } catch (err) {
            console.error('Notifications fetch failed:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setRefreshing(false);
        }
    }, [notifications.limit]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications(1, false);
    }, [fetchNotifications]);

    const loadMore = useCallback(() => {
        if (!notifications.hasMore || isLoadingMore) return;
        fetchNotifications(notifications.page + 1, true);
    }, [fetchNotifications, notifications.hasMore, isLoadingMore]);

    const markAsRead = useCallback(async (id) => {
        try {
            setNotifications(prev => ({
                ...prev,
                data: prev.data.map(n => n._id === id ? { ...n, status: 'read' } : n),
            }));
            await axios.patch(`${API_BASE_URL}/api/appdata/notifications/${id}/read`);
        } catch (err) {
            console.error('Mark as read failed', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            setNotifications(prev => ({
                ...prev,
                data: prev.data.map(n => ({ ...n, status: 'read' })),
            }));
            await axios.patch(`${API_BASE_URL}/api/appdata/notifications/mark-all-read`);
        } catch (err) {
            console.error('Mark all read failed', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1, false);
    }, []);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                isLoading,
                isLoadingMore,
                refreshing,
                refreshNotifications: refresh,
                loadMoreNotifications: loadMore,
                markNotificationAsRead: markAsRead,
                markAllNotificationsAsRead: markAllAsRead,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};