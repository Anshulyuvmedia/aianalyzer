// app/(root)/Portfolio/modifyOrder/[id].jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { BrokerContext } from "@/context/BrokerContext";
import { useInstruments } from "@/context/InstrumentContext";

import HomeHeader from "@/components/HomeHeader";
import { ToastNotification } from "@/components/ToastNotification";
import { DialogModal } from "@/components/DialogModal";
import { useToast } from "@/hooks/useToast";
import { useDialog } from "@/hooks/useDialog";

import OrderConfirmationSheet from "@/components/placeOrder/OrderConfirmationSheet";
import { useModifyOrderLogic } from "@/hooks/useModifyOrderLogic";

import { OrderInfoCard } from "@/components/orders/ModifyOrder/OrderInfoCard";
import { ModifyForm } from "@/components/orders/ModifyOrder/ModifyForm";
import { SummaryCard } from "@/components/orders/ModifyOrder/SummaryCard";

export default function ModifyOrderScreen() {
    const { orderData } = useLocalSearchParams();
    const router = useRouter();

    const { symbolSpecs } = useInstruments();
    const { accountInfo, modifyOrder, fetchOrders, loading } = useContext(BrokerContext);

    const confirmSheetRef = useRef(null);

    // Use toast for warnings/errors, dialog for success message
    const { toast, hideToast, showError, showWarning } = useToast();
    const { dialog, hideDialog, showSuccess: showDialogSuccess } = useDialog();

    // ================= STATE =================
    const [order, setOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [newLot, setNewLot] = useState("0.01");
    const [newPrice, setNewPrice] = useState("");
    const [enableTPSL, setEnableTPSL] = useState(false);
    const [newStopLoss, setNewStopLoss] = useState("");
    const [newTakeProfit, setNewTakeProfit] = useState("");

    const [slDistancePips, setSlDistancePips] = useState("");
    const [tpDistancePips, setTpDistancePips] = useState("");

    const [slType, setSlType] = useState("price");
    const [tpType, setTpType] = useState("price");

    // ================= PARSE ORDER =================
    useEffect(() => {
        if (!orderData) return;

        try {
            const parsed =
                typeof orderData === "string" ? JSON.parse(orderData) : orderData;

            const safeOrder = {
                id: parsed?.id ?? "",
                symbol: parsed?.symbol ?? "UNKNOWN",
                type: parsed?.type ?? "ORDER_TYPE_BUY",
                side: parsed?.side ?? (parsed?.type?.includes("BUY") ? "buy" : "sell"),
                isLimit: parsed?.isLimit ?? parsed?.type?.includes("LIMIT"),
                isStop: parsed?.isStop ?? parsed?.type?.includes("STOP"),
                volume: parsed?.volume ?? parsed?.currentVolume ?? 0.01,
                price: parsed?.openPrice ?? parsed?.price ?? 0,
                marketPrice: parsed?.currentPrice,
                stopLoss: parsed?.stopLoss ?? null,
                takeProfit: parsed?.takeProfit ?? null,
            };

            setOrder(safeOrder);

            setNewLot(String(safeOrder.volume));
            setNewPrice(String(safeOrder.price));

            setEnableTPSL(!!(safeOrder.stopLoss || safeOrder.takeProfit));
            setNewStopLoss(safeOrder.stopLoss?.toString() || "");
            setNewTakeProfit(safeOrder.takeProfit?.toString() || "");

        } catch (err) {
            console.log("Parse error", err);
            showError("Error", "Invalid order data");
        }
    }, [orderData]);

    // ================= SAFE FLAGS =================
    const side = order?.side || "buy";
    const isLimit = order?.isLimit || false;
    const isStop = order?.isStop || false;

    // ================= LOGIC =================
    const {
        digits,
        lotNum,
        priceNum,
        quantity,
        marginRequired,
        slDistanceInPips,
        tpDistanceInPips,
        hasChanges,
        validateLotSize,
    } = useModifyOrderLogic({
        order,
        contextSymbolSpecs: symbolSpecs,
        accountInfo,
        newLot,
        newPrice,
        newStopLoss,
        newTakeProfit,
        enableTPSL,
        isLimit,
        isStop,
        showWarning,
    });

    // ================= MODIFY =================
    const handleModifyOrder = useCallback(() => {
        if (!hasChanges) {
            showWarning("No Changes", "No modifications made");
            return;
        }

        if (!validateLotSize()) return;

        confirmSheetRef.current?.open();
    }, [hasChanges, validateLotSize]);

    const submitModification = async () => {
        if (!order) return;

        setSubmitting(true);

        try {
            const payload = {};

            // Only include volume if it changed
            if (lotNum !== order.volume) {
                payload.volume = lotNum;
            }

            // Only include price for pending orders AND if it changed
            if ((isLimit || isStop) && priceNum !== order.price) {
                payload.price = priceNum;
            }

            // Handle Stop Loss
            const currentSL = order.stopLoss;
            const newSL = enableTPSL && newStopLoss && newStopLoss.trim() !== '' ? parseFloat(newStopLoss) : null;

            if (newSL !== currentSL) {
                payload.stopLoss = newSL;
            }

            // Handle Take Profit
            const currentTP = order.takeProfit;
            const newTP = enableTPSL && newTakeProfit && newTakeProfit.trim() !== '' ? parseFloat(newTakeProfit) : null;

            if (newTP !== currentTP) {
                payload.takeProfit = newTP;
            }

            // Don't send empty payload
            if (Object.keys(payload).length === 0) {
                showWarning("No Changes", "No modifications to apply");
                setSubmitting(false);
                return;
            }

            console.log('Submitting modification payload:', payload);
            await modifyOrder(order.id, payload);

            // Show success dialog (modal) like in PlaceOrderScreen
            showDialogSuccess("Success", "Order modified successfully", () => {
                fetchOrders();
                router.back();
            });

        } catch (e) {
            console.error('Modification error:', e);
            showError("Error", e.message || "Modification failed");
            setSubmitting(false);
        }
    };

    // ================= LOADING =================
    if (!order) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // ================= UI =================
    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <HomeHeader
                        title={`Modify ${(order.symbol || "Order").toString()}`}
                        subtitle={`Order #${order.id}`}
                    />

                    <View style={styles.box}>
                        <OrderInfoCard order={order} digits={digits} styles={styles} />

                        <ModifyForm
                            isLimit={isLimit}
                            isStop={isStop}
                            newLot={newLot}
                            handleLotChange={setNewLot}
                            newPrice={newPrice}
                            setNewPrice={setNewPrice}
                            order={order}
                            digits={digits}
                            enabled={enableTPSL}
                            onEnabledChange={setEnableTPSL}
                            stopLoss={newStopLoss}
                            onStopLossChange={setNewStopLoss}
                            takeProfit={newTakeProfit}
                            onTakeProfitChange={setNewTakeProfit}
                            slDistanceInPips={slDistanceInPips}
                            tpDistanceInPips={tpDistanceInPips}
                            slType={slType}
                            onSlTypeChange={setSlType}
                            tpType={tpType}
                            onTpTypeChange={setTpType}
                            priceNum={priceNum}
                            side={side}
                        />

                        <SummaryCard
                            quantity={quantity}
                            priceNum={priceNum}
                            marginRequired={marginRequired}
                            styles={styles}
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={handleModifyOrder}
                    style={styles.button}
                >
                    <Text style={{ color: "#fff" }}>
                        {submitting ? "Processing..." : "Apply Changes"}
                    </Text>
                </TouchableOpacity>

                <OrderConfirmationSheet
                    ref={confirmSheetRef}
                    side={side}
                    symbol={order.symbol}
                    orderType={isLimit ? "limit" : isStop ? "stop" : "market"}
                    lotNum={lotNum}
                    priceNum={priceNum}
                    digits={digits}
                    enableTPSL={enableTPSL}
                    stopLoss={newStopLoss}
                    takeProfit={newTakeProfit}
                    slDistanceInPips={slDistanceInPips}
                    tpDistanceInPips={tpDistanceInPips}
                    estimatedValue={quantity * priceNum}
                    marginRequired={marginRequired}
                    leverage={accountInfo?.leverage || 100}
                    freeMargin={accountInfo?.freeMargin || accountInfo?.balance || 0}
                    freeMarginAfterTrade={(accountInfo?.freeMargin || accountInfo?.balance || 0) - marginRequired}
                    isTradeAllowed={true}
                    submitting={submitting}
                    onConfirm={submitModification}
                    onClose={() => confirmSheetRef.current?.close()}
                />
            </KeyboardAvoidingView>

            <ToastNotification {...toast} onHide={hideToast} />
            <DialogModal {...dialog} onCancel={hideDialog} />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    box: { paddingHorizontal: 10 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    button: {
        backgroundColor: "#3B82F6",
        padding: 15,
        margin: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    card: {
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    label: { color: "#aaa" },
    value: { color: "#fff" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    loadingText: { color: "#8B949E", fontSize: 14, marginTop: 12 },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        padding: 20,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    backButton: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    orderInfoCard: {
        backgroundColor: "#0D1117",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        // marginTop: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#30363D",
    },
    orderInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    orderInfoLabel: { color: "#8B949E", fontSize: 14, fontWeight: "500" },
    orderInfoValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
