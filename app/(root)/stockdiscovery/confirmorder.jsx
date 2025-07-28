import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HomeHeader from '@/components/HomeHeader';
import LinearGradient from 'react-native-linear-gradient';

const ConfirmOrder = () => {
    const { stock, action, quantity, orderType, price, totalValue } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <HomeHeader page={'chatbot'} title={'Place Order'} />

            <View stlye={styles.section}>

                <LinearGradient
                    colors={['#3E3E4580', '#0C0C1800', '#706F72']}
                    start={{ x: 0.2, y: 1.2 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.gradientBorder, { padding: 1 }]}
                >
                    <View style={styles.detailsContainer}>

                        <Text style={styles.title}>Order Summary</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Stock:</Text>
                            <Text style={styles.value}>{stock}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Action:</Text>
                            <Text style={styles.value}>{action}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Quantity:</Text>
                            <Text style={styles.value}>{quantity}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Order Type:</Text>
                            <Text style={styles.value}>{orderType}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Price:</Text>
                            <Text style={styles.value}>₹{price}</Text>
                        </View>
                        <View style={[styles.detailRow, styles.totalRow]}>
                            <Text style={styles.label}>Total Value:</Text>
                            <Text style={styles.totalValue}>₹{totalValue}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={() => console.log('Order confirmed')}>
                                <Text style={styles.cfnbuttonText}>Confirm Order</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

export default ConfirmOrder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
        // borderRadius: 20,
        alignItems: 'center',

    },
    section: {
        marginVertical: 'auto',
        // flex: 1,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
    },
    detailsContainer: {
        padding: 15,
        backgroundColor: '#11111c',
        borderRadius: 20,
    },
    title: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    label: {
        color: '#A9A9A9',
        fontSize: 16,
    },
    value: {
        color: '#FFF',
        fontSize: 16,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#FFF',
        paddingTop: 15,
    },
    totalValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#05FF93',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        flex: 1,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cfnbuttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});