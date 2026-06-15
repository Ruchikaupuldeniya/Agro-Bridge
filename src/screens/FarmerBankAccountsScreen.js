import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const FarmerBankAccountsScreen = ({ navigation }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // New Account Form State
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [holderName, setHolderName] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        if (!auth.currentUser) return;
        try {
            const docRef = doc(db, 'farmers', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().bankAccounts) {
                setAccounts(docSnap.data().bankAccounts);
            } else {
                // Default mock if empty for demo purposes (optional)
                setAccounts([]);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
            Alert.alert('Error', 'Failed to load bank accounts.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async () => {
        if (!bankName.trim() || !accountNumber.trim() || !holderName.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all bank details.');
            return;
        }

        setSubmitting(true);
        const newAccount = {
            id: Date.now().toString(), // Simple ID generation
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            holderName: holderName.trim(),
            isPrimary: accounts.length === 0 // Make primary if it's the first one
        };

        try {
            const docRef = doc(db, 'farmers', auth.currentUser.uid);
            // If the document doesn't exist, we should create it or set it, but usually profile exists.
            // Using updateDoc assuming profile exists from signup.
            await updateDoc(docRef, {
                bankAccounts: arrayUnion(newAccount)
            });

            setAccounts([...accounts, newAccount]);
            setModalVisible(false);
            resetForm();
            Alert.alert('Success', 'Bank account added successfully!');
        } catch (error) {
            console.error("Error adding account:", error);
            // Fallback: If document doesn't exist (unlikely in this flow), handle it or use setDoc with merge
            Alert.alert('Error', 'Could not save bank account. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAccount = (account) => {
        Alert.alert(
            'Remove Account',
            `Are you sure you want to remove your ${account.bankName} account context?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const docRef = doc(db, 'farmers', auth.currentUser.uid);
                            await updateDoc(docRef, {
                                bankAccounts: arrayRemove(account)
                            });
                            setAccounts(accounts.filter(a => a.id !== account.id));
                        } catch (error) {
                            console.error("Error removing account:", error);
                            Alert.alert('Error', 'Failed to remove account.');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setBankName('');
        setAccountNumber('');
        setHolderName('');
    };

    const getBankColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes('commercial')) return '#1565C0'; // Blue
        if (n.includes('sampath')) return '#EF6C00'; // Orange
        if (n.includes('people')) return '#C62828'; // Red
        if (n.includes('boc') || n.includes('ceylon')) return '#FBC02D'; // Yellow
        if (n.includes('hatton') || n.includes('hnb')) return '#8D6E63'; // Brown
        return '#1B4D20'; // Default Green
    };

    const maskNumber = (num) => {
        if (!num || num.length < 4) return num;
        return `**** **** **** ${num.slice(-4)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bank Accounts</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setModalVisible(true)}
                    disabled={loading}
                >
                    <MaterialCommunityIcons name="plus" size={28} color="#1B4D20" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D20" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Your Accounts</Text>

                        {accounts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="bank-outline" size={48} color="#CCC" />
                                <Text style={styles.emptyText}>No bank accounts linked yet.</Text>
                            </View>
                        ) : (
                            accounts.map((acc) => (
                                <View key={acc.id} style={styles.accountCard}>
                                    <View style={[styles.bankIcon, { backgroundColor: getBankColor(acc.bankName) }]}>
                                        <MaterialCommunityIcons name="bank" size={24} color="#FFF" />
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={styles.bankName}>{acc.bankName}</Text>
                                        <Text style={styles.accountNumber}>{maskNumber(acc.accountNumber)}</Text>
                                        <Text style={styles.holderName}>{acc.holderName}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        {acc.isPrimary && (
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#4CDE16" style={{ marginBottom: 10 }} />
                                        )}
                                        <TouchableOpacity onPress={() => handleDeleteAccount(acc)}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF6B6B" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}

                        <TouchableOpacity
                            style={styles.addAccountButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.addAccountText}>+ Link New Account</Text>
                        </TouchableOpacity>

                        <Text style={styles.infoText}>
                            Payouts are processed every Wednesday to your primary account.
                        </Text>
                    </>
                )}
            </ScrollView>

            {/* Add Account Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Bank Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Bank of Ceylon"
                                value={bankName}
                                onChangeText={setBankName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                keyboardType="numeric"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Holder Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Name as per passbook"
                                value={holderName}
                                onChangeText={setHolderName}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, submitting && styles.disabledButton]}
                            onPress={handleAddAccount}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    addBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bankIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    accountInfo: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    accountNumber: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
        letterSpacing: 1,
    },
    holderName: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    actions: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addAccountButton: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#1B4D20',
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(27, 77, 32, 0.03)'
    },
    addAccountText: {
        color: '#1B4D20',
        fontWeight: '600',
        fontSize: 15,
    },
    infoText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 30,
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        color: '#999',
        marginTop: 10,
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#1B4D20',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default FarmerBankAccountsScreen;
