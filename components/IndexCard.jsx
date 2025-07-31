import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FontAwesome, Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

const IndexCard = ({ data, page }) => {
    return (
        <View style={styles.container}>
            <View style={styles.cardGrid}>
                {data?.dashboardMetrics?.map((metric) => (
                    <View key={metric.id} style={styles.card}>
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
                                <View style={page === 'algo' ? styles.algoContent : styles.defaultContent}>
                                    {page !== 'algo' && (
                                        <View style={styles.cardHeader}>
                                            {metric.icon === 'dollar' || metric.icon === 'line-chart' ? (
                                                <FontAwesome name={metric.icon} size={20} color="#1E90FF" />
                                            ) : (
                                                <Feather name={metric.icon} size={20} color="#1E90FF" />
                                            )}
                                            <Text style={[styles.cardChange, { color: metric.changeColor }]}>
                                                {metric.change}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.cardBody}>
                                        <View>
                                            <Text style={[styles.cardValue, { color: metric.iconColor }]}>{metric.value}</Text>
                                            <Text style={styles.cardLabel}>{metric.label}</Text>
                                        </View>
                                        {page === 'algo' && (
                                            <View style={styles.algoIcon}>
                                                {(metric.icon === 'dollar' || metric.icon === 'line-chart' || metric.icon === 'trophy') ? (
                                                    <FontAwesome name={metric.icon} size={26} color={metric.iconColor} />
                                                ) : (
                                                    <Feather name={metric.icon} size={26} color={metric.iconColor} />
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </LinearGradient>
                        </LinearGradient>
                    </View>
                ))}
            </View>
        </View>
    );
};

IndexCard.propTypes = {
    data: PropTypes.shape({
        dashboardMetrics: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                icon: PropTypes.string.isRequired,
                change: PropTypes.string,
                changeColor: PropTypes.string,
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                label: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
    page: PropTypes.string,
};

IndexCard.defaultProps = {
    page: 'home',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    gradientBoxBorder: {
        borderRadius: 15,
        padding: 1,
    },
    innerGradient: {
        borderRadius: 14,
        padding: 15,
    },
    algoContent: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    defaultContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    cardChange: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 5,
    },
    cardLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '400',
    },
    algoIcon: {
        marginLeft: 20,
    },
});

export default IndexCard;