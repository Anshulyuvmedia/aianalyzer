// contexts/InstrumentContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';

const InstrumentContext = createContext();

export const InstrumentProvider = ({ children }) => {
    const [instrumentsByType, setInstrumentsByType] = useState({
        forex: [],           // start empty – we'll fill it immediately
        crypto: [],
        commodities: [],
        indices: [],
        stocks: [],
        other: [],
    });

    const [loadingTypes, setLoadingTypes] = useState({});
    const [error, setError] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [symbolSpecs, setSymbolSpecs] = useState({});
    // Quote state
    const [quoteData, setQuoteData] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState(null);
    const fetchInProgress = useRef(new Set());
    // Simple placeholder logo (still useful when no real icon available)
    const getLogoUrl = useCallback((instrument) => {
        const symbol =
            typeof instrument === "string"
                ? instrument
                : instrument?.symbol || "?";

        const firstLetter = String(symbol)?.trim().charAt(0).toUpperCase() || "?";

        const width = 56;
        const height = 56;
        const bgColor = "0F172A";
        const textColor = "00ff9d";
        const font = "roboto";

        return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}.png?text=${firstLetter}&font=${font}`;
    }, []);

    // Fetch list of instruments from broker via MetaApi
    const fetchInstruments = useCallback(async (type = 'forex', options = {}) => {
        const { forceRefresh = false } = options;

        const normType = type.toLowerCase().trim();

        // Skip if already loaded and not forced
        if (!forceRefresh && instrumentsByType[normType]?.length > 0) {
            return instrumentsByType[normType];
        }

        // Prevent duplicate simultaneous calls for same type
        if (fetchInProgress.current.has(normType)) {
            console.log(`Fetch for ${normType} already in progress – skipping`);
            return instrumentsByType[normType] || [];
        }

        fetchInProgress.current.add(normType);
        setLoadingTypes(prev => ({ ...prev, [normType]: true }));

        try {
            const response = await api.get(`/api/appdata/instruments`, {
                params: { type: normType, limit: 20 }
            });

            if (!response.data?.success) {
                throw new Error(response.data?.error || 'API failed');
            }

            const data = response.data.data || [];

            setInstrumentsByType(prev => ({
                ...prev,
                [normType]: data
            }));

            return data;
        } catch (err) {
            console.error(`Fetch ${normType} failed:`, err);
            return instrumentsByType[normType] || [];
        } finally {
            setLoadingTypes(prev => ({ ...prev, [normType]: false }));
            fetchInProgress.current.delete(normType);
        }
    }, [instrumentsByType]);

    // Preload important categories
    useEffect(() => {
        fetchInstruments('forex');
    }, [fetchInstruments]);

    // Toggle watchlist
    const toggleWatchlist = useCallback((instrument) => {
        setWatchlist((prev) => {
            const symbol = instrument.symbol;
            if (prev.some((i) => i.symbol === symbol)) {
                return prev.filter((i) => i.symbol !== symbol);
            }
            return [...prev, instrument];
        });
    }, []);

    // Optional: fetch more details if needed (but often not necessary with MetaApi)
    const fetchInstrumentDetails = useCallback(
        async (symbol) => {
            // For now — just find in cache or set directly
            // You can extend later to call getSymbolSpecification if you add that endpoint
            const allLoaded = [
                ...instrumentsByType.forex,
                ...instrumentsByType.crypto,
                ...instrumentsByType.commodities,
                ...instrumentsByType.indices,
                ...instrumentsByType.stocks,
            ];

            const found = allLoaded.find(i => i.symbol === symbol);
            if (found) {
                setSelectedInstrument(found);
                return found;
            }

            // Fallback: just use symbol
            const minimal = { symbol, name: symbol };
            setSelectedInstrument(minimal);
            return minimal;
        },
        [instrumentsByType]
    );

    const fetchSymbolSpecification = useCallback(async (symbol) => {

        if (symbolSpecs[symbol]) return symbolSpecs[symbol];

        try {

            const response = await api.get('/api/appdata/instrument-spec', {
                params: { symbol }
            });

            if (response.data?.success) {

                setSymbolSpecs(prev => ({
                    ...prev,
                    [symbol]: response.data.data
                }));

                return response.data.data;
            }

        } catch (err) {

            console.error("spec fetch failed", err);
        }

    }, [symbolSpecs]);

    // Fetch real-time quote (bid/ask) from broker
    const fetchQuote = useCallback(async (symbol) => {
        if (!symbol) {
            setQuoteError('No symbol provided');
            return;
        }

        setQuoteLoading(true);
        setQuoteError(null);
        setQuoteData(null);

        try {
            const response = await api.get(`/api/appdata/quote`, {
                params: { symbol: symbol.trim() },
            });

            if (response.data?.success && response.data.data) {
                const q = response.data.data;

                // Normalize to something frontend-friendly
                const normalized = {
                    symbol: q.symbol,
                    bid: q.bid,
                    ask: q.ask,
                    last: q.last || ((q.bid + q.ask) / 2).toFixed(5),
                    spread: q.spread || (q.ask - q.bid).toFixed(5),
                    timestamp: q.timestamp || new Date().toISOString(),
                    // Add more if your backend sends them later
                };

                setQuoteData(normalized);
            } else {
                throw new Error(response.data?.error || 'Failed to fetch quote');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to load quote';
            setQuoteError(msg);
            console.error(`Quote fetch failed for ${symbol}:`, err);
            setQuoteData(null);
        } finally {
            setQuoteLoading(false);
        }
    }, []);

    const clearSelectedInstrument = useCallback(() => {
        setSelectedInstrument(null);
        setQuoteData(null);
        setQuoteError(null);
    }, []);

    //-----------------------------------------------------------------------
    const placeOrder = useCallback(async (order) => {
        try {
            const payload = {
                symbol: order.symbol,
                side: order.side,
                orderType: order.orderType,
                volume: order.volume,
                price: order.price || null,
                stopLoss: order.stopLoss || null,
                takeProfit: order.takeProfit || null,
                magic: order.magic || null,
                comment: order.comment || null,
            };

            // Remove null/undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === null || payload[key] === undefined) {
                    delete payload[key];
                }
            });

            const response = await api.post('/api/appdata/order/place-order', payload);

            if (response.data?.success) {
                return response.data;
            }

            throw new Error(response.data?.error || "Order failed");

        } catch (err) {
            console.error("Order placement failed:", err);

            // Extract error message from response if available
            const errorMessage = err.response?.data?.error || err.message || "Order placement failed";
            throw new Error(errorMessage);
        }
    }, []);

    const value = {
        instrumentsByType,
        loading: loadingTypes,
        error,
        fetchInstruments,
        getLogoUrl,
        selectedInstrument,
        setSelectedInstrument,
        fetchInstrumentDetails,
        clearSelectedInstrument,
        watchlist,
        toggleWatchlist,
        fetchSymbolSpecification,
        symbolSpecs,
        quoteData,
        quoteLoading,
        quoteError,
        fetchQuote,
        placeOrder,
    };

    return (
        <InstrumentContext.Provider value={value}>
            {children}
        </InstrumentContext.Provider>
    );
};

export const useInstruments = () => {
    const context = useContext(InstrumentContext);
    if (!context) {
        throw new Error('useInstruments must be used within InstrumentProvider');
    }
    return context;
};