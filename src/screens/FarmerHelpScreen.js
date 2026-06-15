import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FarmerHelpScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.banner}>
                    <MaterialCommunityIcons name="face-agent" size={48} color="#1B4D20" />
                    <Text style={styles.bannerText}>How can we help you today?</Text>
                </View>

                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <TouchableOpacity style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How do I update my inventory?</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>When will I get paid?</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How to handle return requests?</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Contact Support</Text>

                <TouchableOpacity style={styles.contactItem} onPress={() => alert('Opening Email...')}>
                    <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
                        <MaterialCommunityIcons name="email-outline" size={24} color="#2196F3" />
                    </View>
                    <View>
                        <Text style={styles.contactTitle}>Email Support</Text>
                        <Text style={styles.contactSub}>support@agrobridge.lk</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactItem} onPress={() => alert('Calling...')}>
                    <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialCommunityIcons name="phone" size={24} color="#4CDE16" />
                    </View>
                    <View>
                        <Text style={styles.contactTitle}>Call Us</Text>
                        <Text style={styles.contactSub}>+94 11 234 5678</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9F5',
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
    banner: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 20,
    },
    bannerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 15,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    faqQuestion: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    contactSub: {
        fontSize: 13,
        color: '#666',
    },
});

export default FarmerHelpScreen;
