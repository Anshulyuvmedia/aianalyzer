import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text } from 'react-native';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <Text style={{ padding: 20, fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
        Wealth Walk
      </Text>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: { backgroundColor: '#000000', width: 240 }, // Changed to black
          drawerLabelStyle: { color: '#fff' }, // Added to make labels white for contrast
          drawerActiveTintColor: '#6200ea', // Active item color
          drawerInactiveTintColor: '#ccc', // Inactive item color
          headerStyle: { backgroundColor: '#6200ea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          swipeEdgeWidth: 100,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerLabel: 'Home', title: 'Home' }}
        />
        <Drawer.Screen
          name="trendalerts"
          options={{ drawerLabel: 'Trend Alerts', title: 'Trend Alerts' }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}