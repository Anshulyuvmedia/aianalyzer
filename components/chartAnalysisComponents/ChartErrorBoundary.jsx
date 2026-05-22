// components/chartAnalysisComponents/ChartErrorBoundary.jsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Chart Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Feather name="alert-triangle" size={40} color="#ef4444" />
                    <Text style={styles.errorTitle}>Chart Render Error</Text>
                    <Text style={styles.errorMessage}>{this.state.error?.message || 'Unknown error'}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => this.setState({ hasError: false, error: null })}
                    >
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131722' },
    errorTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 12 },
    errorMessage: { color: '#6b7280', fontSize: 12, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
    retryButton: { marginTop: 20, backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryText: { color: '#fff', fontWeight: '600' }
});