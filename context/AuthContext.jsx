// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);        // initial check
    const [otpLoading, setOtpLoading] = useState(false);     // generate OTP
    const [yourOtp, setYourOtp] = useState(false);     // generate OTP
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Load persisted user on mount
    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Auth bootstrap error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        bootstrapAuth();
    }, []);

    // Send OTP
    const requestOtp = useCallback(async (phoneNumber) => {
        if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number');
            return false;
        }

        setOtpLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/generateOtp`, { phoneNumber });
            // console.log(res.data.otp);
            setYourOtp(res.data.otp);
            if (res.data.status) {
                return true; // success → open OTP sheet
            } else {
                Alert.alert('Error', res.data.msg || 'Failed to send OTP');
                return false;
            }
        } catch (error) {
            console.log("Login Error:", error);
            // If backend sent a JSON response
            if (error.response) {
                const status = error.response.status;
                const msg = error.response.data.msg || error.response.data.message;

                if (status === 400) {
                    Alert.alert("Phone Number is required", msg);
                }
                else if (status === 404) {
                    Alert.alert("Already exits.!", msg);
                }
                else if (status === 500) {
                    Alert.alert("Server Error", "Something went wrong on server.");
                }
                else {
                    Alert.alert("Error", msg || "Login failed");
                }
            }
            else {
                // Network or unexpected error
                Alert.alert("Network Error", "Unable to reach the server.");
            }
        } finally {
            setOtpLoading(false);
        }
    }, []);

    // Verify OTP → login
    const verifyAndLogin = useCallback(async (phoneNumber, otp) => {
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit code');
            return false;
        }

        setVerifyLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/verifyOtp`, {
                phoneNumber,
                otp,
            });

            if (res.data.status === true) {
                const userData = res.data.userdata;
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                router.replace('/(root)/(tabs)');
                return true;
            } else {
                Alert.alert('Verification Failed', res.data.msg || 'Invalid OTP');
                return false;
            }
        } catch (err) {
            const msg = err.response?.data?.msg || 'OTP verification failed';
            Alert.alert('Error', msg);
            return false;
        } finally {
            setVerifyLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('userData');
            setUser(null);
            setIsAuthenticated(false);
            router.replace('/(auth)/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                otpLoading,
                verifyLoading,
                requestOtp,        // ← renamed for clarity
                verifyAndLogin,
                logout,
                yourOtp
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};