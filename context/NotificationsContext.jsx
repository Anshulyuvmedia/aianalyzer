import { createContext, useState, useCallback, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from './AuthContext';
import { registerForPushNotifications, setupNotificationListeners } from '@/services/pushNotifications';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id;

    const [notifications, setNotifications] = useState({
        data: [], page: 1, limit: 20, total: 0, hasMore: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/appdata/notifications/unread-count?userId=${userId}`
            );
            setUnreadCount(res.data.count || 0);
        } catch { /* ignore */ }
    }, [userId]);

    const fetchNotifications = useCallback(async (page = 1, append = false) => {
        if (!userId) return;
        try {
            if (page === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const res = await axios.get(
                `${API_BASE_URL}/api/appdata/get-notifications?page=${page}&limit=${notifications.limit}&userId=${userId}`
            );
            const { data = [], total = 0, hasMore = false } = res.data || {};
            setNotifications(prev => ({
                data: append ? [...prev.data, ...data] : data,
                page, limit: prev.limit, total, hasMore,
            }));
        } catch (err) {
            console.error('Notifications fetch failed:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setRefreshing(false);
        }
    }, [notifications.limit, userId]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications(1, false);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    const loadMore = useCallback(() => {
        if (!notifications.hasMore || isLoadingMore) return;
        fetchNotifications(notifications.page + 1, true);
    }, [fetchNotifications, notifications.hasMore, isLoadingMore]);

    const markAsRead = useCallback(async (id) => {
        if (!userId) return;
        try {
            setNotifications(prev => ({
                ...prev,
                data: prev.data.map(n =>
                    n._id === id ? { ...n, readBy: [...(n.readBy || []), userId] } : n
                ),
            }));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await axios.patch(`${API_BASE_URL}/api/appdata/notifications/${id}/read`, { userId });
        } catch (err) {
            console.error('Mark as read failed', err);
        }
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        try {
            setNotifications(prev => ({
                ...prev,
                data: prev.data.map(n => ({
                    ...n,
                    readBy: n.dismissedBy?.includes(userId) ? n.readBy : [...(n.readBy || []), userId],
                })),
            }));
            setUnreadCount(0);
            await axios.patch(`${API_BASE_URL}/api/appdata/notifications/mark-all-read`, { userId });
        } catch (err) {
            console.error('Mark all read failed', err);
        }
    }, [userId]);

    const dismissNotification = useCallback(async (id) => {
        if (!userId) return;
        try {
            setNotifications(prev => ({
                ...prev,
                data: prev.data.filter(n => n._id !== id),
            }));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await axios.patch(`${API_BASE_URL}/api/appdata/notifications/${id}/dismiss`, { userId });
        } catch (err) {
            console.error('Dismiss failed', err);
        }
    }, [userId]);

    const pushRegistered = useRef(false);

    useEffect(() => {
        if (userId) {
            fetchNotifications(1, false);
            fetchUnreadCount();
            if (!pushRegistered.current) {
                pushRegistered.current = true;
                registerForPushNotifications(userId);
                setupNotificationListeners();
            }
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [userId, fetchUnreadCount]);

    const isUnread = useCallback((n) => {
        return !n.readBy?.includes(userId) && !n.dismissedBy?.includes(userId);
    }, [userId]);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                isLoading,
                isLoadingMore,
                refreshing,
                unreadCount,
                refreshNotifications: refresh,
                loadMoreNotifications: loadMore,
                markNotificationAsRead: markAsRead,
                markAllNotificationsAsRead: markAllAsRead,
                dismissNotification,
                isUnread,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};
