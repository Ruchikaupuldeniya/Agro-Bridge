import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FarmerBottomNav from '../components/FarmerBottomNav';

import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';

const FarmerOrdersScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('New');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'orders'),
            where('farmerId', '==', auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersList = [];
            snapshot.forEach(doc => {
                ordersList.push({ id: doc.id, ...doc.data() });
            });
            setOrders(ordersList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update status");
        }
    };

    const filteredOrders = activeTab === 'All' ? orders :
        activeTab === 'New' ? orders.filter(o => o.status === 'Pending') :
            activeTab === 'Active' ? orders.filter(o => o.status === 'Confirmed' || o.status === 'Accepted') :
                orders.filter(o => ['Delivered', 'Cancelled', 'Completed'].includes(o.status));

    const renderOrder = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="package-variant-closed" size={24} color="#1B4D20" />
                </View>
                <View style={styles.details}>
                    <Text style={styles.itemName}>{item.items?.[0]?.name || 'Mixed Items'}</Text>
                    <Text style={styles.itemQty}>
                        {item.items?.length || 1} items • LKR {item.totalPrice}
                    </Text>
                    <Text style={styles.customerName}>Customer: {item.customerName || 'Guest'}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'Pending' ? '#FFF3E0' :
                        (item.status === 'Confirmed' || item.status === 'Accepted') ? '#E3F2FD' :
                            item.status === 'Cancelled' ? '#FFEBEE' : '#E8F5E9'
                }]}>
                    <Text style={[styles.statusText, {
                        color: item.status === 'Pending' ? '#EF6C00' :
                            (item.status === 'Confirmed' || item.status === 'Accepted') ? '#1565C0' :
                                item.status === 'Cancelled' ? '#D32F2F' : '#2E7D32'
                    }]}>{item.status}</Text>
                </View>

                {item.status === 'Pending' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => updateOrderStatus(item.id, 'Cancelled')}
                        >
                            <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.acceptBtn]}
                            onPress={() => updateOrderStatus(item.id, 'Confirmed')}
                        >
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Orders</Text>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="magnify" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {['New', 'Active', 'Completed', 'All'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Orders List */}
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No orders found</Text>
                        </View>
                    }
                />

            </SafeAreaView>

            <FarmerBottomNav navigation={navigation} activeNav="orders" />
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
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeTab: {
        backgroundColor: '#1B4D20',
        borderColor: '#1B4D20',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    orderTime: {
        fontSize: 12,
        color: '#999',
    },
    cardBody: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    itemQty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    customerName: {
        fontSize: 12,
        color: '#999',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    rejectBtn: {
        backgroundColor: '#FFEBEE',
    },
    acceptBtn: {
        backgroundColor: '#1B4D20',
    },
    rejectText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D32F2F',
    },
    acceptText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
    },
});

export default FarmerOrdersScreen;
