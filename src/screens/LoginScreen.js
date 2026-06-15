import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

const LoginScreen = ({ navigation }) => {
    const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Social Auth Request Hooks
    const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
        clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com', // <--- REPLACE THIS
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    });

    const [fbRequest, fbResponse, promptFbAsync] = Facebook.useAuthRequest({
        clientId: '1264010941881677',
        responseType: ResponseType.Token,
    });

    // Handle Social Auth Responses
    React.useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { id_token } = googleResponse.params;
            const credential = GoogleAuthProvider.credential(id_token);
            handleSocialLogin(credential);
        }
    }, [googleResponse]);

    React.useEffect(() => {
        if (fbResponse?.type === 'success') {
            const { access_token } = fbResponse.params;
            const credential = FacebookAuthProvider.credential(access_token);
            handleSocialLogin(credential);
        }
    }, [fbResponse]);

    const handleSocialLogin = async (credential) => {
        setLoading(true);
        try {
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            await checkProfileAndLogin(user);
        } catch (error) {
            console.error("Social Login Error:", error);
            alert("Social Login Failed: " + error.message);
            setLoading(false);
        }
    };

    const checkProfileAndLogin = async (user) => {
        const collectionName = role === 'farmer' ? 'farmers' : 'buyers';
        const docRef = doc(db, collectionName, user.uid);

        try {
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Profile found, navigating...");
            } else {
                console.log(`No ${role} profile found. Auto-creating...`);
                // Auto-create profile if missing (give access as requested)
                await setDoc(docRef, {
                    uid: user.uid,
                    fullName: user.displayName || 'Agro User',
                    email: user.email,
                    role,
                    joinedAt: new Date().toISOString(),
                    photoURL: user.photoURL || null,
                });
                alert(`New ${role} profile created for you!`);
            }

            // Navigate
            if (role === 'farmer') {
                navigation.replace('FarmerDashboard');
            } else {
                navigation.replace('BuyerDashboard');
            }

        } catch (error) {
            console.error("Login Profile Error:", error);
            alert("Login succeeded, but profile check failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        // Simple Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address (e.g., user@example.com). Phone numbers are not supported.');
            return;
        }

        setLoading(true);
        try {
            // 1. Authenticate
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Check/Create Profile
            await checkProfileAndLogin(user);

        } catch (error) {
            console.error("Login Error: ", error);
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/images/landing_background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar style="light" />
            <SafeAreaView style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <Text style={styles.headerTitle}>PORTAL ACCESS</Text>
                    <Text style={styles.welcomeText}>Welcome to{'\n'}AgroBridge</Text>
                    <Text style={styles.subText}>Select your portal to continue</Text>

                    {/* Role Selection Tabs */}
                    <View style={styles.roleTabsContainer}>
                        <TouchableOpacity
                            style={[styles.roleTab, role === 'farmer' && styles.activeRoleTab]}
                            onPress={() => setRole('farmer')}
                        >
                            <Text style={[styles.roleTabText, role === 'farmer' && styles.activeRoleTabText]}>Farmer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleTab, role === 'buyer' && styles.activeRoleTab]}
                            onPress={() => setRole('buyer')}
                        >
                            <Text style={[styles.roleTabText, role === 'buyer' && styles.activeRoleTabText]}>Buyer</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Form */}
                    <BlurView intensity={30} tint="dark" style={styles.formCard}>

                        {/* Email Input */}
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={email}
                                onChangeText={(text) => setEmail(text.trim())}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Input */}
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialCommunityIcons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPass}>
                            <Text style={styles.forgotPassText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR LOGIN WITH</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={() => promptGoogleAsync()}
                                disabled={!googleRequest}
                            >
                                <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.socialIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.socialButton, styles.facebookButton]}
                                onPress={() => promptFbAsync()}
                                disabled={!fbRequest}
                            >
                                <Image source={{ uri: 'https://img.icons8.com/color/48/000000/facebook-new.png' }} style={styles.socialIcon} />
                            </TouchableOpacity>
                        </View>

                    </BlurView>

                    {/* Login Button */}
                    {/* Login Button */}
                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Logging in...' : (role === 'farmer' ? 'Login to Dashboard' : 'Login to Marketplace')}
                        </Text>
                        {!loading && <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />}
                    </TouchableOpacity>

                    {/* Signup Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    backButton: {
        marginLeft: 20,
        marginTop: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    headerTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        letterSpacing: 2,
        fontWeight: '600',
        alignSelf: 'center',
        marginTop: 20,
    },
    welcomeText: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        lineHeight: 44,
    },
    subText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    roleTabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 30,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    roleTab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    activeRoleTab: {
        backgroundColor: '#FFF',
    },
    roleTabText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    activeRoleTabText: {
        color: '#1B4D20',
        fontWeight: 'bold',
    },
    formCard: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30, 30, 30, 0.4)', // Darker glass
        marginBottom: 20,
    },
    inputLabel: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginTop: -10,
        marginBottom: 5,
    },
    forgotPassText: {
        color: '#4ADE80', // Light green
        fontSize: 14,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 10,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    socialIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    loginButton: {
        backgroundColor: '#1B4D20', // Dark green
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    signupText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    signupLink: {
        color: '#4ADE80',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
