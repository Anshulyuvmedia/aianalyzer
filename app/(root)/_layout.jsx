// app/(root)/_layout.jsx
import { Stack } from 'expo-router';

export default function RootMainStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="brokerconnection" options={{ headerShown: false }} />
            <Stack.Screen name="brokerapiconnect" options={{ headerShown: false }} />
            <Stack.Screen name="OverallanalysisResult" options={{ headerShown: false }} />
            <Stack.Screen name="BacktestingResultsPage" options={{ headerShown: false }} />
        </Stack>
    );
}