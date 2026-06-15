import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, FlatList, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRODUCTS } from '../data/mockData';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { db, auth } from '../config/firebase';
import { addToCart } from '../services/CartService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useCartCount } from '../hooks/useCartCount';

const { width } = Dimensions.get('window');

const CategoryProductsScreen = ({ route, navigation }) => {
    const { categoryName } = route.params;
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const cartItemCount = useCartCount();
    const [products, setProducts] = useState([]);

    React.useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('category', '==', categoryName),
            where('active', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsList = [];
            snapshot.forEach(doc => {
                productsList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsList);
        });

        return () => unsubscribe();
    }, [categoryName]);

    const categoryProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
            <Image
                source={item.image ? { uri: item.image } : require('../../assets/images/landing_background.png')}
                style={styles.productImage}
            />
            <TouchableOpacity style={styles.favoriteButton}>
                <MaterialCommunityIcons name="heart-outline" size={18} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.farmName}>{item.farm}</Text>

                <View style={styles.priceRow}>
                    <View>
                        <Text style={styles.price}>{item.currency} {item.price}</Text>
                        <Text style={styles.unit}>per {item.unit}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(auth.currentUser?.uid, item)}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryName}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search in Category */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                        <TextInput
                            placeholder={`Search in ${categoryName}...`}
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Products Grid */}
                <FlatList
                    data={categoryProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 + insets.bottom }]}
                    columnWrapperStyle={styles.columnWrapper}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="basket-remove-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No products found in this category</Text>
                        </View>
                    }
                />
            </SafeAreaView>

            <BuyerBottomNav
                navigation={navigation}
                activeNav="home"
                cartItemCount={cartItemCount}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9F7',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#000',
    },
    gridContainer: {
        paddingHorizontal: 16,
        paddingTop: 5,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productCard: {
        width: (width - 48) / 2,
        backgroundColor: '#FFF',
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    farmName: {
        fontSize: 11,
        color: '#4CDE16',
        fontWeight: '600',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    unit: {
        fontSize: 10,
        color: '#999',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#1B4D20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default CategoryProductsScreen;
