import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import BuyerBottomNav from '../components/BuyerBottomNav';

import { auth, db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { clearCart } from '../services/CartService';

const { width, height } = Dimensions.get('window');

const CheckoutScreen = ({ navigation, route }) => {
    const passedProduct = route.params?.product;
    const insets = useSafeAreaInsets();
    const [fulfillment, setFulfillment] = useState('pickup'); // 'pickup' or 'delivery'
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'cash', 'card', 'wallet'
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Determine what we are buying: Single Item (Buy Now) or Cart Items
    const isBuyNow = !!passedProduct;
    const activeItems = isBuyNow
        ? [{ ...passedProduct, quantity: 1, id: passedProduct.id }]
        : cartItems;

    // Fetch Cart if not Buy Now
    React.useEffect(() => {
        if (!isBuyNow && auth.currentUser) {
            const fetchCart = async () => {
                try {
                    const docRef = doc(db, 'carts', auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setCartItems(docSnap.data().items || []);
                    }
                } catch (err) {
                    console.error("Error fetching cart:", err);
                }
            };
            fetchCart();
        }
    }, [isBuyNow]);

    const handlePlaceOrder = async () => {
        if (!auth.currentUser) {
            alert("Please login to place an order");
            return;
        }

        if (activeItems.length === 0) {
            alert("Your cart is empty!");
            return; // Prevent empty order
        }

        setLoading(true);
        try {
            // Calculate totals
            const subitemsTotal = activeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const totalAmount = subitemsTotal + 150; // + Service Fee

            // Identify Farmer (Simple logic: first item's farmer)
            // In a real multi-vendor app, you'd split orders.
            const farmerId = activeItems[0].farmerId || activeItems[0].farmId;

            if (!farmerId) {
                // Fallback or alert if data is missing, but let's proceed for now or alert
                console.warn("No farmerId found for items");
            }

            // Create Order Document
            await addDoc(collection(db, 'orders'), {
                buyerId: auth.currentUser.uid,
                customerName: auth.currentUser.displayName || "Buyer",
                farmerId: farmerId,
                items: activeItems,
                totalPrice: totalAmount,
                status: 'Pending',
                fulfillmentMethod: fulfillment,
                paymentMethod: paymentMethod,
                createdAt: new Date().toISOString(),
                timestamp: serverTimestamp()
            });

            // If Cart Checkout, Clear Cart
            if (!isBuyNow) {
                await clearCart(auth.currentUser.uid);
            }

            navigation.replace('OrderSuccess');

        } catch (error) {
            console.error("Order Error:", error);
            alert("Failed to place order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculation for UI
    const subtotal = activeItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const serviceFee = 150;
    const totalAmount = subtotal + serviceFee;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Image (blurred) */}
            <ImageBackground
                source={require('../../assets/images/landing_background.png')}
                style={styles.background}
                resizeMode="cover"
                blurRadius={10}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quick Checkout</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Main Card */}
                    <View style={styles.mainCard}>
                        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>

                            {/* Order Summary */}
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>Order Summary</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{activeItems.length} ITEMS</Text>
                                </View>
                            </View>

                            {/* Render Active Items */}
                            {activeItems.map((item, index) => (
                                <View key={index} style={styles.itemCard}>
                                    <View style={styles.itemImageContainer}>
                                        <Image source={item.image} style={styles.itemImage} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQty}>Quantity: <Text style={styles.qtyValue}>{item.quantity} {item.unit}</Text></Text>
                                    </View>
                                    <Text style={styles.itemPrice}>{item.currency || 'LKR'} {item.price * item.quantity}</Text>
                                </View>
                            ))}

                            {/* Totals */}
                            <View style={styles.divider} />
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal</Text>
                                <Text style={styles.totalValue}>LKR {subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Service Fee</Text>
                                <Text style={styles.totalValue}>LKR {serviceFee.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.totalRow, { marginTop: 10 }]}>
                                <Text style={styles.grandTotalLabel}>Total Price</Text>
                                <Text style={styles.grandTotalValue}>LKR {totalAmount.toFixed(2)}</Text>
                            </View>


                            {/* Fulfillment Method */}
                            <Text style={styles.sectionTitle}>Fulfillment Method</Text>
                            <View style={styles.fulfillmentContainer}>
                                <TouchableOpacity
                                    style={[styles.fulfillmentOption, fulfillment === 'pickup' && styles.activeFulfillment]}
                                    onPress={() => setFulfillment('pickup')}
                                >
                                    <MaterialCommunityIcons name="basket" size={24} color={fulfillment === 'pickup' ? '#1B4D20' : '#888'} />
                                    <Text style={[styles.fulfillmentText, fulfillment === 'pickup' && styles.activeFulfillmentText]}>PICKUP</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.fulfillmentOption, fulfillment === 'delivery' && styles.activeFulfillment]}
                                    onPress={() => setFulfillment('delivery')}
                                >
                                    <MaterialCommunityIcons name="truck-delivery" size={24} color={fulfillment === 'delivery' ? '#1B4D20' : '#888'} />
                                    <Text style={[styles.fulfillmentText, fulfillment === 'delivery' && styles.activeFulfillmentText]}>DELIVERY</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Payment Method */}
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>Payment Method</Text>
                                <MaterialCommunityIcons name="shield-check" size={16} color="#4CDE16" />
                            </View>

                            <View style={styles.paymentContainer}>
                                {/* Cash */}
                                <TouchableOpacity
                                    style={[styles.paymentOption]}
                                    onPress={() => setPaymentMethod('cash')}
                                >
                                    <View style={styles.paymentIconBg}>
                                        <MaterialCommunityIcons name="cash" size={20} color="#1B4D20" />
                                    </View>
                                    <Text style={styles.paymentText}>Cash on Pickup</Text>
                                    <View style={[styles.radioOuter, paymentMethod === 'cash' && styles.radioOuterSelected]}>
                                        {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>

                                {/* Card */}
                                <TouchableOpacity
                                    style={[styles.paymentOption, styles.activePaymentOption]} // Highlighted style for card
                                    onPress={() => setPaymentMethod('card')}
                                >
                                    <View style={[styles.paymentIconBg, { backgroundColor: '#E8F5FF' }]}>
                                        <MaterialCommunityIcons name="credit-card" size={20} color="#2196F3" />
                                    </View>
                                    <Text style={styles.paymentText}>Debit / Credit Card</Text>
                                    <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterSelected]}>
                                        {paymentMethod === 'card' && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>

                                {/* Wallet */}
                                <TouchableOpacity
                                    style={[styles.paymentOption]}
                                    onPress={() => setPaymentMethod('wallet')}
                                >
                                    <View style={[styles.paymentIconBg, { backgroundColor: '#F3E5F5' }]}>
                                        <MaterialCommunityIcons name="wallet" size={20} color="#9C27B0" />
                                    </View>
                                    <Text style={styles.paymentText}>Mobile Wallet</Text>
                                    <View style={[styles.radioOuter, paymentMethod === 'wallet' && styles.radioOuterSelected]}>
                                        {paymentMethod === 'wallet' && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Text style={styles.confirmButtonText}>Processing...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.confirmButtonText}>Confirm Payment - LKR {totalAmount.toFixed(2)}</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />

                        </ScrollView>
                    </View>

                </SafeAreaView >

                <BuyerBottomNav
                    navigation={navigation}
                    activeNav="home"
                    cartItemCount={3}
                />
            </ImageBackground >
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    mainCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.85)', // Translucent white card
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginHorizontal: 15,
        paddingTop: 25,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10, // Default margin for non-row titles
    },
    badge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4CDE16',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    itemQty: {
        fontSize: 12,
        color: '#888',
    },
    qtyValue: {
        color: '#4CDE16',
        fontWeight: 'bold',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    grandTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CDE16',
    },
    fulfillmentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 25,
        marginTop: 5,
    },
    fulfillmentOption: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 16,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeFulfillment: {
        backgroundColor: '#D1E7D2', // Light green selected bg
        borderColor: '#4CDE16',
        borderWidth: 1.5,
    },
    fulfillmentText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        marginTop: 8,
    },
    activeFulfillmentText: {
        color: '#1B4D20',
    },
    paymentContainer: {
        gap: 10,
        marginTop: 5,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    activePaymentOption: {
        backgroundColor: '#D1E7D2', // Light green selected bg
        borderColor: '#4CDE16',
        borderWidth: 1.5,
    },
    paymentIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    paymentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#4CDE16',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CDE16',
    },
    confirmButton: {
        backgroundColor: '#1B4D20', // Dark green like in success screen
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        shadowColor: "#1B4D20",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen;
