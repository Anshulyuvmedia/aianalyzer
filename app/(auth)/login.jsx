//अक्रम अखंड आकाशीय परिणाम परीक्षम प्रस्थानम्
//अनन्त और आकाश-समान अटूट परिणामों की परीक्षा ही जीवन का रास्ता है
import images from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RBSheet from "react-native-raw-bottom-sheet";


const Login = () => {
    const [apiData, setapiData] = useState('');
    const [phoneNumber, setphoneNumber] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef([]);
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const otpSheetRef = useRef(null);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [otp,setOtp] = useState("");

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

    // OTP Input Change Handler
    const handleOtpChange = (val, index) => {
        if (/^\d?$/.test(val)) {
            const arr = [...otpArray];
            arr[index] = val;
            setOtpArray(arr);

            if (val !== "" && index < 5) {
                otpRefs.current[index + 1].focus();
            }
        }
    };

    // OTP Timer
    useEffect(() => {
        let interval;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const validatePhone = (num) => /^[6-9]\d{9}$/.test(num);


    // Handle login submission
    const handleLogin = async () => {
        let valid = true;
        setPhoneError('');

        if (!phoneNumber) {
            setPhoneError("Phone number is required");
            valid = false;
        } else if (!validatePhone(phoneNumber)) {
            setPhoneError("Enter a valid Indian phone number");
            valid = false;
        }
        if (!valid) return;

        try {
            const res = await axios.post("https://api.aianalyzer.in/api/generateOtp", {
                phoneNumber,
            });

            console.log(res.data);
            if (res.data.status) {
                setTimer(30);
                setIsTimerActive(true);
                otpSheetRef.current.open();
            } else {
                Alert.alert("Error", res.data.message || "Login failed");
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
        }
    };

    // Verify OTP API
    const handleVerifyOTP = async () => {
        const finalOtp = otpArray.join("");

        if (finalOtp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP");
            return;
        }
        try {
            setLoadingVerify(true); // start loading

            const res = await axios.post("https://api.aianalyzer.in/api/verifyOtp", {
                phoneNumber: phoneNumber,
                otp: finalOtp,
            });
            console.log(res.data);
            setLoadingVerify(false); // stop loading

            if (res.data.status === true) {

                // 👉 Save user data to AsyncStorage
                await AsyncStorage.setItem(
                    'userData',
                    JSON.stringify(res.data.userdata)
                );
                setOtp(res.data.otp);
                console.log("User saved into AsyncStorage");


                setapiData(res.data.userdata);
                otpSheetRef.current.close();
                console.log("Redirecting to......../(root)/(tabs)");
                router.replace('/(root)/(tabs)');
            } else {
                Alert.alert("Error", res.data.msg || "Invalid OTP");
            }

        } catch (error) {
            setLoadingVerify(false); // stop loading
            Alert.alert(
                "Error",
                error?.response?.data?.msg || "OTP verification failed"
            );
        }
    };

    // Handle navigation to registration
    const handleRegister = () => {
        router.push('/register');
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.credentialsContainer}>
                    <Text style={styles.credentialsText}>
                        Demo Credentials:
                    </Text>
                    <Text style={styles.credentialsText}>
                        Mobile No: 9876543210
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputWithIcon]}
                            placeholder="Phone Number"
                            placeholderTextColor="#6B7280"
                            value={phoneNumber}
                            onChangeText={(val) => setphoneNumber(val.replace(/[^0-9]/g, ""))}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    onPress={handleLogin}
                >
                    <Animated.View style={[styles.button, { transform: [{ scale: buttonScaleAnim }] }]}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRegister} style={styles.registerContainer}>
                    <Text style={styles.registerText}>Dont have an account? <Text style={styles.registerLink}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
            <RBSheet
                ref={otpSheetRef}
                height={300}
                closeOnDragDown={false}
                openDuration={250}
                customStyles={{ container: styles.sheet }}
            >
                <Text style={styles.otpTitle}>Enter OTP : {otp}</Text>
                <Text style={styles.otpSubtitle}>A 6-digit code has been sent to {phoneNumber}</Text>

                {/* ---- NEW 6 BOX OTP UI ---- */}
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
                            onKeyPress={(e) => handleKeyPress(e, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.verifyBtn}
                    disabled={loadingVerify}
                    onPress={handleVerifyOTP}
                >
                    {loadingVerify ? (
                        <Text style={styles.verifyText}>Verifying...</Text>
                    ) : (
                        <Text style={styles.verifyText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>


                {isTimerActive ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            setTimer(30);
                            setIsTimerActive(true);
                        }}
                    >
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
        fontFamily: 'Inter-SemiBold',
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Inter-Regular',
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
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
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
    passwordInput: {
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
    registerContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    registerLink: {
        color: '#10B981',
        fontWeight: '600',
    },
    sheet: {
        backgroundColor: "#1F2937",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        elevation: 20,
    },

    otpTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 10,
    },

    otpSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginVertical: 10,
    },

    verifyBtn: {
        backgroundColor: "#10B981",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
    },

    verifyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    timerText: {
        textAlign: "center",
        marginTop: 15,
        color: "#9CA3AF",
        fontSize: 14,
    },

    resendText: {
        textAlign: "center",
        marginTop: 15,
        color: "#10B981",
        fontSize: 14,
        fontWeight: "600",
    },
    otpBoxContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
        paddingHorizontal: 10,
    },

    otpBox: {
        width: 42,
        height: 50,
        backgroundColor: "#2D3748",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 20,
        color: "#fff",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },

});