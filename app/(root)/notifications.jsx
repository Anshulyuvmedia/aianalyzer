import HomeHeader from '@/components/HomeHeader';
import { useContext, useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SectionList, RefreshControl, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NotificationsContext } from '@/context/NotificationsContext';
import { Ionicons } from '@expo/vector-icons';
import RBSheet from 'react-native-raw-bottom-sheet';

const typeMeta = {
    info: { icon: 'information-circle', color: '#60A5FA', bg: '#1E3A5F' },
    success: { icon: 'checkmark-circle', color: '#34D399', bg: '#14532D' },
    warning: { icon: 'warning', color: '#FBBF24', bg: '#5C4100' },
    error: { icon: 'alert-circle', color: '#F87171', bg: '#5C1A1A' },
};

const Notifications = () => {
    const {
        notifications, refreshNotifications, loadMoreNotifications,
        isLoading, isLoadingMore, refreshing,
        markNotificationAsRead, markAllNotificationsAsRead, dismissNotification, isUnread,
    } = useContext(NotificationsContext);
    const { data: notificationsData, hasMore } = notifications;
    const [filter, setFilter] = useState('all');
    const rbSheetRef = useRef(null);
    const [selected, setSelected] = useState(null);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true,
        }).replace(',', '');
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const filtered = useMemo(() => {
        let list = notificationsData || [];
        if (filter === 'unread') list = list.filter((n) => isUnread(n));
        if (filter === 'read') list = list.filter((n) => !isUnread(n));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const todayItems = list.filter((n) => isToday(new Date(n.createdAt)));
        const olderItems = list.filter((n) => !isToday(new Date(n.createdAt)));
        return [
            { title: 'Today', data: todayItems },
            { title: 'Older', data: olderItems },
        ].filter((s) => s.data.length > 0);
    }, [notificationsData, filter, isUnread]);

    const onEndReached = useCallback(() => {
        if (!isLoadingMore && hasMore) loadMoreNotifications();
    }, [isLoadingMore, hasMore, loadMoreNotifications]);

    const openDetail = useCallback((item) => {
        if (isUnread(item)) markNotificationAsRead(item._id);
        setSelected(item);
        rbSheetRef.current.open();
    }, [markNotificationAsRead, isUnread]);

    const handleDismiss = useCallback(() => {
        if (selected) dismissNotification(selected._id);
        rbSheetRef.current.close();
        setSelected(null);
    }, [selected, dismissNotification]);

    const sectionHeader = ({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderItem = useCallback(({ item }) => {
        const meta = typeMeta[item.type] || typeMeta.info;
        const unread = isUnread(item);
        return (
            <TouchableOpacity onPress={() => openDetail(item)} activeOpacity={0.85}>
                <LinearGradient
                    colors={['#7C3AED', '#000', '#3B82F6']}
                    start={{ x: 0.0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gradientBoxBorder}
                >
                    <LinearGradient
                        colors={['#1e1b4b', '#111827', '#1e293b']}
                        start={{ x: 0.3, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.innerGradient}
                    >
                        <View style={styles.notifRow}>
                            <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
                                <Ionicons name={meta.icon} size={18} color={meta.color} />
                            </View>
                            <View style={styles.notifContent}>
                                <View style={styles.notifHeader}>
                                    <Text style={[styles.titleText, unread && styles.unreadTitle]} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    {unread && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
                                <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </TouchableOpacity>
        );
    }, [openDetail, isUnread]);

    const ListEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubText}>No notifications to show.</Text>
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
                <TouchableOpacity onPress={markAllNotificationsAsRead} style={styles.markAllButton}>
                    <Ionicons name="checkmark-done" size={20} color="#8B5CF6" />
                    <Text style={styles.markAllText}>Mark All Read</Text>
                </TouchableOpacity>
            </View>

            {isLoading && notificationsData.length === 0 && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={{ color: '#9ca3af', marginTop: 16 }}>Loading notifications...</Text>
                </View>
            )}

            <SectionList
                sections={filtered}
                renderItem={renderItem}
                renderSectionHeader={sectionHeader}
                keyExtractor={(item) => item._id?.toString()}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isLoading}
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

            <RBSheet ref={rbSheetRef} height={380} openDuration={280} customStyles={{ container: styles.rbSheetContainer }}>
                {selected && (
                    <View style={styles.rbSheetContent}>
                        <View style={styles.rbSheetHeader}>
                            <View style={styles.rbSheetTitleRow}>
                                {(() => {
                                    const m = typeMeta[selected.type] || typeMeta.info;
                                    return <Ionicons name={m.icon} size={22} color={m.color} />;
                                })()}
                                <Text style={styles.rbSheetTitle}>{selected.title}</Text>
                            </View>
                            <TouchableOpacity onPress={() => rbSheetRef.current.close()}>
                                <Ionicons name="close" size={24} color="#e5e7eb" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.rbSheetMessage}>{selected.message}</Text>
                        <Text style={styles.rbSheetTime}>{formatDate(selected.createdAt)}</Text>
                        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
                            <Ionicons name="trash-outline" size={18} color="#F87171" />
                            <Text style={styles.dismissText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </RBSheet>
        </View>
    );
};

export default Notifications;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { paddingHorizontal: 12 },
    headerActions: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#000',
    },
    filterContainer: { flexDirection: 'row', gap: 8 },
    filterPill: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1e293b' },
    activePill: { backgroundColor: '#8B5CF6' },
    filterText: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
    activeText: { color: '#fff' },
    markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    markAllText: { color: '#8B5CF6', fontSize: 14, fontWeight: '500' },
    sectionHeader: {
        fontSize: 17, fontWeight: '700', color: '#e5e7eb',
        marginTop: 16, marginBottom: 8, paddingHorizontal: 4,
    },
    gradientBoxBorder: {
        borderRadius: 16, padding: 1.5, marginBottom: 12,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18, shadowRadius: 5, elevation: 4,
    },
    innerGradient: { borderRadius: 14.5, padding: 12 },
    notifRow: { flexDirection: 'row', gap: 12 },
    typeIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    notifContent: { flex: 1 },
    notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    titleText: { color: '#f3f4f6', fontSize: 15, fontWeight: '600', flex: 1 },
    unreadTitle: { fontWeight: '700' },
    unreadDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6',
    },
    messageText: { color: '#9ca3af', fontSize: 13, lineHeight: 18, marginBottom: 4 },
    timeText: { color: '#6B7280', fontSize: 11, textAlign: 'left' },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    emptyContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        padding: 40, marginTop: 100,
    },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#d1d5db', marginBottom: 8 },
    emptySubText: { fontSize: 15, color: '#9ca3af', textAlign: 'center' },
    rbSheetContainer: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    rbSheetContent: { padding: 24, flex: 1 },
    rbSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    rbSheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rbSheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    rbSheetMessage: { fontSize: 16, color: '#e5e7eb', lineHeight: 24, marginBottom: 16 },
    rbSheetTime: { fontSize: 14, color: '#9ca3af', marginBottom: 24 },
    dismissBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: 12, backgroundColor: '#1F2937',
        alignSelf: 'flex-start',
    },
    dismissText: { color: '#F87171', fontSize: 15, fontWeight: '600' },
});
