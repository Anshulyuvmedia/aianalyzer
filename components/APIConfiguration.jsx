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
import { ConnectionContext } from "../app/context/ConnectionContext";

const APIConfiguration = ({ apiType }) => {
  const navigation = useNavigation();
  const { connectionStatus, setConnectionStatus } =
    useContext(ConnectionContext);

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

    const savedUser = await AsyncStorage.getItem("userData");
    const { _id } = JSON.parse(savedUser);

    if (!apiKey || !apiSecret) {
      Alert.alert("Error", "Please enter both API Key and API Secret");
      setLoading(false);
      return;
    }

    const savedConnection = await AsyncStorage.getItem("brokerConnection");
    const parsedConnection = savedConnection
      ? JSON.parse(savedConnection)
      : null;

    if (
      parsedConnection &&
      parsedConnection.apiType === apiType &&
      parsedConnection.apiKey === apiKey &&
      parsedConnection.connection_status === true
    ) {
      Alert.alert("Already Connected", "Using saved connection ✔");
      setConnectionStatus(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.aianalyzer.in/api/connect-api",
        { userId: _id, apiType, apiKey, apiSecret },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      Alert.alert("Success", "Connection successful");

      const brokerObj = {
        userId: _id,
        apiType,
        apiKey,
        apiSecret,
        connection_status: data.connection_status,
        lastTested: new Date().toISOString(),
      };

      await AsyncStorage.setItem("brokerConnection", JSON.stringify(brokerObj));
      console.log("Broker Connection:", brokerObj);
      setConnectionStatus(data.connection_status);
      // fetchDashboardData();
      setReconnectMode(false);
    } catch (error) {
      console.error("Connection Error:", error);
      setStatusMessage("Something went wrong ❌");
    }

    setLoading(false);
  };

  /** ---------------- ALREADY CONNECTED UI ---------------- */
  if (connectionStatus && !reconnectMode) {
    return (
      <View style={styles.connectedContainer}>
        <Feather name="check-circle" size={50} color="#22c55e" />
        <Text style={styles.connectedText}>Broker is now connected</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.reconnectBtn]}
          onPress={async () => {
            setConnectionStatus(false);
            setReconnectMode(true);
            await AsyncStorage.removeItem("brokerConnection");
            console.log("Local Is now Empty", AsyncStorage.getItem("brokerConnection"));
          }}
        >
          <Text style={styles.actionText}>
            <Feather name="refresh-cw" size={20} color="#fff" />
            {"  "}
            Reconnect
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

  /** ---------------- FORM UI ---------------- */
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

        <Text style={styles.description}>
          Configure your broker API credentials
        </Text>

        {statusMessage && (
          <View style={styles.statusSection}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* API KEY */}
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
          <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
            <Feather
              name={showApiKey ? "eye-off" : "eye"}
              size={20}
              color="#60a5fa"
            />
          </TouchableOpacity>
        </View>

        {/* API SECRET */}
        <Text style={[styles.inputLabel, { marginTop: 20 }]}>API Secret</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputField}
            value={apiSecret}
            onChangeText={setApiSecret}
            placeholder="Enter API Secret"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showApiSecret}
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

/** ---------------- STYLES ---------------- */
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
    marginBottom: 20,
  },
  inputLabel: {
    color: "#A0AEC0",
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d3748",
    padding: 10,
    borderRadius: 8,
  },
  inputField: {
    flex: 1,
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#078736ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  statusSection: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  statusText: {
    color: "#22c55e",
    textAlign: "center",
  },

  /** Connected UI */
  connectedContainer: {
    backgroundColor: "#111827",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  connectedText: {
    color: "#22c55e",
    fontSize: 18,
    marginVertical: 15,
    fontWeight: "600",
  },
  actionButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
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
  },
});
