import AIMarketInsights from '@/components/AIMarketInsights';
import HomeHeader from '@/components/HomeHeader';
import OverallAnalysis from '@/components/OverallAnalysis';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';


const OverallanalysisResult = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    // const [aiInsights, setAiInsights] = useState(null);


    useEffect(() => {
        const fetchOverallAnalysisData = async () => {
            const savedUser = await AsyncStorage.getItem("userData");
            const parsedUser = JSON.parse(savedUser);
            const { _id } = parsedUser;
            try {
                const response = await axios.get('http://192.168.1.42:3000/api/appdata/get-chart-analysis', { params: { userid: _id } });
                setAnalysisData(response.data);
                // console.log(response.data?.analysisData?.[0]?.analysisData?.aiInsights);
                // setAiInsights(response.data?.analysisData?.[0]?.analysisData?.aiInsights);

            } catch (error) {
                console.error("Failed to fetch overall analysis data:", error);
            }
        };

        fetchOverallAnalysisData();
    }, []);


    const components = [
        { id: '1', component: <OverallAnalysis data={analysisData} /> },
        // { id: '2', component: <AIMarketInsights data={analysisData} /> },

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
            <HomeHeader page="Home" title="Overall Analysis Result" subtitle="AI-powered chart pattern recognition and technical analysis" />

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

export default OverallanalysisResult;

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