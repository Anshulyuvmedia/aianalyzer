import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';

const ReferralAccess = () => {
    const [referralLink, setReferralLink] = useState('https://one.exnesstrack.org/a/df1vcmxnjg');
    const [emailInput, setEmailInput] = useState('');
    const [recentReferrals] = useState([
        { email: 'john@example.com', date: 'Jan 15, 2024', earnings: '$45.00', status: 'Active' },
        { email: 'sarah@example.com', date: 'Jan 12, 2024', earnings: '$32.50', status: 'Active' },
        { email: 'mike@example.com', date: 'Jan 10, 2024', earnings: '$67.80', status: 'Active' },
    ]);

    const handleCopyLink = () => {
        // Add copy to clipboard logic here
        console.log('Copied referral link:', referralLink);
    };

    const handleSendInvite = () => {
        // Add send invite logic here
        console.log('Sending invite to:', emailInput);
        setEmailInput(''); // Clear input after sending
    };

    return (
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
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View className="flex-row" >
                            <Feather name="users" size={20} color="#c084fc" />
                            <Text style={styles.header}>Referral Access</Text>
                        </View>
                        <View style={styles.referralBox}>
                            <Text style={styles.referralTitle}>Your Referral Link</Text>
                            <View style={styles.linkContainer}>
                                <Text style={styles.referralLink} numberOfLines={1}>{referralLink}</Text>
                                <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
                                    <Feather name="copy" size={16} color="#fff" />
                                    <Text style={styles.copyText}>Copy Link</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.earningsSummary}>
                            <Text style={styles.summaryTitle}>Earnings Summary</Text>
                            <View style={styles.summaryRow}>
                                <View className="flex-row" >
                                    <Feather name="users" size={16} color="#22d3ee" />
                                    <Text style={styles.summaryLabel}>Total Referrals</Text>
                                </View>
                                <Text style={styles.summaryValue}>15</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <View className="flex-row" >
                                    <Feather name="dollar-sign" size={16} color="#42db80" />
                                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                                </View>
                                <Text style={styles.summaryValue}>$220.00</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <View className="flex-row" >
                                    <Feather name="bar-chart" size={16} color="#c084fc" />
                                    <Text style={styles.summaryLabel}>Commission Rate</Text>
                                </View>
                                <Text style={styles.summaryValue}>10% per trade</Text>
                            </View>
                        </View>
                        {/* <View style={styles.inviteSection}>
                            <Text style={styles.sectionTitle}>Invite Friends</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.inputField}
                                    value={emailInput}
                                    onChangeText={setEmailInput}
                                    placeholder="Enter email address"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="email-address"
                                />
                                <TouchableOpacity style={styles.sendButton} onPress={handleSendInvite}>
                                    <Text style={styles.sendText}>Send Invite</Text>
                                </TouchableOpacity>
                            </View>
                        </View> */}
                        <View style={styles.recentReferralsSection}>
                            <Text style={styles.sectionTitle}>Recent Referrals</Text>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Email</Text>
                                <Text style={styles.tableHeaderText}>Date Joined</Text>
                                <Text style={styles.tableHeaderText}>Earnings</Text>
                                <Text style={styles.tableHeaderText}>Status</Text>
                            </View>
                            {recentReferrals.map((referral, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{referral.email}</Text>
                                    <Text style={styles.tableCell}>{referral.date}</Text>
                                    <Text style={styles.tableCell}>{referral.earnings}</Text>
                                    <Text style={[styles.tableCell, { backgroundColor: referral.status === 'Active' ? '#152a2d' : '#ef4444', color: "#43c976" }]}>
                                        {referral.status}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </LinearGradient>
    );
};

export default ReferralAccess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        marginStart: 10,
    },
    referralBox: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    referralTitle: {
        color: '#A0AEC0',
        fontSize: 14,
        marginBottom: 10,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    referralLink: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f53dd',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    copyText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 5,
    },
    earningsSummary: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    summaryTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#A0AEC0',
        fontSize: 14,
        marginStart: 5,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    inviteSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputField: {
        flex: 1,
        backgroundColor: '#2d3748',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    sendText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    orText: {
        color: '#A0AEC0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    recentReferralsSection: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2d3748',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    tableHeaderText: {
        color: '#A0AEC0',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    tableCell: {
        color: '#fff',
        fontSize: 12,
        flex: 1,
        textAlign: 'center',
        margin: 'auto',
        borderRadius: 10,
        paddingVertical: 5,
    },
});