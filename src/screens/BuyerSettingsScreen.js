import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const BuyerSettingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = React.useState({
        name: 'Loading...',
        email: '...',
        avatar: require('../../assets/images/landing_background.png'),
    });

    React.useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const docRef = doc(db, 'buyers', auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUser({
                            name: data.fullName || 'Agro User',
                            email: data.email || auth.currentUser.email,
                            avatar: data.photoURL ? { uri: data.photoURL } : require('../../assets/images/landing_background.png'),
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, []);

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

    const SettingItem = ({ icon, title, subtitle, target, isDestructive }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={() => target ? navigation.navigate(target) : null}
        >
            <View style={[styles.iconBg, isDestructive && styles.destructiveBg]}>
                <MaterialCommunityIcons name={icon} size={24} color={isDestructive ? '#FF3B30' : '#1B4D20'} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            {!isDestructive && <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>

                    {/* Profile Brief */}
                    <TouchableOpacity style={styles.profileBrief} onPress={() => navigation.navigate('BuyerProfile')}>
                        <Image source={user.avatar} style={styles.avatar} />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <Text style={styles.viewProfileText}>View Profile</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.section}>
                        <SettingItem icon="account-edit-outline" title="Personal Information" subtitle="Edit details" target="PersonalInfo" />
                        <SettingItem icon="package-variant-closed" title="My Orders" subtitle="Order history" target="OrderHistory" />
                        <SettingItem icon="credit-card-outline" title="Payment Methods" subtitle="Cards & wallets" target="PaymentMethods" />
                    </View>

                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.section}>
                        <SettingItem icon="bell-outline" title="Notifications" subtitle="Offers & updates" target="Notifications" />
                        <SettingItem icon="heart-outline" title="Saved Items" subtitle="Favorites" target="BuyerDashboard" />
                    </View>

                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.section}>
                        <SettingItem icon="help-circle-outline" title="Help Center" subtitle="FAQs & Support" target="Chat" />
                        <SettingItem icon="file-document-outline" title="Terms & Privacy" target="FarmerTerms" />
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <View style={styles.destructiveBg}>
                            <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
                        </View>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>

            <BuyerBottomNav navigation={navigation} activeNav="settings" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileBrief: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 16,
        marginBottom: 25,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    viewProfileText: {
        fontSize: 13,
        color: '#1B4D20',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 25,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    destructiveBg: {
        backgroundColor: '#FFEBEE',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    destructiveText: {
        color: '#FF3B30',
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    }
});

export default BuyerSettingsScreen;
