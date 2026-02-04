import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { BrokerContext } from "@/context/BrokerContext";
import { API_BASE_URL } from "@/config/api";

const APIConfiguration = ({ apiType }) => {
  const navigation = useNavigation();
  const { isConnected, connectBroker, disconnectBroker } = useContext(BrokerContext);

  const [apiKey, setApiKey] = useState("k6pfIbVSZL24lGUXnW6supQVnYbbzX");
  const [apiSecret, setApiSecret] = useState(
    "OWsTgCzcAPDxzvZJhWwcgiGmh1zVjehtwKfqaaM6C5uiBQDGDzvIPpnaXeAy"
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reconnectMode, setReconnectMode] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setStatusMessage("");

    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) throw new Error("User data not found");

      const { _id: userId } = JSON.parse(savedUser);

      if (!apiKey.trim() || !apiSecret.trim()) {
        Alert.alert("Error", "Please enter both API Key and API Secret");
        return;
      }

      // Optional: skip server check if we already have matching saved credentials
      const savedConnection = await AsyncStorage.getItem("brokerConnection");
      const parsed = savedConnection ? JSON.parse(savedConnection) : null;

      if (
        parsed &&
        parsed.apiType === apiType &&
        parsed.apiKey === apiKey.trim() &&
        parsed.apiSecret === apiSecret.trim() &&
        parsed.connection_status
      ) {
        Alert.alert("Already Connected", "Using saved credentials");
        await connectBroker(parsed);
        return;
      }

      // Test connection with backend
      const response = await axios.post(`${API_BASE_URL}/api/connect-api`, {
        userId,
        apiType,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
      });

      const data = response.data;

      if (data.connection_status === true) {
        const brokerObj = {
          userId,
          apiType,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          connection_status: true,
          lastTested: new Date().toISOString(),
        };

        await connectBroker(brokerObj);
        Alert.alert("Success", "Connection established successfully");
        setReconnectMode(false);
        // Optional: navigation.goBack();  // if you want to return after success
      } else {
        const reason = data.message || data.error || "Authentication failed";
        Alert.alert("Connection Failed", reason);
        setStatusMessage(reason);
      }
    } catch (error) {
      console.error("Full Axios error:", error);
      console.error("Response if any:", error.response);
      console.error("Request config:", error.config);

      let msg = "Could not connect to server";

      if (error.response) {
        // Server responded with 500 (or other error status)
        msg = `Server error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'No details'}`;
        console.log("Server sent:", error.response.data);
      } else if (error.request) {
        // No response received (network level)
        msg = "No response from server – check network / backend is running?";
      } else {
        msg = error.message;
      }

      Alert.alert("Connection Error", msg);
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectBroker();
    setReconnectMode(true);
  };

  // ──────────────────────────────────────────────
  // Already Connected / Success State
  // ──────────────────────────────────────────────
  if (isConnected && !reconnectMode) {
    return (
      <View style={styles.connectedContainer}>
        <Feather name="check-circle" size={50} color="#22c55e" />
        <Text style={styles.connectedText}>Broker is now connected</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.reconnectBtn]}
          onPress={handleDisconnect}
        >
          <Text style={styles.actionText}>
            <Feather name="refresh-cw" size={20} color="#fff" /> Reconnect
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.backBtn]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionText}>
            <Feather name="arrow-left" size={20} color="#fff" /> Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // Connection Form
  // ──────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#AEAED4", "#000", "#AEAED4"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBoxBorder}
    >
      <LinearGradient
        colors={["#1e2836", "#111827", "#1e2836"]}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerGradient}
      >
        <View style={styles.headerRow}>
          <Feather name="shield" size={20} color="#60a5fa" />
          <Text style={styles.header}>API Configuration</Text>
        </View>

        <Text style={styles.description}>Configure your broker API credentials</Text>

        {statusMessage ? (
          <View style={styles.statusSection}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.inputLabel}>API Key</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputField}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter API Key"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
            <Feather
              name={showApiKey ? "eye-off" : "eye"}
              size={20}
              color="#60a5fa"
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.inputLabel, { marginTop: 20 }]}>API Secret</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputField}
            value={apiSecret}
            onChangeText={setApiSecret}
            placeholder="Enter API Secret"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showApiSecret}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowApiSecret(!showApiSecret)}>
            <Feather
              name={showApiSecret ? "eye-off" : "eye"}
              size={20}
              color="#60a5fa"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleTestConnection}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Connect & Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
};

export default APIConfiguration;

const styles = StyleSheet.create({
  gradientBoxBorder: {
    borderRadius: 15,
    padding: 1,
  },
  innerGradient: {
    borderRadius: 14,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  header: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 6,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 24,
  },
  inputLabel: {
    color: "#A0AEC0",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d3748",
    padding: 12,
    borderRadius: 10,
  },
  inputField: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#078736",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusSection: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  statusText: {
    color: "#f87171",
    textAlign: "center",
    fontSize: 14,
  },

  // Connected UI
  connectedContainer: {
    backgroundColor: "#111827",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    margin: 16,
  },
  connectedText: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 16,
  },
  actionButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  reconnectBtn: {
    backgroundColor: "#2563eb",
  },
  backBtn: {
    backgroundColor: "#374151",
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});