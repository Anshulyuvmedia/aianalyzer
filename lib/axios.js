// src/lib/axios.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});
// console.log('Axios instance created with baseURL:', API_BASE_URL);
api.interceptors.request.use(async (config) => {
    // console.log('Request starting → URL:', config.url);
    // console.log('Full request URL:', config.baseURL + config.url);
    const token = await AsyncStorage.getItem('userToken');
    // console.log('Token from storage:', token ? 'present (length ' + token.length + ')' : 'missing');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log('Added Authorization header');
    }
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Handle 401 globally → auto logout
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await AsyncStorage.multiRemove(['userToken', 'userData']);
                setTimeout(() => {
                    Alert.alert('Session Expired', 'Please log in again.');
                    router.replace('/(auth)/login');
                }, 300);
            } catch (e) {
                console.error('Auto-logout failed:', e);
            }
        }
        return Promise.reject(error);
    }
);

export default api;