import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
const CourseScreen = () => {
    const { id } = useLocalSearchParams();
    return (
        <View style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 10 }}>
            <Text style={{ color: '#FFF' }}>Course Details for ID: {id}</Text>
        </View>
    )
}

export default CourseScreen

const styles = StyleSheet.create({})