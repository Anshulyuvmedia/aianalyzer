import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const LineChartComponent = ({ data, title }) => {
    const screenWidth = Dimensions.get('window').width;

    // Improved trend calculation
    const calculateTrend = (values) => {
        if (values.length < 2) return true; // Default to ascending for insufficient data

        // Step 1: Overall trend (first vs. last)
        const overallTrend = values[values.length - 1] - values[0];

        // Step 2: Step-by-step trend
        let ascendingCount = 0;
        let descendingCount = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[i] > values[i - 1]) ascendingCount++;
            else if (values[i] < values[i - 1]) descendingCount++;
            // Equal values are neutral, no increment
        }

        // Step 3: Decision rule
        if (overallTrend > 0) return true; // Clear ascending trend
        if (overallTrend < 0) return false; // Clear descending trend
        // If overall trend is neutral (first ≈ last), use step-by的所有step trend
        return ascendingCount >= descendingCount;
    };

    const isAscending = calculateTrend(data.values);
    const lineColor = isAscending ? '#05FF93' : '#FF5555'; // Green for ascending, red for descending

    // console.log('Data:', data.values, 'Trend:', isAscending ? 'Ascending (Green)' : 'Descending (Red)');

    const chartConfig = {
        backgroundGradientFrom: '#000',
        backgroundGradientTo: '#000',
        decimalPlaces: 0,
        color: (opacity = 1) => `${lineColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`, // Dynamic color with opacity
        labelColor: (opacity = 1) => `rgba(255, 255, 255, 0)`, // Make labels visible for testing
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '0',
            strokeWidth: '0',
            stroke: lineColor,
        },
    };

    return (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            {title && (
                <Text style={{ color: '#FFF', fontSize: 18, fontFamily: 'Sora-Bold', marginBottom: 10 }}>
                    {title}
                </Text>
            )}
            <LineChart
                data={{
                    labels: data.labels,
                    datasets: [
                        {
                            data: data.values,
                            strokeWidth: 4,
                        },
                    ],
                }}
                width={screenWidth - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
};

export default LineChartComponent;