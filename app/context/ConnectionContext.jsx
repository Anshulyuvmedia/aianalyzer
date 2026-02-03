import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const BASE_URL = "https://api.aianalyzer.in/api/appdata";

  const [connectionStatus, setConnectionStatus] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [algotradingData, setAlgotradingData] = useState(null);
  const [copytradingData, setCopytradingData] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [referralData, setReferralData] = useState(null);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAlgotrading, setLoadingAlgotrading] = useState(true);
  const [loadingCopytrading, setLoadingCopytrading] = useState(true);
  const [loadingReferral, setLoadingReferral] = useState(true);

  /* ---------------- DASHBOARD ---------------- */

  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const response = await axios.get(`${BASE_URL}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.log("Dashboard fetch failed:", error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  /* ---------------- ALGOTRADING ---------------- */

  const fetchAlogtradingData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) return;

      const { _id } = JSON.parse(savedUser);
      const response = await axios.get(
        `${BASE_URL}/algotrading-data?userid=${_id}`
      );

      setAlgotradingData(response.data);
      await AsyncStorage.setItem(
        "algotradingCache",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.log("Algotrading fetch failed:", error);
      const cache = await AsyncStorage.getItem("algotradingCache");
      if (cache) setAlgotradingData(JSON.parse(cache));
    } finally {
      setLoadingAlgotrading(false);
    }
  };

  /* ---------------- COPY TRADING ---------------- */

  const fetchCopyTradingData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("userData");
      if (!savedUser) return;

      const { _id } = JSON.parse(savedUser);
      const response = await axios.get(
        `${BASE_URL}/copytrading-data?userid=${_id}`
      );

      setCopytradingData(response.data);
      await AsyncStorage.setItem(
        "copytradingCache",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.log("Copytrading fetch failed:", error);
      const cache = await AsyncStorage.getItem("copytradingCache");
      if (cache) setCopytradingData(JSON.parse(cache));
    } finally {
      setLoadingCopytrading(false);
    }
  };

  /* ---------------- NOTIFICATIONS ---------------- */

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-notifications`);
      console.log("Notifications Data:", response);
      setNotifications(response.data);
    } catch (error) {
      console.log("Notifications fetch failed:", error);
    }
  };

  /* ---------------- REFERRALS ---------------- */

  const fetchReferralData = async () => {
    try {
      setLoadingReferral(true);
      const response = await axios.get(`${BASE_URL}/referrals`);
      setReferralData(response.data?.data || null);
    } catch (error) {
      console.log("Referral fetch failed:", error);
    } finally {
      setLoadingReferral(false);
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    fetchDashboardData();
    fetchAlogtradingData();
    fetchCopyTradingData();
    fetchNotifications();
    fetchReferralData();
  }, []);

  /* ---------------- CACHE DASHBOARD ---------------- */

  useEffect(() => {
    if (!dashboardData) return;

    AsyncStorage.setItem(
      "dashboardData",
      JSON.stringify(dashboardData)
    );
  }, [dashboardData]);

  /* ---------------- CONTEXT PROVIDER ---------------- */

  return (
    <ConnectionContext.Provider
      value={{
        connectionStatus,
        setConnectionStatus,
        dashboardData,
        loadingDashboard,
        algotradingData,
        loadingAlgotrading,
        copytradingData,
        loadingCopytrading,
        notifications,
        referralData,
        loadingReferral,
        fetchDashboardData,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
