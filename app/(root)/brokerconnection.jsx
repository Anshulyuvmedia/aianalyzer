import HomeHeader from '@/components/HomeHeader';
import ReferralAccess from '@/components/ReferralAccess';
import SupportedBrokers from '@/components/SupportedBrokers';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

const BrokerConnection = () => {
    const [refreshing, setRefreshing] = useState(false);

    const components = [
        { id: '1', component: <ReferralAccess /> },
        // { id: '2', component: <APIConfiguration /> },
        { id: '3', component: <SupportedBrokers /> },

    ];
    const renderItem = ({ item }) => (
        <View style={styles.section}>
            {item.component}
        </View>
    );

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate a refresh action (e.g., fetching new data)
        setTimeout(() => {
            setRefreshing(false);
        }, 2000); // Replace with actual data fetching logic
    };
    return (
        <View style={styles.container}>
            <HomeHeader page="broker" title="Broker Connection" subtitle="Configure your broker API credentials for automated trading" />

            <FlatList
                data={components}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#34C759', '#FF3B15']} // Custom colors for the refresh indicator
                        progressBackgroundColor="#1e2836" // Background color of the refresh circle
                    />
                }
            />
        </View>
    )
}

export default BrokerConnection

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    section: {
        marginBottom: 10,
    },
})