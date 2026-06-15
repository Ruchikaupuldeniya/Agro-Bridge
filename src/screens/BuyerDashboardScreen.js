import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';

import { CATEGORIES, PRODUCTS, USERS } from '../data/mockData';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { addToCart } from '../services/CartService';
import { useCartCount } from '../hooks/useCartCount';

const { width } = Dimensions.get('window');

const BuyerDashboardScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeNav, setActiveNav] = useState(route.params?.activeNav || 'home');
    const cartItemCount = useCartCount();
    const [favorites, setFavorites] = useState([PRODUCTS[0].id, PRODUCTS[2].id]); // Mock some initial favorites

    // Location state
    const [currentLocationName, setCurrentLocationName] = useState('Detecting location...');
    const [locationError, setLocationError] = useState(null);

    // Synchronize state with navigation params
    React.useEffect(() => {
        if (route.params?.activeNav) {
            setActiveNav(route.params.activeNav);
        }
    }, [route.params?.activeNav]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning! 👋';
        if (hour < 18) return 'Good Afternoon! ☀️';
        return 'Good Evening! 🌙';
    };

    // Using Centralized Data
    const categories = CATEGORIES;
    // Real-time Fetch
    const [products, setProducts] = useState([]);

    React.useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('active', '==', true)
            // orderBy('createdAt', 'desc') // Temporarily disabled to avoid index error
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsList = [];
            snapshot.forEach(doc => {
                productsList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsList);
        }, (error) => {
            console.error("Error fetching available products:", error);
        });

        return () => unsubscribe();
    }, []);

    // Real-time Location Logic (Robust Version)
    React.useEffect(() => {
        (async () => {
            try {
                // 1. Check Permissions
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setCurrentLocationName(USERS.buyer.location);
                    return;
                }

                // 2. Check if Location Services are Enabled
                const enabled = await Location.hasServicesEnabledAsync();
                if (!enabled) {
                    setCurrentLocationName(USERS.buyer.location);
                    return;
                }

                // 3. Try to get last known position first (very fast)
                let location = await Location.getLastKnownPositionAsync({});

                // 4. If no last known, or if we want fresher, try current position with timeout
                if (!location) {
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Low, // Low accuracy is enough for city name
                        timeout: 5000, // 5 second timeout
                    });
                }

                if (location) {
                    // Reverse Geocode
                    let addressResponse = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    });

                    if (addressResponse.length > 0) {
                        const addr = addressResponse[0];
                        const city = addr.city || addr.subregion || addr.district || addr.name;
                        const region = addr.region || addr.country;
                        const display = city ? (region ? `${city}, ${region}` : city) : USERS.buyer.location;
                        setCurrentLocationName(display);
                    } else {
                        setCurrentLocationName(USERS.buyer.location);
                    }
                } else {
                    setCurrentLocationName(USERS.buyer.location);
                }
            } catch (error) {
                console.log("Location fetching notice (handled):", error.message);
                setCurrentLocationName(USERS.buyer.location); // Quietly fallback
            }
        })();
    }, []);



    const currentUser = USERS.buyer;

    // Unified filtering logic
    const filteredProducts = products.filter(product => {
        // Tab-based navigation filtering
        if (activeNav === 'saved') {
            return favorites.includes(product.id);
        }

        // Tag filter
        const matchesTag = activeFilter === 'all' || (product.tag && product.tag.toLowerCase() === activeFilter);

        // Category filter
        const matchesCategory = !selectedCategory || product.category === selectedCategory;

        // Search filter
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.address?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTag && matchesCategory && matchesSearch;
    });

    // Featured/Promotional banners
    const promos = [
        { id: '1', title: 'Fresh Organic', subtitle: 'Up to 30% OFF', color: '#1B4D20', emoji: '🥕' },
        { id: '2', title: 'Farm Direct', subtitle: 'Best Prices', color: '#2D6A3E', emoji: '🚚' },
    ];

    // Trending products (sample)
    const trendingProducts = products.slice(0, 3);

    const handleCategoryPress = (categoryName) => {
        navigation.navigate('CategoryProducts', { categoryName });
    };

    const handleProductPress = (product) => {
        console.log('Product selected:', product.name);
        navigation.navigate('ProductDetails', { product: product });
    };

    const handleFavoriteToggle = (productId) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAddToCart = async (product) => {
        if (!auth.currentUser) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            await addToCart(auth.currentUser.uid, product);
            alert(`${product.name} added to cart!`);
            // Optimistic update or wait for listener? 
            // Since we don't have a listener for cart count in this screen yet (except maybe via Navigation param, but that's messy), 
            // we'll rely on the alert for now.
            // setCartItemCount(prev => prev + 1); // Removed local increment, relying on listener
        } catch (error) {
            alert("Failed to add to cart");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Premium Header */}
            <View style={styles.headerPremium}>
                <View>
                    <Text style={styles.greetingText}>{getGreeting()}</Text>
                    <View style={styles.locationContainer}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#1B4D20" />
                        <Text style={styles.locationText} numberOfLines={1}>{currentLocationName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('BuyerProfile')}>
                    <MaterialCommunityIcons name="account-circle" size={32} color="#1B4D20" />
                </TouchableOpacity>
            </View>

            {/* Search & Filters */}
            <View style={styles.searchSection}>
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={() => navigation.navigate('MapScreen', { searchQuery: searchQuery })}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="magnify" size={22} color="#1B4D20" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search vegetables, grains..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <MaterialCommunityIcons name="tune" size={22} color="#1B4D20" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {activeNav === 'home' ? (
                    <>
                        {/* Promotional Banners */}
                        <FlatList
                            data={promos}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.promoBanner, { backgroundColor: item.color }]} onPress={() => console.log('Promo banner clicked:', item.title)}>
                                    <View style={styles.promoContent}>
                                        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                                        <Text style={styles.promoTitle}>{item.title}</Text>
                                        <Text style={styles.promoArrow}>→</Text>
                                    </View>
                                    <Text style={styles.promoBannerEmoji}>{item.emoji}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                            horizontal
                            scrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.promosScroll}
                        />

                        {/* Filter Tabs */}
                        <View style={styles.filterSection}>
                            {['All', 'Fresh', 'Premium'].map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterButton,
                                        activeFilter === filter.toLowerCase() && styles.filterButtonActive,
                                    ]}
                                    onPress={() => setActiveFilter(filter.toLowerCase())}
                                >
                                    <Text
                                        style={[
                                            styles.filterText,
                                            activeFilter === filter.toLowerCase() && styles.filterTextActive,
                                        ]}
                                    >
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {/* Unique Organic Filter (checks if name contains "Organic") */}
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    activeFilter === 'organic' && styles.filterButtonActive,
                                ]}
                                onPress={() => setActiveFilter(activeFilter === 'organic' ? 'all' : 'organic')}
                            >
                                <Text style={[styles.filterText, activeFilter === 'organic' && styles.filterTextActive]}>Organic</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Trending Section */}
                        <View style={styles.trendingSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('MapScreen')}>
                                    <Text style={styles.seeAllText}>See All →</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={trendingProducts}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.trendingCard}
                                        activeOpacity={0.8}
                                        onPress={() => handleProductPress(item)}
                                    >
                                        <View style={styles.trendingImageContainer}>
                                            <Image
                                                source={item.image ? { uri: item.image } : require('../../assets/images/landing_background.png')}
                                                style={styles.trendingImage}
                                            />
                                            <View style={styles.badgePremium}>
                                                <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FFF" />
                                                <Text style={styles.badgeText}>Trending</Text>
                                            </View>
                                        </View>
                                        <View style={styles.trendingInfo}>
                                            <Text style={styles.trendingName}>{item.name}</Text>
                                            <TouchableOpacity onPress={() => navigation.navigate('FarmProfile')}>
                                                <Text style={styles.trendingFarm}>{item.farm}</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.trendingPrice}>
                                                {item.currency} {item.price}
                                                <Text style={styles.unitText}>/{item.unit}</Text>
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.id}
                                horizontal
                                scrollEnabled={true}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>

                        {/* Categories */}
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <FlatList
                            data={categories}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.categoryCard, selectedCategory === item.name && styles.categoryCardActive]}
                                    activeOpacity={0.7}
                                    onPress={() => handleCategoryPress(item.name)}
                                >
                                    <View style={[styles.categoryIconBg, selectedCategory === item.name && { backgroundColor: item.color + '33' }]}>
                                        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
                                    </View>
                                    <Text style={[styles.categoryName, selectedCategory === item.name && { color: item.color, fontWeight: 'bold' }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesScroll}
                        />

                        {/* All Products Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Available Near You</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
                                <Text style={styles.seeAllText}>Messages →</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={styles.savedHeader}>
                        <Text style={styles.savedTitle}>Saved Items</Text>
                        <Text style={styles.savedSubtitle}>{filteredProducts.length} items you love</Text>
                    </View>
                )}

                {/* Product Area (Grid or Empty State) */}
                {filteredProducts.length > 0 ? (
                    <View style={styles.productGrid}>
                        {filteredProducts.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.productCard}
                                activeOpacity={0.85}
                                onPress={() => handleProductPress(item)}
                            >
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={item.image ? { uri: item.image } : require('../../assets/images/landing_background.png')}
                                        style={styles.productImage}
                                    />
                                    {item.tag && (
                                        <View style={[styles.tag, item.tag === 'PREMIUM' ? styles.premiumTag : styles.freshTag]}>
                                            <Text style={styles.tagText}>{item.tag}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity style={styles.favoriteButton} onPress={() => handleFavoriteToggle(item.id)}>
                                        <MaterialCommunityIcons
                                            name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                                            size={20}
                                            color={favorites.includes(item.id) ? "#FF4B4B" : "#FFF"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <TouchableOpacity style={styles.farmerContainer} onPress={() => navigation.navigate('FarmProfile')}>
                                        <Text style={styles.farmerName}>👨‍🌾 {item.farm}</Text>
                                    </TouchableOpacity>

                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceText}>{item.currency} {item.price}<Text style={styles.unitText}>/{item.unit}</Text></Text>
                                    </View>

                                    <View style={styles.productFooter}>
                                        <View style={styles.ratingBadge}>
                                            <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                                            <Text style={styles.ratingText}>4.8</Text>
                                        </View>
                                        <TouchableOpacity style={styles.quickAddButton} onPress={() => handleAddToCart(item)}>
                                            <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptySavedContainer}>
                        <View style={styles.emptyIconBg}>
                            <MaterialCommunityIcons name="heart-outline" size={60} color="#4CDE16" />
                        </View>
                        <Text style={styles.emptySavedTitle}>No saved items yet</Text>
                        <Text style={styles.emptySavedSubtitle}>Tap the heart icon on any product to save it for later.</Text>
                        <TouchableOpacity style={styles.exploreBtn} onPress={() => setActiveNav('home')}>
                            <Text style={styles.exploreBtnText}>Explore Products</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Spacer for Bottom Nav */}
                <View style={{ height: 100 }} />

            </ScrollView>

            {/* Bottom Navigation Bar */}
            <BuyerBottomNav
                navigation={navigation}
                activeNav={activeNav}
                cartItemCount={cartItemCount}
            />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header Premium
    headerPremium: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    greetingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B4D20',
        marginBottom: 6,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Search Section
    searchSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },

    // Promotional Banners
    promosScroll: {
        marginBottom: 20,
    },
    promoBanner: {
        width: width - 80,
        height: 140,
        borderRadius: 16,
        marginRight: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    promoContent: {
        flex: 1,
    },
    promoSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    promoTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    promoArrow: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    promoBannerEmoji: {
        fontSize: 48,
        opacity: 0.3,
    },

    // Filter Section
    filterSection: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    filterButtonActive: {
        backgroundColor: '#1B4D20',
        borderColor: '#1B4D20',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#FFF',
    },

    // Trending Section
    trendingSection: {
        marginBottom: 24,
    },
    trendingCard: {
        marginRight: 14,
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        width: width * 0.45,
    },
    trendingImageContainer: {
        height: 110,
        position: 'relative',
        backgroundColor: '#F9F9F9',
    },
    trendingImage: {
        width: '100%',
        height: '100%',
    },
    badgePremium: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF6B00',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 20,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    trendingInfo: {
        padding: 10,
    },
    trendingName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B1B1B',
        marginBottom: 3,
    },
    trendingFarm: {
        fontSize: 12,
        color: '#999',
        marginBottom: 6,
    },
    trendingPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1B4D20',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1B4D20',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    seeAllText: {
        color: '#1B4D20',
        fontWeight: '600',
        fontSize: 12,
    },

    categoriesScroll: {
        marginBottom: 20,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    categoryCard: {
        alignItems: 'center',
        marginRight: 16,
    },
    categoryIconBg: {
        width: 70,
        height: 70,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#F0F9F0',
        borderWidth: 1,
        borderColor: '#E0E8E0',
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },

    // Product Grid
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    productCard: {
        width: (width - 48) / 2,
        backgroundColor: '#FFF',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    imageContainer: {
        height: 130,
        position: 'relative',
        backgroundColor: '#F5F5F5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    tag: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    freshTag: {
        backgroundColor: '#1B4D20',
    },
    premiumTag: {
        backgroundColor: '#FF6B00',
    },
    tagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1B1B1B',
        marginBottom: 3,
    },
    farmerContainer: {
        marginBottom: 8,
    },
    farmerName: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1B4D20',
    },
    unitText: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 3,
        backgroundColor: '#FFF9E6',
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '600',
    },
    quickAddButton: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#1B4D20',
        justifyContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Saved Section Styles
    savedHeader: {
        marginBottom: 20,
        paddingTop: 10,
    },
    savedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B4D20',
        marginBottom: 4,
    },
    savedSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    emptySavedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptySavedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySavedSubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 25,
    },
    exploreBtn: {
        backgroundColor: '#1B4D20',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default BuyerDashboardScreen;
