import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FarmerTermsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Privacy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.docTitle}>Terms of Service</Text>
                <Text style={styles.paragraph}>
                    Welcome to AgroBridge. By using our platform as a farmer, you agree to comply with our community guidelines and fair trade policies.
                </Text>

                <Text style={styles.paragraph}>
                    1. **Product Quality**: All listed crops must be accurate in description and photos.
                </Text>
                <Text style={styles.paragraph}>
                    2. **Order Fulfillment**: You are required to fulfill accepted orders within the specified timeframe.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.docTitle}>Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We respect your privacy. Your data, including farm location and contact details, is only shared with buyers when an order is confirmed or as strictly necessary for the service.
                </Text>

                <Text style={styles.paragraph}>
                    We do not sell your personal data to third parties.
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        padding: 20,
    },
    docTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B4D20',
        marginBottom: 15,
        marginTop: 10,
    },
    paragraph: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 30,
    },
});

export default FarmerTermsScreen;
