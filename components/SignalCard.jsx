import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const MetricItem = ({ label, value, isQuantity, onDecrease, onIncrease }) => (
    <LinearGradient
        colors={['#3C3B40', '#0C0C1800']} // Green gradient to match theme
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 0.6 }}
        style={styles.metricGradient}
    >
        <View style={styles.metricContainer}>
            <Text style={styles.metricLabel}>{label}</Text>
            {isQuantity ? (
                <View style={styles.quantityControls}>
                    <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.metricValue}>{value}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.metricValue}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </Text>
            )}
        </View>
    </LinearGradient>
);

const SignalCard = ({ item }) => {
    const [quantity, setQuantity] = React.useState(item.quantity);

    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    return (
        <LinearGradient
            colors={['#D2BDFF', '#0C0C1800']} // Green gradient for card border
            start={{ x: 0, y: 0 }}
            end={{ x: 0.2, y: 0.6 }}
            style={styles.cardGradient}
        >
            <View style={styles.cardbox}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.indicatorDot} />
                        <View>
                            <Text style={styles.stockName}>{item.stock}</Text>
                            <Text style={styles.subText}>{item.type}</Text>
                            <Text style={styles.subText}>{item.date}</Text>
                        </View>
                    </View>
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>Live</Text>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <MetricItem label="Entry" value={item.entry} />
                    <MetricItem label="Current/Exit" value={item.current} />
                    <MetricItem label="Target" value={item.target} />
                </View>

                <View style={styles.metricsRow}>
                    <MetricItem label="StopLoss" value={item.stopLoss} />
                    <MetricItem label="P&L/Target Hits" value="---" />
                    <MetricItem
                        label="Quantity"
                        value={quantity}
                        isQuantity
                        onDecrease={handleDecrease}
                        onIncrease={handleIncrease}
                    />
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButtonPrimary}>
                        <Text style={styles.actionButtonText}>Place Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary}>
                        <Text style={styles.actionButtonText}>About Signal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

export default SignalCard;

const styles = StyleSheet.create({
    cardGradient: {
        borderRadius: 25,
        padding: 1,
        marginTop: 5,
    },
    cardbox: {
        backgroundColor: '#000000', // Black background to match theme
        borderRadius: 25,
        padding: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'start',
    },
    indicatorDot: {
        width: 12, // Reduced from 24 (w-6) for consistency
        height: 12,
        borderRadius: 6,
        backgroundColor: '#8349FF', // Green to match theme
        marginRight: 8,
        marginTop: 8,
    },
    stockName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular', // Match Signals and SwingTrade
    },
    liveBadge: {
        backgroundColor: '#05FF93', // Green to match theme
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        elevation: 4, // Shadow for Android
        shadowColor: '#05FF93', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    liveText: {
        color: '#000000', // Black for contrast
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
    },
    subText: {
        color: '#A0A0A0',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    metricGradient: {
        borderRadius: 7,
        padding: 1,
        flex: 1,
        marginHorizontal: 4,
    },
    metricContainer: {
        alignItems: 'center',
        backgroundColor: '#000000', // Black background
        borderRadius: 7,
        padding: 12,
    },
    metricLabel: {
        color: '#A0A0A0',
        fontSize: 14,
        fontFamily: 'Questrial-Regular',
        borderBottomWidth: 1,
        borderBottomColor: '#3C3B40',
        paddingBottom: 4,
    },
    metricValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
        margin: 5,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityButton: {
        backgroundColor: '#000', // Green to match theme
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 0,

    },
    quantityButtonText: {
        color: '#fff', // Black for contrast
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButtonPrimary: {
        backgroundColor: '#723CDF', // Green to match theme
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    actionButtonSecondary: {
        backgroundColor: '#000000',
        borderColor: '#383848', // Green border
        borderWidth: 1,
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    actionButtonText: {
        color: '#fff', // Black for primary, white for secondary
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Questrial-Regular',
        textAlign: 'center',
    },
});