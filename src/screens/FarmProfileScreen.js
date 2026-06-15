import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FarmerBottomNav from '../components/FarmerBottomNav';

const FarmProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // Local state to hold profile data
    const [profile, setProfile] = useState({
        farmName: 'Loading...',
        about: '...',
        phone: '...',
        email: '...',
        location: '...',
        heroImage: require('../../assets/images/landing_background.png') // Used as Avatar now
    });

    React.useEffect(() => {
        const fetchFarmerData = async () => {
            if (auth.currentUser) {
                try {
                    const docRef = doc(db, 'farmers', auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setProfile({
                            farmName: data.farmName || data.fullName || 'My Farm',
                            about: data.about || 'No description yet. Add details in settings.',
                            phone: data.phone || 'No phone set',
                            email: data.email || 'No email set',
                            location: data.location || 'No location set',
                            heroImage: data.photoURL ? { uri: data.photoURL } : require('../../assets/images/landing_background.png')
                        });
                    }
                } catch (error) {
                    console.error("Error fetching farmer data:", error);
                }
            }
        };
        fetchFarmerData();
    }, []);

    // Callback to update local state AND Firestore from Edit Screen
    const handleProfileUpdate = async (updatedData) => {
        // Optimistic UI update
        // Note: 'heroImage' in updatedData comes from image picker, map it correctly
        setProfile(prev => ({
            ...prev,
            ...updatedData,
            heroImage: updatedData.heroImage || prev.heroImage
        }));

        // Save to Firestore
        if (auth.currentUser) {
            try {
                const docRef = doc(db, 'farmers', auth.currentUser.uid);
                await updateDoc(docRef, {
                    farmName: updatedData.farmName,
                    about: updatedData.about,
                    phone: updatedData.phone,
                    email: updatedData.email,
                    location: updatedData.location,
                    // Note: In a real app, we'd upload the image to storage and save the URL.
                    // For now, if we implemented Base64 elsewhere, we'd save that here.
                });
                console.log("Farmer profile synced to DB");
            } catch (error) {
                console.error("Error syncing farmer profile:", error);
                alert("Saved locally, but failed to sync to server.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                >
                    {/* Header Title */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>My Farm</Text>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image source={profile.heroImage} style={styles.avatar} />
                            <TouchableOpacity
                                style={styles.editBadge}
                                onPress={() => navigation.navigate('EditFarmProfile', {
                                    currentProfile: profile,
                                    onSave: handleProfileUpdate
                                })}
                            >
                                <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color="#FFF" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>

                        <Text style={styles.userName}>{profile.farmName}</Text>

                        <View style={styles.locationRow}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#4CDE16" />
                            <Text style={styles.locationText}>{profile.location}</Text>
                        </View>

                        <Text style={styles.aboutText} numberOfLines={3}>
                            {profile.about}
                        </Text>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>4.9</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>128</Text>
                                <Text style={styles.statLabel}>Orders</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>95%</Text>
                                <Text style={styles.statLabel}>On-Time</Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact Info */}
                    <Text style={styles.sectionHeading}>Contact Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIconBg}>
                                <MaterialCommunityIcons name="phone" size={20} color="#1B4D20" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{profile.phone}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View style={styles.infoIconBg}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#1B4D20" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{profile.email}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Badges */}
                    <Text style={[styles.sectionHeading, { marginTop: 25 }]}>Badges</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
                        <View style={styles.badgeChip}>
                            <MaterialCommunityIcons name="leaf" size={16} color="#FFF" />
                            <Text style={styles.badgeText}>Organic</Text>
                        </View>
                        <View style={[styles.badgeChip, { backgroundColor: '#2196F3' }]}>
                            <MaterialCommunityIcons name="water" size={16} color="#FFF" />
                            <Text style={styles.badgeText}>Water Smart</Text>
                        </View>
                        <View style={[styles.badgeChip, { backgroundColor: '#FF9800' }]}>
                            <MaterialCommunityIcons name="star-circle" size={16} color="#FFF" />
                            <Text style={styles.badgeText}>Top Rated</Text>
                        </View>
                    </ScrollView>



                </ScrollView>
            </SafeAreaView>

            <FarmerBottomNav navigation={navigation} activeNav="settings" />
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
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
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
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CDE16',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
        gap: 4,
    },
    verifiedText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
        textAlign: 'center',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 5,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    aboutText: {
        fontSize: 13,
        color: '#777',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
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
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    infoIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginLeft: 70,
    },
    badgeScroll: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    badgeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B4D20',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        gap: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },

});

export default FarmProfileScreen;
