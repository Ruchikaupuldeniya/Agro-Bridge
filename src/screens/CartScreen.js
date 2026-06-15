import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { updateCartItemQuantity, removeFromCart, clearCart } from '../services/CartService';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // Real-time Cart Data
    const [cartItems, setCartItems] = useState([]);

    React.useEffect(() => {
        if (!auth.currentUser) return;

        const cartRef = doc(db, 'carts', auth.currentUser.uid);
        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists()) {
                setCartItems(docSnap.data().items || []);
            } else {
                setCartItems([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const updateQuantity = async (id, delta) => {
        try {
            await updateCartItemQuantity(auth.currentUser.uid, id, delta);
        } catch (error) {
            console.error("Failed to update quantity", error);
        }
    };

    const removeItem = async (id) => {
        try {
            await removeFromCart(auth.currentUser.uid, id);
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart(auth.currentUser.uid);
        } catch (error) {
            console.error("Failed to clear cart", error);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const serviceFee = cartItems.length > 0 ? 150 : 0;
    const total = subtotal + serviceFee;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <TouchableOpacity onPress={handleClearCart}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {cartItems.length > 0 ? (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 + insets.bottom }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {cartItems.map((item) => (
                            <View key={item.id} style={styles.cartItem}>
                                <Image
                                    source={
                                        typeof item.image === 'string' && item.image
                                            ? { uri: item.image }
                                            : (item.image || require('../../assets/images/landing_background.png'))
                                    }
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemFarm}>{item.farm}</Text>
                                    <Text style={styles.itemPrice}>{item.currency} {item.price} / {item.unit}</Text>
                                </View>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => updateQuantity(item.id, -1)}
                                    >
                                        <MaterialCommunityIcons name="minus" size={16} color="#000" />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => updateQuantity(item.id, 1)}
                                    >
                                        <MaterialCommunityIcons name="plus" size={16} color="#000" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() => removeItem(item.id)}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={22} color="#DDD" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Order Summary Card */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Order Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>LKR {subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Service Fee</Text>
                                <Text style={styles.summaryValue}>LKR {serviceFee.toFixed(2)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>LKR {total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBg}>
                            <MaterialCommunityIcons name="cart-off" size={64} color="#4CDE16" />
                        </View>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
                        <TouchableOpacity
                            style={styles.shopNowBtn}
                            onPress={() => navigation.navigate('BuyerDashboard')}
                        >
                            <Text style={styles.shopNowText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>

            {/* Bottom Checkout Button Area */}
            {cartItems.length > 0 && (
                <View style={[styles.checkoutBar, { bottom: 85 + insets.bottom }]}>
                    <View style={styles.totalInfo}>
                        <Text style={styles.barTotalLabel}>Total</Text>
                        <Text style={styles.barTotalValue}>LKR {total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={() => navigation.navigate('Checkout')}
                    >
                        <Text style={styles.checkoutBtnText}>Checkout</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            <BuyerBottomNav
                navigation={navigation}
                activeNav="cart"
                cartItemCount={cartItems.length}
            />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 15,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    itemFarm: {
        fontSize: 12,
        color: '#4CDE16',
        fontWeight: '600',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    qtyText: {
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: 'bold',
    },
    removeBtn: {
        marginLeft: 10,
    },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: -50,
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    shopNowBtn: {
        backgroundColor: '#1B4D20',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
        elevation: 3,
    },
    shopNowText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkoutBar: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    totalInfo: {
        flex: 1,
    },
    barTotalLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    barTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    checkoutBtn: {
        backgroundColor: '#1B4D20',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    checkoutBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;
