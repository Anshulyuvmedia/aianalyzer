import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;

const IndexPieChart = () => {
    const indicesData = {
        'NIFTY 50': {
            data: [
                { name: 'Others', value: 52.14, color: '#34C759' },
                { name: 'HDFCLIFE', value: -12.82, color: '#FF3B30' },
                { name: 'JSWSTEEL', value: 12.41, color: '#28A745' },
                { name: 'SHRIRAMFIN', value: 12.04, color: '#20C997' },
                { name: 'ADANIPORTS', value: 10.32, color: '#17A2B8' },
                { name: 'TECHM', value: 9.32, color: '#007BFF' },
                { name: 'TITAN', value: 8.76, color: '#6610F2' },
                { name: 'Apollohosp', value: 16.90, color: '#28A745' },
                { name: 'Grasim', value: 16.80, color: '#20C997' },
                { name: 'Ultracemco', value: 19.11, color: '#17A2B8' },
            ],
            change: '145 pts',
        },
        'SENSEX': {
            data: [
                { name: 'Reliance', value: 28.50, color: '#34C759' },
                { name: 'TCS', value: 15.75, color: '#28A745' },
                { name: 'HDFC Bank', value: -10.20, color: '#FF3B30' },
                { name: 'Infosys', value: 12.30, color: '#20C997' },
                { name: 'ICICI Bank', value: 9.80, color: '#17A2B8' },
                { name: 'SBI', value: 7.45, color: '#007BFF' },
                { name: 'Axis Bank', value: 6.90, color: '#6610F2' },
                { name: 'Bajaj Finance', value: 5.60, color: '#28A745' },
                { name: 'Kotak Bank', value: 4.80, color: '#20C997' },
                { name: 'L&T', value: 3.90, color: '#17A2B8' },
            ],
            change: '320 pts',
        },
        'BANK NIFTY': {
            data: [
                { name: 'HDFC Bank', value: 25.40, color: '#34C759' },
                { name: 'ICICI Bank', value: 20.10, color: '#28A745' },
                { name: 'SBI', value: -15.30, color: '#FF3B30' },
                { name: 'Axis Bank', value: 12.80, color: '#20C997' },
                { name: 'Kotak Bank', value: 10.50, color: '#17A2B8' },
                { name: 'IndusInd Bank', value: 8.20, color: '#007BFF' },
                { name: 'Bank of Baroda', value: 6.90, color: '#6610F2' },
                { name: 'PNB', value: 5.60, color: '#28A745' },
                { name: 'Federal Bank', value: 4.30, color: '#20C997' },
                { name: 'IDFC First', value: 3.80, color: '#17A2B8' },
            ],
            change: '210 pts',
        },
        'NIFTY IT': {
            data: [
                { name: 'Infosys', value: 30.20, color: '#34C759' },
                { name: 'TCS', value: 25.10, color: '#28A745' },
                { name: 'Wipro', value: -8.50, color: '#FF3B30' },
                { name: 'HCL Tech', value: 15.30, color: '#20C997' },
                { name: 'Tech Mahindra', value: 12.40, color: '#17A2B8' },
                { name: 'LTIMindtree', value: 9.80, color: '#007BFF' },
                { name: 'Mphasis', value: 7.20, color: '#6610F2' },
                { name: 'Coforge', value: 5.90, color: '#28A745' },
                { name: 'Persistent', value: 4.60, color: '#20C997' },
                { name: 'L&T Tech', value: 3.70, color: '#17A2B8' },
            ],
            change: '180 pts',
        },
    };

    const [selectedIndex, setSelectedIndex] = useState('NIFTY 50');
    const [selectedSegment, setSelectedSegment] = useState(null);

    const chartData = indicesData[selectedIndex].data;
    const changeText = indicesData[selectedIndex].change;

    if (!chartData || chartData.length === 0) {
        return (
            <View>
                <Text style={{ color: '#FFF', fontFamily: 'Questrial-Regular' }}>
                    No chart data available
                </Text>
            </View>
        );
    }

    const pieData = chartData.map(item => ({
        value: Math.abs(item.value),
        color: item.color,
        name: item.name,
        focused: selectedSegment === item.name,
        text: `${item.name}\n${item.value}%`,
        textColor: '#FFF',
        textSize: 12,
        font: 'Questrial-Regular',
        percentageColor: item.value >= 0 ? '#34C759' : '#FF3B30',
        labelPosition: 'outward',
    }));

    // Log pieData to debug
    // console.log('Pie Data:', pieData);

    const handleSegmentPress = (item) => {
        setSelectedSegment(item.name);
    };

    return (
        <View style={styles.container}>
            <View style={styles.chartSection}>
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#444', '#AEAED4']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>Index:</Text>
                            <Picker
                                selectedValue={selectedIndex}
                                onValueChange={(itemValue) => {
                                    setSelectedIndex(itemValue);
                                    setSelectedSegment(null);
                                }}
                                style={styles.dropdown}
                                dropdownIconColor="#FFF"
                            >
                                {Object.keys(indicesData).map((indexName) => (
                                    <Picker.Item
                                        key={indexName}
                                        label={indexName}
                                        value={indexName}
                                        style={styles.dropdownItem}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.chartWrapper}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={120} // Reduced to give more space for labels
                        innerRadius={60}
                        center={[screenWidth / 2 - 20, 150]}
                        innerCircleColor="#121212"
                        focusOnPress
                        sectionAutoFocus
                        onPress={handleSegmentPress}
                        focusedRadius={10}
                        focusedInnerRadius={10}
                        extraRadius={20} // Increased for outward labels
                        paddingHorizontal={60} // Increased padding
                        paddingVertical={60} // Increased padding
                        showValuesAsLabels
                        labelsPosition="outward"
                        showTextBackground
                        textBackgroundColor="#333"
                        textBackgroundRadius={12}
                        showLabelLine
                        labelLineColor="#FFF"
                        labelLineConfig={{
                            length: 30, // Increased to position labels further out
                            tailLength: 10,
                            color: '#fff',
                            thickness: 2, // Increased for visibility
                            avoidOverlappingOfLabels: true,
                        }}
                        initialAngle={0}
                        style={{ height: 500 }} // Increased height for labels
                        centerLabelComponent={() => {
                            return (
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text
                                        style={{ fontSize: 18, color: 'white', fontFamily: 'Questrial-Regular', fontWeight: 'bold', }}>
                                        {selectedIndex}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: 'white', fontFamily: 'Questrial-Regular' }}>
                                        {changeText}
                                    </Text>
                                </View>
                            );
                        }}
                        // Temporarily removed textComponent to test default labels
                        textComponent={(item) => {
                            const [name, percentage] = item.text.split('\n');
                            return (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#FFF', fontFamily: 'Questrial-Regular' }}>
                                        {name}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: item.percentageColor, fontFamily: 'Questrial-Regular' }}>
                                        {percentage}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </View>
    );
};

export default IndexPieChart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chartSection: {
        alignItems: 'flex-end',
        marginTop: 5,
        width: '100%', // Ensure full width
    },
    gradientBorder: {
        borderRadius: 100,
        padding: 1,
        marginHorizontal: 15,
        marginBottom: 0,
    },
    dropdownContainer: {
        width: 200,
        paddingHorizontal: 10,
        backgroundColor: '#000',
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownLabel: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: 'Questrial-Regular',
        marginRight: 8,
    },
    dropdown: {
        color: '#FFF',
        fontFamily: 'Questrial-Regular',
        fontSize: 12,
        flex: 1,
    },
    dropdownItem: {
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
        color: '#FFF',
        backgroundColor: '#000',
    },
    chartWrapper: {
        alignItems: 'center',
        width: '100%', // Ensure full width
    },
});