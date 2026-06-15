import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'Order Delivered!',
            desc: 'Your order #ORD-8921 has been delivered to your doorstep. Rate the farmer!',
            time: '2 hours ago',
            icon: 'check-circle-outline',
            color: '#4CDE16',
            unread: true
        },
        {
            id: '2',
            title: 'New Promo Code',
            desc: 'Use AGRO20 for 20% off on your next purchase of Jaffna Red Onions.',
            time: 'Yesterday',
            icon: 'tag-outline',
            color: '#1B4D20',
            unread: false
        },
        {
            id: '3',
            title: 'Price Drop Alert',
            desc: 'Organic Carrots from Nuwara Eliya are now only LKR 300/kg!',
            time: '2 days ago',
            icon: 'trending-down',
            color: '#FF6B00',
            unread: false
        },
        {
            id: '4',
            title: 'Message from Sunil',
            desc: 'Ayubowan! The Keeri Samba harvest is ready for pickup.',
            time: '3 days ago',
            icon: 'chat-outline',
            color: '#03A9F4',
            unread: false
        },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity style={[styles.notiCard, item.unread && styles.unreadCard]}>
            <View style={[styles.iconBg, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.notiContent}>
                <View style={styles.notiHeader}>
                    <Text style={styles.notiTitle}>{item.title}</Text>
                    {item.unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notiDesc}>{item.desc}</Text>
                <Text style={styles.notiTime}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={markAllRead}>
                    <Text style={styles.clearText}>Read All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-off-outline" size={80} color="#DDD" />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySubtitle}>You don't have any new notifications at the moment.</Text>
                    </View>
                )}
            />
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
    clearBtn: {
        padding: 5,
    },
    clearText: {
        color: '#1B4D20',
        fontWeight: 'bold',
        fontSize: 14,
    },
    listContent: {
        padding: 15,
    },
    notiCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    unreadCard: {
        backgroundColor: '#F0F9F0',
        borderWidth: 1,
        borderColor: '#E0F2E0',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notiContent: {
        flex: 1,
    },
    notiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    notiTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CDE16',
    },
    notiDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
    },
    notiTime: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 150,
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
        paddingHorizontal: 50,
    },
});

export default NotificationsScreen;
