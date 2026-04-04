import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@/config/api';

let socket = null;

export const connectSocket = async (userId) => {
    if (socket) return socket;
    const token = await AsyncStorage.getItem("userToken");
    socket = io(API_BASE_URL, {
        transports: ["websocket"],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });
    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });
    socket.on("connect_error", (err) => {
        console.log("❌ Socket error:", err.message);
    });
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔌 Socket disconnected manually");
    }
};

export const subscribeToStrategies = (strategyIds = []) => {
    if (!socket || !strategyIds.length) return;
    console.log("📡 Subscribing:", strategyIds);
    socket.emit("subscribeTrades", { strategyIds });
};

export const unsubscribeFromStrategies = (strategyIds = []) => {
    if (!socket || !strategyIds.length) return;
    socket.emit("unsubscribeTrades", { strategyIds });
};

export const getSocket = () => socket;