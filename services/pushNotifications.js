import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotifications(userId) {
    if (Platform.isDevice === false) {
        console.log("Push notifications require a physical device");
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenData.data;

    // Send token to backend
    try {
        await axios.post(`${API_BASE_URL}/api/appdata/push-token`, {
            userId,
            expoPushToken,
            platform: Platform.OS,
        });
        console.log("Push token saved on server");
    } catch (err) {
        console.error("Failed to save push token:", err);
    }

    // Android notification channel
    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#8B5CF6",
        });
    }

    return expoPushToken;
}

export function setupNotificationListeners(handleNotificationPress) {
    // When app is in foreground, notification is displayed via handler above
    // When user taps a notification while app is in background
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (handleNotificationPress) {
            handleNotificationPress(data);
        }
    });

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response && handleNotificationPress) {
            const data = response.notification.request.content.data;
            handleNotificationPress(data);
        }
    });

    return responseListener;
}
