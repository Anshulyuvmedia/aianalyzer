import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Polyline } from 'react-native-svg';

const EquityCurve = ({ trades }) => {
    let cumulative = 0;

    const points = trades.map((t, i) => {
        cumulative += t.pnl;
        return `${i * 20},${100 - cumulative}`;
    }).join(" ");

    return (
        <Svg height="120" width="100%">
            <Polyline
                points={points}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
            />
        </Svg>
    );
};

export default EquityCurve

const styles = StyleSheet.create({})