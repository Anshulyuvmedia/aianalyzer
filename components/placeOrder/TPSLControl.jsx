// components/placeOrder/TPSLControl.jsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

const TPSLInput = ({
    type,
    value,
    onChange,
    distancePips,
    onPipsChange,
    inputType,
    onInputTypeChange,
    priceNum,
    side,
    digits,
    color,
    icon,
    placeholder
}) => {
    const isPriceMode = inputType === 'price';

    return (
        <>
            <View style={styles.tpslRow}>
                <View style={styles.tpslLabelContainer}>
                    <Ionicons name={icon} size={16} color={color} />
                    <Text style={[styles.tpslLabel, { color }]}>{type}</Text>
                </View>

                <View style={styles.tpslInputContainer}>
                    <TouchableOpacity
                        style={[styles.tpslTypeButton, isPriceMode && styles.tpslTypeActive]}
                        onPress={() => onInputTypeChange('price')}
                    >
                        <Text style={[styles.tpslTypeText, isPriceMode && styles.tpslTypeTextActive]}>Price</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tpslTypeButton, !isPriceMode && styles.tpslTypeActive]}
                        onPress={() => onInputTypeChange('pips')}
                    >
                        <Text style={[styles.tpslTypeText, !isPriceMode && styles.tpslTypeTextActive]}>Pips</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isPriceMode ? (
                <TextInput
                    style={styles.tpslInput}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    placeholder={placeholder}
                    placeholderTextColor="#666"
                />
            ) : (
                <View style={styles.pipsInputWrapper}>
                    <TextInput
                        style={[styles.tpslInput, styles.pipsInput]}
                        value={distancePips}
                        onChangeText={onPipsChange}
                        keyboardType="decimal-pad"
                        placeholder="Distance in pips"
                        placeholderTextColor="#666"
                    />
                    <Text style={styles.pipsUnit}>pips</Text>
                </View>
            )}
        </>
    );
};

export const TPSLControl = ({
    enabled,
    onEnabledChange,
    stopLoss,
    onStopLossChange,
    takeProfit,
    onTakeProfitChange,
    slDistancePips,
    onSlPipsChange,
    tpDistancePips,
    onTpPipsChange,
    slType,
    onSlTypeChange,
    tpType,
    onTpTypeChange,
    priceNum,
    side,
    digits,
    slDistanceInPips,
    tpDistanceInPips,
    riskReward
}) => (
    <View style={styles.section}>
        <TouchableOpacity
            style={styles.tpslHeader}
            onPress={() => onEnabledChange(!enabled)}
            activeOpacity={0.7}
        >
            <View style={styles.tpslHeaderLeft}>
                <Ionicons name="shield-outline" size={20} color="#8B949E" />
                <Text style={styles.sectionLabel}>Stop Loss & Take Profit</Text>
            </View>
            <Switch
                value={enabled}
                onValueChange={onEnabledChange}
                trackColor={{ false: '#1E252E', true: '#22C55E' }}
                thumbColor={enabled ? '#FFFFFF' : '#f4f3f4'}
            />
        </TouchableOpacity>

        {enabled && (
            <View style={styles.tpslContainer}>
                <TPSLInput
                    type="Stop Loss"
                    value={stopLoss}
                    onChange={onStopLossChange}
                    distancePips={slDistancePips}
                    onPipsChange={onSlPipsChange}
                    inputType={slType}
                    onInputTypeChange={onSlTypeChange}
                    priceNum={priceNum}
                    side={side}
                    digits={digits}
                    color="#EF4444"
                    icon="alert-circle-outline"
                    placeholder={`SL Price (${side === 'buy' ? '<' : '>'} ${priceNum?.toFixed(digits)})`}
                />

                {stopLoss && slDistanceInPips && slType === 'price' && (
                    <Text style={styles.distanceHint}>
                        ≈ {slDistanceInPips} pips from entry
                    </Text>
                )}

                <TPSLInput
                    type="Take Profit"
                    value={takeProfit}
                    onChange={onTakeProfitChange}
                    distancePips={tpDistancePips}
                    onPipsChange={onTpPipsChange}
                    inputType={tpType}
                    onInputTypeChange={onTpTypeChange}
                    priceNum={priceNum}
                    side={side}
                    digits={digits}
                    color="#22C55E"
                    icon="flag-outline"
                    placeholder={`TP Price (${side === 'buy' ? '>' : '<'} ${priceNum?.toFixed(digits)})`}
                />

                {takeProfit && tpDistanceInPips && tpType === 'price' && (
                    <Text style={styles.distanceHint}>
                        ≈ {tpDistanceInPips} pips from entry
                    </Text>
                )}

                <View style={styles.riskRewardContainer}>
                    <Text style={styles.riskRewardLabel}>Risk/Reward Ratio</Text>
                    <Text style={styles.riskRewardValue}>
                        {riskReward || '—'}
                    </Text>
                </View>
            </View>
        )}
    </View>
);