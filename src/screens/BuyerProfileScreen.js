import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { USERS } from '../data/mockData';

import { auth, db } from '../config/firebase'; // Ensure db is imported
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const BuyerProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = React.useState({
        name: 'Loading...',
        email: '...',
        location: 'Loading...',
        avatar: require('../../assets/images/landing_background.png'), // Default/Placeholder
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
                            location: data.location || 'Srilanka', // Default if not set
                            avatar: data.photoURL ? { uri: data.photoURL } : require('../../assets/images/landing_background.png'),
                        });
                    }
                } catch (error) {
                    console.error("Error fetching buyer data:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    const menuItems = [
        { id: '1', title: 'Personal Information', icon: 'account-outline', subtitle: 'Name, Email, Location', target: 'PersonalInfo' },
        { id: '2', title: 'My Orders', icon: 'package-variant-closed', subtitle: 'History, Tracking, Reviews', target: 'OrderHistory' },
        { id: '3', title: 'Payment Methods', icon: 'credit-card-outline', subtitle: 'Saved Cards, Digital Wallets', target: 'PaymentMethods' },
        { id: '4', title: 'Saved Items', icon: 'heart-outline', subtitle: 'Favorite products & farms', target: 'BuyerDashboard' },
        { id: '5', title: 'Notifications', icon: 'bell-outline', subtitle: 'Order updates & offers', target: 'Notifications' },
        { id: '6', title: 'Help Center', icon: 'help-circle-outline', subtitle: 'FAQs, Support, Contact', target: 'Chat' },
    ];

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

    const MenuRow = ({ item }) => (
        <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => item.target && navigation.navigate(item.target, item.id === '4' ? { activeNav: 'saved' } : {})}
        >
            <View style={styles.menuIconBg}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#1B4D20" />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                >
                    {/* Profile Header Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image source={user.avatar} style={styles.avatar} />
                            <TouchableOpacity style={styles.editBadge}>
                                <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <View style={styles.locationRow}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#4CDE16" />
                            <Text style={styles.locationText}>{user.location}</Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Orders</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>5</Text>
                                <Text style={styles.statLabel}>Saved</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>2</Text>
                                <Text style={styles.statLabel}>Active</Text>
                            </View>
                        </View>
                    </View>

                    {/* Profile details only */}

                    {/* Support Card */}
                    <TouchableOpacity style={styles.supportCard}>
                        <View style={styles.supportContent}>
                            <Text style={styles.supportTitle}>Need help?</Text>
                            <Text style={styles.supportText}>Our support team is available 24/7</Text>
                        </View>
                        <View style={styles.supportIcon}>
                            <MaterialCommunityIcons name="headset" size={24} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Log Out Button */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>AgroBridge v1.0.2 • Made with ❤️ for Sri Lanka</Text>
                </ScrollView>
            </SafeAreaView>

            <BuyerBottomNav
                navigation={navigation}
                activeNav="settings"
                cartItemCount={3}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBF8',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 25,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 25,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#E8F5E9',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1B4D20',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 5,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAF9',
        borderRadius: 16,
        paddingVertical: 15,
        width: '100%',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B4D20',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E0E0E0',
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        marginLeft: 5,
    },
    menuList: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginBottom: 25,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    supportCard: {
        backgroundColor: '#1B4D20',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        elevation: 4,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    supportContent: {
        flex: 1,
    },
    supportTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    supportText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    supportIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFEDED',
        marginBottom: 20,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#CCC',
        marginBottom: 20,
    },
});

export default BuyerProfileScreen;
