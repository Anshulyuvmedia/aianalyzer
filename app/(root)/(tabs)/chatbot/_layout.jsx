// app/(root)/(tabs)/chatbot/_layout.jsx
import { Stack } from 'expo-router';

export default function ChatbotLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="paidsignal" options={{ title: 'Paid Signal' }} />
            <Stack.Screen name="freesignal" options={{ title: 'Free Signal' }} />
            <Stack.Screen name="aichartpatterns" options={{ title: 'AI Chart Patterns' }} />
        </Stack>
    );
}