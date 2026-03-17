import React, { useContext } from "react";
import HomeHeader from '@/components/HomeHeader';
import { View, Text, FlatList, StyleSheet } from "react-native";
import { BrokerContext } from "@/context/BrokerContext";

export default function OrdersScreen() {

    const { orders = [] } = useContext(BrokerContext);

    const renderOrder = ({ item }) => {
        const isBuy = item.type.includes("BUY");
        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={[
                        styles.side,
                        isBuy ? styles.buy : styles.sell
                    ]}>
                        {isBuy ? "BUY" : "SELL"} {item.volume}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Order Type</Text>
                    <Text style={styles.value}>
                        {item.type.replace("ORDER_TYPE_", "")}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Price</Text>
                    <Text style={styles.value}>
                        {item.price}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>
                        {item.state}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'My Orders'} />
            {!orders.length &&
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No pending orders</Text>
                </View>
            }
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id?.toString()}
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
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    label: {
        color: "#8B949E"
    },
    value: {
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
    empty: {
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