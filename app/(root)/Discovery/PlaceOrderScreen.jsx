// app/(root)/Discovery/PlaceOrderScreen.jsx
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInstruments } from '@/context/InstrumentContext';
import { BrokerContext } from '@/context/BrokerContext';
import HomeHeader from '@/components/HomeHeader';
import { ToastNotification } from '@/components/ToastNotification';
import { DialogModal } from '@/components/DialogModal';
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';
import { styles } from '@/components/placeOrder/styles';
import { SideSelector } from '@/components/placeOrder/SideSelector';
import { OrderTypeSelector } from '@/components/placeOrder/OrderTypeSelector';
import { LotSizeInput } from '@/components/placeOrder/LotSizeInput';
import { LimitPriceInput } from '@/components/placeOrder/LimitPriceInput';
import { TPSLControl } from '@/components/placeOrder/TPSLControl';
import { OrderSummary } from '@/components/placeOrder/OrderSummary';
import { OrderConfirmationSheet } from '@/components/placeOrder/OrderConfirmationSheet';

export default function PlaceOrderScreen() {
    const { selectedInstrument, quoteData, symbolSpecs, placeOrder } = useInstruments();
    const { accountInfo, fetchPositions } = useContext(BrokerContext);
    const router = useRouter();
    const params = useLocalSearchParams();
    const confirmSheetRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);

    // Toast and Dialog hooks
    const { toast, hideToast, showSuccess, showError, showWarning, showInfo } = useToast();
    const { dialog, hideDialog, showError: showDialogError, showSuccess: showDialogSuccess, showConfirm } = useDialog();

    // Get params
    const symbol = Array.isArray(params.symbol)
        ? params.symbol[0]
        : params.symbol?.toString() ?? '';

    const transactionType = Array.isArray(params.transactionType)
        ? params.transactionType[0]
        : params.transactionType?.toString() ?? 'buy';

    const initialSide = (transactionType === 'buy' || transactionType === 'sell')
        ? transactionType
        : 'buy';

    // Form state
    const [orderType, setOrderType] = useState('market');
    const [side, setSide] = useState(initialSide);
    const [lot, setLot] = useState('0.01');
    const [price, setPrice] = useState('');

    // TP/SL State
    const [enableTPSL, setEnableTPSL] = useState(false);
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [slDistancePips, setSlDistancePips] = useState('');
    const [tpDistancePips, setTpDistancePips] = useState('');
    const [slType, setSlType] = useState('price');
    const [tpType, setTpType] = useState('price');

    // Instrument specs with dynamic lot handling
    const spec = symbolSpecs?.[symbol] || {};
    const digits = spec?.digits ?? 5;
    const pipSize = spec?.pipSize ?? 0.0001;

    // Dynamic lot configuration based on instrument
    const volumeStep = Number(spec.volumeStep || 0.01);
    const maxLot = Number(spec.maxVolume || 100);
    const minLot = Number(spec.minVolume || 0.01);

    // Calculate step precision dynamically (e.g., 0.001 -> 3 decimal places)
    const getStepPrecision = (step) => {
        const stepStr = step.toString();
        const decimalIndex = stepStr.indexOf('.');
        return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
    };

    const stepPrecision = getStepPrecision(volumeStep);

    // Format lot value with correct precision
    const formatLotValue = useCallback((value) => {
        return value.toFixed(stepPrecision);
    }, [stepPrecision]);

    // Validate if lot is multiple of volume step
    const isValidLotStep = useCallback((value) => {
        if (volumeStep === 0) return true;
        const remainder = (value / volumeStep) % 1;
        return Math.abs(remainder) < 1e-10;
    }, [volumeStep]);

    // Get min lot with proper precision
    const formattedMinLot = useMemo(() => minLot.toFixed(stepPrecision), [minLot, stepPrecision]);
    const formattedMaxLot = useMemo(() => maxLot.toFixed(stepPrecision), [maxLot, stepPrecision]);

    // Quote data
    const ask = Number(quoteData?.ask);
    const bid = Number(quoteData?.bid);
    const spread = ask - bid;
    const currentPrice = side === "buy" ? (isNaN(ask) ? 0 : ask) : (isNaN(bid) ? 0 : bid);
    const instrumentName = selectedInstrument?.name || (spec?.description);

    // Calculations
    const lotNum = Number(lot) || 0;
    const priceNum = orderType === 'limit' ? Number(price) || currentPrice : currentPrice;
    const contractSize = Number(spec?.contractSize ?? 1);
    const quantity = lotNum * contractSize;
    const estimatedValue = quantity * priceNum;
    const leverage = Number(accountInfo?.leverage || 100);
    const balance = Number(accountInfo?.balance || 0);
    const freeMargin = Number(accountInfo?.freeMargin || balance);
    const marginRequired = useMemo(() => (quantity * priceNum) / leverage, [quantity, priceNum, leverage]);
    const freeMarginAfterTrade = freeMargin - marginRequired;

    // Pip distance calculations
    const slDistanceInPips = useMemo(() => {
        if (!stopLoss || !currentPrice) return null;
        const sl = Number(stopLoss);
        const distance = Math.abs(currentPrice - sl);
        return (distance / pipSize).toFixed(1);
    }, [stopLoss, currentPrice, pipSize]);

    const tpDistanceInPips = useMemo(() => {
        if (!takeProfit || !currentPrice) return null;
        const tp = Number(takeProfit);
        const distance = Math.abs(currentPrice - tp);
        return (distance / pipSize).toFixed(1);
    }, [takeProfit, currentPrice, pipSize]);

    const riskReward = stopLoss && takeProfit
        ? `1:${(Math.abs(Number(takeProfit) - priceNum) / Math.abs(Number(stopLoss) - priceNum)).toFixed(2)}`
        : null;

    const isTradeAllowed = accountInfo?.tradeAllowed &&
        accountInfo?.synchronized &&
        lotNum > 0 &&
        priceNum > 0 &&
        freeMargin > 0 &&
        marginRequired <= freeMargin;

    // Effects
    useEffect(() => {
        if (orderType === 'limit' && !price && currentPrice > 0) {
            setPrice(currentPrice.toFixed(digits));
        }
    }, [orderType, currentPrice, price, digits]);

    useEffect(() => {
        if (enableTPSL) {
            setStopLoss('');
            setTakeProfit('');
            setSlDistancePips('');
            setTpDistancePips('');
        }
    }, [side, enableTPSL]);

    // Update initial lot to respect min lot when instrument loads
    useEffect(() => {
        if (minLot > 0 && Number(lot) < minLot) {
            setLot(formatLotValue(minLot));
        }
    }, [minLot, formatLotValue]);

    useEffect(() => {
        if (!enableTPSL) return;

        if (slType === 'pips' && slDistancePips && currentPrice > 0) {
            const distance = Number(slDistancePips) * pipSize;
            const newSL = side === 'buy' ? currentPrice - distance : currentPrice + distance;
            setStopLoss(newSL.toFixed(digits));
        }

        if (tpType === 'pips' && tpDistancePips && currentPrice > 0) {
            const distance = Number(tpDistancePips) * pipSize;
            const newTP = side === 'buy' ? currentPrice + distance : currentPrice - distance;
            setTakeProfit(newTP.toFixed(digits));
        }
    }, [slDistancePips, tpDistancePips, slType, tpType, currentPrice, side, pipSize, digits, enableTPSL]);

    // Validation functions
    const validateLotSize = useCallback(() => {
        if (lotNum <= 0) {
            showWarning('Invalid Volume', 'Volume must be greater than 0');
            return false;
        }

        // Check minimum lot
        if (lotNum < minLot - 1e-10) {
            showWarning('Volume Too Small', `Minimum volume is ${formattedMinLot}`);
            return false;
        }

        // Check maximum lot
        if (lotNum > maxLot + 1e-10) {
            showWarning('Volume Too Large', `Maximum volume is ${formattedMaxLot}`);
            return false;
        }

        // Check lot step (must be multiple of volumeStep)
        if (!isValidLotStep(lotNum)) {
            showWarning('Invalid Volume Step', `Volume must be a multiple of ${volumeStep} (e.g., ${formatLotValue(volumeStep)}, ${formatLotValue(volumeStep * 2)}, etc.)`);
            return false;
        }

        return true;
    }, [lotNum, minLot, maxLot, volumeStep, formattedMinLot, formattedMaxLot, formatLotValue, isValidLotStep, showWarning]);

    const validateTPSL = useCallback(() => {
        if (!enableTPSL) return true;

        const sl = Number(stopLoss);
        const tp = Number(takeProfit);
        const entry = priceNum;

        if (stopLoss && isNaN(sl)) {
            showError('Invalid Stop Loss', 'Please enter a valid stop loss price');
            return false;
        }

        if (takeProfit && isNaN(tp)) {
            showError('Invalid Take Profit', 'Please enter a valid take profit price');
            return false;
        }

        if (stopLoss && sl) {
            if (side === 'buy' && sl >= entry - 1e-10) {
                showError('Invalid Stop Loss', 'Stop loss must be below entry price for BUY orders');
                return false;
            }
            if (side === 'sell' && sl <= entry + 1e-10) {
                showError('Invalid Stop Loss', 'Stop loss must be above entry price for SELL orders');
                return false;
            }
        }

        if (takeProfit && tp) {
            if (side === 'buy' && tp <= entry + 1e-10) {
                showError('Invalid Take Profit', 'Take profit must be above entry price for BUY orders');
                return false;
            }
            if (side === 'sell' && tp >= entry - 1e-10) {
                showError('Invalid Take Profit', 'Take profit must be below entry price for SELL orders');
                return false;
            }
        }

        if (stopLoss && takeProfit && sl && tp) {
            if (side === 'buy' && sl >= tp - 1e-10) {
                showError('Invalid Levels', 'Stop loss must be below take profit');
                return false;
            }
            if (side === 'sell' && sl <= tp + 1e-10) {
                showError('Invalid Levels', 'Stop loss must be above take profit');
                return false;
            }
        }

        // Check minimum distance (10 pips or broker's minimum)
        const minDistancePips = 10;
        const minDistance = minDistancePips * pipSize;

        if (stopLoss && sl && Math.abs(entry - sl) < minDistance - 1e-10) {
            showError('Stop Loss Too Close', `Minimum distance is ${minDistancePips} pips`);
            return false;
        }

        if (takeProfit && tp && Math.abs(entry - tp) < minDistance - 1e-10) {
            showError('Take Profit Too Close', `Minimum distance is ${minDistancePips} pips`);
            return false;
        }

        return true;
    }, [enableTPSL, stopLoss, takeProfit, priceNum, side, pipSize, showError]);

    const handlePlaceOrder = useCallback(() => {
        // Validate lot size first
        if (!validateLotSize()) return;

        if (orderType === 'limit' && priceNum <= 0) {
            showWarning('Invalid Price', 'Please enter a valid limit price');
            return;
        }
        if (!validateTPSL()) return;

        if (!accountInfo?.tradeAllowed) {
            showError('Trading Disabled', 'Trading is currently disabled for this account.');
            return;
        }

        if (!accountInfo?.synchronized) {
            showError('Connection Issue', 'Trading server is not synchronized. Please reconnect.');
            return;
        }

        confirmSheetRef.current?.open();
    }, [validateLotSize, orderType, priceNum, validateTPSL, accountInfo, showError, showWarning]);

    const submitOrder = useCallback(async () => {
        if (marginRequired > freeMargin + 1e-10) {
            showError('Insufficient Margin', "You don't have enough margin to place this trade.");
            return;
        }

        const payload = {
            symbol,
            side,
            orderType,
            volume: lotNum,
            price: orderType === 'limit' ? priceNum : null,
            stopLoss: enableTPSL && stopLoss ? Number(stopLoss) : null,
            takeProfit: enableTPSL && takeProfit ? Number(takeProfit) : null,
        };

        if (submitting) return;
        setSubmitting(true);

        try {
            const result = await placeOrder(payload);
            if (!result?.success) {
                throw new Error(result?.message || "Order rejected");
            }
            confirmSheetRef.current?.close();

            showDialogSuccess(
                'Order Executed',
                `${side.toUpperCase()} ${lotNum} ${symbol} successfully${enableTPSL ? ' with TP/SL' : ''}`,
                async () => {
                    await fetchPositions();
                    setTimeout(() => router.back(), 400);
                }
            );
        } catch (err) {
            showError('Order Failed', err?.message || "Failed to place order");
        } finally {
            setSubmitting(false);
        }
    }, [marginRequired, freeMargin, symbol, side, orderType, lotNum, priceNum, enableTPSL, stopLoss, takeProfit, submitting, placeOrder, fetchPositions, router, showError, showDialogSuccess]);

    // Lot handlers with dynamic step precision
    const normalizeLot = useCallback((value) => {
        const num = Number(value);
        if (isNaN(num)) return lot;

        // Round to nearest valid step
        const steps = Math.round(num / volumeStep);
        const normalized = Math.max(minLot, Math.min(maxLot, steps * volumeStep));

        return normalized.toFixed(stepPrecision);
    }, [lot, volumeStep, minLot, maxLot, stepPrecision]);

    const handleLotChange = useCallback((value) => {
        const cleaned = value.replace(',', '.');
        // Allow decimal input with appropriate precision
        const decimalRegex = new RegExp(`^\\d*\\.?\\d{0,${stepPrecision}}$`);
        if (!decimalRegex.test(cleaned) && cleaned !== '') return;
        setLot(cleaned);
    }, [stepPrecision]);

    const handleLotBlur = useCallback(() => {
        const normalized = normalizeLot(lot);
        setLot(normalized);
    }, [lot, normalizeLot]);

    const increaseLot = useCallback(() => {
        setLot((prev) => {
            const current = Number(prev);
            const next = Math.min(maxLot, current + volumeStep);
            return next.toFixed(stepPrecision);
        });
    }, [maxLot, volumeStep, stepPrecision]);

    const decreaseLot = useCallback(() => {
        setLot((prev) => {
            const current = Number(prev);
            const next = Math.max(minLot, current - volumeStep);
            return next.toFixed(stepPrecision);
        });
    }, [minLot, volumeStep, stepPrecision]);

    const handleSlPipsChange = useCallback((value) => {
        const num = Number(value);
        setSlDistancePips(isNaN(num) ? '' : num.toFixed(1));
    }, []);

    const handleTpPipsChange = useCallback((value) => {
        const num = Number(value);
        setTpDistancePips(isNaN(num) ? '' : num.toFixed(1));
    }, []);

    return (
        <>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <HomeHeader page="discovery" title={symbol} subtitle={instrumentName} />

                    <SideSelector side={side} onSideChange={setSide} />
                    <OrderTypeSelector orderType={orderType} onOrderTypeChange={setOrderType} />

                    <LotSizeInput
                        lot={lot}
                        onLotChange={handleLotChange}
                        onLotBlur={handleLotBlur}
                        onIncrease={increaseLot}
                        onDecrease={decreaseLot}
                        contractSize={contractSize}
                        symbol={symbol}
                        minLot={formattedMinLot}
                        maxLot={formattedMaxLot}
                        volumeStep={volumeStep}
                        stepPrecision={stepPrecision}
                    />

                    {orderType === 'limit' && (
                        <LimitPriceInput price={price} onPriceChange={setPrice} digits={digits} />
                    )}

                    <TPSLControl
                        enabled={enableTPSL}
                        onEnabledChange={setEnableTPSL}
                        stopLoss={stopLoss}
                        onStopLossChange={setStopLoss}
                        takeProfit={takeProfit}
                        onTakeProfitChange={setTakeProfit}
                        slDistancePips={slDistancePips}
                        onSlPipsChange={handleSlPipsChange}
                        tpDistancePips={tpDistancePips}
                        onTpPipsChange={handleTpPipsChange}
                        slType={slType}
                        onSlTypeChange={setSlType}
                        tpType={tpType}
                        onTpTypeChange={setTpType}
                        priceNum={priceNum}
                        side={side}
                        digits={digits}
                        slDistanceInPips={slDistanceInPips}
                        tpDistanceInPips={tpDistanceInPips}
                        riskReward={riskReward}
                    />

                    <OrderSummary
                        balance={balance}
                        quantity={quantity}
                        symbol={symbol}
                        estimatedValue={estimatedValue}
                        currentPrice={currentPrice}
                        marginRequired={marginRequired}
                        margin={accountInfo?.margin}
                        equity={accountInfo?.equity}
                        credit={accountInfo?.credit}
                        spread={spread}
                        digits={digits}
                    />
                </ScrollView>

                <View style={styles.bottomBar}>
                    {marginRequired > freeMargin + 1e-10 && (
                        <Text style={styles.marginWarningText}>Insufficient margin to place this trade.</Text>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            side === "buy" ? styles.confirmBuy : styles.confirmSell,
                            !isTradeAllowed && { opacity: 0.4 }
                        ]}
                        disabled={!isTradeAllowed}
                        onPress={handlePlaceOrder}
                    >
                        <Text style={styles.confirmButtonText}>
                            {side === "buy" ? 'Buy' : 'Sell'} {symbol}
                        </Text>
                    </TouchableOpacity>
                </View>

                <OrderConfirmationSheet
                    ref={confirmSheetRef}
                    side={side}
                    symbol={symbol}
                    orderType={orderType}
                    lotNum={lotNum}
                    priceNum={priceNum}
                    digits={digits}
                    enableTPSL={enableTPSL}
                    stopLoss={stopLoss}
                    takeProfit={takeProfit}
                    slDistanceInPips={slDistanceInPips}
                    tpDistanceInPips={tpDistanceInPips}
                    estimatedValue={estimatedValue}
                    marginRequired={marginRequired}
                    leverage={leverage}
                    freeMarginAfterTrade={freeMarginAfterTrade}
                    freeMargin={freeMargin}
                    isTradeAllowed={isTradeAllowed}
                    submitting={submitting}
                    onConfirm={submitOrder}
                    onClose={() => confirmSheetRef.current?.close()}
                />
            </KeyboardAvoidingView>

            {/* Toast and Dialog Components */}
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
        </>
    );
}