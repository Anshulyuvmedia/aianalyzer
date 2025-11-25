import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ConnectionContext } from "../app/context/ConnectionContext";

const APIConfiguration = ({ apiType }) => {
    const { connectionStatus, setConnectionStatus } = useContext(ConnectionContext);
    const [apiKey, setApiKey] = useState('k6pfIbVSZL24lGUXnW6supQVnYbbzX');
    const [apiSecret, setApiSecret] = useState('OWsTgCzcAPDxzvZJhWwcgiGmh1zVjehtwKfqaaM6C5uiBQDGDzvIPpnaXeAy');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showApiSecret, setShowApiSecret] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleToggleApiKey = () => setShowApiKey(!showApiKey);
    const handleToggleApiSecret = () => setShowApiSecret(!showApiSecret);

    const handleTestConnection = async () => {

        //Getting ID from Local storage as user is already logged in
        const savedUser = await AsyncStorage.getItem("userData");
        const { _id } = JSON.parse(savedUser);
        console.log("User ID:", _id);

        if (!apiKey || !apiSecret) {
            Alert.alert("Error", 'Please enter both API Key and API Secret');
            return;
        }
        try {
            const response = await axios.post("http://192.168.1.27:3000/api/connect-api", {
                userId: _id,
                apiType: apiType,
                apiKey: apiKey,
                apiSecret: apiSecret,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = response.data;
            console.log("Broker Response:", data);

            if (data?.connection_status === true) {
                setConnectionStatus(true);
            } else {
                setConnectionStatus(false);
            }

        } catch (error) {
            console.error("Error connecting:", error);
            setStatusMessage("Something went wrong. Try again ❌");
        }
    };

    return (
        <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBoxBorder}
        >
            <LinearGradient
                colors={['#1e2836', '#111827', '#1e2836']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
            >
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Feather name="shield" size={20} color="#60a5fa" />
                            <Text style={styles.header}>API Configuration</Text>
                        </View>
                        <Text style={styles.description}>Configure your broker API credentials for automated trading</Text>

                        <View style={styles.inputSection}>
                            {statusMessage && (
                                <View style={styles.statusSection}>
                                    <Text style={styles.statusText}>{statusMessage}</Text>
                                </View>
                            )}
                            <Text style={styles.inputLabel}>API Key</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputField}
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    placeholder="Enter API Key"
                                    placeholderTextColor="#A0AEC0"
                                    secureTextEntry={!showApiKey}
                                />
                                <TouchableOpacity style={styles.toggleButton} onPress={handleToggleApiKey}>
                                    <Feather
                                        name={showApiKey ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#60a5fa"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>API Secret</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputField}
                                    value={apiSecret}
                                    onChangeText={setApiSecret}
                                    placeholder="Enter API Secret"
                                    placeholderTextColor="#A0AEC0"
                                    secureTextEntry={!showApiSecret}
                                />
                                <TouchableOpacity style={styles.toggleButton} onPress={handleToggleApiSecret}>
                                    <Feather
                                        name={showApiSecret ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#60a5fa"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleTestConnection}>
                            <Text style={styles.saveText}>Test Connection</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default APIConfiguration;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: 'black',
    },
    content: {
        // padding: 20,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginStart: 5,
    },
    description: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#A0AEC0',
        fontSize: 14,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        padding: 10,
        borderRadius: 8,
    },
    inputField: {
        flex: 1,
        color: '#fff',
    },
    toggleButton: {
        padding: 10,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    selectedRadio: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
    },
    radioCircle: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    radioText: {
        color: '#fff',
        fontSize: 14,
    },
    warningSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#facc15',
    },
    warningText: {
        color: '#facc15',
        fontSize: 12,
        marginStart: 8,
    },
    saveButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    statusSection: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    statusText: {
        color: '#22c55e',
        fontSize: 14,
        textAlign: 'center',
    },
});