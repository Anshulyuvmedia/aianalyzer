import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function TradingChart({ symbol }) {

    const tvSymbol = `${symbol}`; // TradingView forex format

    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            html, body {
                margin:0;
                padding:0;
                height:100%;
                width:100%;
                background:#0B0E11;
            }

            .tradingview-widget-container {
                height:100%;
                width:100%;
            }

            #tradingview_chart {
                height:100%;
                width:100%;
            }
        </style>
    </head>

    <body>
        <div class="tradingview-widget-container">
        <div id="tradingview_chart"></div>
        </div>
        <script src="https://s3.tradingview.com/tv.js"></script>
        <script>
            new TradingView.widget({
            autosize: true,
            symbol: "${tvSymbol}",
            interval: "15",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0B0E11",
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: "tradingview_chart"
            });
        </script>
    </body>
</html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={["*"]}
                source={{ html }}
                javaScriptEnabled
                domStorageEnabled
                style={styles.webview}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 420,
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1E252E",
    },
    webview: {
        flex: 1,
        backgroundColor: "#0B0E11",
    },
});