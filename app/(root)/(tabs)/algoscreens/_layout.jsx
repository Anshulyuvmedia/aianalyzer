// app/(root)/(tabs)/algoscreens/_layout.jsx
import { Stack } from 'expo-router';

export default function AlgoLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="algo" options={{ title: 'Algo' }} />
            <Stack.Screen name="indicatorbased" options={{ title: 'indicatorbased' }} />
            <Stack.Screen name="signals" options={{ title: 'signal' }} />
        </Stack>
    );
}