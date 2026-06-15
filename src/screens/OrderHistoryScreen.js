import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Alert, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OrderHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const allOrders = [
        {
            id: 'ORD-8921',
            date: 'May 12, 2024',
            status: 'Delivered',
            total: 'LKR 4,250',
            subtotal: 'LKR 3,850',
            fee: 'LKR 400',
            items: [
                { name: 'Organic Carrots', qty: '2 kg', price: 'LKR 700' },
                { name: 'Red Onions', qty: '5 kg', price: 'LKR 3,150' }
            ],
            image: require('../../assets/images/landing_background.png')
        },
        {
            id: 'ORD-7740',
            date: 'May 08, 2024',
            status: 'En Route',
            total: 'LKR 1,500',
            subtotal: 'LKR 1,100',
            fee: 'LKR 400',
            items: [
                { name: 'Ceylon Cinnamon', qty: '100g', price: 'LKR 1,100' }
            ],
            image: require('../../assets/images/landing_background.png')
        },
        {
            id: 'ORD-6621',
            date: 'April 28, 2024',
            status: 'Cancelled',
            total: 'LKR 850',
            subtotal: 'LKR 450',
            fee: 'LKR 400',
            items: [
                { name: 'Fresh Spinach', qty: '3 bundles', price: 'LKR 450' }
            ],
            image: require('../../assets/images/landing_background.png')
        },
    ];

    const [filteredOrders, setFilteredOrders] = useState(allOrders);

    const handleTabPress = (tab) => {
        setActiveTab(tab);
        if (tab === 'All') {
            setFilteredOrders(allOrders);
        } else if (tab === 'Active') {
            setFilteredOrders(allOrders.filter(o => o.status === 'En Route'));
        } else if (tab === 'Completed') {
            setFilteredOrders(allOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled'));
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const handleReorder = (item) => {
        Alert.alert(
            'Add to Cart?',
            `Do you want to add the items from ${item.id} to your current cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add Items', onPress: () => Alert.alert('Success', 'Items added to cart!') }
            ]
        );
    };

    const openReceipt = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'En Route': return { bg: '#FFF3E0', text: '#EF6C00' };
            case 'Cancelled': return { bg: '#FFEBEE', text: '#C62828' };
            default: return { bg: '#F5F5F5', text: '#666' };
        }
    };

    const renderOrderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() => item.status === 'En Route' ? navigation.navigate('TrackOrder') : openReceipt(item)}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>{item.id}</Text>
                        <Text style={styles.orderDate}>{item.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.itemsRow}>
                    <Image source={item.image} style={styles.itemThumb} />
                    <View style={styles.itemsInfo}>
                        <Text style={styles.itemsList} numberOfLines={1}>{item.items.map(i => i.name).join(', ')}</Text>
                        <Text style={styles.orderTotal}>{item.total}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </View>

                <View style={styles.orderFooter}>
                    <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(item)}>
                        <Text style={styles.reorderText}>Reorder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailsLink} onPress={() => openReceipt(item)}>
                        <Text style={styles.detailsText}>View Receipt</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1B4D20']} />
                }
                ListHeaderComponent={() => (
                    <View style={styles.tabBar}>
                        {['All', 'Active', 'Completed'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => handleTabPress(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab === 'All' ? 'All Orders' : tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="package-variant" size={80} color="#DDD" />
                        <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} orders</Text>
                        <Text style={styles.emptySubtitle}>You don't have any orders in this category yet.</Text>
                    </View>
                )}
            />

            {/* Receipt Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Receipt</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.receiptHeader}>
                                    <View style={styles.receiptLogoBg}>
                                        <MaterialCommunityIcons name="sprout" size={30} color="#1B4D20" />
                                    </View>
                                    <Text style={styles.receiptFarm}>AgroBridge Official</Text>
                                    <Text style={styles.receiptId}>{selectedOrder.id}</Text>
                                    <Text style={styles.receiptDate}>{selectedOrder.date}</Text>
                                </View>

                                <View style={styles.receiptDivider} />

                                {selectedOrder.items.map((item, index) => (
                                    <View key={index} style={styles.receiptItem}>
                                        <View>
                                            <Text style={styles.receiptItemName}>{item.name}</Text>
                                            <Text style={styles.receiptItemQty}>{item.qty}</Text>
                                        </View>
                                        <Text style={styles.receiptItemPrice}>{item.price}</Text>
                                    </View>
                                ))}

                                <View style={styles.receiptDivider} />

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Subtotal</Text>
                                    <Text style={styles.summaryValue}>{selectedOrder.subtotal}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                    <Text style={styles.summaryValue}>{selectedOrder.fee}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                    <Text style={styles.totalValue}>{selectedOrder.total}</Text>
                                </View>

                                <View style={styles.paymentMethod}>
                                    <MaterialCommunityIcons name="credit-card-outline" size={20} color="#666" />
                                    <Text style={styles.paymentText}>Paid via Visa •••• 4242</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.downloadBtn}
                                    onPress={() => Alert.alert('Download', 'Receipt download started...')}
                                >
                                    <MaterialCommunityIcons name="download" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.downloadText}>Download PDF</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBF8',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    listContent: {
        padding: 20,
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1B4D20',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#FFF',
    },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingBottom: 10,
    },
    orderId: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
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
    itemsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    itemThumb: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
    },
    itemsInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemsList: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    reorderBtn: {
        backgroundColor: '#F0F9F0',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },
    reorderText: {
        color: '#1B4D20',
        fontWeight: 'bold',
        fontSize: 13,
    },
    detailsLink: {
        padding: 5,
    },
    detailsText: {
        color: '#666',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    receiptHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    receiptLogoBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F9F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    receiptFarm: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    receiptId: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    receiptDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    receiptDivider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderRadius: 1,
    },
    receiptItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    receiptItemName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    receiptItemQty: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    receiptItemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 12,
        marginTop: 20,
        gap: 10,
    },
    paymentText: {
        fontSize: 13,
        color: '#666',
    },
    downloadBtn: {
        backgroundColor: '#1B4D20',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 30,
        marginBottom: 20,
    },
    downloadText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderHistoryScreen;
