import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FarmerBottomNav from '../components/FarmerBottomNav';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const ListingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState([]); // Empty initially
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Real-time Fetch
    React.useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'products'),
            where('farmerId', '==', auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsList = [];
            querySnapshot.forEach((doc) => {
                productsList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching listings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleSwitch = async (id, currentStatus) => {
        try {
            const productRef = doc(db, 'products', id);
            await updateDoc(productRef, { active: !currentStatus });
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update status");
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesFilter = filter === 'All' ? true :
            filter === 'Active' ? product.active : !product.active;
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Crops</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('AddProduct')}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                        <Text style={styles.addBtnText}>Add New</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filters}>
                    {['All', 'Active', 'Inactive'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.activeFilter]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statInfo}>
                            <Text style={styles.statLabel}>Total Inventory Value</Text>
                            <Text style={styles.statValue}>LKR 128,500</Text>
                        </View>
                        <View style={styles.statIcon}>
                            <MaterialCommunityIcons name="chart-pie" size={24} color="#1B4D20" />
                        </View>
                    </View>

                    {/* Listings List */}
                    {filteredProducts.map((product) => (
                        <View key={product.id} style={styles.productCard}>
                            <Image
                                source={product.image ? { uri: product.image } : require('../../assets/images/landing_background.png')}
                                style={styles.productImage}
                            />

                            <View style={styles.productInfo}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <View style={[styles.statusDot, { backgroundColor: product.active ? '#4CDE16' : '#CCC' }]} />
                                </View>

                                <Text style={[styles.productStock, product.lowStock && styles.lowStockText]}>
                                    {product.stock} {product.unit || 'kg'} • LKR {product.price}
                                </Text>

                                <View style={styles.actionRow}>
                                    <Switch
                                        trackColor={{ false: "#E0E0E0", true: "#C8E6C9" }}
                                        thumbColor={product.active ? "#4CDE16" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => toggleSwitch(product.id, product.active)}
                                        value={product.active}
                                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                    />
                                    <TouchableOpacity
                                        style={styles.editBtn}
                                        onPress={() => navigation.navigate('AddProduct', { product })}
                                    >
                                        <Text style={styles.editBtnText}>Edit Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                    {filteredProducts.length === 0 && (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="leaf-off" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No crops found</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>

            <FarmerBottomNav navigation={navigation} activeNav="listings" />
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B4D20',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginTop: 15,
        paddingHorizontal: 15,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilter: {
        backgroundColor: '#1B4D20',
        borderColor: '#1B4D20',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#FFF',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#F0F0F0',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    productStock: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
    },
    lowStockText: {
        color: '#EF6C00',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    editBtn: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    editBtnText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        marginTop: 10,
        fontSize: 14,
    },
});

export default ListingsScreen;
