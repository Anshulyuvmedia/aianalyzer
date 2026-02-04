import HomeHeader from '@/components/HomeHeader';
import { useContext, useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NotificationsContext } from '@/context/NotificationsContext';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

const Notifications = () => {
    const {
        notifications,
        refreshNotifications,
        loadMoreNotifications,
        isLoadingNotifications,
        isLoadingMore,
        refreshing,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    } = useContext(NotificationsContext);
    const { data: notificationsData, hasMore } = notifications;
    const [filter, setFilter] = useState('all');
    const rbSheetRef = useRef(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).replace(',', '');
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const filteredNotifications = useMemo(() => {
        let filtered = notificationsData || [];   // ← fixed here
        if (filter === 'read') filtered = filtered.filter((n) => n.status === 'read');
        if (filter === 'unread') filtered = filtered.filter((n) => n.status === 'unread');

        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const todayItems = filtered.filter((n) => isToday(new Date(n.createdAt)));
        const olderItems = filtered.filter((n) => !isToday(new Date(n.createdAt)));

        return [
            { title: 'Today', data: todayItems },
            { title: 'Older', data: olderItems },
        ].filter((section) => section.data.length > 0);
    }, [notificationsData, filter]);

    const onEndReached = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            loadMoreNotifications();
        }
    }, [isLoadingMore, hasMore, loadMoreNotifications]);

    const handleViewNotification = useCallback((item) => {
        if (item.status === 'unread') {
            markNotificationAsRead(item._id);
        }
        setSelectedNotification(item);
        rbSheetRef.current.open();
    }, [markNotificationAsRead]);

    const handleMarkAllRead = useCallback(() => {
        if (markAllNotificationsAsRead) {
            markAllNotificationsAsRead();
        }
    }, [markAllNotificationsAsRead]);

    const renderSectionHeader = ({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity onPress={() => handleViewNotification(item)} activeOpacity={0.85}>
                <LinearGradient
                    colors={['#7C3AED', '#000', '#3B82F6']} // Purple → Black → Blue branding
                    start={{ x: 0.0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBoxBorder}
                >
                    <LinearGradient
                        colors={['#1e1b4b', '#111827', '#1e293b']}
                        start={{ x: 0.3, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.innerGradient}
                    >
                        <View style={styles.notificationItem}>
                            <View style={styles.notificationHeader}>
                                <Text style={styles.messageText} numberOfLines={2} ellipsizeMode="tail">
                                    {item.message}
                                </Text>
                                <Text style={[styles.status, getStatusStyle(item.status)]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>
        ),
        [handleViewNotification]
    );

    const ListEmpty = () => (
        <View style={styles.emptyContainer}>
            {/* You can replace with <Image source={require('@/assets/empty-notif.png')} style={styles.emptyImage} /> */}
            <Text style={styles.emptyText}>You&apos;re all caught up!</Text>
            <Text style={styles.emptySubText}>No new notifications at the moment.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeHeader page="Home" title="Notifications" />

            <View style={styles.headerActions}>
                <View style={styles.filterContainer}>
                    {['all', 'unread', 'read'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterPill, filter === f && styles.activePill]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.activeText]}>
                                {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                    <Ionicons name="checkmark-done" size={20} color="#8B5CF6" />
                    <Text style={styles.markAllText}>Mark All Read</Text>
                </TouchableOpacity>
            </View>

            {isLoadingNotifications && notifications.data.length === 0 && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={{ color: '#9ca3af', marginTop: 16 }}>Loading notifications...</Text>
                </View>
            )}

            <SectionList
                sections={filteredNotifications}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item._id?.toString()}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isLoadingNotifications}
                        onRefresh={refreshNotifications}
                        tintColor="#8B5CF6"
                        colors={['#8B5CF6', '#3B82F6']}
                    />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        </View>
                    ) : null
                }
                ListEmptyComponent={ListEmpty}
            />

            <RBSheet
                ref={rbSheetRef}
                height={320}
                openDuration={280}
                customStyles={{ container: styles.rbSheetContainer }}
            >
                {selectedNotification && (
                    <View style={styles.rbSheetContent}>
                        <View style={styles.rbSheetHeader}>
                            <Text style={styles.rbSheetTitle}>Notification</Text>
                            <TouchableOpacity onPress={() => rbSheetRef.current.close()}>
                                <Ionicons name="close" size={24} color="#e5e7eb" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.rbSheetMessage}>{selectedNotification.message}</Text>
                        <Text style={styles.rbSheetTime}>{formatDate(selectedNotification.createdAt)}</Text>
                        <Text style={styles.rbSheetStatus}>
                            Status: <Text style={getStatusStyle(selectedNotification.status).text}>{selectedNotification.status.toUpperCase()}</Text>
                        </Text>
                    </View>
                )}
            </RBSheet>
        </View>
    );
};

const getStatusStyle = (status) => {
    if (status === 'read') return styles.readStatus;
    if (status === 'unread') return styles.unreadStatus;
    return {};
};

export default Notifications;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { paddingHorizontal: 12 },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        // paddingVertical: 8,
        backgroundColor: '#000',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterPill: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#1e293b',
    },
    activePill: {
        backgroundColor: '#8B5CF6', // Purple primary
    },
    filterText: {
        color: '#d1d5db',
        fontSize: 13,
        fontWeight: '600',
    },
    activeText: { color: '#fff' },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    markAllText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 17,
        fontWeight: '700',
        color: '#e5e7eb',
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    gradientBoxBorder: {
        borderRadius: 16,
        padding: 1.5,
        marginBottom: 12,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 4,
    },
    innerGradient: {
        borderRadius: 14.5,
        padding: 14,
    },
    notificationItem: {},
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    messageText: {
        color: '#f3f4f6',
        fontSize: 15,
        flex: 1,
        lineHeight: 20,
        fontWeight: '500',
    },
    status: {
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        fontWeight: '700',
    },
    readStatus: {
        backgroundColor: '#6B728033',
        color: '#9ca3af',
        borderWidth: 1,
        borderColor: '#6B7280',
    },
    unreadStatus: {
        backgroundColor: '#3B82F633', // Blue tint
        color: '#60A5FA',
        borderWidth: 1,
        borderColor: '#60A5FA',
    },
    timeText: {
        color: '#9ca3af',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d1d5db',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 15,
        color: '#9ca3af',
        textAlign: 'center',
    },
    rbSheetContainer: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    rbSheetContent: { padding: 24, flex: 1 },
    rbSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    rbSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    rbSheetMessage: {
        fontSize: 16,
        color: '#e5e7eb',
        lineHeight: 24,
        marginBottom: 16,
    },
    rbSheetTime: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 12,
    },
    rbSheetStatus: {
        fontSize: 15,
        color: '#d1d5db',
    },
});