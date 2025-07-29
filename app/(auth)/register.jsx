import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import images from '@/constants/images';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    // Fade-in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Handle button press animation
    const handleButtonPressIn = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 0.97,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
        }).start();
    };

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Save session to AsyncStorage
    const saveSession = async (email) => {
        try {
            const token = 'dummy-token-' + Math.random().toString(36).slice(2);
            const userData = { id: 'user-' + email, email };
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('lastRoute', '(root)/(tabs)');
        } catch (error) {
            console.error('Error saving session:', error);
            Alert.alert('Error', 'Failed to save session. Please try again.');
        }
    };

    // Handle registration submission
    const handleRegister = async () => {
        let valid = true;
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            valid = false;
        }

        if (valid) {
            await saveSession(email);
            router.replace('/(root)/(tabs)');
        }
    };

    // Handle navigation to login
    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={styles.container}
        >
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={images.mainlogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color="#9CA3AF"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Email"
                            placeholderTextColor="#6B7280"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#9CA3AF"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Password"
                            placeholderTextColor="#6B7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#9CA3AF"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Confirm Password"
                            placeholderTextColor="#6B7280"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleRegister}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
    },
    formContainer: {
        width: '90%',
        maxWidth: 360,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Inter-SemiBold',
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Inter-Regular',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D3748',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputIcon: {
        marginLeft: 16,
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter-Regular',
    },
    inputWithIcon: {
        paddingLeft: 0,
        paddingRight: 48,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 16,
        fontFamily: 'Inter-Regular',
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter-SemiBold',
    },
    loginContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    loginText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    loginLink: {
        color: '#10B981',
        fontWeight: '600',
    },
});