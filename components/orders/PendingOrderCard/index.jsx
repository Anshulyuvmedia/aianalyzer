// components/orders/PendingOrderCard/index.jsx
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import PendingOrderCardContent from './PendingOrderCardContent';

export default function PendingOrderCard({
    order,
    onCancel,
    isCancelling,
    isModifying,
    formatPrice,
    symbolSpecs
}) {
    if (!order || !order.id) {
        return null;
    }

    const isBuy = order.type?.includes("BUY") || false;
    const isLimit = order.type?.includes("LIMIT") || false;
    const isStop = order.type?.includes("STOP") || false;

    const handleModifyPress = useCallback(() => {
        router.push({
            pathname: '/Portfolio/modifyOrder/[id]',
            params: {
                id: order.id,
                orderData: JSON.stringify(order)
            }
        });
    }, [order]);

    const handleCancelPress = useCallback(() => {
        onCancel(order);
    }, [onCancel, order]);

    return (
        <TouchableOpacity activeOpacity={0.7}>
            <PendingOrderCardContent
                order={order}
                isBuy={isBuy}
                isLimit={isLimit}
                isStop={isStop}
                isCancelling={isCancelling}
                isModifying={isModifying}
                onModify={handleModifyPress}
                onCancel={handleCancelPress}
                formatPrice={formatPrice}
            />
        </TouchableOpacity>
    );
}