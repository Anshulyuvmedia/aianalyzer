// app/(root)/_layout.jsx
import { Stack } from 'expo-router';

export default function RootMainStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="reports" options={{ headerShown: false }} />

            <Stack.Screen name="Broker/brokerconnection" options={{ headerShown: false }} />
            <Stack.Screen name="Broker/brokerapiconnect" options={{ headerShown: false }} />
            <Stack.Screen name="Broker/saved-accounts" options={{ headerShown: false }} />

            <Stack.Screen name="ChartAnalysisResults/OverallanalysisResult" options={{ headerShown: false }} />
            <Stack.Screen name="ChartAnalysisResults/PairDetailsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="ChartAnalysisResults/ChartViewScreen" options={{ headerShown: false }} />
            
            <Stack.Screen name="BacktestingResultsPage" options={{ headerShown: false }} />
            <Stack.Screen name="StrategyDetail/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="StrategyPerformance/[id]" options={{ headerShown: false }} />
            
            <Stack.Screen name="Discovery/InstrumentList" options={{ headerShown: false }} />
            <Stack.Screen name="Discovery/[symbol]" options={{ headerShown: false }} />
            <Stack.Screen name="Discovery/PlaceOrderScreen" options={{ headerShown: false }} />
            
            <Stack.Screen name="Portfolio/PositionsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="Portfolio/PositionDetailScreen" options={{ headerShown: false }} />
            <Stack.Screen name="Portfolio/TradesScreen" options={{ headerShown: false }} />
            <Stack.Screen name="Portfolio/modifyOrder/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}