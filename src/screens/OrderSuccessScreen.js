import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BuyerBottomNav from '../components/BuyerBottomNav';

const { width } = Dimensions.get('window');

const OrderSuccessScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('BuyerDashboard')}>
                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Success</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="share-variant" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>

                {/* Success Graphic */}
                <View style={styles.graphicContainer}>
                    <View style={styles.checkCircleBg}>
                        <View style={styles.checkCircle}>
                            <MaterialCommunityIcons name="check" size={40} color="#FFF" />
                        </View>
                    </View>
                    {/* Optional small leaf decorations */}
                    <MaterialCommunityIcons name="leaf" size={20} color="#4CDE16" style={[styles.leafIcon, { top: 100, left: 40 }]} />
                    <MaterialCommunityIcons name="leaf" size={16} color="#8BC34A" style={[styles.leafIcon, { top: 180, right: 60, transform: [{ rotate: '45deg' }] }]} />
                </View>

                {/* Hero Image */}
                <View style={styles.heroImageContainer}>
                    <Image
                        source={require('../../assets/images/landing_background.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroText}>CONNECTING THE BRIDGE</Text>
                    </View>
                </View>

                {/* Success Text */}
                <Text style={styles.title}>Thank You!</Text>
                <Text style={styles.subtitle}>
                    Your bridge to fresh farm produce is complete. Your order has been successfully placed and is being prepared.
                </Text>

                {/* Order Confirmation Card */}
                <View style={styles.orderCard}>
                    <View style={styles.orderCardInfo}>
                        <Text style={styles.orderLabel}>ORDER CONFIRMATION</Text>
                        <Text style={styles.orderId}>#AGB-88291</Text>

                        <View style={styles.arrivalRow}>
                            <MaterialCommunityIcons name="truck-delivery" size={16} color="#4CDE16" />
                            <Text style={styles.arrivalText}>Arrival: Today, 4:00 - 6:00 PM</Text>
                        </View>
                    </View>
                    <Image
                        source={require('../../assets/images/landing_background.png')}
                        style={styles.orderThumb}
                    />
                </View>

                {/* Buttons */}
                <TouchableOpacity style={styles.trackButton} onPress={() => navigation.navigate('TrackOrder')}>
                    <Text style={styles.trackButtonText}>Track My Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('BuyerDashboard')}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#888" />
                    <Text style={styles.footerText}>Verified AgroBridge Delivery</Text>
                </View>

            </ScrollView>

            <BuyerBottomNav
                navigation={navigation}
                activeNav="home"
                cartItemCount={0}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    graphicContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    checkCircleBg: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F0F9F0', // Very light green fade
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#4CDE16",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 4,
        borderColor: '#FFF',
    },
    leafIcon: {
        position: 'absolute',
        opacity: 0.6,
    },
    heroImageContainer: {
        width: '100%',
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    heroText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    orderCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderCardInfo: {
        flex: 1,
    },
    orderLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 1,
        marginBottom: 5,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    arrivalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    arrivalText: {
        fontSize: 12,
        color: '#4CDE16',
        fontWeight: '600',
    },
    orderThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    trackButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#1B4D20', // Dark green
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    trackButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    homeButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 30,
    },
    homeButtonText: {
        color: '#5D4037', // Brownish text
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        opacity: 0.5,
    },
    footerText: {
        fontSize: 10,
        color: '#888',
    },
});

export default OrderSuccessScreen;
