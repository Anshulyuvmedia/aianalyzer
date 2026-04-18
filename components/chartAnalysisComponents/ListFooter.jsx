// components/chartAnalysisComponents/ListFooter.jsx
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const ListFooter = ({ isLoadingMore, hasMore, totalDisplayed }) => {
    if (isLoadingMore) {
        return (
            <View style={styles.loaderFooter}>
                <ActivityIndicator size="small" color="#60a5fa" />
                <Text style={styles.loaderFooterText}>Loading more...</Text>
            </View>
        );
    }

    if (hasMore) {
        return (
            <View style={styles.loaderFooter}>
                <Text style={styles.loaderFooterText}>Scroll for more</Text>
            </View>
        );
    }

    if (totalDisplayed > 0) {
        return (
            <View style={styles.loaderFooter}>
                <Text style={styles.endText}>End of history</Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    loaderFooter: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loaderFooterText: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 8,
    },
    endText: {
        color: '#6b7280',
        fontSize: 12,
    },
});