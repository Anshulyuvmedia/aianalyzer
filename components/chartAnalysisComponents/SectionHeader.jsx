// components/chartAnalysisComponents/SectionHeader.jsx
import { StyleSheet, Text, View } from 'react-native';

export const SectionHeader = ({ title, count }) => {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLine} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <View style={styles.sectionHeaderLine} />
            <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{count}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        marginTop: 8,
    },
    sectionHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1e293b',
    },
    sectionHeaderText: {
        color: '#60a5fa',
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 12,
        letterSpacing: 0.5,
    },
    sectionBadge: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    sectionBadgeText: {
        color: '#60a5fa',
        fontSize: 10,
        fontWeight: '500',
    },
});