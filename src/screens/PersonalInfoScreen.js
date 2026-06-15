import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PersonalInfoScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const docRef = doc(db, 'buyers', auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setName(data.fullName || '');
                        setEmail(data.email || auth.currentUser.email || '');
                        setPhone(data.phone || '');
                        setAddress(data.location || '');
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    Alert.alert('Error', 'Could not load profile data');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const docRef = doc(db, 'buyers', auth.currentUser.uid);
            await updateDoc(docRef, {
                fullName: name,
                phone: phone,
                location: address,
                // Email is usually not updated directly in Firestore for Auth sync without re-auth, 
                // but we can update the display field.
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1B4D20" />
            </View>
        );
    }

    const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', editable = true }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
                <MaterialCommunityIcons name={icon} size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                    keyboardType={keyboardType}
                    editable={editable}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Information</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoCard}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarLarge}>
                            <MaterialCommunityIcons name="account" size={50} color="#1B4D20" />
                        </View>
                        {/* Camera badge removed as image upload is complex for this step */}
                    </View>

                    <InputField
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        icon="account-outline"
                    />

                    <InputField
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        icon="email-outline"
                        keyboardType="email-address"
                        editable={false} // Prevent email edit for simplicity
                    />

                    <InputField
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        icon="phone-outline"
                        keyboardType="phone-pad"
                    />

                    <InputField
                        label="Delivery Address"
                        value={address}
                        onChangeText={setAddress}
                        icon="map-marker-outline"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteLink}
                    onPress={() => Alert.alert('Delete Account', 'Are you sure? This cannot be undone.')}
                >
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1B4D20',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    avatarNote: {
        fontSize: 12,
        color: '#999',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        paddingLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAF9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: '#000',
    },
    disabledInput: {
        backgroundColor: '#E0E0E0',
        borderColor: '#CCC',
    },
    saveButton: {
        backgroundColor: '#1B4D20',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteLink: {
        marginTop: 30,
        alignItems: 'center',
    },
    deleteText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PersonalInfoScreen;
