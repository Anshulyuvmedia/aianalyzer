import APIConfiguration from '@/components/APIConfiguration';
import HomeHeader from '@/components/HomeHeader';
import { StyleSheet, View } from 'react-native';
const Brokerapiconnect = () => {
    return (
        <View style={styles.container}>
            <HomeHeader page="broker" title="Broker API" subtitle="Configure your broker API credentials for automated trading" />
            <APIConfiguration />
        </View>
    )
}

export default Brokerapiconnect

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})