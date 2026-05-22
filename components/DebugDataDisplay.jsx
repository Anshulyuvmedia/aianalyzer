// components/DebugDataDisplay.jsx
import React from 'react';
import { View, Text } from 'react-native';

export const DebugDataDisplay = ({ analysisData }) => {
    if (!analysisData) return null;

    const style = analysisData.analysisStyle;
    const data = analysisData;

    return (
        <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 5, zIndex: 999 }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>Style: {style}</Text>
            <Text style={{ color: '#22c55e', fontSize: 10 }}>Order Blocks: {data.orderBlocks?.length || 0}</Text>
            <Text style={{ color: '#ef4444', fontSize: 10 }}>FVGs: {data.fairValueGaps?.length || 0}</Text>
            <Text style={{ color: '#60a5fa', fontSize: 10 }}>Patterns: {data.patterns?.length || 0}</Text>
        </View>
    );
};