// Create new file: hooks/usePositionsData.js

import { useState, useMemo, useCallback } from 'react';

export const usePositionsData = (positions, quoteData, symbolSpecs) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [sortBy, setSortBy] = useState('pnl');
    const [sortOrder, setSortOrder] = useState('desc');

    // Calculate current price for a position
    const getCurrentPrice = useCallback((position) => {
        if (position.currentPrice) return position.currentPrice;

        const quote = quoteData?.[position.symbol];
        if (!quote) return position.openPrice;

        return position.type === 'POSITION_TYPE_BUY' ? quote.ask : quote.bid;
    }, [quoteData]);

    // Calculate PnL for a position
    const calculatePnL = useCallback((position) => {
        if (position.pnl !== undefined) return position.pnl;

        const currentPrice = getCurrentPrice(position);
        const contractSize = position.contractSize || 100000;
        const isBuy = position.type === 'POSITION_TYPE_BUY';

        let pnl = 0;
        if (isBuy) {
            pnl = (currentPrice - position.openPrice) * contractSize * position.volume;
        } else {
            pnl = (position.openPrice - currentPrice) * contractSize * position.volume;
        }

        // Add swap and commission
        return pnl + (position.swap || 0) + (position.commission || 0);
    }, [getCurrentPrice]);

    // Filter and sort positions
    const processedPositions = useMemo(() => {
        if (!positions || positions.length === 0) return [];

        let filtered = [...positions];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.symbol?.toLowerCase().includes(query) ||
                p.id?.toString().includes(query)
            );
        }

        // Apply profit/loss filter
        filtered = filtered.filter(p => {
            const pnl = calculatePnL(p);
            if (selectedFilter === 'profit') return pnl > 0;
            if (selectedFilter === 'loss') return pnl < 0;
            return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'pnl':
                    aVal = calculatePnL(a);
                    bVal = calculatePnL(b);
                    break;
                case 'symbol':
                    aVal = a.symbol || '';
                    bVal = b.symbol || '';
                    break;
                case 'volume':
                    aVal = a.volume || 0;
                    bVal = b.volume || 0;
                    break;
                default:
                    aVal = calculatePnL(a);
                    bVal = calculatePnL(b);
            }

            if (sortOrder === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            } else {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }
        });

        return filtered;
    }, [positions, searchQuery, selectedFilter, sortBy, sortOrder, calculatePnL]);

    // Calculate totals
    const totals = useMemo(() => {
        let totalPnl = 0;
        let totalProfit = 0;
        let totalLoss = 0;
        let totalVolume = 0;

        positions.forEach(pos => {
            const pnl = calculatePnL(pos);
            totalPnl += pnl;
            if (pnl > 0) totalProfit += pnl;
            if (pnl < 0) totalLoss += Math.abs(pnl);
            totalVolume += pos.volume || 0;
        });

        return { totalPnl, totalProfit, totalLoss, totalVolume };
    }, [positions, calculatePnL]);

    const formatPrice = (price, symbol) => {
        const digits = symbolSpecs?.[symbol]?.digits ?? 5;
        return Number(price || 0).toFixed(digits);
    };

    const formatVolume = (volume) => {
        return volume?.toFixed(2) || "0.00";
    };

    return {
        positions: processedPositions,
        totals,
        searchQuery,
        setSearchQuery,
        selectedFilter,
        setSelectedFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        calculatePnL,
        getCurrentPrice,
        formatPrice,
        formatVolume
    };
};