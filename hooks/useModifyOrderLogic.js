// app/hooks/useModifyOrderLogic.js
import { useMemo, useCallback } from 'react';

export const useModifyOrderLogic = ({
    order,
    contextSymbolSpecs,
    accountInfo,
    newLot,
    newPrice,
    newStopLoss,
    newTakeProfit,
    enableTPSL,
    isLimit,
    isStop,
    showWarning
}) => {

    const symbol = order?.symbol;
    const spec = contextSymbolSpecs?.[symbol] || {};

    const digits = spec?.digits ?? 5;
    const pipSize = spec?.pipSize ?? 0.0001;

    const volumeStep = Number(spec.volumeStep || 0.01);
    const minLot = Number(spec.minVolume || 0.01);
    const maxLot = Number(spec.maxVolume || 100);
    const contractSize = Number(spec.contractSize || 100000);

    const stepPrecision = useMemo(() => {
        const stepStr = volumeStep.toString();
        const i = stepStr.indexOf('.');
        return i === -1 ? 0 : stepStr.length - i - 1;
    }, [volumeStep]);

    const lotNum = parseFloat(newLot) || 0;

    const priceNum = useMemo(() => {
        if (!order) return 0;
        return (isLimit || isStop)
            ? (parseFloat(newPrice) || order.price)
            : order.price;
    }, [newPrice, order, isLimit, isStop]);

    const quantity = lotNum * contractSize;
    const leverage = Number(accountInfo?.leverage || 100);

    const marginRequired = useMemo(() => {
        if (!priceNum) return 0;
        return (quantity * priceNum) / leverage;
    }, [quantity, priceNum, leverage]);

    const slDistanceInPips = useMemo(() => {
        if (!newStopLoss || !priceNum) return null;
        const sl = parseFloat(newStopLoss);
        if (isNaN(sl)) return null;
        return (Math.abs(priceNum - sl) / pipSize).toFixed(1);
    }, [newStopLoss, priceNum, pipSize]);

    const tpDistanceInPips = useMemo(() => {
        if (!newTakeProfit || !priceNum) return null;
        const tp = parseFloat(newTakeProfit);
        if (isNaN(tp)) return null;
        return (Math.abs(priceNum - tp) / pipSize).toFixed(1);
    }, [newTakeProfit, priceNum, pipSize]);

    const hasChanges = useMemo(() => {
        if (!order) return false;

        const lot = parseFloat(newLot);
        if (isNaN(lot)) return false;

        if (Math.abs(lot - order.volume) > 0.0001) return true;

        if ((isLimit || isStop) && newPrice) {
            if (Math.abs(parseFloat(newPrice) - order.price) > 0.00001) return true;
        }

        return false;
    }, [newLot, newPrice, order, isLimit, isStop]);

    const validateLotSize = useCallback(() => {
        if (lotNum <= 0) {
            showWarning('Invalid Volume', 'Volume must be > 0');
            return false;
        }
        if (lotNum < minLot) {
            showWarning('Too Small', `Min ${minLot}`);
            return false;
        }
        if (lotNum > maxLot) {
            showWarning('Too Large', `Max ${maxLot}`);
            return false;
        }
        return true;
    }, [lotNum, minLot, maxLot, showWarning]);

    return {
        digits,
        stepPrecision,
        lotNum,
        priceNum,
        quantity,
        marginRequired,
        slDistanceInPips,
        tpDistanceInPips,
        hasChanges,
        validateLotSize,
        minLot,
        maxLot,
        volumeStep
    };
};