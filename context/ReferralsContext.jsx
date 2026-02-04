// src/context/ReferralsContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const ReferralsContext = createContext();

export const ReferralsProvider = ({ children }) => {
    const [referralData, setReferralData] = useState(null);
    const [loadingReferral, setLoadingReferral] = useState(true);

    const fetchReferralData = useCallback(async () => {
        try {
            setLoadingReferral(true);
            const response = await axios.get(`${API_BASE_URL}/api/appdata/referrals`);
            setReferralData(response.data?.data || null);
        } catch (error) {
            console.log('Referral fetch failed:', error);
        } finally {
            setLoadingReferral(false);
        }
    }, []);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    return (
        <ReferralsContext.Provider
            value={{
                referralData,
                loadingReferral,
                fetchReferralData,
            }}
        >
            {children}
        </ReferralsContext.Provider>
    );
};