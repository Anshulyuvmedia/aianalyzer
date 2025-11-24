import APIConfiguration from '@/components/APIConfiguration';
import HomeHeader from '@/components/HomeHeader';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
const Brokerapiconnect = () => {
    const { apiType } = useLocalSearchParams();
    console.log(apiType);
    return (
        <View style={styles.container}>
            <HomeHeader page="broker" title="Broker API" subtitle="Configure your broker API credentials for automated trading" />

            <View className="flex-1 mt-3">
                <APIConfiguration apiType={apiType} />
            </View>
        </View>
    )
}

export default Brokerapiconnect

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
})