import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { useCartCount } from '../hooks/useCartCount';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const cartItemCount = useCartCount();
    const initialProduct = route.params?.product;
    const initialQuery = route.params?.searchQuery || ''; // Get query from Dashboard

    // State
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialProduct ? initialProduct.name : initialQuery);
    const [activeFilter, setActiveFilter] = useState('nearby');
    const [favorites, setFavorites] = useState([]);
    const [activeMarker, setActiveMarker] = useState(initialProduct ? initialProduct.id : null);

    // View Mode: 'map' or 'list'
    const [viewMode, setViewMode] = useState('map');

    // Fetch Products from Firestore
    React.useEffect(() => {
        const q = query(collection(db, 'products'), where('active', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setProducts(list);

            if (!activeMarker && list.length > 0) {
                setActiveMarker(list[0].id);
            }
        });
        return () => unsubscribe();
    }, []);

    // Also update local search query if params change specifically (e.g. subsequent navigations)
    React.useEffect(() => {
        if (route.params?.searchQuery) {
            setSearchQuery(route.params.searchQuery);
        }
    }, [route.params?.searchQuery]);

    const filterOptions = [
        { id: 'nearby', label: 'Nearby' },
        { id: 'price', label: 'Price: Low to High' },
        { id: 'organic', label: 'Organic Only' },
    ];

    // Unified filtering and sorting logic
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.farm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.address?.toLowerCase().includes(searchQuery.toLowerCase());

        const isOrganic = product.tag?.toLowerCase() === 'organic' ||
            product.name?.toLowerCase().includes('organic');

        const matchesCategory = activeFilter === 'organic' ? isOrganic : true;

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (activeFilter === 'price') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        if (activeFilter === 'nearby') {
            const distA = parseFloat(a.distance) || 999;
            const distB = parseFloat(b.distance) || 999;
            return distA - distB;
        }
        return 0;
    });

    // ... (rest of logic: sync active marker, favorites, etc.)
    // Sync active marker if list changes and current marker is gone
    React.useEffect(() => {
        if (filteredProducts.length > 0 && !filteredProducts.find(p => p.id === activeMarker)) {
            setActiveMarker(filteredProducts[0].id);
        }
    }, [filteredProducts]);

    const activeProduct = products.find(p => p.id === activeMarker) || filteredProducts[0] || null;
    const isFavorite = activeProduct ? favorites.includes(activeProduct.id) : false;

    const toggleFavorite = (id) => {
        setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color="#4CDE16" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Find products or farms..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Toggle View Button */}
            <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setViewMode(prev => prev === 'map' ? 'list' : 'map')}
            >
                <MaterialCommunityIcons
                    name={viewMode === 'map' ? "format-list-bulleted" : "map-outline"}
                    size={24}
                    color="#FFF"
                />
            </TouchableOpacity>
        </View>
    );

    const renderListItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.listItem}
            onPress={() => navigation.navigate('Checkout', { product: item })}
        >
            <Image
                source={item.image ? { uri: item.image } : require('../../assets/images/landing_background.png')}
                style={styles.listImage}
            />
            <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listFarm}>{item.farm}</Text>
                <Text style={styles.listPrice}>{item.currency} {item.price} / {item.unit}</Text>
            </View>
            <TouchableOpacity style={styles.listAddBtn}>
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background */}
            <Image
                source={require('../../assets/images/landing_background.png')}
                style={styles.mapBackground}
                resizeMode="cover"
            />
            {viewMode === 'map' && <View style={styles.darkOverlay} />}
            {viewMode === 'list' && <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />}

            <SafeAreaView style={styles.safeArea}>
                {renderHeader()}

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {filterOptions.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[styles.filterChip, activeFilter === filter.id ? styles.activeFilter : styles.inactiveFilter]}
                                onPress={() => setActiveFilter(filter.id)}
                            >
                                <Text style={[styles.filterText, activeFilter === filter.id ? styles.activeFilterText : styles.inactiveFilterText]}>
                                    {filter.label}
                                </Text>
                                {filter.id === 'price' && <MaterialCommunityIcons name="chevron-down" size={16} color={activeFilter === 'price' ? "#000" : "#FFF"} style={{ marginLeft: 5 }} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {viewMode === 'map' ? (
                        <>
                            {/* Map Markers (Simulated) */}
                            <View style={styles.mapLayer}>
                                {filteredProducts.map((product) => (
                                    <TouchableOpacity
                                        key={product.id}
                                        style={[styles.markerContainer, product.coordinates]}
                                        onPress={() => setActiveMarker(product.id)}
                                    >
                                        {activeMarker === product.id ? (
                                            <>
                                                <View style={styles.priceTag}>
                                                    <Text style={styles.priceTagText}>{product.currency}{product.price}/{product.unit}</Text>
                                                </View>
                                                <View style={styles.markerPin}>
                                                    <MaterialCommunityIcons name="tractor" size={16} color="#000" />
                                                </View>
                                                <View style={styles.pulseRing} />
                                            </>
                                        ) : (
                                            <View style={styles.dotMarker}>
                                                <View style={styles.dotCore} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {/* Map Controls */}
                            <View style={styles.controlsContainer}>
                                <View style={styles.zoomControls}>
                                    <TouchableOpacity style={[styles.controlBtn, styles.borderBottom]}>
                                        <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.controlBtn}>
                                        <MaterialCommunityIcons name="minus" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.controlBtn}>
                                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#4CDE16" />
                                </TouchableOpacity>
                            </View>

                            {/* Bottom Card */}
                            {activeProduct && (
                                <View style={[styles.bottomCardContainer, { bottom: 90 + insets.bottom }]}>
                                    <TouchableOpacity style={styles.pullIndicator} />
                                    <View style={styles.cardContent}>
                                        <Image
                                            source={activeProduct.image ? { uri: activeProduct.image } : require('../../assets/images/landing_background.png')}
                                            style={styles.cardImage}
                                        />
                                        <View style={styles.cardInfo}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.ratingBadge}>
                                                    <MaterialCommunityIcons name="star" size={12} color="#000" />
                                                    <Text style={styles.ratingText}>4.9</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => toggleFavorite(activeProduct.id)}>
                                                    <MaterialCommunityIcons
                                                        name={isFavorite ? "heart" : "heart-outline"}
                                                        size={24}
                                                        color={isFavorite ? "#4CDE16" : "#AAA"}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={styles.cardTitle}>{activeProduct.farm}</Text>
                                            <Text style={styles.cardDistance}>1.2 km away • Est. 15 min</Text>
                                            <Text style={styles.productName}>{activeProduct.name}</Text>
                                            <View style={styles.priceContainer}>
                                                <Text style={styles.price}>{activeProduct.currency} {activeProduct.price}</Text>
                                                <Text style={styles.unit}> / {activeProduct.unit}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => navigation.navigate('ProductDetails', { product: activeProduct })}
                                        >
                                            <MaterialCommunityIcons name="information-outline" size={20} color="#FFF" />
                                            <Text style={styles.detailsText}>Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.buyButton}
                                            onPress={() => navigation.navigate('Checkout', { product: activeProduct })}
                                        >
                                            <MaterialCommunityIcons name="shopping" size={20} color="#000" />
                                            <Text style={styles.buyText}>Buy Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        /* List View */
                        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                            {filteredProducts.length > 0 ? filteredProducts.map(renderListItem) : (
                                <View style={{ alignItems: 'center', marginTop: 50 }}>
                                    <Text style={{ color: '#FFF', opacity: 0.6 }}>No products found</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            <BuyerBottomNav
                navigation={navigation}
                activeNav="search"
                cartItemCount={cartItemCount}
            />
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1A10', // Dark green/black base
    },
    mapBackground: {
        position: 'absolute',
        width: width,
        height: height,
        opacity: 0.6,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 20, 5, 0.85)', // Strong dark overlay for map effect
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        gap: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        marginLeft: 10,
        fontSize: 14,
        paddingVertical: 10,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    filterContainer: {
        paddingLeft: 20,
        height: 40,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    activeFilter: {
        backgroundColor: '#4CDE16',
        borderColor: '#4CDE16',
    },
    inactiveFilter: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.15)',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#000',
    },
    inactiveFilterText: {
        color: '#FFF',
    },
    mapLayer: {
        flex: 1,
        position: 'relative',
    },
    markerContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: '#4CDE16',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 5,
    },
    priceTagText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    markerPin: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        zIndex: 2,
    },
    pulseRing: {
        position: 'absolute',
        top: 25, // Centered on pin center approx
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(76, 222, 22, 0.4)',
        zIndex: 1,
        transform: [{ translateY: -7 }], // Adjust to center vertically on pin
    },
    inactiveTag: {
        backgroundColor: 'rgba(25, 40, 25, 0.9)',
        borderWidth: 1,
        borderColor: '#4CDE16',
    },
    inactiveTagText: {
        color: '#4CDE16',
        fontSize: 10,
    },
    inactivePin: {
        backgroundColor: 'rgba(25, 40, 25, 0.9)',
        borderColor: '#4CDE16',
    },
    dotMarker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(76, 222, 22, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CDE16',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    controlsContainer: {
        position: 'absolute',
        right: 20,
        top: 150,
        gap: 15,
    },
    zoomControls: {
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    controlBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        borderRadius: 0,
        borderWidth: 0,
    },
    locationBtn: {
        // styles applied via array
    },
    layersBtn: {
        // styles applied via array
    },
    bottomCardContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#1E241E', // Dark card
        borderRadius: 24,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(76, 222, 22, 0.3)', // Green glow border
        shadowColor: "#4CDE16",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    pullIndicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
    },
    cardInfo: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFC107',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 2,
    },
    cardDistance: {
        fontSize: 12,
        color: '#4CDE16',
        marginBottom: 5,
    },
    productName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    unit: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    detailsButton: {
        flex: 1,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        gap: 8,
    },
    detailsText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    buyButton: {
        flex: 1,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CDE16',
        borderRadius: 16,
        gap: 8,
    },
    buyText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    stockStatus: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CDE16',
    },
    stockText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    toggleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    listImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#333',
    },
    listInfo: {
        flex: 1,
    },
    listName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    listFarm: {
        color: '#4CDE16',
        fontSize: 12,
        marginBottom: 4,
    },
    listPrice: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    listAddBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapScreen;
