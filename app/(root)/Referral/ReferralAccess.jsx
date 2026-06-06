import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, Share, ActivityIndicator, Linking, Platform } from 'react-native';
import React, { useContext, useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import HomeHeader from '@/components/HomeHeader';
import { ReferralsContext } from '@/context/ReferralsContext';
import { formatCurrency } from '@/utils/numberFormatter';

const StatusBadge = ({ status }) => {
  const colors = {
    Active: { bg: '#14532d', text: '#4ade80' },
    active: { bg: '#14532d', text: '#4ade80' },
    Completed: { bg: '#1e3a5f', text: '#60a5fa' },
    completed: { bg: '#1e3a5f', text: '#60a5fa' },
    Pending: { bg: '#713f12', text: '#fbbf24' },
    pending: { bg: '#713f12', text: '#fbbf24' },
    Expired: { bg: '#7f1d1d', text: '#f87171' },
    expired: { bg: '#7f1d1d', text: '#f87171' },
  };
  const style = colors[status] || colors.Pending;
  return (
    <View style={[statusStyles.badge, { backgroundColor: style.bg }]}>
      <View style={[statusStyles.dot, { backgroundColor: style.text }]} />
      <Text style={[statusStyles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
};

const statusStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

const SOCIAL_PLATFORMS = [
  { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', url: (msg) => `https://wa.me/?text=${encodeURIComponent(msg)}` },
  { name: 'Telegram', icon: 'telegram', color: '#0088cc', url: (msg) => `https://t.me/share/url?url=&text=${encodeURIComponent(msg)}` },
  { name: 'Twitter', icon: 'twitter', color: '#1DA1F2', url: (msg) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}` },
  { name: 'Facebook', icon: 'facebook', color: '#1877F2', url: (msg) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(msg)}` },
];

const ReferralAccess = () => {
  const { referralData, loadingReferral, fetchReferralData, referralError } = useContext(ReferralsContext);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReferralData();
    setRefreshing(false);
  }, [fetchReferralData]);

  const shareMessage = `🚀 Join me on Ai Analyzer! Use my referral code: ${referralData?.referralCode || ''}\n\n${referralData?.referralLink || 'https://app.aianalyzer.com'}\n\nEarn rewards together!`;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareMessage,
        url: referralData?.referralLink,
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  const handleSocialShare = async (platform) => {
    try {
      const canOpen = await Linking.canOpenURL(platform.url(''));
      if (canOpen) {
        await Linking.openURL(platform.url(shareMessage));
      } else {
        handleNativeShare();
      }
    } catch (err) {
      handleNativeShare();
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(referralData?.referralLink || '');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log('Copy failed:', err);
    }
  };

  if (loadingReferral && !referralData) {
    return (
      <View style={styles.container}>
        <HomeHeader page="broker" title="Referrals" subtitle="Your Referral Program" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={styles.loadingText}>Loading referral data...</Text>
        </View>
      </View>
    );
  }

  const earningsSummary = referralData?.earningsSummary || {
    totalReferrals: 0, totalEarnings: 0, commissionRate: '10% per trade', pendingReferrals: 0,
  };
  const recentReferrals = referralData?.recentReferrals || [];
  const referralLink = referralData?.referralLink || 'https://app.aianalyzer.com';
  const referralCode = referralData?.referralCode || '';

  return (
    <View style={styles.container}>
      <HomeHeader page="broker" title="Referrals" subtitle="Share and earn rewards" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#34C759', '#FF3B15']}
            progressBackgroundColor="#1e2836"
          />
        }
      >
        {referralError && !referralData && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#f87171" />
            <Text style={styles.errorText}>{referralError}</Text>
          </View>
        )}

        <LinearGradient
          colors={['#AEAED4', '#000', '#AEAED4']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#1e2836', '#111827', '#1e2836']}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.yourCodeSection}>
              <MaterialCommunityIcons name="gift-outline" size={28} color="#c084fc" />
              <Text style={styles.yourCodeLabel}>Your Referral Code</Text>
              <Text style={styles.yourCodeValue}>{referralCode || '—'}</Text>
            </View>
          </LinearGradient>
        </LinearGradient>

        <LinearGradient
          colors={['#AEAED4', '#000', '#AEAED4']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#1e2836', '#111827', '#1e2836']}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.referralBox}>
              <Text style={styles.sectionTitle}>Share on Social Media</Text>
              <View style={styles.socialRow}>
                {SOCIAL_PLATFORMS.map((platform) => (
                  <TouchableOpacity
                    key={platform.name}
                    style={[styles.socialButton, { backgroundColor: platform.color + '20' }]}
                    onPress={() => handleSocialShare(platform)}
                  >
                    <FontAwesome name={platform.icon} size={24} color={platform.color} />
                    <Text style={[styles.socialButtonText, { color: platform.color }]}>{platform.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or share via</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleNativeShare}>
                <Feather name="share-2" size={16} color="#fff" />
                <Text style={styles.shareText}>Native Share</Text>
              </TouchableOpacity>
              <View style={styles.linkContainer}>
                <Text style={styles.referralLink} numberOfLines={1}>{referralLink}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
                  <Feather name={copied ? 'check' : 'copy'} size={16} color="#fff" />
                  <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </LinearGradient>

        <LinearGradient
          colors={['#AEAED4', '#000', '#AEAED4']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#1e2836', '#111827', '#1e2836']}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.earningsSummary}>
              <Text style={styles.sectionTitle}>Earnings Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Feather name="users" size={20} color="#22d3ee" />
                  <Text style={styles.summaryValue}>{earningsSummary.totalReferrals}</Text>
                  <Text style={styles.summaryLabel}>Total Referrals</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Feather name="dollar-sign" size={20} color="#4ade80" />
                  <Text style={styles.summaryValue}>{formatCurrency(earningsSummary.totalEarnings)}</Text>
                  <Text style={styles.summaryLabel}>Total Earnings</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Feather name="bar-chart" size={20} color="#c084fc" />
                  <Text style={styles.summaryValue}>{earningsSummary.commissionRate}</Text>
                  <Text style={styles.summaryLabel}>Commission</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Feather name="clock" size={20} color="#fbbf24" />
                  <Text style={styles.summaryValue}>{earningsSummary.pendingReferrals || 0}</Text>
                  <Text style={styles.summaryLabel}>Pending</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </LinearGradient>

        <LinearGradient
          colors={['#AEAED4', '#000', '#AEAED4']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#1e2836', '#111827', '#1e2836']}
            start={{ x: 0.4, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.recentReferralsSection}>
              <Text style={styles.sectionTitle}>Recent Referrals</Text>
              {recentReferrals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="users" size={32} color="#4b5563" />
                  <Text style={styles.emptyText}>No referrals yet. Share your code to get started!</Text>
                </View>
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Email</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
                    <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Earnings</Text>
                    <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Status</Text>
                  </View>
                  {recentReferrals.map((referral, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1.5 }]} numberOfLines={1}>{referral.email}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{referral.dateJoined || '—'}</Text>
                      <Text style={[styles.tableCell, { flex: 0.8, color: referral.earnings > 0 ? '#4ade80' : '#6b7280' }]}>
                        {formatCurrency(referral.earnings)}
                      </Text>
                      <View style={{ flex: 0.8, alignItems: 'center' }}>
                        <StatusBadge status={referral.status} />
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </LinearGradient>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default ReferralAccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 30,
    gap: 12,
  },
  gradientBoxBorder: {
    borderRadius: 15,
    padding: 1,
  },
  innerGradient: {
    borderRadius: 14,
    padding: 15,
  },
  yourCodeSection: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  yourCodeLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  },
  yourCodeValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  referralBox: {
    gap: 14,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#6b7280',
    fontSize: 12,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingLeft: 12,
  },
  referralLink: {
    color: '#60a5fa',
    fontSize: 13,
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 2,
    gap: 4,
  },
  copyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  shareText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  earningsSummary: {
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    width: '47%',
    alignItems: 'center',
    gap: 6,
    minHeight: 90,
    justifyContent: 'center',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  recentReferralsSection: {
    gap: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tableHeaderText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tableCell: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451a1a',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    flex: 1,
  },
});
