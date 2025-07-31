// app/(root)/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

// Get screen width
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// TabItem Component
const TabItem = ({ route, index, isFocused, options, navigation }) => {
  const iconScale = useRef(new Animated.Value(isFocused ? 1 : 0.84)).current;
  const iconTranslateY = useRef(new Animated.Value(isFocused ? -24 : 0)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const labelTranslateY = useRef(new Animated.Value(isFocused ? -14 : -8)).current;
  const labelScale = useRef(new Animated.Value(isFocused ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: isFocused ? 1 : 0.84,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(iconTranslateY, {
        toValue: isFocused ? -24 : 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(labelTranslateY, {
        toValue: isFocused ? -14 : -8,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(labelScale, {
        toValue: isFocused ? 1 : 0.92,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const getIconName = (routeName, focused) => {
    const iconMap = {
      index: focused ? 'home' : 'home-outline',
      algotrading: focused ? 'hardware-chip-sharp' : 'hardware-chip-outline',
      copytrading: focused ? 'copy' : 'copy-outline',
      chartanalysis: focused ? 'stats-chart' : 'stats-chart-outline',
      backtesting: focused ? 'git-compare' : 'git-compare-outline',
    };
    return iconMap[routeName] || 'circle';
  };

  const iconColor = isFocused ? Colors.iconActive : Colors.iconInactive;

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={1}>
      <Animated.View
        style={{
          transform: [{ scale: iconScale }, { translateY: iconTranslateY }],
        }}
      >
        <Ionicons
          name={getIconName(route.name, isFocused)}
          size={24}
          color={iconColor}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          {
            opacity: labelOpacity,
            transform: [{ translateY: labelTranslateY }, { scale: labelScale }],
          },
        ]}
      >
        {options.title}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// Custom TabBar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const tabWidth = SCREEN_WIDTH / 5; // Full screen width / 5 tabs
  const circlePosition = state.index * tabWidth;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: circlePosition,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.tabBar, { width: SCREEN_WIDTH }]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [{ translateX }],
            left: tabWidth / 2 - 22, // Center indicator in tab
          },
        ]}
      >
        <LinearGradient
          colors={['#723CDF', '#FAC1EC']}
          style={styles.indicatorGradient}
        />
      </Animated.View>
      {state.routes.map((route, index) => (
        <TabItem
          key={route.key}
          route={route}
          index={index}
          isFocused={state.index === index}
          options={descriptors[route.key].options}
          navigation={navigation}
        />
      ))}
    </View>
  );
};

// Colors from CSS variables
const Colors = {
  iconActive: '#fff',
  iconInactive: '#6C7486',
  iconHover: '#99A3BA', // Not used in touch-based UI
  text: '#E4ECFA',
  circle: '#E4ECFA',
  background: '#000',
  shadow: 'rgba(18, 22, 33, 0.1)',
};

// Styles
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    height: 70,
    borderRadius: 0,
    // paddingHorizontal: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 100,
    top: -12,
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    position: 'absolute',
    bottom: 5,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="algotrading"
        options={{
          title: 'Algo Trading',
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="copytrading"
        options={{
          title: 'Copy Trading',
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="chartanalysis"
        options={{
          title: 'Chart Analysis',
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="backtesting"
        options={{
          title: 'Back Testing',
          lazy: true,
        }}
      />
    </Tabs>
  );
}