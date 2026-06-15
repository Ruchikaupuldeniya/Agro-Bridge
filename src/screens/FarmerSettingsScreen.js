import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FarmerBottomNav from '../components/FarmerBottomNav';

const FarmerSettingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    const [pushNotifications, setPushNotifications] = useState(false);
    const [locationServices, setLocationServices] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        if (!auth.currentUser) return;
        try {
            const docRef = doc(db, 'farmers', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Load settings or default to false
                if (data.settings) {
                    setPushNotifications(data.settings?.pushNotifications ?? false);
                    setLocationServices(data.settings?.locationServices ?? false);
                }
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        // Update State
        if (key === 'pushNotifications') setPushNotifications(value);
        if (key === 'locationServices') setLocationServices(value);

        // Update Firestore
        if (auth.currentUser) {
            try {
                const docRef = doc(db, 'farmers', auth.currentUser.uid);
                await updateDoc(docRef, {
                    [`settings.${key}`]: value
                });
            } catch (error) {
                console.error(`Error updating ${key}:`, error);
                Alert.alert("Error", "Could not save setting.");
                // Revert state if failed
                if (key === 'pushNotifications') setPushNotifications(!value);
                if (key === 'locationServices') setLocationServices(!value);
            }
        }
    };

    const handleNotificationToggle = async (value) => {
        if (value) {
            // Request Permission Logic (Mock for now, or use expo-notifications)
            // const { status } = await Notifications.requestPermissionsAsync();
            // if (status !== 'granted') return;
            Alert.alert("Permissions", "Push Notifications enabled for orders and updates.");
        }
        updateSetting('pushNotifications', value);
    };

    const handleLocationToggle = async (value) => {
        if (value) {
            // We can't strictly 'enable' location services from here, but we can ask for permission
            // or guide user to settings. For now, we save the preference.
            Alert.alert("Location", "Location Services enabled. We will use your location for better delivery.");
        }
        updateSetting('locationServices', value);
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            navigation.replace('Landing');
                        } catch (error) {
                            console.error("Logout Error:", error);
                            Alert.alert('Error', 'Failed to log out');
                        }
                    }
                }
            ]
        );
    };

    // Helper components moved outside will be used here.

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Account Settings */}
                <SectionHeader title="Account Security" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="account-edit-outline"
                        title="Edit Profile"
                        subtitle="Name, Farm Details, Bio"
                        onPress={() => navigation.navigate('FarmProfile')}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="lock-outline"
                        title="Change Password"
                        subtitle="Last changed 30 days ago"
                        onPress={() => navigation.navigate('FarmerChangePassword')}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="bank-outline"
                        title="Bank Accounts"
                        subtitle="Manage payout methods"
                        onPress={() => navigation.navigate('FarmerBankAccounts')}
                    />
                </View>

                {/* Notifications */}
                <SectionHeader title="Notifications" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="bell-ring-outline"
                        title="Push Notifications"
                        onToggle={handleNotificationToggle}
                        toggleValue={pushNotifications}
                    />
                </View>

                {/* App Preferences */}
                <SectionHeader title="App Preferences" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="crosshairs-gps"
                        title="Location Services"
                        onToggle={handleLocationToggle}
                        toggleValue={locationServices}
                    />
                </View>

                {/* Support */}
                <SectionHeader title="Support" />
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="help-circle-outline"
                        title="Help Center"
                        onPress={() => navigation.navigate('FarmerHelp')}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="file-document-outline"
                        title="Terms & Privacy"
                        onPress={() => navigation.navigate('FarmerTerms')}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>AgroBridge v1.0.0 (Build 2024)</Text>

            </ScrollView>
            <FarmerBottomNav navigation={navigation} activeNav="settings" />
        </SafeAreaView>
    );
};

const SettingItem = ({ icon, title, subtitle, onPress, toggleValue, onToggle }) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!!onToggle}
    >
        <View style={styles.settingIconContainer}>
            <MaterialCommunityIcons name={icon} size={22} color="#1B4D20" />
        </View>
        <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {onToggle ? (
            <Switch
                trackColor={{ false: "#E0E0E0", true: "#C8E6C9" }}
                thumbColor={toggleValue ? "#4CDE16" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onToggle}
                value={toggleValue}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
        ) : (
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
        )}
    </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingVertical: 5,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    settingIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 62, // Align with text start
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 10,
        gap: 8,
    },
    logoutButtonText: {
        color: '#C62828',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40,
    },
});

export default FarmerSettingsScreen;
