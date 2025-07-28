// app/(root)/_layout.jsx
import { Stack } from 'expo-router';

export default function RootMainStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="algostrategybuilder" options={{ headerShown: false }} />
            <Stack.Screen name="algodashboard" options={{ headerShown: false }} />
            <Stack.Screen name="strategybacktesting" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
    );
}