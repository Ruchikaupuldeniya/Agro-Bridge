import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentMethodsScreen = ({ navigation }) => {
    const [selectedMethod, setSelectedMethod] = useState('card1');

    const paymentMethods = [
        { id: 'card1', type: 'Credit Card', provider: 'Visa', last4: '4242', expiry: '12/26', icon: 'credit-card-outline' },
        { id: 'card2', type: 'Credit Card', provider: 'Mastercard', last4: '8821', expiry: '05/25', icon: 'credit-card-outline' },
        { id: 'wallet1', type: 'Digital Wallet', provider: 'EasyCash', balance: 'LKR 25,000', icon: 'wallet-outline' },
    ];

    const MethodCard = ({ method }) => (
        <TouchableOpacity
            style={[styles.methodCard, selectedMethod === method.id && styles.activeMethod]}
            onPress={() => setSelectedMethod(method.id)}
            activeOpacity={0.8}
        >
            <View style={styles.methodIconBg}>
                <MaterialCommunityIcons name={method.icon} size={24} color="#1B4D20" />
            </View>
            <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.provider} {method.type}</Text>
                {method.last4 ? (
                    <Text style={styles.methodDetail}>•••• •••• •••• {method.last4}</Text>
                ) : (
                    <Text style={[styles.methodDetail, { color: '#1B4D20', fontWeight: 'bold' }]}>{method.balance}</Text>
                )}
            </View>
            <View style={[styles.radioButton, selectedMethod === method.id && styles.radioButtonActive]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.creditCardContainer}>
                    <View style={styles.virtualCard}>
                        <View style={styles.cardHeader}>
                            <Image source={require('../../assets/images/landing_background.png')} style={styles.cardLogo} />
                            <MaterialCommunityIcons name="nfc" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.cardNum}>••••  ••••  ••••  4242</Text>
                        <View style={styles.cardFooter}>
                            <View>
                                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                <Text style={styles.cardValue}>RUCHIKA PERERA</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardValue}>12/26</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Saved Methods</Text>
                {paymentMethods.map(method => <MethodCard key={method.id} method={method} />)}

                <TouchableOpacity style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={20} color="#1B4D20" />
                    <Text style={styles.addButtonText}>Add New Payment Method</Text>
                </TouchableOpacity>

                <View style={styles.promoBox}>
                    <View style={styles.promoIconBg}>
                        <MaterialCommunityIcons name="tag-outline" size={24} color="#FFF" />
                    </View>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>EasyCash Offer!</Text>
                        <Text style={styles.promoText}>Get 10% cashback on your first organic order using EasyCash.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBF8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 20,
    },
    creditCardContainer: {
        marginBottom: 30,
    },
    virtualCard: {
        height: 200,
        backgroundColor: '#1B4D20',
        borderRadius: 24,
        padding: 25,
        justifyContent: 'space-between',
        elevation: 8,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    cardNum: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        marginTop: 5,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
    },
    activeMethod: {
        borderColor: '#1B4D20',
        backgroundColor: '#F9FDF9',
    },
    methodIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodInfo: {
        flex: 1,
        marginLeft: 15,
    },
    methodName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    methodDetail: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonActive: {
        borderColor: '#1B4D20',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1B4D20',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderWidth: 2,
        borderColor: '#E8F5E9',
        borderStyle: 'dashed',
        borderRadius: 16,
        marginTop: 10,
        gap: 8,
    },
    addButtonText: {
        color: '#1B4D20',
        fontWeight: 'bold',
        fontSize: 14,
    },
    promoBox: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    promoIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1B4D20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    promoText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});

export default PaymentMethodsScreen;
