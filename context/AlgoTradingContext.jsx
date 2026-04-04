// src/context/AlgoTradingContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket } from "../lib/socketService";
import { useAuth } from "./AuthContext";
import api from '@/lib/axios';
import { BrokerContext } from "@/context/BrokerContext";

export const AlgoTradingContext = createContext();

export const AlgoTradingProvider = ({ children }) => {
    const { brokerConnection } = useContext(BrokerContext);
    const [algotradingData, setAlgotradingData] = useState(null);
    const [loadingAlgotrading, setLoadingAlgotrading] = useState(true);
    const { user } = useAuth(); // must contain user._id
    const [trades, setTrades] = useState([]);
    const [pnl, setPnl] = useState(null);
    const resetTrades = () => setTrades([]);
    const [pendingTrades, setPendingTrades] = useState([]);
    const [lastTradeTime, setLastTradeTime] = useState(null);
    const [engineStatus, setEngineStatus] = useState({});
    const [engineLogs, setEngineLogs] = useState([]);


    useEffect(() => {
        if (!user?._id) return;
        let socketInstance;
        let handleSingle;
        let handleBatch;
        const init = async () => {
            socketInstance = await connectSocket(user._id);

            handleSingle = (data) => {
                console.log("🔥 TRADE RECEIVED:", JSON.stringify(data, null, 2));
                if (data.type === "PNL") {
                    setPnl(data);
                } else {
                    setTrades(prev => [
                        { ...data, _receivedAt: Date.now() },
                        ...prev,
                    ].slice(0, 50));
                }
                if (data.event === "pnl") {
                    setPnl(data);
                }
                if (data.event === "trade") {
                    setAlgotradingData(prev => {
                        if (!prev) return prev;
                        setLastTradeTime(Date.now());
                        return {
                            ...prev,
                            aiTrading: {
                                ...prev.aiTrading,
                                tradesExecuted: (prev.aiTrading?.tradesExecuted || 0) + 1,
                                lastTrade: data,
                                status: "Active"
                            }
                        };
                    });
                }
            };
            handleBatch = (batch) => {
                const pnlUpdate = batch.find(t => t.type === "PNL");
                if (pnlUpdate) setPnl(pnlUpdate);
                const tradesOnly = batch.filter(t => t.type !== "PNL");
                if (tradesOnly.length) {
                    setTrades(prev => [
                        ...tradesOnly.map(t => ({
                            ...t,
                            _receivedAt: Date.now(),
                        })),
                        ...prev,
                    ].slice(0, 50));
                }
            };
            socketInstance.on("tradeUpdate", handleSingle);
            socketInstance.on("tradeBatch", handleBatch);
            socketInstance.on("engineEvent", (data) => {
                console.log("⚙️ ENGINE EVENT:", data);
                if (data.event === "engine") {
                    if (data.type === "STATUS") {
                        setEngineStatus(data);
                    }
                    if (data.type === "LOG") {
                        setEngineLogs(prev => [data.message, ...prev]);
                    }
                    if (data.type === "ERROR") {
                        setEngineStatus({
                            status: "error",
                            message: data.message
                        });
                    }
                    return;
                }
            });
        };
        init();
        return () => {
            socketInstance?.off("tradeUpdate", handleSingle);
            socketInstance?.off("tradeBatch", handleBatch);
        };
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (pendingTrades.length) {
                setTrades(prev => [...pendingTrades, ...prev].slice(0, 50));
                setPendingTrades([]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [pendingTrades]);

    const fetchAlgoTradingData = useCallback(async () => {
        try {
            setLoadingAlgotrading(true);
            const savedUser = await AsyncStorage.getItem('userData');
            if (!savedUser) return;

            const { _id } = JSON.parse(savedUser);
            const response = await api.get(`/api/appdata/algotrading-data?userid=${_id}`);

            setAlgotradingData(response.data);
            await AsyncStorage.setItem('algotradingCache', JSON.stringify(response.data));
        } catch (error) {
            console.log('AlgoTrading fetch failed:', error);
            const cache = await AsyncStorage.getItem('algotradingCache');
            if (cache) setAlgotradingData(JSON.parse(cache));
        } finally {
            setLoadingAlgotrading(false);
        }
    }, []);

    const updateStategyStatus = useCallback(async (strategy, newStatus) => {
        try {
            if (!strategy) return;
            const metaApiAccountId = brokerConnection?.metaApiAccountId;
            console.log("🧠 Strategy:", strategy);
            console.log("🔗 Broker:", brokerConnection);
            if (!metaApiAccountId) {
                alert("Please connect broker first");
                return;
            }
            if (!strategy.symbols?.length || !strategy.timeframes?.length) {
                alert("Strategy config missing");
                return;
            }
            if (newStatus === "Active") {
                const res = await api.post(
                    `/api/appdata/strategies/${strategy._id}/activate`,
                    {
                        metaApiAccountId,
                        symbol: strategy.symbols[0],
                        timeframe: strategy.timeframes[0],
                        riskPerTradePercent: 1
                    }
                );
                console.log("✅ Activation Response:", res.data);
                setEngineStatus({
                    status: "starting",
                    message: "Starting strategy..."
                });
            } else {
                const res = await api.post(
                    `/api/appdata/strategies/${strategy._id}/deactivate`,
                    {
                        metaApiAccountId,
                        action: "pause"
                    }
                );
                console.log("⛔ Deactivation Response:", res.data);
            }
        } catch (err) {
            console.error("❌ Strategy Update Failed:", err.response?.data || err.message);
        }
    }, [brokerConnection]);

    useEffect(() => {
        fetchAlgoTradingData();
    }, [fetchAlgoTradingData]);

    return (
        <AlgoTradingContext.Provider
            value={{
                algotradingData,
                loadingAlgotrading,
                fetchAlgoTradingData,
                trades,
                pnl,
                resetTrades,
                updateStategyStatus,
                engineStatus,
                engineLogs,
            }}
        >
            {children}
        </AlgoTradingContext.Provider>
    );
};