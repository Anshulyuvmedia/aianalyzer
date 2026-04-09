// app/(root)/components/orders/ModifyOrder/ModifyForm.jsx
import React from 'react';
import { View } from 'react-native';
import { LotSizeInput } from '@/components/placeOrder/LotSizeInput';
import { LimitPriceInput } from '@/components/placeOrder/LimitPriceInput';
import { TPSLControl } from '@/components/placeOrder/TPSLControl';

export const ModifyForm = ({
    isLimit,
    isStop,
    newLot,
    handleLotChange,
    handleLotBlur,
    increaseLot,
    decreaseLot,
    newPrice,
    setNewPrice,
    order,
    digits,
    ...rest
}) => {
    return (
        <View>

            <LotSizeInput
                lot={newLot}
                onLotChange={handleLotChange}
                onLotBlur={handleLotBlur}
                onIncrease={increaseLot}
                onDecrease={decreaseLot}
                symbol={order.symbol}
            />

            {(isLimit || isStop) && (
                <LimitPriceInput
                    price={newPrice}
                    onPriceChange={setNewPrice}
                    digits={digits}
                />
            )}

            <TPSLControl {...rest} />

        </View>
    );
};