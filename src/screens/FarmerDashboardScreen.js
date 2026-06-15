import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FarmerBottomNav from '../components/FarmerBottomNav';

import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const FarmerDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [farmerName, setFarmerName] = useState('Farmer');
    const [stats, setStats] = useState({
        earnings: 'LKR 0',
        pendingOrders: 0,
        activeListings: 0,
        rating: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    React.useEffect(() => {
        if (!auth.currentUser) return;

        const fetchData = async () => {
            // 1. Fetch Farmer Profile
            try {
                const docRef = doc(db, 'farmers', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFarmerName(docSnap.data().farmName || docSnap.data().fullName || 'Farmer');
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            }
        };

        fetchData();

        // 2. Real-time Listeners for Stats & Orders
        // Products Listener
        const productsQ = query(collection(db, 'products'), where('farmerId', '==', auth.currentUser.uid));
        const unsubProducts = onSnapshot(productsQ, (snapshot) => {
            const activeCount = snapshot.docs.filter(d => d.data().active).length;
            setStats(prev => ({ ...prev, activeListings: activeCount }));
        });

        // Orders Listener (assuming 'orders' collection has 'farmerId')
        // *Note: Since we are just starting, orders might be empty.
        const ordersQ = query(
            collection(db, 'orders'),
            where('farmerId', '==', auth.currentUser.uid),
            limit(5)
        );

        const unsubOrders = onSnapshot(ordersQ, (snapshot) => {
            const orders = [];
            let pendingCount = 0;
            let totalEarnings = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                orders.push({ id: doc.id, ...data });
                if (data.status === 'Pending') pendingCount++;
                if (data.status === 'Delivered') totalEarnings += (parseFloat(data.totalPrice) || 0); // Simplified earnings logic
            });

            setRecentOrders(orders);
            setStats(prev => ({
                ...prev,
                pendingOrders: pendingCount,
                earnings: `LKR ${totalEarnings.toLocaleString()}`
            }));
            setLoading(false);
        }, (error) => {
            console.log("Error fetching orders (might be empty/missing index):", error.message);
            // If error (e.g., missing index or empty collection permissions), just stop loading
            setLoading(false);
        });

        return () => {
            unsubProducts();
            unsubOrders();
        };
    }, []);

    const QuickAction = ({ icon, label, color, onPress }) => (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color + '15' }]} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
            </View>
            <Text style={[styles.actionLabel, { color: color }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Good Morning,</Text>
                            <Text style={styles.farmerName}>{farmerName}</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('FarmProfile')}>
                            <Image source={require('../../assets/images/landing_background.png')} style={styles.profileImg} />
                        </TouchableOpacity>
                    </View>

                    {/* Earnings Card */}
                    <View style={styles.earningsCard}>
                        <View>
                            <Text style={styles.earningsLabel}>Total Earnings</Text>
                            <Text style={styles.earningsValue}>{stats.earnings}</Text>
                        </View>
                        <View style={styles.earningsGraph}>
                            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={40} color="rgba(255,255,255,0.8)" />
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                                <MaterialCommunityIcons name="package-variant" size={20} color="#EF6C00" />
                            </View>
                            <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
                            <Text style={styles.statTitle}>Pending Orders</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                                <MaterialCommunityIcons name="sprout" size={20} color="#2E7D32" />
                            </View>
                            <Text style={styles.statNumber}>{stats.activeListings}</Text>
                            <Text style={styles.statTitle}>Active Crops</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="star" size={20} color="#1565C0" />
                            </View>
                            <Text style={styles.statNumber}>{stats.rating || '-'}</Text>
                            <Text style={styles.statTitle}>Rating</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <QuickAction icon="plus" label="Add Crop" color="#1B4D20" onPress={() => navigation.navigate('AddProduct')} />
                        <QuickAction icon="message-text" label="Messages" color="#9C27B0" onPress={() => navigation.navigate('ChatList')} />
                        <QuickAction icon="clipboard-text" label="Reports" color="#00695C" onPress={() => alert('Reports coming soon!')} />
                    </View>

                    {/* Recent Orders */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('FarmerOrders')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <TouchableOpacity key={order.id} style={styles.orderCard}>
                                <View style={styles.orderIcon}>
                                    <MaterialCommunityIcons name="shopping" size={20} color="#1B4D20" />
                                </View>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderItem}>{order.items?.[0]?.name || 'Mixed Order'}</Text>
                                    <Text style={styles.orderMeta}>{order.items?.length || 1} items • {new Date(order.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.orderRight}>
                                    <Text style={styles.orderPrice}>LKR {order.totalPrice}</Text>
                                    <Text style={[styles.orderStatus, {
                                        color: order.status === 'Pending' ? '#EF6C00' :
                                            order.status === 'Confirmed' ? '#1565C0' : '#2E7D32'
                                    }]}>{order.status}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999' }}>No orders yet</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>

            <FarmerBottomNav navigation={navigation} activeNav="dashboard" />
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
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    greeting: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    farmerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
    profileBtn: {
        padding: 2,
        borderWidth: 2,
        borderColor: '#1B4D20',
        borderRadius: 25,
    },
    profileImg: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    earningsCard: {
        backgroundColor: '#1B4D20',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        elevation: 5,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    earningsLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 5,
        fontWeight: '600',
    },
    earningsValue: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    statTitle: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B1B1B',
        marginBottom: 15,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 25,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAll: {
        color: '#1B4D20',
        fontSize: 13,
        fontWeight: '600',
    },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
    },
    orderIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    orderInfo: {
        flex: 1,
    },
    orderItem: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    orderMeta: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    orderRight: {
        alignItems: 'flex-end',
    },
    orderPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    orderStatus: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default FarmerDashboardScreen;
