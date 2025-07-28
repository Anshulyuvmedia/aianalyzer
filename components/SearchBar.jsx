// components/SearchBar.jsx
import { StyleSheet, View, TextInput } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const SearchBar = ({ color }) => {
    return (
        <View>
            {/* Outer LinearGradient to create the gradient border */}
            {color === 'transparent' ?
                <LinearGradient
                    colors={['#D9C4FC', '#D49DEA']} // Gradient from black (left) to white (right)
                    start={{ x: 1, y: 0 }} // Start at the left
                    end={{ x: 1, y: 1 }} // End at the right
                    style={styles.gradientBorder}
                >
                    <LinearGradient
                        colors={['#824ce0', '#965fe2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientBox}
                    >
                        <View style={styles.innerContainer}>
                            <AntDesign name="search1" size={22} color="#fff" />
                            <TextInput
                                placeholder="Search for 'Nestle'"
                                placeholderTextColor="#fff"
                                style={[styles.textInput, {
                                    color: '#fff',
                                }]}
                            />
                        </View>
                    </LinearGradient>
                </LinearGradient>
                :
                <LinearGradient
                    colors={['#AEAED4', '#444']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.gradientBorder}
                >
                    <LinearGradient
                        colors={['#824ce0', '#965fe2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientBox}
                    >
                        <View style={[styles.innerContainer, { backgroundColor: '#000' }]}>
                            <AntDesign name="search1" size={22} color="#AFAFAF" />
                            <TextInput
                                placeholder="Search for 'Nestle'"
                                placeholderTextColor="#888"
                                style={styles.textInput}
                            />
                        </View>
                    </LinearGradient>
                </LinearGradient>
            }
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: 100,
        padding: 1, // This acts as the "border" width
        marginHorizontal: 10,
    },
    gradientBox: {
        borderRadius: 100,
    },
    innerContainer: {
        borderRadius: 100, // Matches the outer borderRadius
        paddingHorizontal: 25,
        paddingVertical: 0,
        flexDirection: 'row', // Already handled by className, but added for clarity
        alignItems: 'center',
    },
    textInput: {
        color: '#FFF',
        flex: 1, // Ensures the TextInput takes up remaining space
        marginLeft: 5, // Adds spacing between the icon and input
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
    },
});