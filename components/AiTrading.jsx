// (root)/components/AiTrading.jsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

const AiTrading = ({ data = {}, strategy, lastTradeTime, pnl = 0, engineStatus }) => {

    // ---------------- SAFE HELPERS ----------------
    const safeNumber = (val, def = 0) => {
        const num = Number(val);
        return isNaN(num) ? def : num;
    };

    // ---------------- DATA ----------------
    const confidence = safeNumber(data?.confidence, 0);
    const progress = Math.min(Math.max(confidence / 100, 0), 1);

    const winRate = safeNumber(data?.winRate, 0);
    const roi = safeNumber(data?.roi, 0);
    const tradesExecuted = safeNumber(data?.tradesExecuted, 0);

    const status = data?.status || strategy?.status || "Paused";
    const timeframe = data?.timeframe || strategy?.timeframes?.[0] || "—";
    const market = data?.market || strategy?.symbols?.[0] || "—";
    const sentiment = data?.sentiment || "NEUTRAL";

    // ---------------- LIVE STATE ----------------
    const [isLive, setIsLive] = useState(false);
    const [lastTradeAgo, setLastTradeAgo] = useState("—");

    const blinkAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);

    // ---------------- ANIMATIONS ----------------
    const pnlAnim = useRef(new Animated.Value(0)).current;
    const tradePulse = useRef(new Animated.Value(1)).current;
    const confidenceAnim = useRef(new Animated.Value(0)).current;

    // ---------------- TIMER & LIVE STATUS ----------------
    useEffect(() => {
        if (!lastTradeTime) {
            setIsLive(false);
            setLastTradeAgo("—");
            return;
        }

        const interval = setInterval(() => {
            const diff = Date.now() - lastTradeTime;

            const liveStatus = diff < 8000; // 8 seconds window for "live"
            setIsLive(liveStatus);

            if (diff < 1000) setLastTradeAgo("Just now");
            else if (diff < 60000) setLastTradeAgo(`${Math.floor(diff / 1000)}s ago`);
            else setLastTradeAgo(`${Math.floor(diff / 60000)}m ago`);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastTradeTime]);

    // ---------------- LIVE BLINK ANIMATION ----------------
    useEffect(() => {
        if (isLive) {
            animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
                    Animated.timing(blinkAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            );
            animationRef.current.start();
        } else {
            blinkAnim.setValue(1);
            animationRef.current?.stop();
        }

        return () => animationRef.current?.stop();
    }, [isLive]);

    // ---------------- PNL FLASH ----------------
    useEffect(() => {
        Animated.sequence([
            Animated.timing(pnlAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(pnlAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
        ]).start();
    }, [pnl]);

    // ---------------- TRADE PULSE ----------------
    useEffect(() => {
        if (!lastTradeTime) return;

        Animated.sequence([
            Animated.timing(tradePulse, { toValue: 1.04, duration: 180, useNativeDriver: true }),
            Animated.timing(tradePulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, [lastTradeTime]);

    // ---------------- CONFIDENCE ANIMATION ----------------
    useEffect(() => {
        Animated.timing(confidenceAnim, {
            toValue: progress,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [progress]);

    // ---------------- COLORS ----------------
    const pnlColor = pnl >= 0 ? "#22c55e" : "#ef4444";
    const sentimentColor =
        sentiment === "BULLISH" ? "#22c55e" :
            sentiment === "BEARISH" ? "#ef4444" : "#94a3b8";

    const strokeDashoffset = 188 - (progress * 188); // Circumference ≈ 188 (2 * π * 30)

    return (
        <Animated.View
            style={{
                transform: [{ scale: tradePulse }]
            }}
        >
            <LinearGradient
                colors={['#1e2937', '#0f172a']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.strategyName}>{strategy?.name || "AI Trading Engine"}</Text>
                        <Text style={styles.marketInfo}>
                            {market} • {timeframe}
                        </Text>
                    </View>

                    {/* LIVE STATUS */}
                    <View style={styles.liveContainer}>
                        <Animated.View
                            style={[
                                styles.liveDot,
                                {
                                    opacity: isLive ? blinkAnim : 0.35,
                                    transform: [{ scale: isLive ? blinkAnim : 1 }]
                                }
                            ]}
                        />
                        <Text style={[
                            styles.liveText,
                            { color: isLive ? "#22c55e" : "#64748b" }
                        ]}>
                            {isLive ? "● LIVE" : "IDLE"}
                        </Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    </View>
                </View>

                {/* LAST TRADE */}
                <Text style={styles.lastTrade}>
                    Last trade • {lastTradeAgo}
                </Text>

                {/* METRICS ROW */}
                <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                        <Text style={styles.metricValue}>{winRate.toFixed(1)}%</Text>
                        <Text style={styles.metricLabel}>Win Rate</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.metric,
                            {
                                transform: [{
                                    scale: pnlAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 1.15],
                                    })
                                }]
                            }
                        ]}
                    >
                        <Text style={[styles.metricValue, { color: pnlColor }]}>
                            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
                        </Text>
                        <Text style={styles.metricLabel}>Today's PnL</Text>
                    </Animated.View>

                    <View style={styles.metric}>
                        <Text style={styles.metricValue}>{tradesExecuted}</Text>
                        <Text style={styles.metricLabel}>Trades</Text>
                    </View>
                </View>

                {/* AI CONFIDENCE + SENTIMENT */}
                <View style={styles.aiContainer}>
                    <View style={styles.sentimentContainer}>
                        <Text style={styles.sectionLabel}>Market Sentiment</Text>
                        <Text style={[styles.sentimentText, { color: sentimentColor }]}>
                            {sentiment}
                        </Text>
                    </View>

                    {/* Confidence Circle */}
                    <View style={styles.confidenceContainer}>
                        <Svg height="92" width="92" viewBox="0 0 80 80">
                            {/* Background Circle */}
                            <Circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="#1e2937"
                                strokeWidth="7"
                                fill="none"
                            />
                            {/* Progress Circle */}
                            <AnimatedCircle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="#22c55e"
                                strokeWidth="7"
                                fill="none"
                                strokeDasharray="201"
                                strokeDashoffset={Animated.multiply(
                                    Animated.subtract(1, confidenceAnim),
                                    201
                                )}
                                strokeLinecap="round"
                                rotation="-90"
                                origin="40,40"
                            />
                            {/* Center Text */}
                            <SvgText
                                x="40"
                                y="40"
                                textAnchor="middle"
                                dy=".35em"
                                fill="#f1f5f9"
                                fontSize="18"
                                fontWeight="700"
                            >
                                {Math.round(confidence)}%
                            </SvgText>
                        </Svg>
                        <Text style={styles.confidenceLabel}>Confidence</Text>
                    </View>
                </View>

                {/* Optional: Engine Status Message */}
                {engineStatus?.message && (
                    <View style={styles.statusMessage}>
                        <Text style={styles.statusMessageText}>
                            {engineStatus.message}
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

// Custom Animated Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default AiTrading;

// ---------------- MODERN STYLES ----------------
const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    headerLeft: {
        flex: 1,
    },
    strategyName: {
        color: "#f8fafc",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    marketInfo: {
        color: "#94a3b8",
        fontSize: 13.5,
        marginTop: 2,
    },
    liveContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    liveDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#22c55e",
    },
    liveText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    statusBadge: {
        backgroundColor: "#1e2937",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#334155",
    },
    statusText: {
        color: "#cbd5e1",
        fontSize: 11.5,
        fontWeight: "600",
    },
    lastTrade: {
        color: "#64748b",
        fontSize: 12.5,
        marginBottom: 18,
    },
    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 22,
    },
    metric: {
        alignItems: "center",
        flex: 1,
    },
    metricValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#f1f5f9",
    },
    metricLabel: {
        fontSize: 12.5,
        color: "#64748b",
        marginTop: 4,
        fontWeight: "500",
    },
    aiContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    sentimentContainer: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: 13,
        color: "#94a3b8",
        marginBottom: 6,
    },
    sentimentText: {
        fontSize: 21,
        fontWeight: "700",
        letterSpacing: -0.4,
    },
    confidenceContainer: {
        alignItems: "center",
    },
    confidenceLabel: {
        marginTop: 8,
        fontSize: 12.5,
        color: "#94a3b8",
        fontWeight: "500",
    },
    statusMessage: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#1e2937",
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: "#64748b",
    },
    statusMessageText: {
        color: "#cbd5e1",
        fontSize: 13,
        lineHeight: 18,
    },
});