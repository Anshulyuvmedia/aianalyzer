import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const BASE_URL = "http://192.168.1.42:3000/api/appdata";
  const [connectionStatus, setConnectionStatus] = useState(false); // default false
  const [dashboardData, setDashboardData] = useState(null);
  const [algotradingData, setAlgotradingData] = useState(null);
  const [copytradingData, setCopytradingData] = useState(null);
  const [loadingCopytrading, setLoadingCopytrading] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAlgotrading, setLoadingAlgotrading] = useState(true);
  const [notifications, setnotifications] = useState(null);


  const fetchDashboardData = async () => {
    // console.log("Fetching dashboard data...");
    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) return;

      const { _id } = JSON.parse(savedUser);

      const response = await axios.get(
        `${BASE_URL}/dashboard-data?userid=${_id}`
      );

      // Save in global context
      setDashboardData(response.data);

      // Save in local cache
      await AsyncStorage.setItem("dashboardCache", JSON.stringify(response.data));


      setLoadingDashboard(false);
    } catch (error) {
      console.log("Dashboard fetch failed:", error);

      // 🟡 Fallback to saved cache
      const cache = await AsyncStorage.getItem("dashboardCache");
      if (cache) {
        setDashboardData(JSON.parse(cache));
      }

      setLoadingDashboard(false);
    }
  };
  const fetchAlogtradingData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) return;

      const { _id } = JSON.parse(savedUser);

      const response = await axios.get(
        `${BASE_URL}/algotrading-data?userid=${_id}`
      );

      // Save in global context
      setAlgotradingData(response.data);

      // Save in local cache
      await AsyncStorage.setItem("algotradingCache", JSON.stringify(response.data));


      setLoadingAlgotrading(false);
    } catch (error) {
      console.log("Algotrading fetch failed:", error);

      // 🟡 Fallback to saved cache
      const cache = await AsyncStorage.getItem("algotradingCache");
      if (cache) {
        setAlgotradingData(JSON.parse(cache));
      }

      setLoadingAlgotrading(false);
    }
  };
  const FetchCopyTradingData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) return;

      const { _id } = JSON.parse(savedUser);

      const response = await axios.get(
        `${BASE_URL}/copytrading-data?userid=${_id}`
      );
      // console.log("Copytrading fetch failed:", response.data);

      // Save in global context
      setCopytradingData(response.data);

      // Save in local cache
      await AsyncStorage.setItem("copytradingCache", JSON.stringify(response.data));


      setLoadingCopytrading(false);
    } catch (error) {
      console.log("Copytrading fetch failed:", error);

      // 🟡 Fallback to saved cache
      const cache = await AsyncStorage.getItem("copytradingCache");
      if (cache) {
        setCopytradingData(JSON.parse(cache));
      }

      setLoadingCopytrading(false);
    }
  };
  const FetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get-notifications`
      );
      // console.log("Notifications fetch failed:", response.data);
      setnotifications(response.data);
    } catch (error) {
      console.log("Notifications fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAlogtradingData();
    FetchCopyTradingData();
    FetchNotifications();

    // Auto-refresh every 5 minutes
    // const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <ConnectionContext.Provider value={
      { notifications, connectionStatus, setConnectionStatus, dashboardData, loadingDashboard, algotradingData, loadingAlgotrading, copytradingData, loadingCopytrading }
    }>
      {children}
    </ConnectionContext.Provider>
  );
};
