import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, SafeAreaView as RNSafeAreaView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BuyerBottomNav from '../components/BuyerBottomNav';

const { width, height } = Dimensions.get('window');

const TrackOrderScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Map Background (Simulated) */}
            <Image
                source={require('../../assets/images/landing_background.png')} // Keeping consistency with existing assets usually, or a map placeholder
                style={styles.mapBackground}
                resizeMode="cover"
            />
            {/* Light overlay to make it look more like a map base for this specific design if needed, 
          but the design shows a light map. We'll use a light overlay on the dark image or assume a map image. 
          For now, using a light overlay on the existing image to simulate a map surface. */}
            <View style={styles.mapOverlay} />

            {/* Simulated Route & Icons */}
            <View style={styles.mapLayer}>

                {/* Farm Location */}
                <View style={[styles.mapIconContainer, { top: '30%', left: '30%' }]}>
                    <View style={[styles.mapIconBubble, { backgroundColor: '#FFF' }]}>
                        <Text style={styles.mapLabel}>GREEN VALLEY FARM</Text>
                        <MaterialCommunityIcons name="tractor" size={16} color="#1B4D20" />
                    </View>
                </View>

                {/* Dotted Line (Simulated with simple views for demo) */}
                <View style={[styles.routeDot, { top: '34%', left: '35%' }]} />
                <View style={[styles.routeDot, { top: '38%', left: '40%' }]} />
                <View style={[styles.routeDot, { top: '42%', left: '44%' }]} />
                <View style={[styles.routeDot, { top: '46%', left: '48%' }]} />
                <View style={[styles.routeDot, { top: '50%', left: '52%' }]} />

                {/* Delivery Truck (Moving) */}
                <View style={[styles.truckContainer, { top: '45%', left: '45%' }]}>
                    <View style={styles.truckIconBg}>
                        <MaterialCommunityIcons name="truck-delivery" size={24} color="#FFF" />
                    </View>
                </View>

                {/* Home Location */}
                <View style={[styles.mapIconContainer, { top: '55%', left: '60%' }]}>
                    <View style={[styles.mapIconBubble, { backgroundColor: '#FFF' }]}>
                        <MaterialCommunityIcons name="home-variant" size={20} color="#1B4D20" />
                        <Text style={styles.mapLabelBottom}>YOUR HOME</Text>
                    </View>
                </View>

            </View>


            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBg}>
                        <Text style={styles.headerTitle}>Track Delivery</Text>
                    </View>
                    <TouchableOpacity style={styles.infoButton}>
                        <MaterialCommunityIcons name="information-variant" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Order Journey Card */}
                <View style={styles.journeyCard}>
                    <View style={styles.journeyHeader}>
                        <Text style={styles.journeyTitle}>ORDER JOURNEY</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>En Route</Text>
                        </View>
                    </View>

                    <View style={styles.stepperContainer}>
                        {/* Step 1: Ordered */}
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, styles.stepActive]}>
                                <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                            </View>
                            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Ordered</Text>
                        </View>
                        <View style={[styles.stepLine, styles.stepLineActive]} />

                        {/* Step 2: Prepared */}
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, styles.stepActive]}>
                                <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                            </View>
                            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Prepared</Text>
                        </View>
                        <View style={[styles.stepLine, styles.stepLineActive]} />

                        {/* Step 3: En Route */}
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, styles.stepCurrent]}>
                                <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#4CDE16" />
                            </View>
                            <Text style={[styles.stepLabel, styles.stepLabelActive]}>En Route</Text>
                        </View>
                        <View style={styles.stepLine} />

                        {/* Step 4: Delivered */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepCircle}>
                                <View style={styles.stepDot} />
                            </View>
                            <Text style={styles.stepLabel}>Delivered</Text>
                        </View>

                    </View>
                </View>


                {/* Map Controls (Floating) */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MaterialCommunityIcons name="plus" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MaterialCommunityIcons name="minus" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlBtn, styles.gpsBtn]}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>


                {/* Bottom Panel */}
                <View style={[styles.bottomPanel, { bottom: 100 + insets.bottom }]}>
                    <View style={styles.bottomHeaderRow}>
                        <View>
                            <Text style={styles.bottomLabel}>ORDER STATUS</Text>
                            <Text style={styles.bottomTitle}>Order on the way!</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Text style={styles.timeText}>12 mins</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Driver Info */}
                    <View style={styles.driverRow}>
                        <Image source={require('../../assets/images/landing_background.png')} style={styles.driverImage} />
                        <View style={styles.driverInfo}>
                            <Text style={styles.driverRole}>Your Farmer</Text>
                            <Text style={styles.driverName}>Samuel Green</Text>
                            <View style={styles.ratingRow}>
                                <MaterialCommunityIcons name="star" size={14} color="#FFC107" />
                                <Text style={styles.ratingText}>4.9</Text>
                            </View>
                        </View>

                        <View style={styles.contactButtons}>
                            <TouchableOpacity style={styles.messageButton} onPress={() => navigation.navigate('Chat')}>
                                <MaterialCommunityIcons name="message-text" size={24} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.callButton}>
                                <MaterialCommunityIcons name="phone" size={24} color="#FFF" />
                                <Text style={styles.callText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

            </SafeAreaView>

            {/* Bottom Nav */}
            <BuyerBottomNav
                navigation={navigation}
                activeNav="home"
                cartItemCount={3}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F0',
    },
    mapBackground: {
        position: 'absolute',
        width: width,
        height: height,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    mapLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    mapIconContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    mapIconBubble: {
        padding: 8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    mapLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    mapLabelBottom: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 2,
    },
    routeDot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CDE16',
        transform: [{ rotate: '45deg' }], // slanted path simulation
    },
    truckContainer: {
        position: 'absolute',
    },
    truckIconBg: {
        width: 44,
        height: 44,
        backgroundColor: '#4CDE16',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    safeArea: {
        flex: 1,
        zIndex: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitleBg: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    journeyCard: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    journeyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    journeyTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#4CDE16',
        fontSize: 10,
        fontWeight: 'bold',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
        zIndex: 2,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    stepActive: {
        backgroundColor: '#4CDE16',
    },
    stepCurrent: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#4CDE16',
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 0,
        top: -4,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DDD',
    },
    stepLabel: {
        fontSize: 10,
        color: '#AAA',
    },
    stepLabelActive: {
        color: '#4CDE16',
        fontWeight: '600',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#F0F0F0',
        marginHorizontal: -5,
        top: -10,
        zIndex: 1,
    },
    stepLineActive: {
        backgroundColor: '#4CDE16',
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: 250, // Below journey card
        gap: 10,
    },
    controlBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gpsBtn: {
        backgroundColor: '#4CDE16',
        marginTop: 10,
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 80, // Above nav bar
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    bottomHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    bottomLabel: {
        fontSize: 10,
        color: '#4CDE16',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bottomTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    timeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        color: '#4CDE16',
        fontWeight: 'bold',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 15,
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
        marginRight: 15,
    },
    driverInfo: {
        flex: 1,
    },
    driverRole: {
        fontSize: 10,
        color: '#888',
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFA000',
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    messageButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: '#4CDE16',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 44,
        borderRadius: 12,
        gap: 8,
    },
    callText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        zIndex: 10,
    },
    navItem: {
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        fontWeight: '500',
    },
});

export default TrackOrderScreen;
