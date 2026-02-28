// contexts/InstrumentContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '@/config/api';

const InstrumentContext = createContext();

export const InstrumentProvider = ({ children }) => {
    const [instrumentsByType, setInstrumentsByType] = useState({
        stocks: [],
        forex_pairs: [],
        cryptocurrencies: [],
        commodities: [],
    });

    const [loadingTypes, setLoadingTypes] = useState({});
    const [error, setError] = useState(null);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [watchlist, setWatchlist] = useState([]);

    // ── NEW: Quote state ───────────────────────────────────────────────
    const [quoteData, setQuoteData] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState(null);

    // Placeholder logo
    const getLogoUrl = useCallback((instrument) => {
        const symbol = instrument?.symbol || '?';
        const firstLetter = symbol.trim().charAt(0).toUpperCase() || '?';

        const width = 56;
        const height = 56;
        const bgColor = '0F172A';
        const textColor = '00ff9d';
        const font = 'roboto';

        return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}.png?text=${firstLetter}&font=${font}`;
    }, []);

    // Fetch list of instruments
    const fetchInstruments = useCallback(
        async (type = 'stocks', options = {}) => {
            const { forceRefresh = false } = options;

            if (!forceRefresh && instrumentsByType[type]?.length > 0) {
                console.log(`Using cached ${type} data (${instrumentsByType[type].length} items)`);
                return instrumentsByType[type];
            }

            setLoadingTypes((prev) => ({ ...prev, [type]: true }));
            setError(null);

            try {
                const params = { type };

                if (type === 'stocks') {
                    params.exchange = 'NASDAQ';
                }

                const response = await axios.get(`${API_BASE_URL}/api/appdata/list-instruments`, {
                    params,
                });

                if (!response.data?.success) {
                    throw new Error(response.data?.message || 'API returned failure');
                }

                const data = response.data.data || [];
                setInstrumentsByType((prev) => ({
                    ...prev,
                    [type]: data,
                }));

                console.log(`Loaded ${data.length} ${type} instruments`);
                return data;
            } catch (err) {
                const msg = err.response?.data?.message || err.message || `Failed to load ${type}`;
                setError(msg);
                console.error(`Fetch ${type} failed:`, err);
                return [];
            } finally {
                setLoadingTypes((prev) => ({ ...prev, [type]: false }));
            }
        },
        [instrumentsByType]
    );

    // Preload
    useEffect(() => {
        fetchInstruments('stocks');
        fetchInstruments('cryptocurrencies');
        fetchInstruments('forex_pairs');
        fetchInstruments('commodities');
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

    // Fetch single instrument details & set as selected
    const fetchInstrumentDetails = useCallback(
        async (symbol, type = 'stocks') => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/appdata/list-instruments`, {
                    params: {
                        type,
                        symbol,
                    },
                });

                if (response.data?.success && response.data.data?.length > 0) {
                    const item = response.data.data[0];
                    setSelectedInstrument(item);
                    return item;
                }
                setSelectedInstrument(null);
                return null;
            } catch (err) {
                console.error(`Failed to fetch details for ${symbol}:`, err);
                setSelectedInstrument(null);
                return null;
            }
        },
        []
    );

    // ── NEW: Centralized quote fetch ───────────────────────────────────
    const fetchQuote = useCallback(async (symbol) => {
        if (!symbol) {
            setQuoteError('No symbol provided');
            return;
        }

        setQuoteLoading(true);
        setQuoteError(null);
        setQuoteData(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/appdata/quote`, {
                params: { symbol },
            });

            if (response.data?.success) {
                setQuoteData(response.data.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch quote');
            }
        } catch (err) {
            let msg = err.message || 'Failed to load quote';

            // Broader fallback on 500 or credit errors
            if (err.response?.status === 500 || msg.includes('API credits') || msg.includes('quota')) {
                msg = 'Quote service unavailable (quota or server issue). Showing demo data.';
                setQuoteError(msg);

                const dummyQuote = {
                    symbol: symbol.toUpperCase(),
                    name: selectedInstrument?.name || 'Unknown Instrument',
                    exchange: selectedInstrument?.exchange || '—',
                    currency: 'USD',
                    datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    close: (Math.random() * 200 + 50).toFixed(2),
                    change: (Math.random() * 10 - 5).toFixed(2),
                    percent_change: (Math.random() * 8 - 4).toFixed(2),
                    previous_close: (Math.random() * 200 + 50).toFixed(2),
                    volume: Math.floor(Math.random() * 1e8 + 1e6),
                    is_market_open: false,
                };

                setQuoteData(dummyQuote); // This must run
                console.warn(`Quote failed for ${symbol} — dummy data set:`, dummyQuote.close);
            } else {
                setQuoteError(msg);
                console.error('Quote fetch failed:', err);
            }
        } finally {
            setQuoteLoading(false);
        }
    }, []);

    const clearSelectedInstrument = useCallback(() => {
        setSelectedInstrument(null);
        setQuoteData(null);        // also clear quote when deselecting
        setQuoteError(null);
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

        // ── NEW exports for quote ──────────────────────────────────────
        quoteData,
        quoteLoading,
        quoteError,
        fetchQuote,
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