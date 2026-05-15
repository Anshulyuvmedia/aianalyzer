// app/components/UserBacktesting/SectionHeader.jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const SectionHeader = ({ icon, title, color = '#60a5fa', subtitle, gradient }) => {
    if (gradient) {
        return (
            <LinearGradient
                colors={['#3b82f620', '#3b82f605']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientContainer}
            >
                <View style={styles.container}>
                    <Feather name={icon} size={22} color={color} />
                    <View>
                        <Text style={[styles.title, { color }]}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={styles.container}>
            <Feather name={icon} size={20} color={color} />
            <Text style={[styles.title, { color }]}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 12,
        gap: 10,
    },
    gradientContainer: {
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 2,
    },
});

export default SectionHeader;