import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import images from '@/constants/images';

const Login = () => {
    const DUMMY_EMAIL = 'user@example.com';
    const DUMMY_PASSWORD = 'password123';
    const [email, setEmail] = useState(DUMMY_EMAIL);
    const [password, setPassword] = useState(DUMMY_PASSWORD);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    // Fade-in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Handle button press animation
    const handleButtonPressIn = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 0.95,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // Basic email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Save session to AsyncStorage
    const saveSession = async (email) => {
        try {
            const token = 'dummy-token-' + Math.random().toString(36).slice(2); // Replace with real token from backend
            const userData = { id: 'user-' + email, email }; // Ensure id is included
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('lastRoute', '(root)/(tabs)'); // Set default route after login
            // console.log('Saved to AsyncStorage:', { token, userData, lastRoute: '(root)/(tabs)' });
        } catch (error) {
            console.error('Error saving session:', error);
            Alert.alert('Error', 'Failed to save session. Please try again.');
        }
    };

    // Handle login submission
    const handleLogin = async () => {
        let valid = true;
        setEmailError('');
        setPasswordError('');

        // Basic input validation
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

        // Dummy credential validation
        if (valid) {
            if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
                await saveSession(email);
                router.replace('/(root)/(tabs)')
                // Alert.alert('Success', 'Logged in successfully!', [
                //     { text: 'OK', onPress: () => router.replace('/(root)/(tabs)') },
                // ]);
            } else {
                Alert.alert('Error', 'Invalid email or password. Please use the credentials shown above.');
            }
        }
    };

    return (
        <LinearGradient
            colors={['#25242F', '#151718']}
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
                <Text style={styles.title}>Welcome Back</Text>

                <View style={styles.credentialsContainer}>
                    <Text style={styles.credentialsText}>
                        Use these credentials to login:
                    </Text>
                    <Text style={styles.credentialsText}>
                        Email: {DUMMY_EMAIL}
                    </Text>
                    <Text style={styles.credentialsText}>
                        Password: {DUMMY_PASSWORD}
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <LinearGradient
                        colors={['#00FF00', '#00000000']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0.5, y: 0 }}
                        style={styles.inputGradient}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="gray"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </LinearGradient>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <LinearGradient
                        colors={['#00FF00', '#00000000']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0.5, y: 0 }}
                        style={styles.inputGradient}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="gray"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </LinearGradient>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                >
                    <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                        <LinearGradient
                            colors={['#00FF00', '#00000000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Login</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    credentialsContainer: {
        marginBottom: 20,
    },
    credentialsText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Questrial-Regular',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputGradient: {
        borderRadius: 80,
        padding: 1,
    },
    input: {
        height: 50,
        borderRadius: 80,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#000',
        color: '#FFFFFF',
        fontFamily: 'Questrial-Regular',
    },
    errorText: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'Questrial-Regular',
    },
    buttonGradient: {
        borderRadius: 8,
        padding: 1,
        marginTop: 10,
    },
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Questrial-Regular',
    },
});