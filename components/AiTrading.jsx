import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Alert, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STATUS_COLORS = {
  'Active': { bg: '#14532d', text: '#22c55e', dot: '#22c55e' },
  'Paused': { bg: '#78350f', text: '#f59e0b', dot: '#f59e0b' },
  'Not Started': { bg: '#1e293b', text: '#94a3b8', dot: '#64748b' },
  'starting': { bg: '#1e3a5f', text: '#60a5fa', dot: '#3b82f6' },
  'pausing': { bg: '#1e3a5f', text: '#f59e0b', dot: '#f59e0b' },
  'running': { bg: '#14532d', text: '#22c55e', dot: '#22c55e' },
  'error': { bg: '#7f1d1d', text: '#ef4444', dot: '#ef4444' },
};

const AiTrading = ({ strategy, algotradingData, lastTradeTime, pnl, engineStatus, onToggleStatus, onUnfollow, userConfig, configLoaded, onSaveConfig, capital }) => {
    const safeNumber = (val, def = 0) => {
        const num = Number(val);
        return isNaN(num) ? def : num;
    };

    const data = algotradingData?.aiTrading || {};

    const confidence = safeNumber(data?.confidence, null);
    const progress = confidence !== null ? Math.min(Math.max(confidence / 100, 0), 1) : 0;
    const winRate = safeNumber(data?.winRate, 0);
    const tradesExecuted = safeNumber(data?.tradesExecuted, 0);

    const liveStrategy = algotradingData?.strategies?.find(s => s._id === strategy?._id);
    const rawStatus = liveStrategy?.status || engineStatus?.status || strategy?.status || 'Paused';
    const statusColors = STATUS_COLORS[rawStatus] || STATUS_COLORS['Paused'];
    const isActive = rawStatus === 'Active' || rawStatus === 'running';
    const isNotStarted = rawStatus === 'Not Started';
    const isStarting = rawStatus === 'starting';

    const timeframe = data?.timeframe || strategy?.timeframes?.[0] || '—';
    const market = data?.symbol || strategy?.symbols?.[0] || '—';
    const pnlDisplay = safeNumber(pnl, 0);
    const pnlColor = pnlDisplay >= 0 ? '#22c55e' : '#ef4444';

    const [lastTradeAgo, setLastTradeAgo] = useState('—');
    const [editLotSize, setEditLotSize] = useState('');
    const [editRiskPercent, setEditRiskPercent] = useState('');
    const [configSaved, setConfigSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userConfig) {
            setEditLotSize(String(userConfig.lotSize ?? ''));
            setEditRiskPercent(String(userConfig.riskPercent ?? ''));
            setConfigSaved(true);
        }
    }, [userConfig]);

    const handleSave = async () => {
        const lotSize = parseFloat(editLotSize);
        const riskPercent = parseFloat(editRiskPercent);
        if (!lotSize || lotSize <= 0) {
            Alert.alert('Invalid Lot Size', 'Please enter a valid lot size greater than 0.');
            return;
        }
        if (!riskPercent || riskPercent <= 0 || riskPercent > 50) {
            Alert.alert('Invalid Risk %', 'Please enter a risk percentage between 0.1 and 50.');
            return;
        }
        setSaving(true);
        const ok = await onSaveConfig?.(strategy?._id, { lotSize, riskPercent });
        if (ok) setConfigSaved(true);
        setSaving(false);
    };

    const configDirty = () => {
        if (!userConfig) return editLotSize !== '' || editRiskPercent !== '';
        return editLotSize !== String(userConfig.lotSize ?? '') || editRiskPercent !== String(userConfig.riskPercent ?? '');
    };

    const confidenceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!lastTradeTime) { setLastTradeAgo('—'); return; }
        const interval = setInterval(() => {
            const diff = Date.now() - lastTradeTime;
            if (diff < 1000) setLastTradeAgo('Just now');
            else if (diff < 60000) setLastTradeAgo(`${Math.floor(diff / 1000)}s ago`);
            else setLastTradeAgo(`${Math.floor(diff / 60000)}m ago`);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastTradeTime]);

    useEffect(() => {
        if (confidence === null) return;
        Animated.timing(confidenceAnim, {
            toValue: progress, duration: 800, useNativeDriver: true,
        }).start();
    }, [progress]);

    const handleToggle = () => {
        if (isStarting) return;
        if (!configSaved && (isNotStarted || rawStatus === 'Paused')) {
            Alert.alert('Save Required', 'Please save your lot size and risk settings before starting the strategy.');
            return;
        }
        if (onToggleStatus) onToggleStatus(strategy?._id);
    };

    const handleUnfollow = () => {
        if (!strategy?.name) return;
        Alert.alert(
            'Unfollow Strategy',
            `Remove "${strategy.name}" from your portfolio?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unfollow', style: 'destructive',
                    onPress: () => onUnfollow && onUnfollow(strategy?._id),
                },
            ]
        );
    };

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.strategyName} numberOfLines={1}>
                        {strategy?.name || 'AI Trading Engine'}
                    </Text>
                    <Text style={styles.marketInfo}>{market} &middot; {timeframe}</Text>
                </View>

                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
                    <Text style={[styles.statusLabel, { color: statusColors.text }]}>
                        {rawStatus.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* ── METRICS ── */}
            <View style={styles.metricsRow}>
                <View style={styles.metric}>
                    <Text style={styles.metricValue}>{winRate.toFixed(1)}%</Text>
                    <Text style={styles.metricLabel}>Win Rate</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: pnlColor }]}>
                        {pnlDisplay >= 0 ? '+' : ''}{pnlDisplay.toFixed(2)}
                    </Text>
                    <Text style={styles.metricLabel}>PnL</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metric}>
                    <Text style={styles.metricValue}>{tradesExecuted}</Text>
                    <Text style={styles.metricLabel}>Trades</Text>
                </View>
            </View>

            {/* ── LAST TRADE ── */}
            <View style={styles.lastTradeRow}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.lastTradeText}>Last trade &middot; {lastTradeAgo}</Text>
            </View>

            {/* ── AI INSIGHT ── */}
            {data?.confidence !== undefined && data?.sentiment !== undefined && (
                <View style={styles.aiContainer}>
                    <View style={styles.sentimentBox}>
                        <Text style={styles.sectionLabel}>Sentiment</Text>
                        <Text style={[
                            styles.sentimentValue,
                            { color: data.sentiment === 'BULLISH' ? '#22c55e' : data.sentiment === 'BEARISH' ? '#ef4444' : '#94a3b8' }
                        ]}>
                            {data.sentiment === 'BULLISH' ? '▲' : data.sentiment === 'BEARISH' ? '▼' : '—'} {data.sentiment || 'NEUTRAL'}
                        </Text>
                    </View>

                    <Svg height={80} width={80} viewBox="0 0 80 80">
                        <Circle cx="40" cy="40" r="30" stroke="#1e2937" strokeWidth="6" fill="none" />
                        <AnimatedCircle
                            cx="40" cy="40" r="30" stroke="#22c55e" strokeWidth="6" fill="none"
                            strokeDasharray="188.5"
                            strokeDashoffset={Animated.multiply(Animated.subtract(1, confidenceAnim), 188.5)}
                            strokeLinecap="round" rotation="-90" origin="40,40"
                        />
                        <SvgText x="40" y="40" textAnchor="middle" dy=".35em" fill="#f1f5f9" fontSize="16" fontWeight="700">
                            {Math.round(confidence)}%
                        </SvgText>
                    </Svg>
                    <Text style={styles.confidenceLabel}>Confidence</Text>
                </View>
            )}

            {/* ── ENGINE STATUS ── */}
            {engineStatus?.message && (
                <View style={[styles.statusMsg, isStarting && styles.statusMsgStarting]}>
                    <Ionicons
                        name={isStarting ? 'sync-circle' : 'information-circle'}
                        size={16} color={isStarting ? '#60a5fa' : '#94a3b8'}
                    />
                    <Text style={[styles.statusMsgText, isStarting && { color: '#60a5fa' }]}>
                        {engineStatus.message}
                    </Text>
                </View>
            )}

            {/* ── CONFIGURATION ── */}
            {configLoaded && !isActive && (
                <View style={styles.configSection}>
                    <View style={styles.capitalRow}>
                        <MaterialCommunityIcons name="bank" size={16} color="#64748b" />
                        <Text style={styles.capitalLabel}>Required Capital: </Text>
                        <Text style={styles.capitalValue}>${capital.toLocaleString()}</Text>
                    </View>
                    <View style={styles.configRow}>
                        <View style={styles.configInputWrap}>
                            <Text style={styles.configLabel}>Lot Size</Text>
                            <TextInput
                                style={styles.configInput}
                                placeholder="0.01"
                                placeholderTextColor="#4B5563"
                                keyboardType="decimal-pad"
                                value={editLotSize}
                                onChangeText={setEditLotSize}
                            />
                        </View>
                        <View style={styles.configInputWrap}>
                            <Text style={styles.configLabel}>Risk per Trade %</Text>
                            <TextInput
                                style={styles.configInput}
                                placeholder="1.0"
                                placeholderTextColor="#4B5563"
                                keyboardType="decimal-pad"
                                value={editRiskPercent}
                                onChangeText={setEditRiskPercent}
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveBtn, configDirty() && styles.saveBtnDirty]}
                        onPress={handleSave}
                        disabled={saving || !configDirty()}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons
                            name={configDirty() ? 'content-save' : 'check-circle'}
                            size={18}
                            color={configDirty() ? '#22c55e' : '#64748b'}
                        />
                        <Text style={[styles.saveBtnText, configDirty() && { color: '#22c55e' }]}>
                            {saving ? 'Saving...' : configDirty() ? 'Save Settings' : 'Settings Saved'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {configLoaded && isActive && (
                <View style={styles.configLocked}>
                    <MaterialCommunityIcons name="lock" size={14} color="#22c55e" />
                    <Text style={styles.configLockedText}>
                        Lot: {userConfig?.lotSize || '—'} • Risk: {userConfig?.riskPercent || '—'}%
                    </Text>
                </View>
            )}

            {/* ── ACTIONS ── */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[
                        styles.actionBtn,
                        isActive ? styles.actionPause : styles.actionPlay,
                        isStarting && styles.actionDisabled,
                    ]}
                    onPress={handleToggle}
                    disabled={isStarting}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isActive ? 'pause' : 'play'}
                        size={18}
                        color={isActive ? '#f59e0b' : '#22c55e'}
                    />
                    <Text style={[
                        styles.actionLabel,
                        { color: isActive ? '#f59e0b' : '#22c55e' }
                    ]}>
                        {isActive ? 'Pause' : isNotStarted ? 'Start' : 'Resume'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={handleUnfollow}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="account-minus" size={18} color="#f87171" />
                    <Text style={styles.actionLabelSecondary}>Unfollow</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

export default AiTrading;

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    // ── HEADER ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: { flex: 1, marginRight: 12 },
    strategyName: {
        color: '#f8fafc',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
        textTransform: 'capitalize',
    },
    marketInfo: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#1e293b',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    // ── METRICS ──
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15,23,42,0.6)',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#1e2937',
    },
    metric: { flex: 1, alignItems: 'center' },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f1f5f9',
    },
    metricLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 3,
        fontWeight: '500',
    },
    metricDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#1e2937',
    },
    // ── LAST TRADE ──
    lastTradeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        marginBottom: 4,
    },
    lastTradeText: {
        color: '#64748b',
        fontSize: 12.5,
    },
    // ── AI INSIGHT ──
    aiContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(15,23,42,0.6)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1e2937',
        marginTop: 14,
    },
    sentimentBox: { flex: 1 },
    sectionLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 4,
    },
    sentimentValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    confidenceLabel: {
        marginTop: 6,
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    // ── ENGINE STATUS ──
    statusMsg: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
        padding: 12,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#334155',
    },
    statusMsgStarting: {
        borderLeftColor: '#3b82f6',
    },
    statusMsgText: {
        color: '#94a3b8',
        fontSize: 13,
        flex: 1,
    },
    // ── ACTIONS ──
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionPlay: {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
    },
    actionPause: {
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.08)',
    },
    actionDisabled: {
        opacity: 0.4,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionBtnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#7f1d1d',
        backgroundColor: 'rgba(239,68,68,0.06)',
    },
    actionLabelSecondary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f87171',
    },
    // ── CONFIG ──
    configSection: {
        marginTop: 14,
        backgroundColor: 'rgba(15,23,42,0.6)',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1e2937',
    },
    capitalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    capitalLabel: {
        color: '#94a3b8',
        fontSize: 13,
    },
    capitalValue: {
        color: '#f1f5f9',
        fontSize: 13,
        fontWeight: '700',
    },
    configRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    configInputWrap: {
        flex: 1,
    },
    configLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 4,
    },
    configInput: {
        backgroundColor: '#0f172a',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#f1f5f9',
        fontSize: 15,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#334155',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: '#111827',
    },
    saveBtnDirty: {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    configLocked: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 8,
        backgroundColor: '#14532d20',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#22c55e30',
    },
    configLockedText: {
        color: '#22c55e',
        fontSize: 13,
        fontWeight: '500',
    },
});
