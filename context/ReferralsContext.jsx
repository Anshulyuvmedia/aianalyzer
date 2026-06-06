import { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';

export const ReferralsContext = createContext();

export const ReferralsProvider = ({ children }) => {
    const [referralData, setReferralData] = useState(null);
    const [loadingReferral, setLoadingReferral] = useState(true);
    const [referralError, setReferralError] = useState(null);

    const fetchReferralData = useCallback(async () => {
        try {
            setLoadingReferral(true);
            setReferralError(null);
            const response = await api.get('/api/appdata/referrals');
            if (response.data?.success) {
                setReferralData(response.data.data);
                await AsyncStorage.setItem('referralCache', JSON.stringify(response.data.data));
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.log('Referral fetch failed:', error);
            setReferralError('Unable to load referral data');
            const cached = await AsyncStorage.getItem('referralCache');
            if (cached) {
                setReferralData(JSON.parse(cached));
            }
        } finally {
            setLoadingReferral(false);
        }
    }, []);

    const generateReferralCode = useCallback(async () => {
        try {
            const response = await api.post('/api/appdata/referrals/generate-code');
            if (response.data?.success) {
                fetchReferralData();
                return response.data.referralCode;
            }
            return null;
        } catch (error) {
            console.log('Generate code failed:', error);
            return null;
        }
    }, [fetchReferralData]);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    return (
        <ReferralsContext.Provider
            value={{
                referralData,
                loadingReferral,
                referralError,
                fetchReferralData,
                generateReferralCode,
            }}
        >
            {children}
        </ReferralsContext.Provider>
    );
};
