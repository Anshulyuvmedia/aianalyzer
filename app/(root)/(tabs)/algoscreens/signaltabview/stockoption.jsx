import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons';
import SignalCard from '@/components/SignalCard';

const StockOption = () => {
  const [selectedOption, setSelectedOption] = React.useState('Stratzy');

  const options = [
    'Stratzy',
    '5Paisa',
    'AngelOne',
    'IFL',
    'Kotak',
    'Master',
  ];

  const signalsData = [
    {
      stock: 'HINDCOPPER',
      type: '(B) HINDCOPPER X 1',
      date: '2023-06-10  14:30',
      entry: 350.70,
      current: 349.1,
      target: 401.00,
      stopLoss: 325.00,
      quantity: 1,
      performance: 74.58,
      risk: 25.42,
    },
    {
      stock: 'TATAMOTORS',
      type: '(S) TATAMOTORS X 2',
      date: '2023-06-11  10:15',
      entry: 520.50,
      current: 515.0,
      target: 500.00,
      stopLoss: 540.00,
      quantity: 2,
      performance: 60.12,
      risk: 39.88,
    },
    {
      stock: 'RELIANCE',
      type: '(B) RELIANCE X 3',
      date: '2023-06-12  09:45',
      entry: 2450.00,
      current: 2475.5,
      target: 2550.00,
      stopLoss: 2400.00,
      quantity: 3,
      performance: 80.00,
      risk: 20.00,
    },
    {
      stock: 'INFY',
      type: '(S) INFY X 1',
      date: '2023-06-13  13:00',
      entry: 1500.00,
      current: 1480.0,
      target: 1450.00,
      stopLoss: 1525.00,
      quantity: 1,
      performance: 55.00,
      risk: 45.00,
    },
    {
      stock: 'SBIN',
      type: '(B) SBIN X 4',
      date: '2023-06-14  11:30',
      entry: 450.00,
      current: 455.0,
      target: 470.00,
      stopLoss: 440.00,
      quantity: 4,
      performance: 70.00,
      risk: 30.00,
    },
  ];

  const handleOptionSelect = (key) => {
    setSelectedOption(key === selectedOption ? null : key);
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity
      className={`flex-row items-center mr-3 px-4 py-2 rounded-full border ${selectedOption === item
        ? 'bg-purple-600 border-purple-600'
        : 'bg-black border-gray-900'
        }`}
      onPress={() => handleOptionSelect(item)}
    >
      <Text className={`font-sora ${selectedOption === item
        ? 'text-white'
        : 'text-gray-400'
        }`}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 mt-3 pe-3">
      <View className="my-2">
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View className="flex-row justify-between items-center my-2">
        <Text className="text-white text-lg font-sora-bold">Performance Ratio</Text>
        <View className="flex-row">
          <View className="p-3 bg-green-500 rounded-l-lg">
            <Text className="text-white text-base mr-2">↑ 74.58%</Text>
          </View>
          <View className="p-3 bg-red-500 rounded-r-lg ">
            <Text className="text-white text-base">↓ 25.42%</Text>
          </View>
        </View>
        <Feather name="settings" size={24} color="white" />
      </View>

      <View className="flex-1">
        <FlatList
          data={signalsData}
          keyExtractor={(item) => item.stock}
          renderItem={({ item }) => <SignalCard item={item} />}
        />
      </View>
    </View>
  )
}

export default StockOption

const styles = StyleSheet.create({})