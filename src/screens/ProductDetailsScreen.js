import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Animated, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { addToCart } from '../services/CartService';
import { useCartCount } from '../hooks/useCartCount';
import { USERS } from '../data/mockData';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const insets = useSafeAreaInsets();
    const cartItemCount = useCartCount();

    // Dynamic Farmer State
    const [displayFarmer, setDisplayFarmer] = useState({
        name: product.farm || 'Local Farmer',
        phone: '+94 77 123 4567',
        about: 'Sustainable local farming.',
        location: product.address || 'Anuradhapura, Sri Lanka',
        rating: '4.9',
        verified: true,
        loading: true
    });

    React.useEffect(() => {
        const fetchFarmer = async () => {
            if (!product.farmerId) {
                setDisplayFarmer(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                // Fetch from 'farmers' collection
                const farmerRef = doc(db, 'farmers', product.farmerId);
                const farmerSnap = await getDoc(farmerRef);

                if (farmerSnap.exists()) {
                    const data = farmerSnap.data();
                    setDisplayFarmer({
                        id: product.farmerId,
                        uid: product.farmerId,
                        name: data.fullName || data.name || product.farm || 'Verified Farmer',
                        phone: data.phone || '+94 77 123 4567',
                        about: data.about || 'Specializing in fresh, organic produce harvested daily.',
                        location: data.location || product.address || 'Sri Lanka',
                        rating: data.rating || '4.9',
                        verified: data.verified !== undefined ? data.verified : true,
                        loading: false,
                        avatar: data.photoURL || null
                    });
                } else {
                    setDisplayFarmer(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error("Error fetching farmer details:", error);
                setDisplayFarmer(prev => ({ ...prev, loading: false }));
            }
        };

        fetchFarmer();
    }, [product.farmerId]);

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const scrollY = new Animated.Value(0);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const handleShare = async () => {
        try {
            const url = 'https://agrobridge.lk/product/' + product.id; // Mock URL
            const result = await Share.share({
                title: product.name,
                message: `🌿 ${product.name} from ${product.farm || 'Local Farm'} is available on AgroBridge!\n\n💰 Price: Rs. ${parseFloat(product.price || 0).toFixed(2)}/${product.unit || 'unit'}\n📍 Location: ${product.address || 'Sri Lanka'}\n\nDownload the app to buy fresh from local farmers!`,
                url: url,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleAddToCart = async () => {
        if (!auth.currentUser) {
            alert("Please login to add items to cart");
            return;
        }
        try {
            await addToCart(auth.currentUser.uid, product, quantity);
            alert(`${product.name} added to cart!`);
        } catch (error) {
            alert("Failed to add to cart");
        }
    };

    const handleBuyNow = async () => {
        if (!auth.currentUser) {
            alert("Please login to checkout");
            return;
        }
        navigation.navigate('Checkout', { product: { ...product, quantity } });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Dynamic Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity, paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="cart-outline" size={24} color="#000" />
                        {cartItemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Floating Top Buttons (Initial State) */}
            <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.rightButtons}>
                    <TouchableOpacity onPress={handleShare} style={styles.roundBtn}>
                        <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.roundBtn}>
                        <MaterialCommunityIcons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? "#FF4B4B" : "#FFF"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Image */}
                <Image
                    source={
                        typeof product.image === 'string' && product.image
                            ? { uri: product.image }
                            : (product.image || require('../../assets/images/landing_background.png'))
                    }
                    style={styles.heroImage}
                />

                <View style={styles.content}>
                    {/* Category & Rating */}
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category || 'General'}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
                        </View>
                    </View>

                    {/* Price & Status Card */}
                    <View style={styles.priceCard}>
                        <View style={styles.priceHeader}>
                            <View>
                                <Text style={styles.productName}>{product.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.currencySymbol}>Rs. </Text>
                                    <Text style={styles.price}>{parseFloat(product.price).toFixed(2)}</Text>
                                    <Text style={styles.unit}> / {product.unit}</Text>
                                </View>
                            </View>
                            {product.tag === 'PREMIUM' && (
                                <View style={styles.premiumBadge}>
                                    <MaterialCommunityIcons name="crown" size={12} color="#FFF" />
                                    <Text style={styles.premiumText}>PREMIUM</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.statusRow}>
                            <View style={styles.statusItem}>
                                <MaterialCommunityIcons name="archive-check-outline" size={16} color="#1B4D20" />
                                <Text style={styles.statusText}>In Stock</Text>
                            </View>
                            <View style={[styles.statusItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
                                <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#1B4D20" />
                                <Text style={styles.statusText}>Delivery: 24h</Text>
                            </View>
                            <View style={[styles.statusItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#1B4D20" />
                                <Text style={styles.statusText}>Freshly Picked</Text>
                            </View>
                        </View>
                    </View>

                    {/* Farmer Section */}
                    <TouchableOpacity
                        style={styles.premiumFarmerCard}
                        onPress={() => navigation.navigate('PublicFarmProfile', { farmName: displayFarmer.name, farmer: displayFarmer })}
                    >
                        <View style={styles.farmerUpperRow}>
                            <View style={styles.avatarFrame}>
                                <Image
                                    source={displayFarmer.avatar ? { uri: displayFarmer.avatar } : require('../../assets/images/landing_background.png')}
                                    style={styles.farmerAvatarImg}
                                />
                                {displayFarmer.verified && (
                                    <View style={styles.verifiedDot}>
                                        <MaterialCommunityIcons name="check-decagram" size={12} color="#FFF" />
                                    </View>
                                )}
                            </View>

                            <View style={styles.farmerMainContent}>
                                <View style={styles.farmerHeaderTop}>
                                    <View>
                                        <Text style={styles.farmerNameText} numberOfLines={1}>
                                            {displayFarmer.loading ? 'Loading...' : displayFarmer.name}
                                        </Text>
                                        <Text style={styles.ownedByText}>
                                            {displayFarmer.loading ? 'Identifying farmer...' : `Verified Owner (${displayFarmer.name.split(' ')[0]})`}
                                        </Text>
                                    </View>
                                    <View style={styles.ratingBadgeFarmer}>
                                        <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                                        <Text style={styles.ratingValueText}>{displayFarmer.rating}</Text>
                                    </View>
                                </View>

                                <View style={styles.farmerLocationRow}>
                                    <MaterialCommunityIcons name="map-marker" size={14} color="#1B4D20" />
                                    <Text style={styles.farmerLocationSmall} numberOfLines={1}>
                                        {displayFarmer.location}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    style={styles.mapCircleBtn}
                                    onPress={() => navigation.navigate('Chat', { farmer: displayFarmer })}
                                >
                                    <MaterialCommunityIcons name="chat-processing" size={20} color="#1B4D20" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.mapCircleBtn}
                                    onPress={() => navigation.navigate('MapScreen', { product })}
                                >
                                    <MaterialCommunityIcons name="directions" size={20} color="#1B4D20" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Description Card */}
                    <View style={styles.descriptionCard}>
                        <View style={styles.descriptionHeader}>
                            <MaterialCommunityIcons name="text-subject" size={20} color="#1B4D20" />
                            <Text style={styles.cardHeaderTitle}>Product Details</Text>
                        </View>
                        <Text style={styles.description}>
                            Freshly harvested {product.name.toLowerCase()} direct from {product.farm || 'our local farm'}.
                            Grown with traditional methods ensuring the best quality and organic standards.
                            Perfect for daily consumption and healthy meals. Our products are sorted and
                            packaged with care to maintain freshness during delivery.
                        </Text>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Origin</Text>
                                <Text style={styles.infoValue}>Local Farm</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Category</Text>
                                <Text style={styles.infoValue}>{product.category || 'Organic'}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Shelf Life</Text>
                                <Text style={styles.infoValue}>3-5 Days</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quality Indicators */}
                    <View style={styles.qualityContainer}>
                        <View style={styles.qualityItem}>
                            <View style={styles.qualityIconBg}>
                                <MaterialCommunityIcons name="leaf" size={20} color="#1B4D20" />
                            </View>
                            <Text style={styles.qualityLabel}>Organic</Text>
                        </View>
                        <View style={styles.qualityItem}>
                            <View style={styles.qualityIconBg}>
                                <MaterialCommunityIcons name="truck-fast" size={20} color="#1B4D20" />
                            </View>
                            <Text style={styles.qualityLabel}>Fast Delivery</Text>
                        </View>
                        <View style={styles.qualityItem}>
                            <View style={styles.qualityIconBg}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#1B4D20" />
                            </View>
                            <Text style={styles.qualityLabel}>Verified</Text>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </Animated.ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.quantitySection}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                        <MaterialCommunityIcons name="minus" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
                        <MaterialCommunityIcons name="plus" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                        <MaterialCommunityIcons name="cart-plus" size={22} color="#1B4D20" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    heroImage: {
        width: width,
        height: width * 1.1,
    },
    floatingHeader: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roundBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        zIndex: 11,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF6B00',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#F0F9F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    categoryText: {
        color: '#1B4D20',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    productName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#000',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    unit: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
    },
    premiumBadge: {
        backgroundColor: '#FF6B00',
        marginLeft: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    premiumText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    farmerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FBF8',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    farmerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    farmerInfo: {
        flex: 1,
    },
    farmerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    farmerLocation: {
        fontSize: 12,
        color: '#666',
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
        marginBottom: 24,
    },
    qualityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    qualityItem: {
        alignItems: 'center',
        width: width * 0.25,
    },
    qualityIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    qualityLabel: {
        fontSize: 12,
        color: '#1B4D20',
        fontWeight: '600',
    },
    // New Styles for Enhancements
    priceCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: '#F0F9F0',
    },
    priceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B4D20',
        marginBottom: 4,
    },
    unit: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
        marginLeft: 4,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    statusItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    premiumBadge: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    // Farmer Card Redesign
    premiumFarmerCard: {
        backgroundColor: '#F9FFF9',
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8F5E9',
        elevation: 2,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    farmerUpperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarFrame: {
        width: 60,
        height: 60,
        borderRadius: 30,
        padding: 2,
        borderWidth: 2,
        borderColor: '#1B4D20',
        position: 'relative',
    },
    farmerAvatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    verifiedDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1B4D20',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F9FFF9',
    },
    farmerMainContent: {
        flex: 1,
    },
    farmerHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    farmerNameText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1B4D20',
    },
    ownedByText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        marginTop: -2,
    },
    ratingBadgeFarmer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    ratingValueText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    farmerLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    farmerLocationSmall: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        maxWidth: '90%',
    },
    mapCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    descriptionCard: {
        backgroundColor: '#FBFDFA',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F9F0',
    },
    descriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 10,
        color: '#999',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 5,
    },
    qtyBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 15,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
        marginLeft: 20,
    },
    addToCartBtn: {
        width: 54,
        height: 54,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#1B4D20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyNowBtn: {
        flex: 1,
        height: 54,
        backgroundColor: '#1B4D20',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    buyNowText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetailsScreen;
