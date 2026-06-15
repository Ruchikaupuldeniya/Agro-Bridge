import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions, Image, Linking, Alert, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import BuyerBottomNav from '../components/BuyerBottomNav';
import { PRODUCTS, USERS } from '../data/mockData';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { addToCart } from '../services/CartService';

const { width, height } = Dimensions.get('window');

const PublicFarmProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { farmName: routeFarmName, farmer: passedFarmer } = route.params || {};

    // Prioritize passed farmer data from the product, fallback to mock
    const [farmer, setFarmer] = React.useState(passedFarmer || USERS.farmer);
    const farmName = routeFarmName || farmer.fullName || farmer.name || farmer.farmName || "Sunshine Acres Homestead";
    const location = farmer.location || "Anuradhapura, Sri Lanka";
    const rating = farmer.rating || "4.9";
    const phone = farmer.phone || "+94 77 123 4567";
    const about = farmer.about || "We are dedicated to sustainable farming practices.";
    const [farmProducts, setFarmProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFarmData = async () => {
            setLoading(true);
            try {
                // 1. If we only have farmName but no farmer object, try to find farmer by name or UID
                // (This is a bit complex without a name index, so we rely on passed farmer or farmerId)
                let currentFarmer = farmer;

                // 2. Fetch products from Firestore for this farmer
                const q = query(
                    collection(db, 'products'),
                    where('farmerId', '==', currentFarmer.uid || currentFarmer.id || '')
                );

                const querySnapshot = await getDocs(q);
                const productsList = [];
                querySnapshot.forEach((doc) => {
                    productsList.push({ id: doc.id, ...doc.data() });
                });

                setFarmProducts(productsList);
            } catch (error) {
                console.error("Error fetching farm products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFarmData();
    }, [farmer.uid, farmer.id]);

    const [isFollowed, setIsFollowed] = React.useState(false);

    const handleWhatsApp = async () => {
        const cleanPhone = phone.replace(/\s/g, '').replace('+', '');
        const url = `whatsapp://send?phone=${cleanPhone}&text=Hi ${farmName}, I found your farm on AgroBridge.`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("WhatsApp Not Found", "Please install WhatsApp to contact the farmer.");
            }
        } catch (err) {
            Alert.alert("Error", "Could not open WhatsApp");
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: farmName,
                message: `Check out ${farmName} on AgroBridge! They have fresh, local produce.`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddToCart = async (product) => {
        if (!auth.currentUser) {
            Alert.alert("Login Required", "Please login to add items to cart");
            return;
        }
        try {
            await addToCart(auth.currentUser.uid, product, 1);
            Alert.alert("Added!", `${product.name} is now in your cart.`);
        } catch (error) {
            Alert.alert("Error", "Failed to add to cart");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Premium Header/Hero */}
            <View style={styles.heroContainer}>
                <ImageBackground
                    source={require('../../assets/images/landing_background.png')}
                    style={styles.heroImage}
                >
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <View style={[styles.heroOverlay, { backgroundColor: 'rgba(27, 77, 32, 0.4)' }]} />

                    <SafeAreaView style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.backBtn} onPress={handleShare}>
                                <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setIsFollowed(!isFollowed)}>
                                <MaterialCommunityIcons
                                    name={isFollowed ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isFollowed ? "#FF4B4B" : "#FFF"}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={styles.profileFrame}>
                            <Image
                                source={require('../../assets/images/landing_background.png')}
                                style={styles.avatarLarge}
                            />
                            <View style={styles.verifiedFloating}>
                                <MaterialCommunityIcons name="check-decagram" size={18} color="#FFF" />
                            </View>
                        </View>
                        <Text style={styles.farmTitle}>{farmName}</Text>
                        <View style={styles.locationTag}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#FFF" />
                            <Text style={styles.locText}>{farmer.location}</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollArea, { paddingBottom: 100 }]}
            >
                {/* Stats Grid */}
                <View style={styles.statsCard}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{farmer.rating} ★</Text>
                        <Text style={styles.statLabel}>Quality</Text>
                    </View>
                    <View style={styles.vDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>1.2k</Text>
                        <Text style={styles.statLabel}>Sales</Text>
                    </View>
                    <View style={styles.vDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>24h</Text>
                        <Text style={styles.statLabel}>Response</Text>
                    </View>
                </View>

                {/* About Farmer */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.secTitle}>Our Story</Text>
                    <View style={styles.aboutBox}>
                        <Text style={styles.aboutText}>{farmer.about}</Text>
                    </View>
                </View>

                {/* Products List */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.secTitle}>Fresh From The Field</Text>
                        <Text style={styles.productCount}>{farmProducts.length} items</Text>
                    </View>

                    {farmProducts.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            style={styles.premiumProductCard}
                            onPress={() => navigation.navigate('ProductDetails', { product: p })}
                        >
                            <Image source={p.image} style={styles.pCardImg} />
                            <View style={styles.pCardInfo}>
                                <Text style={styles.pCardTitle}>{p.name}</Text>
                                <View style={styles.pCardPriceRow}>
                                    <Text style={styles.pCardCurrency}>Rs. </Text>
                                    <Text style={styles.pCardPrice}>{parseFloat(p.price).toFixed(2)}</Text>
                                    <Text style={styles.pCardUnit}> / {p.unit}</Text>
                                </View>
                                <View style={styles.pCardTags}>
                                    <View style={styles.pTag}>
                                        <Text style={styles.pTagText}>Organic</Text>
                                    </View>
                                    <View style={styles.pTag}>
                                        <Text style={styles.pTagText}>Nuwara Eliya</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtnSmall}
                                onPress={() => handleAddToCart(p)}
                            >
                                <MaterialCommunityIcons name="cart-plus" size={20} color="#1B4D20" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Spacer for Floating Buttons and Nav */}
                <View style={{ height: 160 }} />
            </ScrollView>

            {/* Floating Action Bar */}
            <View style={[styles.floatingFooter, { bottom: insets.bottom + 100 }]}>
                <TouchableOpacity style={styles.chatActionBtn} onPress={() => navigation.navigate('Chat', { farmer })}>
                    <MaterialCommunityIcons name="chat-processing" size={24} color="#FFF" />
                    <Text style={styles.chatActionText}>Chat Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whatsappActionBtn} onPress={handleWhatsApp}>
                    <MaterialCommunityIcons name="whatsapp" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <BuyerBottomNav navigation={navigation} activeNav="search" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    heroContainer: {
        height: height * 0.45,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    heroContent: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    profileFrame: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFF',
        position: 'relative',
        marginBottom: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    avatarLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    verifiedFloating: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CDE16',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    farmTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    locText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    scrollArea: {
        paddingTop: 10,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 20,
        marginTop: -30,
        elevation: 8,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1B4D20',
    },
    statLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    vDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#F0F0F0',
    },
    sectionContainer: {
        paddingHorizontal: 24,
        marginTop: 30,
    },
    secTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1B1B1B',
        marginBottom: 12,
    },
    aboutBox: {
        backgroundColor: '#F9FFF9',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    aboutText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    productCount: {
        fontSize: 12,
        color: '#1B4D20',
        fontWeight: '700',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    premiumProductCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
    },
    pCardImg: {
        width: 80,
        height: 80,
        borderRadius: 15,
    },
    pCardInfo: {
        flex: 1,
        paddingHorizontal: 15,
    },
    pCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    pCardPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    pCardCurrency: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1B4D20',
    },
    pCardPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1B4D20',
    },
    pCardUnit: {
        fontSize: 12,
        color: '#888',
    },
    pCardTags: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    pTag: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    pTagText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    addBtnSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingFooter: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 12,
        zIndex: 20,
    },
    chatActionBtn: {
        flex: 1,
        height: 56,
        backgroundColor: '#1B4D20',
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 5,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    chatActionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    whatsappActionBtn: {
        width: 56,
        height: 56,
        backgroundColor: '#25D366',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});

export default PublicFarmProfileScreen;
