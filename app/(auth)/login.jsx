// app/(auth)/login.jsx
import images from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState, useContext } from 'react';
import { Alert, Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';
import { AuthContext } from '@/context/AuthContext';

const Login = () => {
    const { requestOtp, verifyAndLogin, otpLoading, verifyLoading, yourOtp } = useContext(AuthContext);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const otpSheetRef = useRef(null);

    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);

    // Fade-in animation on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // OTP resend timer
    useEffect(() => {
        let interval;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

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

    const validatePhone = (num) => /^[6-9]\d{9}$/.test(num);

    const handleRequestOtp = async () => {
        setPhoneError('');

        if (!phoneNumber) {
            setPhoneError('Phone number is required');
            return;
        }

        if (!validatePhone(phoneNumber)) {
            setPhoneError('Enter a valid 10-digit Indian mobile number');
            return;
        }

        const success = await requestOtp(phoneNumber);
        if (success) {
            setTimer(30);
            setIsTimerActive(true);
            otpSheetRef.current.open();
        }
    };

    const handleVerifyOtp = async () => {
        const code = otpArray.join('');
        if (code.length !== 6) {
            Alert.alert('Incomplete OTP', 'Please enter the full 6-digit code');
            return;
        }

        await verifyAndLogin(phoneNumber, code);
        // Navigation & success handling is done inside AuthContext
    };

    const handleOtpChange = (val, index) => {
        if (/^\d?$/.test(val)) {
            const newOtp = [...otpArray];
            newOtp[index] = val;
            setOtpArray(newOtp);

            if (val !== '' && index < 5) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleResendOtp = () => {
        setTimer(30);
        setIsTimerActive(true);
        requestOtp(phoneNumber); // resend OTP
    };

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.container}>
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                    <Image source={images.mainlogo} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.credentialsContainer}>
                    <Text style={styles.credentialsText}>Demo Credentials:</Text>
                    <Text style={styles.credentialsText}>Mobile No: 9876543210</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Phone Number"
                            placeholderTextColor="#6B7280"
                            value={phoneNumber}
                            onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                            maxLength={10}
                            editable={!otpLoading}
                        />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleRequestOtp}
                    disabled={otpLoading}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            {otpLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRegister} style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Don&apos;t have an account? <Text style={styles.registerLink}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            <RBSheet
                ref={otpSheetRef}
                height={350}
                closeOnDragDown={false}
                openDuration={250}
                customStyles={{ container: styles.sheet }}
            >
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>
                    A 6-digit code has been sent to +91 {phoneNumber}
                </Text>
                <Text style={{color: 'white', textAlign: 'center'}}>
                    Enter OTP: {yourOtp}
                </Text>

                <View style={styles.otpBoxContainer}>
                    {otpArray.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (otpRefs.current[index] = ref)}
                            style={styles.otpBox}
                            maxLength={1}
                            keyboardType="numeric"
                            value={digit}
                            onChangeText={(val) => handleOtpChange(val, index)}
                            editable={!verifyLoading}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyBtn, verifyLoading && { opacity: 0.7 }]}
                    disabled={verifyLoading}
                    onPress={handleVerifyOtp}
                >
                    {verifyLoading ? (
                        <Text style={styles.verifyText}>Verifying...</Text>
                    ) : (
                        <Text style={styles.verifyText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                {isTimerActive ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                )}
            </RBSheet>
        </LinearGradient>
    );
};

export default Login;

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
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
    },
    credentialsContainer: {
        backgroundColor: '#374151',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    credentialsText: {
        color: '#D1D5DB',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D3748',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
    },
    inputWithIcon: {
        paddingLeft: 0,
        paddingRight: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 16,
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    registerLink: {
        color: '#10B981',
        fontWeight: '600',
    },
    sheet: {
        backgroundColor: '#1F2937',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginVertical: 12,
    },
    otpBoxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        paddingHorizontal: 10,
    },
    otpBox: {
        width: 48,
        height: 56,
        backgroundColor: '#2D3748',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    verifyBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 28,
        alignItems: 'center',
    },
    verifyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    timerText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#9CA3AF',
        fontSize: 14,
    },
    resendText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#10B981',
        fontSize: 14,
        fontWeight: '600',
    },
});