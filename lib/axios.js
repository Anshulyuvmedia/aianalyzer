import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log("API REQUEST:", {
        //     url: config.baseURL + config.url,
        //     method: config.method
        // });
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        // console.log("API RESPONSE:", response.status, response.config.url);
        return response;
    },
    async (error) => {
        if (!error.response) {
            console.log("NETWORK ERROR:", error.message);
            Alert.alert("Network Error", "Unable to reach server");
            return Promise.reject(error);
        }
        if (error.response.status === 401) {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            Alert.alert('Session Expired', 'Please log in again.');
            router.replace('/(auth)/login');
        }
        console.log("API ERROR:", error.response.data);
        return Promise.reject(error);
    }
);

export default api;