import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BuyerBottomNav = ({ navigation, activeNav, cartItemCount = 0 }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.bottomNav, { height: 80 + insets.bottom, paddingBottom: 16 + insets.bottom }]}>
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('BuyerDashboard')}
            >
                <MaterialCommunityIcons
                    name={activeNav === 'home' ? 'home' : 'home-outline'}
                    size={24}
                    color={activeNav === 'home' ? '#1B4D20' : '#999'}
                />
                <Text style={[styles.navLabel, activeNav === 'home' && styles.navLabelActive]}>
                    Home
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('MapScreen')}
            >
                <MaterialCommunityIcons
                    name={activeNav === 'search' ? 'magnify' : 'magnify'}
                    size={24}
                    color={activeNav === 'search' ? '#1B4D20' : '#999'}
                />
                <Text style={[styles.navLabel, activeNav === 'search' && styles.navLabelActive]}>
                    Search
                </Text>
            </TouchableOpacity>

            {/* Cart Button (Center) */}
            <View style={styles.navItemCenter}>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <MaterialCommunityIcons name="cart" size={28} color="#FFF" />
                    {cartItemCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('BuyerDashboard', { activeNav: 'saved' })}
            >
                <MaterialCommunityIcons
                    name={activeNav === 'saved' ? 'heart' : 'heart-outline'}
                    size={24}
                    color={activeNav === 'saved' ? '#1B4D20' : '#999'}
                />
                <Text style={[styles.navLabel, activeNav === 'saved' && styles.navLabelActive]}>
                    Saved
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate('BuyerSettings')}
            >
                <MaterialCommunityIcons
                    name={activeNav === 'settings' ? 'cog' : 'cog-outline'}
                    size={24}
                    color={activeNav === 'settings' ? '#1B4D20' : '#999'}
                />
                <Text style={[styles.navLabel, activeNav === 'settings' && styles.navLabelActive]}>
                    Settings
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 16,
        paddingTop: 10,
        height: 80,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontWeight: '600',
    },
    navLabelActive: {
        color: '#1B4D20',
    },
    navItemCenter: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    cartButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1B4D20',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF6B00',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
});

export default BuyerBottomNav;
