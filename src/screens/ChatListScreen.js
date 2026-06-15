import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import FarmerBottomNav from '../components/FarmerBottomNav';
import BuyerBottomNav from '../components/BuyerBottomNav';

const { width } = Dimensions.get('window');

const ChatListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFarmer, setIsFarmer] = useState(false);

    useEffect(() => {
        if (!auth.currentUser) return;

        // Simple role check: In this app, farmers usually have IDs starting with 'f' 
        // Or better: check if we have any products listed with our UID
        const checkRole = async () => {
            // Mock role detection logic - in a real app, this would be in the user profile doc
            const farmerRef = doc(db, 'farmers', auth.currentUser.uid);
            const snap = await getDoc(farmerRef);
            setIsFarmer(snap.exists());
        };
        checkRole();

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', auth.currentUser.uid),
            orderBy('lastUpdate', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setChats(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderChatItem = ({ item }) => {
        // Determine the other participant's data
        // If I am the buyerId, show farmerName. If I am the farmerId, show buyerName.
        const isMeBuyer = auth.currentUser.uid === item.buyerId;
        const otherName = isMeBuyer ? item.farmerName : item.buyerName;
        const otherId = isMeBuyer ? item.farmerId : item.buyerId;

        return (
            <TouchableOpacity
                style={styles.chatCard}
                onPress={() => navigation.navigate('Chat', {
                    farmer: {
                        id: otherId,
                        uid: otherId,
                        name: otherName
                    }
                })}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../../assets/images/landing_background.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.name}>{otherName || "User"}</Text>
                        <Text style={styles.time}>{item.lastUpdate ? "Active" : "New"}</Text>
                    </View>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                        {item.lastMessage || "No messages yet"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <TouchableOpacity style={styles.searchBtn}>
                        <MaterialCommunityIcons name="magnify" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {chats.length === 0 && !loading ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="message-off-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={chats}
                        renderItem={renderChatItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>

            {isFarmer ? (
                <FarmerBottomNav navigation={navigation} activeNav="messages" />
            ) : (
                <BuyerBottomNav navigation={navigation} activeNav="home" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    searchBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F5F5',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CDE16',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    lastMsg: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
});

export default ChatListScreen;
