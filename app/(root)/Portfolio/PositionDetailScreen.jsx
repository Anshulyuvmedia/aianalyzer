// app/(root)/Portfolio/PositionDetailScreen.jsx
import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrokerContext } from '@/context/BrokerContext';
import { useInstruments } from '@/context/InstrumentContext';
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';
import { ToastNotification } from '@/components/ToastNotification';
import { DialogModal } from '@/components/DialogModal';
import HomeHeader from '@/components/HomeHeader';

const InfoRow = ({ label, value, valueColor, isImportant = false }) => (
    <View style={[styles.infoRow, isImportant && styles.importantRow]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
            {value}
        </Text>
    </View>
);

const Section = ({ title, children, icon }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={20} color="#22c55e" />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
            {children}
        </View>
    </View>
);

const TPSLModal = ({ visible, onClose, onSave, type, currentValue, symbol, digits, isBuy, currentPrice }) => {
    const [value, setValue] = useState(currentValue?.toString() || '');
    const [priceType, setPriceType] = useState(currentValue ? 'price' : 'price');

    const handleSave = () => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return;
        }
        onSave(type, numValue);
        onClose();
    };

    const handleClear = () => {
        onSave(type, null);
        onClose();
    };

    const suggestedPrice = type === 'stopLoss'
        ? (isBuy ? currentPrice * 0.99 : currentPrice * 1.01)
        : (isBuy ? currentPrice * 1.01 : currentPrice * 0.99);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {type === 'stopLoss' ? 'Set Stop Loss' : 'Set Take Profit'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#8B949E" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.priceTypeSelector}>
                            <TouchableOpacity
                                style={[styles.priceTypeButton, priceType === 'price' && styles.priceTypeActive]}
                                onPress={() => setPriceType('price')}
                            >
                                <Text style={[styles.priceTypeText, priceType === 'price' && styles.priceTypeTextActive]}>Price</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.priceTypeButton, priceType === 'pips' && styles.priceTypeActive]}
                                onPress={() => setPriceType('pips')}
                            >
                                <Text style={[styles.priceTypeText, priceType === 'pips' && styles.priceTypeTextActive]}>Pips</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.modalInput}
                            value={value}
                            onChangeText={setValue}
                            keyboardType="decimal-pad"
                            placeholder={`Enter ${type === 'stopLoss' ? 'stop loss' : 'take profit'} ${priceType}`}
                            placeholderTextColor="#666"
                        />

                        <TouchableOpacity style={styles.suggestedButton} onPress={() => setValue(suggestedPrice.toFixed(digits))}>
                            <Text style={styles.suggestedButtonText}>Use Suggested: {suggestedPrice.toFixed(digits)}</Text>
                        </TouchableOpacity>

                        {currentValue && (
                            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                <Text style={styles.clearButtonText}>Clear {type === 'stopLoss' ? 'Stop Loss' : 'Take Profit'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
                            <Text style={styles.modalSaveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ClosePositionModal = ({ visible, onClose, onConfirm, symbol, volume, currentPrice, pnl }) => {
    const [closeVolume, setCloseVolume] = useState(volume.toString());
    const isPartial = parseFloat(closeVolume) !== volume;

    const handleConfirm = () => {
        const vol = parseFloat(closeVolume);
        if (isNaN(vol) || vol <= 0) return;
        onConfirm(vol === volume ? null : vol);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Close Position</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#8B949E" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.positionInfo}>
                            <Text style={styles.positionInfoSymbol}>{symbol}</Text>
                            <Text style={[styles.positionInfoPnl, pnl >= 0 ? styles.profitText : styles.lossText]}>
                                PnL: ${Math.abs(pnl).toFixed(2)} {pnl >= 0 ? '▲' : '▼'}
                            </Text>
                        </View>

                        <View style={styles.volumeInputContainer}>
                            <Text style={styles.volumeLabel}>Volume to close (lots)</Text>
                            <View style={styles.volumeInputRow}>
                                <TouchableOpacity
                                    style={styles.volumeAdjustButton}
                                    onPress={() => setCloseVolume(prev => Math.max(0.01, parseFloat(prev) - 0.01).toFixed(2))}
                                >
                                    <Text style={styles.volumeAdjustText}>-</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.volumeInput}
                                    value={closeVolume}
                                    onChangeText={setCloseVolume}
                                    keyboardType="decimal-pad"
                                />
                                <TouchableOpacity
                                    style={styles.volumeAdjustButton}
                                    onPress={() => setCloseVolume(prev => (parseFloat(prev) + 0.01).toFixed(2))}
                                >
                                    <Text style={styles.volumeAdjustText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.volumeHint}>Max: {volume} lots</Text>
                        </View>

                        {isPartial && (
                            <View style={styles.partialWarning}>
                                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                                <Text style={styles.partialWarningText}>
                                    Partial close will reduce position size to {Math.max(0, volume - parseFloat(closeVolume)).toFixed(2)} lots
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalSaveButton, styles.closeButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.modalSaveText}>
                                {isPartial ? `Close ${closeVolume} lots` : 'Close Full Position'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function PositionDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { positions, fetchPositions, closePosition, getPositionDetails, modifyPosition } = useContext(BrokerContext);
    const { quoteData = {}, symbolSpecs = {}, fetchQuote } = useInstruments();
    const { toast, hideToast, showSuccess, showError, showWarning } = useToast();
    const { dialog, hideDialog, showConfirm, showError: showDialogError } = useDialog();

    const [refreshing, setRefreshing] = useState(false);
    const [position, setPosition] = useState(null);
    const [showTPSLModal, setShowTPSLModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [tpslType, setTpslType] = useState(null);

    const positionId = params.id;

    useEffect(() => {
        if (positionId) {
            loadPositionDetails();
        }
    }, [positionId]);

    const loadPositionDetails = async () => {
        try {
            const details = await getPositionDetails(positionId);
            if (details) {
                setPosition(details);
                // Fix: Remove this console.log or use the new details
                // console.log('Position details loaded:', details);
                if (details.symbol) {
                    fetchQuote(details.symbol);
                }
            } else {
                showWarning('Position Closed', 'This position has been closed');
                setTimeout(() => router.back(), 2000);
            }
        } catch (err) {
            console.warn('Failed to load position details:', err);
            if (positions.length > 0) {
                const found = positions.find(p => p.id?.toString() === positionId?.toString());
                if (found) {
                    setPosition(found);
                    fetchQuote(found.symbol);
                }
            }
        }
    };

    const spec = useMemo(() => symbolSpecs?.[position?.symbol] || {}, [symbolSpecs, position]);
    const digits = spec?.digits ?? 5;
    const pipSize = spec?.pipSize ?? 0.0001;
    const contractSize = spec?.contractSize ?? 100000;
    const isBuy = position?.type === 'POSITION_TYPE_BUY';
    const currentPrice = isBuy ? quoteData?.ask : quoteData?.bid;
    const currentPriceNum = Number(currentPrice) || position?.currentPrice || position?.openPrice || 0;

    const calculatePnL = useCallback(() => {
        if (!position) return 0;
        if (position.pnl !== undefined) return position.pnl;
        const lot = position.volume || 0;
        if (isBuy) {
            return (currentPriceNum - position.openPrice) * contractSize * lot;
        }
        return (position.openPrice - currentPriceNum) * contractSize * lot;
    }, [position, isBuy, currentPriceNum, contractSize]);

    const calculatePnLPercentage = useCallback(() => {
        const pnl = calculatePnL();
        const invested = position?.openPrice * (position?.volume || 0) * contractSize;
        return invested > 0 ? (pnl / invested) * 100 : 0;
    }, [calculatePnL, position, contractSize]);

    const formatPrice = (price) => Number(price || 0).toFixed(digits);
    const formatVolume = (volume) => volume?.toFixed(2) || "0.00";

    const formatCurrency = (value) => {
        const absValue = Math.abs(value);
        return `${value >= 0 ? '$' : '-$'}${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const pnl = calculatePnL();
    const pnlPercentage = calculatePnLPercentage();
    const isProfit = pnl >= 0;

    const handleModifyTPSL = (type) => {
        setTpslType(type);
        setShowTPSLModal(true);
    };

    const handleSaveTPSL = async (type, value) => {
        try {
            const payload = { positionId: position.id };
            if (type === 'stopLoss') {
                payload.stopLoss = value;
            } else {
                payload.takeProfit = value;
            }

            await modifyPosition(payload);

            // Update local position state immediately
            setPosition(prev => ({
                ...prev,
                [type === 'stopLoss' ? 'stopLoss' : 'takeProfit']: value
            }));

            showSuccess('Success', `${type === 'stopLoss' ? 'Stop Loss' : 'Take Profit'} updated successfully`);
            setShowTPSLModal(false);

        } catch (error) {
            showError('Error', error.message || 'Failed to update');
        }
    };

    const handleClosePosition = async (volume = null) => {
        try {
            await closePosition(position.id, volume);
            showSuccess('Success', volume ? `Closed ${volume} lots` : 'Position closed successfully');
            setTimeout(() => router.back(), 500);
        } catch (error) {
            showError('Error', error.message || 'Failed to close position');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPositionDetails();
        if (position?.symbol) {
            await fetchQuote(position.symbol);
        }
        setRefreshing(false);
    };

    if (!position) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>Loading position details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HomeHeader page="portfolio" title="Position Details" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
                }
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.symbol}>{position.symbol}</Text>
                            <View style={styles.typeContainer}>
                                <View style={[styles.typeBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                                    <Text style={styles.typeText}>{isBuy ? 'LONG' : 'SHORT'}</Text>
                                </View>
                                <Text style={styles.volume}>{formatVolume(position.volume)} lots</Text>
                            </View>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                                <Ionicons name="refresh-outline" size={22} color="#22c55e" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.pnlContainer}>
                        <Text style={styles.pnlLabel}>Unrealized P&L</Text>
                        <Text style={[styles.pnlValue, isProfit ? styles.profitText : styles.lossText]}>
                            {formatCurrency(pnl)}
                        </Text>
                        <Text style={[styles.pnlPercentage, isProfit ? styles.profitText : styles.lossText]}>
                            {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Entry Price</Text>
                            <Text style={styles.priceValue}>{formatPrice(position.openPrice)}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#8B949E" />
                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Current Price</Text>
                            <Text style={styles.priceValue}>{formatPrice(currentPriceNum)}</Text>
                        </View>
                    </View>
                </View>

                {/* TP/SL Section */}
                <Section title="Stop Loss & Take Profit" icon="shield-outline">
                    <View style={styles.tpslGrid}>
                        <TouchableOpacity
                            style={styles.tpslCard}
                            onPress={() => handleModifyTPSL('stopLoss')}
                        >
                            <View style={styles.tpslCardHeader}>
                                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                <Text style={styles.tpslCardTitle}>Stop Loss</Text>
                            </View>
                            <Text style={styles.tpslCardValue}>
                                {position.stopLoss ? formatPrice(position.stopLoss) : 'Not set'}
                            </Text>
                            <Text style={styles.tpslCardAction}>Tap to modify →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.tpslCard}
                            onPress={() => handleModifyTPSL('takeProfit')}
                        >
                            <View style={styles.tpslCardHeader}>
                                <Ionicons name="flag" size={20} color="#22c55e" />
                                <Text style={styles.tpslCardTitle}>Take Profit</Text>
                            </View>
                            <Text style={styles.tpslCardValue}>
                                {position.takeProfit ? formatPrice(position.takeProfit) : 'Not set'}
                            </Text>
                            <Text style={styles.tpslCardAction}>Tap to modify →</Text>
                        </TouchableOpacity>
                    </View>
                </Section>

                {/* Position Details Section */}
                <Section title="Position Details" icon="information-circle-outline">
                    <InfoRow label="Position ID" value={position.id} />
                    <InfoRow label="Open Time" value={position.time ? new Date(position.time).toLocaleString() : '--'} />
                    <InfoRow label="Volume" value={`${formatVolume(position.volume)} lots (${(position.volume * contractSize).toLocaleString()} units)`} />
                    <InfoRow label="Contract Size" value={`${contractSize.toLocaleString()} units`} />
                    <InfoRow label="Leverage" value={`1:${spec?.leverage || 100}`} />
                    <InfoRow label="Margin Required" value={formatCurrency((position.openPrice * position.volume * contractSize) / (spec?.leverage || 100))} />
                    <InfoRow label="Swap" value={formatCurrency(position.swap || 0)} />
                    <InfoRow label="Commission" value={formatCurrency(position.commission || 0)} />
                </Section>
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={() => setShowCloseModal(true)}
                >
                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Close Position</Text>
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <TPSLModal
                visible={showTPSLModal}
                onClose={() => setShowTPSLModal(false)}
                onSave={handleSaveTPSL}
                type={tpslType}
                currentValue={tpslType === 'stopLoss' ? position.stopLoss : position.takeProfit}
                symbol={position.symbol}
                digits={digits}
                isBuy={isBuy}
                currentPrice={currentPriceNum}
            />

            <ClosePositionModal
                visible={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                onConfirm={handleClosePosition}
                symbol={position.symbol}
                volume={position.volume}
                currentPrice={currentPriceNum}
                pnl={pnl}
            />

            <ToastNotification
                visible={toast.visible}
                type={toast.type}
                message={toast.message}
                onHide={hideToast}
            />

            <DialogModal
                visible={dialog.visible}
                type={dialog.type}
                title={dialog.title}
                message={dialog.message}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                onConfirm={dialog.onConfirm}
                onCancel={dialog.onCancel}
                singleButton={dialog.singleButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    loadingText: { color: "#8B949E", marginTop: 12, fontSize: 14 },

    headerCard: { backgroundColor: "#161B22", margin: 16, marginTop: 8, borderRadius: 16, padding: 20 },
    headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    symbol: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 8 },
    typeContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    buyBadge: { backgroundColor: "#22c55e20" },
    sellBadge: { backgroundColor: "#ef444420" },
    typeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    volume: { color: "#8B949E", fontSize: 12 },

    pnlContainer: { alignItems: "center", marginBottom: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#0D1117" },
    pnlLabel: { color: "#8B949E", fontSize: 12, marginBottom: 8 },
    pnlValue: { fontSize: 36, fontWeight: "700", marginBottom: 4 },
    pnlPercentage: { fontSize: 14, fontWeight: "600" },
    profitText: { color: "#22c55e" },
    lossText: { color: "#ef4444" },

    priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16 },
    priceItem: { flex: 1, alignItems: "center" },
    priceLabel: { color: "#8B949E", fontSize: 12, marginBottom: 6 },
    priceValue: { color: "#fff", fontSize: 18, fontWeight: "600" },

    tpslGrid: { flexDirection: "row", gap: 12 },
    tpslCard: { flex: 1, backgroundColor: "#0D1117", borderRadius: 12, padding: 16 },
    tpslCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    tpslCardTitle: { color: "#8B949E", fontSize: 14 },
    tpslCardValue: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
    tpslCardAction: { color: "#22c55e", fontSize: 12 },

    section: { backgroundColor: "#161B22", marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: "hidden" },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: "#0D1117" },
    sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
    sectionContent: { padding: 16 },

    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#0D1117" },
    infoLabel: { color: "#8B949E", fontSize: 13 },
    infoValue: { color: "#fff", fontSize: 13, fontWeight: "500" },

    bottomActions: { flexDirection: "row", padding: 16, gap: 12, backgroundColor: "#000", borderTopWidth: 1, borderTopColor: "#161B22" },
    actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12 },
    closeButton: { backgroundColor: "#ef4444" },
    actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#161B22", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 400 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
    modalBody: { flex: 1 },
    modalFooter: { flexDirection: "row", gap: 12, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#0D1117" },
    modalCancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0D1117", alignItems: "center" },
    modalCancelText: { color: "#8B949E", fontSize: 16, fontWeight: "600" },
    modalSaveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#22c55e", alignItems: "center" },
    modalSaveText: { color: "#000", fontSize: 16, fontWeight: "700" },

    modalInput: { backgroundColor: "#0D1117", color: "#fff", fontSize: 18, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#1E252E" },

    priceTypeSelector: { flexDirection: "row", backgroundColor: "#0D1117", borderRadius: 12, padding: 4, marginBottom: 16 },
    priceTypeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
    priceTypeActive: { backgroundColor: "#22c55e" },
    priceTypeText: { color: "#8B949E", fontSize: 14 },
    priceTypeTextActive: { color: "#000", fontWeight: "600" },

    suggestedButton: { paddingVertical: 12, alignItems: "center", marginTop: 8 },
    suggestedButtonText: { color: "#22c55e", fontSize: 14 },
    clearButton: { paddingVertical: 12, alignItems: "center", marginTop: 8 },
    clearButtonText: { color: "#ef4444", fontSize: 14 },

    positionInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    positionInfoSymbol: { color: "#fff", fontSize: 18, fontWeight: "600" },
    positionInfoPnl: { fontSize: 16, fontWeight: "600" },

    volumeInputContainer: { marginBottom: 16 },
    volumeLabel: { color: "#8B949E", fontSize: 14, marginBottom: 8 },
    volumeInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    volumeAdjustButton: { width: 44, height: 44, backgroundColor: "#0D1117", borderRadius: 12, justifyContent: "center", alignItems: "center" },
    volumeAdjustText: { color: "#fff", fontSize: 24, fontWeight: "600" },
    volumeInput: { flex: 1, backgroundColor: "#0D1117", color: "#fff", fontSize: 18, padding: 12, borderRadius: 12, textAlign: "center", borderWidth: 1, borderColor: "#1E252E" },
    volumeHint: { color: "#8B949E", fontSize: 12, marginTop: 8 },

    partialWarning: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F59E0B20", padding: 12, borderRadius: 8, marginTop: 12 },
    partialWarningText: { color: "#F59E0B", fontSize: 12, flex: 1 },
    refreshButton: {
        padding: 2,
        backgroundColor: "#161B22",
        borderRadius: 8,
        marginRight: 8,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
});