// components/placeOrder/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0E11',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 140,
    },
    sideSelector: {
        flexDirection: 'row',
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 6,
        marginBottom: 5,
    },
    sideButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    sideButtonActiveBuy: {
        backgroundColor: '#22C55E',
    },
    sideButtonActiveSell: {
        backgroundColor: '#EF4444',
    },
    sideButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    sideButtonTextActive: {
        color: '#fff',
    },
    section: {
        marginBottom: 10,
    },
    sectionLabel: {
        color: '#8B949E',
        fontSize: 16,
        marginBottom: 12,
        fontWeight: '500',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 6,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#1E252E',
    },
    typeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#22C55E',
    },
    input: {
        backgroundColor: '#12161C',
        color: '#FFFFFF',
        fontSize: 18,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E252E',
    },
    summaryCard: {
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    summaryLabel: {
        color: '#8B949E',
        fontSize: 16,
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#0B0E11',
        borderTopWidth: 1,
        borderTopColor: '#1E252E',
    },
    confirmButton: {
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    confirmBuy: {
        backgroundColor: '#22C55E',
    },
    confirmSell: {
        backgroundColor: '#EF4444',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    sheetContainer: {
        backgroundColor: '#12161C',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20
    },
    sheetContent: {
        flex: 1
    },
    sheetTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center'
    },
    sheetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8
    },
    sheetLabel: {
        color: '#8B949E',
        fontSize: 15
    },
    sheetValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600'
    },
    buyText: {
        color: '#22C55E'
    },
    sellText: {
        color: '#EF4444'
    },
    sheetButtons: {
        flexDirection: 'row',
        marginTop: 28,
        gap: 12
    },
    sheetCancelButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#1E252E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A323C'
    },
    sheetCancelText: {
        color: '#8B949E',
        fontSize: 16,
        fontWeight: '600'
    },
    sheetConfirmButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sheetConfirmText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700'
    },
    sheetDivider: {
        height: 1,
        backgroundColor: '#1E252E',
        marginVertical: 12
    },
    marginWarning: {
        color: '#EF4444'
    },
    sideIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 14
    },
    lotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12161C',
        borderRadius: 16,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#1E252E'
    },
    lotAdjustButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    lotButton: {
        fontSize: 26,
        color: '#FFFFFF',
        fontWeight: '600'
    },
    lotInput: {
        flex: 1,
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 18,
        paddingVertical: 12
    },
    helperText: {
        color: "#8B949E",
        fontSize: 12,
        marginTop: 4
    },
    marginWarningText: {
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 10
    },
    // TP/SL Styles
    tpslHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tpslHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tpslContainer: {
        backgroundColor: '#12161C',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1E252E',
    },
    tpslRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tpslRowMargin: {
        marginTop: 16,
    },
    tpslLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tpslLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    tpslInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E252E',
        borderRadius: 20,
        padding: 2,
    },
    tpslTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 18,
    },
    tpslTypeActive: {
        backgroundColor: '#2A323C',
    },
    tpslTypeText: {
        color: '#8B949E',
        fontSize: 12,
        fontWeight: '500',
    },
    tpslTypeTextActive: {
        color: '#22C55E',
    },
    tpslInput: {
        backgroundColor: '#1E252E',
        color: '#FFFFFF',
        fontSize: 16,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A323C',
        marginBottom: 8,
    },
    pipsInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pipsInput: {
        flex: 1,
        marginBottom: 0,
    },
    pipsUnit: {
        color: '#8B949E',
        fontSize: 14,
        fontWeight: '500',
    },
    distanceHint: {
        color: '#6B7280',
        fontSize: 11,
        marginTop: 4,
        marginBottom: 8,
    },
    riskRewardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#1E252E',
    },
    riskRewardLabel: {
        color: '#8B949E',
        fontSize: 13,
    },
    riskRewardValue: {
        color: '#22C55E',
        fontSize: 16,
        fontWeight: '700',
    },
});