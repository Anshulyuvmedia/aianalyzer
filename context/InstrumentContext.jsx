// contexts/InstrumentContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';

const InstrumentContext = createContext();

export const InstrumentProvider = ({ children }) => {
    const [instrumentsByType, setInstrumentsByType] = useState({
        forex: [],
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

    // Search state
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingSymbols, setIsSearchingSymbols] = useState(false);

    const fetchInProgress = useRef(new Set());
    const isMountedRef = useRef(true);

    const [allSymbolsCache, setAllSymbolsCache] = useState({
        data: [],
        timestamp: null,
        types: {}
    });
    const CACHE_DURATION = 5 * 60 * 1000;

    // Simple placeholder logo
    const getLogoUrl = useCallback((instrument) => {
        const symbol = typeof instrument === "string" ? instrument : instrument?.symbol || "?";
        const firstLetter = String(symbol)?.trim().charAt(0).toUpperCase() || "?";
        const width = 56;
        const height = 56;
        const bgColor = "0F172A";
        const textColor = "00ff9d";
        const font = "roboto";
        return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}.png?text=${firstLetter}&font=${font}`;
    }, []);

    // Fetch ALL symbols from MetaApi (with caching) - FIXED dependencies
    const fetchAllSymbols = useCallback(async (forceRefresh = false) => {
        const now = Date.now();

        // Check cache
        if (!forceRefresh && allSymbolsCache.timestamp &&
            (now - allSymbolsCache.timestamp) < CACHE_DURATION) {
            return allSymbolsCache.data;
        }

        try {
            const response = await api.get('/api/appdata/instruments/all', {
                params: { limit: 'all' }
            });

            if (response.data?.success && isMountedRef.current) {
                const symbols = response.data.data || [];

                // Group by type for quick access
                const grouped = {
                    forex: [],
                    crypto: [],
                    commodities: [],
                    indices: [],
                    stocks: [],
                    other: []
                };

                symbols.forEach(item => {
                    if (grouped[item.type]) {
                        grouped[item.type].push(item);
                    } else {
                        grouped.other.push(item);
                    }
                });

                setAllSymbolsCache({
                    data: symbols,
                    timestamp: now,
                    types: grouped
                });

                return symbols;
            }
            return [];
        } catch (err) {
            console.error('Failed to fetch all symbols:', err);
            return [];
        }
    }, [allSymbolsCache.timestamp, allSymbolsCache.data]); // Only depend on what's needed

    // Fetch instruments - FIXED to avoid recreation loop
    const fetchInstruments = useCallback(async (type = 'forex', options = {}) => {
        const { forceRefresh = false, limit = 100 } = options;
        const normType = type.toLowerCase().trim();

        // Try to get from cache first
        if (!forceRefresh && allSymbolsCache.types[normType]?.length > 0) {
            const cached = allSymbolsCache.types[normType];
            const limited = limit === 'all' ? cached : cached.slice(0, limit);

            // Only update if different
            setInstrumentsByType(prev => {
                if (JSON.stringify(prev[normType]) === JSON.stringify(limited)) {
                    return prev;
                }
                return {
                    ...prev,
                    [normType]: limited
                };
            });
            return limited;
        }

        // Fetch fresh data
        setLoadingTypes(prev => ({ ...prev, [normType]: true }));

        try {
            await fetchAllSymbols(forceRefresh);

            // Use a timeout to get the updated cache
            await new Promise(resolve => setTimeout(resolve, 100));

            const freshData = allSymbolsCache.types[normType] || [];
            const limited = limit === 'all' ? freshData : freshData.slice(0, limit);

            setInstrumentsByType(prev => {
                if (JSON.stringify(prev[normType]) === JSON.stringify(limited)) {
                    return prev;
                }
                return {
                    ...prev,
                    [normType]: limited
                };
            });

            return limited;
        } catch (err) {
            console.error(`Fetch ${normType} failed:`, err);
            return instrumentsByType[normType] || [];
        } finally {
            setLoadingTypes(prev => ({ ...prev, [normType]: false }));
        }
    }, [allSymbolsCache.types, fetchAllSymbols, instrumentsByType]);

    // Clear search results
    const clearSearchResults = useCallback(() => {
        setSearchResults([]);
        setIsSearchingSymbols(false);
    }, []);

    // Search instruments
    const searchInstruments = useCallback(async (query, options = {}) => {
        const { limit = 50, forceRefresh = false } = options;

        if (!query?.trim()) {
            clearSearchResults();
            return [];
        }

        setIsSearchingSymbols(true);

        try {
            if (!forceRefresh && allSymbolsCache.data.length > 0) {
                const term = query.trim().toUpperCase();
                const cachedResults = allSymbolsCache.data
                    .filter(item => item.symbol.toUpperCase().includes(term))
                    .slice(0, limit);

                if (cachedResults.length > 0) {
                    setSearchResults(cachedResults);
                    setIsSearchingSymbols(false);
                    return cachedResults;
                }
            }

            const response = await api.get(`/api/appdata/instruments/search`, {
                params: { q: query.trim(), limit }
            });

            if (response.data?.success) {
                const results = response.data.data || [];
                setSearchResults(results);
                return results;
            }

            setSearchResults([]);
            return [];
        } catch (err) {
            console.error('Search instruments failed:', err);
            setSearchResults([]);
            return [];
        } finally {
            setIsSearchingSymbols(false);
        }
    }, [allSymbolsCache.data, clearSearchResults]);

    // Preload all symbols on mount - ONLY ONCE
    useEffect(() => {
        isMountedRef.current = true;
        fetchAllSymbols();

        return () => {
            isMountedRef.current = false;
        };
    }, []); // Empty dependency array - only runs once

    // Preload important categories - ONLY ONCE
    useEffect(() => {
        fetchInstruments('forex');
    }, []); // Empty dependency array - only runs once

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

    // Fetch instrument details
    const fetchInstrumentDetails = useCallback(async (symbol) => {
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

        const minimal = { symbol, name: symbol };
        setSelectedInstrument(minimal);
        return minimal;
    }, [instrumentsByType]);

    // Fetch symbol specification
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

    // Fetch quote
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
                const normalized = {
                    symbol: q.symbol,
                    bid: q.bid,
                    ask: q.ask,
                    last: q.last || ((q.bid + q.ask) / 2).toFixed(5),
                    spread: q.spread || (q.ask - q.bid).toFixed(5),
                    timestamp: q.timestamp || new Date().toISOString(),
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

    // Place order
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
            const errorMessage = err.response?.data?.error || err.message || "Order placement failed";
            throw new Error(errorMessage);
        }
    }, []);

    const value = {
        instrumentsByType,
        loading: loadingTypes,
        error,
        fetchInstruments,
        fetchAllSymbols,
        allSymbolsCache,
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
        searchInstruments,
        searchResults,
        isSearchingSymbols,
        clearSearchResults,
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