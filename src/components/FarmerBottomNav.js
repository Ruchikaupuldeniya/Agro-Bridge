import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FarmerBottomNav = ({ navigation, activeNav }) => {
    const insets = useSafeAreaInsets();

    const navItems = [
        { id: 'dashboard', icon: 'view-dashboard', label: 'Home', target: 'FarmerDashboard' },
        { id: 'listings', icon: 'format-list-bulleted', label: 'My Crops', target: 'Listings' },
        { id: 'add', icon: 'plus-circle', label: 'Add', target: 'AddProduct', isCenter: true },
        { id: 'orders', icon: 'clipboard-list-outline', label: 'Orders', target: 'FarmerOrders' }, // Placeholder for now
        { id: 'settings', icon: 'cog', label: 'Settings', target: 'FarmerSettings' },
    ];

    return (
        <View style={[styles.container, { height: 70 + insets.bottom, paddingBottom: insets.bottom }]}>
            {navItems.map((item) => {
                const isActive = activeNav === item.id;

                if (item.isCenter) {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.centerButtonWrapper}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate(item.target)}
                        >
                            <View style={styles.centerButton}>
                                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
                            </View>
                            <Text style={styles.centerLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.navItem}
                        onPress={() => item.target && navigation.navigate(item.target)}
                    >
                        <MaterialCommunityIcons
                            name={isActive ? item.icon : `${item.icon}-outline`.replace('-outline-outline', '-outline')}
                            size={26}
                            color={isActive ? '#1B4D20' : '#999'}
                        />
                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    navLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontWeight: '500',
    },
    navLabelActive: {
        color: '#1B4D20',
        fontWeight: 'bold',
    },
    centerButtonWrapper: {
        top: -20,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1B4D20',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#1B4D20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 4,
        borderColor: '#F5F9F5',
    },
    centerLabel: {
        fontSize: 10,
        color: '#1B4D20',
        marginTop: 4,
        fontWeight: '600',
    },
});

export default FarmerBottomNav;
