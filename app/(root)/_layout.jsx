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
            <Stack.Screen name="StrategyDetail/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="StrategyPerformance/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="Discovery/InstrumentList" options={{ headerShown: false }} />
            <Stack.Screen name="Discovery/[symbol]" options={{ headerShown: false }} />
            <Stack.Screen name="Discovery/placeOrder" options={{ headerShown: false }} />
        </Stack>
    );
}