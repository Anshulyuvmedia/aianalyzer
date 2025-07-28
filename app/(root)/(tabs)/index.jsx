import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import IndexPieChart from '@/components/IndexPieChart';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';

const Index = () => {

  // Data for the Call vs Put slider
  const callPercentage = 60;
  const putPercentage = 40;

  return (
    <View style={styles.container}>
      <HomeHeader page={'home'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >


        {/* News and FX Signal Buttons */}
        <View style={styles.buttonRow}>
          <LinearGradient
            colors={['#000', '#AEAED4']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <TouchableOpacity style={styles.button} onPress={() => router.push('/news/newslisting')}>
              <FontAwesome name="newspaper-o" size={22} color="#FFF" style={styles.iconMargin} />
              <Text style={styles.buttonText}>News</Text>
              <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#000', '#AEAED4']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <TouchableOpacity style={styles.button} onPress={() => router.push('../tradealertscreens/tradealerts')} >
              <FontAwesome name="dollar" size={16} color="#FFF" style={styles.iconMargin} />
              <Text style={styles.buttonText}>FX Signal</Text>
              <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* NIFTY 50 Index Section */}
        <View style={styles.indexSection}>
          <TouchableOpacity style={styles.indexBox} onPress={() => router.push('/stockdiscovery/searchdiscovery')}>
            <LinearGradient
              colors={['#000', '#AEAED4']}
              start={{ x: 0.3, y: 0.6 }}
              end={{ x: 0, y: 0 }}
              style={styles.gradientBoxBorder}
            >
              <LinearGradient
                colors={['#000', '#1A3B76']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
              >
                <View style={styles.indexCard}>
                  <View style={styles.indexHeader}>
                    <Text style={styles.indexTitle}>Nifty 50</Text>
                    <View style={styles.indexChangeContainer}>
                      <Feather name="arrow-up-right" size={16} color="#34C759" style={styles.iconMargin} />
                      <Text style={styles.indexChangePositive}>1.2%</Text>
                    </View>
                  </View>
                  {/* Gradient Text */}
                  <MaskedView
                    maskElement={<Text style={styles.indexValue}>18,245.32</Text>}
                  >
                    <LinearGradient
                      colors={['#C6DBF8', '#609DF9']}
                      start={{ x: 1, y: 0.5 }}
                      end={{ x: 0, y: 0 }}
                    // style={{ flex: 1 }}
                    >
                      <Text style={[styles.indexValue, { opacity: 0 }]}>18,245.32</Text>
                    </LinearGradient>
                  </MaskedView>
                </View>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.indexBox} >
            <LinearGradient
              colors={['#000', '#AEAED4']}
              start={{ x: 0.3, y: 0.6 }}
              end={{ x: 0, y: 0 }}
              style={styles.gradientBoxBorder}
            >
              <LinearGradient
                colors={['#000', '#7A2C3F']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.innerGradient}
              >
                <View style={styles.indexCard}>
                  <View style={styles.indexHeader}>
                    <Text style={styles.indexTitle}>Sensex</Text>
                    <View style={styles.indexChangeContainer}>
                      <Feather name="arrow-down-right" size={16} color="#FF3B30" style={styles.iconMargin} />
                      <Text style={styles.indexChangeNegative}> 0.8%</Text>
                    </View>
                  </View>
                  <MaskedView
                    maskElement={<Text style={styles.indexValue}>61,232.45</Text>}
                  >
                    <LinearGradient
                      colors={['#F3DF65', '#FF5D57']}
                      start={{ x: 1, y: 0.5 }}
                      end={{ x: 0, y: 0 }}
                    // style={{ flex: 1 }}
                    >
                      <Text style={[styles.indexValue, { opacity: 0 }]}>61,232.45</Text>
                    </LinearGradient>
                  </MaskedView>
                </View>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderSection}>
          <LinearGradient
            colors={['#402196', '#30F8EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBoxBorder}
          >
            <View style={styles.sliderbox}>
              <Text style={styles.sliderTitle}>Open Interest: Call vs Put</Text>
              <View style={styles.slider}>
                <View style={styles.sliderLabelBox}>
                  <Text style={styles.sliderLabelLeft}>Call: {callPercentage}%</Text>
                  <Text style={styles.sliderLabelRight}>Put: {putPercentage}%</Text>
                </View>
                <View style={styles.sliderBar}>
                  <View style={[styles.callBar, { width: `${callPercentage}%` }]} />
                  <View style={[styles.putBar, { width: `${putPercentage}%` }]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="">
          <IndexPieChart />
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
    paddingBottom: 0,
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 1,
  },
  gradientBoxBorder: {
    borderRadius: 25,
    padding: 1,
    marginHorizontal: 5,
    flex: 1,
  },
  innerGradient: {
    borderRadius: 24,
    padding: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  iconMargin: {
    marginHorizontal: 5,
  },
  indexSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,

  },
  indexBox: {
    width: '50%',
  },
  indexCard: {
    // backgroundColor: '#000',
    padding: 15,
    paddingBottom: 50,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1A3B76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  indexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  indexChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexTitle: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Questrial-Regular',
    fontWeight: '600',
  },
  indexValue: {
    textAlign: 'start',
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Questrial-Regular',
  },
  indexChangePositive: {
    color: '#34C759',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  indexChangeNegative: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  sliderSection: {
    marginBottom: 20,
  },
  sliderbox: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 25,
  },
  sliderTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '700',
    marginBottom: 10,
  },
  slider: {
    alignItems: 'center',
  },
  sliderBar: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  callBar: {
    backgroundColor: '#1F65FF',
  },
  putBar: {
    backgroundColor: '#20202C',
  },
  sliderLabelBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sliderLabelLeft: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Questrial-Regular',
  },
  sliderLabelRight: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Questrial-Regular',
  },

});

export default Index;