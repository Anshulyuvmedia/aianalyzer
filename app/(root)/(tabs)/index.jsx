import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';
import IndexCard from '@/components/IndexCard';
import MarketSentiments from '@/components/MarketSentiments';
import RecentTrades from '@/components/RecentTrades';
import ActiveAlerts from '@/components/ActiveAlerts';

const Index = () => {
  return (
    <View style={styles.container}>
      <HomeHeader page={'home'} title={'Dashboard'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <IndexCard />
        </View>
        <View style={styles.section}>
          <MarketSentiments />
        </View>
        <View style={styles.section}>
          <RecentTrades />
        </View>
        <View style={styles.section}>
          <ActiveAlerts />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  section: {
    marginBottom: 10,
  },

});

export default Index;