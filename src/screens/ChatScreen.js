import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MESSAGES, USERS, OFFERS } from '../data/mockData';
import BuyerBottomNav from '../components/BuyerBottomNav';
import { auth, db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { addToCart } from '../services/CartService';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { farmer: passedFarmer } = route.params || {};
    const farmer = passedFarmer || USERS.farmer;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [offerStatus, setOfferStatus] = useState('pending'); // 'pending', 'accepted', 'declined'
    const scrollViewRef = React.useRef();

    const currentUser = auth.currentUser;
    const farmerId = farmer.id || farmer.uid;

    const chatId = React.useMemo(() => {
        if (!currentUser?.uid || !farmerId) return null;
        return currentUser.uid < farmerId
            ? `${currentUser.uid}_${farmerId}`
            : `${farmerId}_${currentUser.uid}`;
    }, [currentUser?.uid, farmerId]);

    React.useEffect(() => {
        if (!currentUser || !farmerId || !chatId) return;

        console.log("ChatScreen: Initializing chat", { chatId, farmerId, userId: currentUser.uid });

        // Auto-create chat doc if it doesn't exist (optional metadata)
        const chatRef = doc(db, 'chats', chatId);

        // Use a more careful metadata update
        const updateMetadata = async () => {
            const snap = await getDoc(chatRef);
            const metaData = {
                participants: [currentUser.uid, farmerId].sort(),
                lastUpdate: serverTimestamp(),
                buyerId: currentUser.uid,
                farmerId: farmerId,
            };

            if (!snap.exists()) {
                await setDoc(chatRef, {
                    ...metaData,
                    buyerName: currentUser.displayName || 'Buyer',
                    farmerName: farmer.name || farmer.fullName || 'Farmer',
                });

                // Add an initial welcome message from the farmer
                await addDoc(collection(db, 'chats', chatId, 'messages'), {
                    text: `Hello! I'm ${farmer.name?.split(' ')[0]}. How can I help you today? I have some fresh ${farmer.farmName || 'produce'} ready for harvest!`,
                    senderId: farmerId,
                    createdAt: serverTimestamp(),
                    type: 'text',
                    isAuto: true
                });
            } else {
                await setDoc(chatRef, metaData, { merge: true });
            }
        };
        updateMetadata();

        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    ...data,
                    // Handle local temporary null timestamps
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date()
                });
            });

            // Sort locally to be safe (Firestore orderBy might exclude docs with null fields)
            const sortedMsgs = msgs.sort((a, b) => a.createdAt - b.createdAt);
            setMessages(sortedMsgs);
        }, (error) => {
            console.error("ChatScreen Snapshot Error:", error);
        });

        return () => unsubscribe();
    }, [chatId, currentUser?.uid, farmerId]);

    // Simulated Farmer Reply logic
    React.useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // If the last message was from the user and not an auto-reply
            if (lastMsg.senderId === currentUser?.uid && !lastMsg.isSimulated) {
                const timer = setTimeout(async () => {
                    const replies = [
                        "That sounds great! Would you like to see a 3D scan of the harvest?",
                        "I can have that ready for you by tomorrow morning.",
                        "Our Keeri Samba is particularly good this week. How many kgs do you need?",
                        "Yes, we use 100% organic fertilizers. You can check our farm profile for the certifications.",
                        "Let me check the stock level for you quickly."
                    ];
                    const randomReply = replies[Math.floor(Math.random() * replies.length)];

                    try {
                        await addDoc(collection(db, 'chats', chatId, 'messages'), {
                            text: randomReply,
                            senderId: farmerId,
                            createdAt: serverTimestamp(),
                            type: 'text',
                            isSimulated: true
                        });

                        await setDoc(doc(db, 'chats', chatId), {
                            lastMessage: randomReply,
                            lastUpdate: serverTimestamp(),
                        }, { merge: true });
                    } catch (error) {
                        console.error("Simulation error:", error);
                    }
                }, 2500); // 2.5 second delay for realism
                return () => clearTimeout(timer);
            }
        }
    }, [messages.length, chatId, farmerId, currentUser?.uid]);

    const handleSend = async () => {
        if (!inputText.trim() || !currentUser || !chatId) {
            console.log("ChatScreen: Cannot send message", { hasText: !!inputText.trim(), hasUser: !!currentUser, hasChatId: !!chatId });
            return;
        }

        const messageData = {
            text: inputText.trim(),
            senderId: currentUser.uid,
            createdAt: serverTimestamp(),
            type: 'text'
        };

        const currentText = inputText.trim();
        setInputText('');

        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

            // Update last message in chat metadata
            await setDoc(doc(db, 'chats', chatId), {
                lastMessage: currentText,
                lastUpdate: serverTimestamp(),
            }, { merge: true });

        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Could not send message. Please try again.");
        }
    };

    const handleAcceptOffer = async () => {
        if (!auth.currentUser) {
            Alert.alert("Login Required", "Please login to accept offers.");
            return;
        }

        if (!farmerId) {
            Alert.alert("Error", "Missing farmer information. Please restart the chat.");
            return;
        }

        try {
            const offerProduct = {
                id: 'offer_keeri_samba',
                name: 'Organic Keeri Samba (Special Offer)',
                price: 4500, // Total price for the offer quantity
                image: require('../../assets/images/landing_background.png'),
                quantity: 1, // Treating the 10kg as 1 unit of offer
                unit: '10kg bundle',
                farmerId: farmerId
            };

            await addToCart(auth.currentUser.uid, offerProduct, 1);
            setOfferStatus('accepted');

            // Send an automated message to continue the chat flow
            const acceptanceMsg = "I have accepted the offer! Looking forward to getting this fresh produce.";
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: acceptanceMsg,
                senderId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                type: 'text'
            });

            // Update metadata for last message
            await setDoc(doc(db, 'chats', chatId), {
                lastMessage: acceptanceMsg,
                lastUpdate: serverTimestamp(),
            }, { merge: true });

            Alert.alert(
                "Offer Accepted!",
                "The product has been added to your cart. You can continue chatting now.",
                [
                    { text: "Got it", style: "default" },
                    { text: "View Cart", onPress: () => navigation.navigate('Cart') }
                ]
            );
        } catch (error) {
            console.error("ChatScreen cart error:", error);
            Alert.alert("Error", `Failed to add offer to cart: ${error.message}`);
        }
    };

    const handleDeclineOffer = () => {
        setOfferStatus('declined');
        Alert.alert("Offer Declined", "The farmer has been notified.");
    };

    const handleView3D = () => {
        Alert.alert(
            "AI 3D Quality Analysis",
            "✨ Initializing 3D Scan...\n\n✅ Surface Texture: Excellent\n✅ Freshness Level: 98%\n✅ Organic Integrity: Verified\n\nThis product meets premium quality standards.",
            [{ text: "Great!", style: "default" }]
        );
    };

    const handleLiveLocation = () => {
        Alert.alert(
            "Farmer Location",
            `Farmer is currently near ${farmer.location || 'their farm'}.\n\nEstimated harvest freshness: 100%`,
            [
                { text: "View on Map", onPress: () => navigation.navigate('MapScreen', { farmer }) },
                { text: "Close", style: "cancel" }
            ]
        );
    };

    const handleStockLevel = () => {
        Alert.alert(
            "Stock Availability",
            "Current Inventory: 450kg\nHarvest Cycle: Weekly\n\nHigh availability for this product.",
            [{ text: "Noted", style: "default" }]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={styles.container}>
                <StatusBar style="dark" />

                {/* Header */}
                <SafeAreaView style={styles.headerContainer} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
                        </TouchableOpacity>

                        <View style={styles.avatarContainer}>
                            <Image
                                source={farmer.avatar || farmer.photoURL ? { uri: farmer.avatar || farmer.photoURL } : require('../../assets/images/landing_background.png')}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineDot} />
                        </View>

                        <View style={styles.headerInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{farmer.name}</Text>
                                {farmer.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <MaterialCommunityIcons name="check-decagram" size={12} color="#FFF" />
                                        <Text style={styles.verifiedText}>3D VERIFIED</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.status}>Online Now</Text>
                        </View>

                        <TouchableOpacity>
                            <MaterialCommunityIcons name="information" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >

                    {/* Date Divider */}
                    <View style={styles.dateDivider}>
                        <Text style={styles.dateText}>TODAY • HARVEST READY</Text>
                    </View>


                    {/* Messages Rendering */}
                    {messages.map((msg) => (
                        msg.senderId === farmerId ? (
                            <View key={msg.id} style={styles.messageRowLeft}>
                                <Image
                                    source={farmer.avatar || farmer.photoURL ? { uri: farmer.avatar || farmer.photoURL } : require('../../assets/images/landing_background.png')}
                                    style={styles.msgAvatar}
                                />
                                <View>
                                    <Text style={styles.senderName}>{farmer.name?.split(' ')[0]}</Text>
                                    <View style={styles.bubbleLeft}>
                                        <Text style={styles.messageTextLeft}>{msg.text}</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View key={msg.id} style={styles.messageRowRight}>
                                <View>
                                    <Text style={styles.senderNameRight}>You</Text>
                                    <View style={styles.bubbleRight}>
                                        <Text style={styles.messageTextRight}>{msg.text}</Text>
                                    </View>
                                </View>
                                <Image
                                    source={auth.currentUser?.photoURL ? { uri: auth.currentUser.photoURL } : require('../../assets/images/landing_background.png')}
                                    style={styles.msgAvatar}
                                />
                            </View>
                        )
                    ))}

                    {/* Offer Card (Incoming) */}
                    {offerStatus === 'pending' ? (
                        <View style={styles.offerCardContainer}>
                            <View style={styles.offerCard}>
                                {/* 3D Image Area */}
                                <View style={styles.offerImageContainer}>
                                    <Image source={require('../../assets/images/landing_background.png')} style={styles.offerImage} />
                                    <View style={styles.scanBadge}>
                                        <Text style={styles.scanBadgeText}>3D SCAN CAPTURED</Text>
                                    </View>
                                </View>

                                {/* Details */}
                                <View style={styles.offerDetails}>
                                    <Text style={styles.offerLabel}>QUICK OFFER</Text>
                                    <Text style={styles.offerTitle}>Organic Keeri Samba</Text>
                                    <Text style={styles.offerQty}>Quantity: 10kg</Text>

                                    <View style={styles.priceRow}>
                                        <View>
                                            <Text style={styles.currency}>LKR</Text>
                                            <Text style={styles.amount}>4,500</Text>
                                        </View>

                                        <View style={styles.offerButtons}>
                                            <TouchableOpacity style={styles.declineButton} onPress={handleDeclineOffer}>
                                                <Text style={styles.declineText}>Decline</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOffer}>
                                                <Text style={styles.acceptText}>Accept</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.offerStatusBadge}>
                            <MaterialCommunityIcons
                                name={offerStatus === 'accepted' ? "check-circle" : "close-circle"}
                                size={20}
                                color={offerStatus === 'accepted' ? "#4CDE16" : "#FF3B30"}
                            />
                            <Text style={[styles.offerStatusText, { color: offerStatus === 'accepted' ? "#4CDE16" : "#FF3B30" }]}>
                                Offer {offerStatus.charAt(0).toUpperCase() + offerStatus.slice(1)}
                            </Text>
                        </View>
                    )}

                </ScrollView>

                {/* Simulated Activity Indicator */}
                <View style={{ position: 'absolute', bottom: 200, left: 20 }}>
                    {/* Could add a 'Farmer is typing...' indicator here */}
                </View>

                {/* Footer / Input Area - Removed Absolute Positioning for main flow if possible, 
                but we use a simpler approach: keeping it as is but ensuring no overlap */}
                <View style={[styles.footer, { paddingBottom: 15 }]}>

                    {/* Quick Actions Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
                        <TouchableOpacity style={styles.chip} onPress={handleView3D}>
                            <MaterialCommunityIcons name="cube-scan" size={16} color="#000" />
                            <Text style={styles.chipText}>View 3D Quality</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chip} onPress={handleLiveLocation}>
                            <MaterialCommunityIcons name="map-marker" size={16} color="#000" />
                            <Text style={styles.chipText}>Live Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chip} onPress={handleStockLevel}>
                            <MaterialCommunityIcons name="package-variant" size={16} color="#000" />
                            <Text style={styles.chipText}>Stock Level</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Input Bar */}
                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.addButton}>
                            <MaterialCommunityIcons name="plus" size={24} color="#000" />
                        </TouchableOpacity>

                        <View style={styles.textInputWrapper}>
                            <TextInput
                                placeholder="Type a message..."
                                style={styles.textInput}
                                placeholderTextColor="#999"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <MaterialCommunityIcons name="send" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <BuyerBottomNav
                    navigation={navigation}
                    activeNav="home"
                    cartItemCount={3}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9F7', // Light greenish-grey background
    },
    headerContainer: {
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        marginRight: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    offerStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 40,
        marginTop: 10,
        marginBottom: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    offerStatusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CDE16',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C6F221', // Lime green/yellow
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    verifiedText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontSize: 12,
        color: '#4CDE16',
    },
    chatContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    dateDivider: {
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 20,
    },
    dateText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 1,
    },
    messageRowLeft: {
        flexDirection: 'row',
        marginBottom: 20,
        maxWidth: '85%',
    },
    messageRowRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        marginBottom: 20,
        maxWidth: '85%',
    },
    msgAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 20, // Align closer to text bubble bottom? Or top. Design shows top align roughly
    },
    senderName: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        marginLeft: 5,
    },
    senderNameRight: {
        fontSize: 12,
        color: '#4CDE16',
        marginBottom: 4,
        textAlign: 'right',
        marginRight: 5,
    },
    bubbleLeft: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 15,
        borderRadius: 20,
        borderTopLeftRadius: 5,
    },
    bubbleRight: {
        backgroundColor: '#DCF8C6', // Light green
        padding: 15,
        borderRadius: 20,
        borderTopRightRadius: 5,
    },
    messageTextLeft: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    messageTextRight: {
        fontSize: 14,
        color: '#1B4D20',
        lineHeight: 20,
    },
    offerCardContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    offerCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    offerImageContainer: {
        height: 150,
        width: '100%',
        position: 'relative',
    },
    offerImage: {
        width: '100%',
        height: '100%',
    },
    scanBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#4CDE16',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    scanBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFF',
    },
    offerDetails: {
        padding: 15,
    },
    offerLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4CDE16',
        letterSpacing: 1,
        marginBottom: 5,
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    offerQty: {
        fontSize: 12,
        color: '#888',
        marginBottom: 15,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    currency: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        lineHeight: 28,
    },
    offerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    declineButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    declineText: {
        color: '#333',
        fontWeight: '600',
    },
    acceptButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        backgroundColor: '#4CDE16',
        borderRadius: 10,
    },
    acceptText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: '#F7F9F7',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
        paddingBottom: 85, // Extra space to stay above BuyerBottomNav (80px + margin)
    },
    chipsScroll: {
        marginBottom: 10,
    },
    chipsContent: {
        paddingHorizontal: 15,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        gap: 10,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: '#000',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#4CDE16",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
});

export default ChatScreen;
