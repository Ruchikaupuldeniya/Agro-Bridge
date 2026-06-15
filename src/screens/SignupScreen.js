import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from 'firebase/auth'; // Added Social Auth providers
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession(); // Required for web

const SignupScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
    const [fullName, setFullName] = useState('');
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
            await checkOrCreateProfile(user);
        } catch (error) {
            console.error("Social Login Error:", error);
            alert("Social Login Failed: " + error.message);
            setLoading(false);
        }
    };

    const checkOrCreateProfile = async (user) => {
        const collectionName = role === 'farmer' ? 'farmers' : 'buyers';
        console.log(`Social Auth: Checking profile in ${collectionName}...`);

        try {
            const docRef = doc(db, collectionName, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                alert(`Welcome back, ${role === 'farmer' ? 'Farmer' : 'Buyer'}!`);
            } else {
                console.log(`Creating new ${role} profile from Social Auth...`);
                await setDoc(docRef, {
                    uid: user.uid,
                    fullName: user.displayName || 'No Name',
                    email: user.email,
                    role, // 'farmer' or 'buyer'
                    joinedAt: new Date().toISOString(),
                    photoURL: user.photoURL,
                });
                alert(`Welcome ${role === 'farmer' ? 'Farmer' : 'Buyer'}! Account created.`);
            }

            if (role === 'farmer') {
                navigation.replace('FarmerDashboard');
            } else {
                navigation.replace('BuyerDashboard');
            }
        } catch (error) {
            console.error("Profile Save Error:", error);
            alert("Login successful, but failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        console.log("Starting Signup Process...");

        const collectionName = role === 'farmer' ? 'farmers' : 'buyers';

        try {
            let user;
            try {
                // 1. Try to Create User in Auth
                console.log("Attempting to create user in Auth...");
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
                console.log("User created in Auth:", user.uid);
            } catch (authError) {
                // 1.b. If user exists, try to login to add new role
                if (authError.code === 'auth/email-already-in-use') {
                    console.log("Email exists, attempting to login to add new role...");
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    user = userCredential.user;
                } else {
                    throw authError; // Throw other errors
                }
            }

            // 2. Check/Create Profile in Correct Collection
            console.log(`Checking profile in ${collectionName}...`);
            const docRef = doc(db, collectionName, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                alert(`You already have a ${role} account! Logging you in...`);
            } else {
                console.log(`Creating new ${role} profile...`);
                // Create a timeout promise that rejects after 5 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Firestore write timed out")), 5000)
                );

                // Race the setDoc against the timeout
                await Promise.race([
                    setDoc(docRef, {
                        uid: user.uid,
                        fullName,
                        email,
                        role, // 'farmer' or 'buyer'
                        joinedAt: new Date().toISOString()
                    }),
                    timeoutPromise
                ]);
                console.log("Profile saved successfully.");
                alert(`Welcome ${role === 'farmer' ? 'Farmer' : 'Buyer'}! Account created.`);
            }

            // 3. Navigate
            if (role === 'farmer') {
                navigation.replace('FarmerDashboard');
            } else {
                navigation.replace('BuyerDashboard');
            }

        } catch (error) {
            console.error("Signup Main Error: ", error);
            if (error.code === 'auth/email-already-in-use') {
                alert('That email address is already in use!');
            } else if (error.code === 'auth/invalid-email') {
                alert('That email address is invalid!');
            } else {
                alert('Signup failed: ' + error.message);
            }
        } finally {
            setLoading(false);
            console.log("Signup Process Finished.");
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
                    <MaterialCommunityIcons name="chevron-left" size={32} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]} showsVerticalScrollIndicator={false}>

                        {/* Heder */}
                        <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
                        <Text style={styles.welcomeText}>Join AgroBridge</Text>
                        <Text style={styles.subText}>Start your journey with us today</Text>

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

                        {/* Form Card */}
                        <BlurView intensity={25} tint="dark" style={styles.formCard}>

                            {/* Full Name */}
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            {/* Email/Mobile */}
                            <Text style={styles.inputLabel}>Email or Mobile</Text>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email or phone number"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Password */}
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a strong password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    <MaterialCommunityIcons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                style={[styles.signupButton, loading && { opacity: 0.7 }]}
                                onPress={handleSignup}
                                disabled={loading}
                            >
                                <Text style={styles.signupButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                                {!loading && <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
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
                                    <Text style={styles.socialText}>Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.socialButton, styles.facebookButton]}
                                    onPress={() => promptFbAsync()}
                                    disabled={!fbRequest}
                                >
                                    <Image source={{ uri: 'https://img.icons8.com/color/48/000000/facebook-new.png' }} style={styles.socialIcon} />
                                    <Text style={styles.socialText}>Facebook</Text>
                                </TouchableOpacity>
                            </View>

                        </BlurView>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login Here</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
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
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: '700',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    welcomeText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 25,
    },
    roleTabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
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
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30,30,30,0.4)',
    },
    inputLabel: {
        color: '#E0E0E0',
        fontSize: 13,
        marginBottom: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)', // Darker input background for better contrast
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 15,
    },
    signupButton: {
        backgroundColor: '#1B4D20', // Matched Login Page Dark Green
        height: 54,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signupButtonText: {
        color: '#FFF', // White text to match
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        gap: 15,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    socialIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    socialText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    loginText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    loginLink: {
        color: '#4CDE16',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
