import React, { useContext } from "react";
import HomeHeader from '@/components/HomeHeader';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { BrokerContext } from "@/context/BrokerContext";
import { useInstruments } from "@/context/InstrumentContext";

export default function PositionsScreen() {

    const { positions } = useContext(BrokerContext);
    const { quoteData = {}, symbolSpecs = {} } = useInstruments();

    const calculatePnL = (position, price, spec) => {
        if (!price) return 0;

        const contractSize = spec.contractSize || 100000;
        const lot = position.volume || 0;

        if (position.side === "buy") {
            return (price - position.entryPrice) * contractSize * lot;
        }

        return (position.entryPrice - price) * contractSize * lot;
    };

    const renderPosition = ({ item }) => {

        const spec = symbolSpecs?.[item.symbol] || {};
        const digits = spec?.digits ?? 5;

        const ask = Number(quoteData?.ask);
        const bid = Number(quoteData?.bid);

        const currentPrice =
            item.side === "buy"
                ? (isNaN(ask) ? item.entryPrice : ask)
                : (isNaN(bid) ? item.entryPrice : bid);

        const pnl = calculatePnL(item, currentPrice, spec);

        return (
            <View style={styles.card}>

                <View style={styles.row}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={[
                        styles.side,
                        item.side === "buy" ? styles.buy : styles.sell
                    ]}>
                        {item?.side || null} {item.volume}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Entry</Text>
                    <Text style={styles.value}>
                        {Number(item.entryPrice || 0).toFixed(digits)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Current</Text>
                    <Text style={styles.value}>
                        {Number(currentPrice || 0).toFixed(digits)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>PnL</Text>
                    <Text style={[
                        styles.pnl,
                        pnl >= 0 ? styles.profit : styles.loss
                    ]}>
                        ${Number(pnl).toFixed(2)}
                    </Text>
                </View>

                <TouchableOpacity style={styles.closeButton}>
                    <Text style={styles.closeText}>Close Position</Text>
                </TouchableOpacity>

            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Positions'} />
            {!positions.length &&
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No open positions</Text>
                </View>
            }
            <FlatList
                data={positions}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                renderItem={renderPosition}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#000"
    },

    card: {
        backgroundColor: "#161B22",
        padding: 16,
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 10
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4
    },

    symbol: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff"
    },

    side: {
        fontWeight: "600"
    },

    buy: {
        color: "#22c55e"
    },

    sell: {
        color: "#ef4444"
    },

    label: {
        color: "#8B949E"
    },

    value: {
        color: "#fff"
    },

    pnl: {
        fontWeight: "700"
    },

    profit: {
        color: "#22c55e"
    },

    loss: {
        color: "#ef4444"
    },

    closeButton: {
        marginTop: 12,
        backgroundColor: "#EF4444",
        padding: 10,
        borderRadius: 6,
        alignItems: "center"
    },

    closeText: {
        color: "#fff",
        fontWeight: "600"
    },

    emptyContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center"
    },

    emptyText: {
        color: "#8B949E",
        fontSize: 16
    }

});