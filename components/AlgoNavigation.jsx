import { StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';

const AlgoNavigation = () => {
    const navigationItems = [
        { id: '1', title: 'Algo Dashboard', route: 'algodashboard' },
        { id: '2', title: 'Strategy Builder', route: '/algostrategybuilder' },
        { id: '3', title: 'FOX Strategy Builder', route: '/foxstrategybuilder' },
    ];

    const renderItem = ({ item }) => (
        <LinearGradient
            colors={['#9E68E4', '#723CDF']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.buttonGradientBorder}
        >
            <TouchableOpacity style={styles.button} onPress={() => router.push(item.route)}>
                <Text style={styles.buttonText}>{item.title}</Text>
            </TouchableOpacity>
        </LinearGradient>
    );

    return (
        <FlatList
            data={navigationItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonRow}
        />
    );
};

export default AlgoNavigation;

const styles = StyleSheet.create({
    buttonRow: {
        paddingHorizontal: 15,
        borderBottomColor: '#3C3B40',
        borderWidth: 1,
        paddingBottom: 15,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonGradientBorder: {
        borderRadius: 100,
        // width: '65%',
        marginHorizontal: 5, // Added to provide spacing between buttons
    },
    button: {
        flexDirection: 'row',
        paddingBottom: 10,
        paddingHorizontal: 15,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Questrial-Regular',
        lineHeight: 45,
    },
});