import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    Dimensions, Image, Modal, Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { auth, db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import FarmerBottomNav from '../components/FarmerBottomNav';
import { CATEGORIES } from '../data/mockData';

const { width } = Dimensions.get('window');

const AddProductScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const productToEdit = route.params?.product;

    const [productName, setProductName] = useState(productToEdit ? productToEdit.name : '');
    const [price, setPrice] = useState(productToEdit ? productToEdit.price.toString().replace(/[^0-9.]/g, '') : '');
    const [stock, setStock] = useState(productToEdit ? productToEdit.stock.toString().replace(/[^0-9.]/g, '') : '');
    const [unit, setUnit] = useState(productToEdit ? productToEdit.unit : 'kg');
    const [category, setCategory] = useState(productToEdit ? productToEdit.category : null);
    const [image, setImage] = useState(productToEdit ? productToEdit.image : null);

    // Location State
    const [location, setLocation] = useState(productToEdit ? {
        latitude: productToEdit.latitude,
        longitude: productToEdit.longitude
    } : null);
    const [address, setAddress] = useState(productToEdit ? productToEdit.address : '');
    const [loadingLocation, setLoadingLocation] = useState(false);


    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
    const [errors, setErrors] = useState({});

    const UNITS = ['kg', 'g', 'l', 'ml', 'pcs', 'bunches'];

    // Image Picker Logic
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2, // Low quality to keep base64 string small for Firestore (Limit < 1MB)
            base64: true,
        });

        if (!result.canceled) {
            // Create the data URI for immediate display and storage
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Img); // Store the full base64 string
            setErrors(prev => ({ ...prev, image: null }));
        }
    };

    // Location Logic
    const getCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setLoadingLocation(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            // Reverse Geocode
            let addressResponse = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            if (addressResponse.length > 0) {
                const addr = addressResponse[0];
                const formattedAddr = `${addr.street || ''} ${addr.city || addr.region || ''}, ${addr.country || ''}`;
                setAddress(formattedAddr);
            }

            Alert.alert('Location Updated', 'GPS coordinates fetched successfully!');

        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert('Error', 'Could not fetch location.');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Validation Logic
    const validate = () => {
        let valid = true;
        let newErrors = {};

        if (!productName.trim()) { newErrors.name = 'Product Name is required'; valid = false; }
        if (!price.trim()) { newErrors.price = 'Price is required'; valid = false; }
        if (!stock.trim()) { newErrors.stock = 'Stock is required'; valid = false; }
        if (!category) { newErrors.category = 'Category is required'; valid = false; }
        // For existing products, image might be an object (require), for new it might be null
        if (!image && !productToEdit) { newErrors.image = 'Image is required'; valid = false; }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        if (!validate()) {
            Alert.alert('Missing Details', 'Please fill in all required fields.');
            return;
        }

        const actionText = productToEdit ? 'Updated' : 'Published';

        // Fetch farmer name to store with product for easy retrieval
        let farmerName = 'Local Farmer';
        try {
            const farmerDoc = await getDoc(doc(db, 'farmers', auth.currentUser.uid));
            if (farmerDoc.exists()) {
                farmerName = farmerDoc.data().fullName || farmerDoc.data().name || 'Verified Farmer';
            }
        } catch (err) {
            console.log("Could not fetch farmer name, using fallback");
        }

        // Prepare Data
        const productData = {
            farmerId: auth.currentUser?.uid,
            farm: farmerName, // Added for buyer dashboard display
            name: productName,
            price: price, // Store as raw number/string
            stock: parseInt(stock),
            unit: unit,
            category: category,
            image: image, // This is now the base64 string or null
            active: productToEdit ? productToEdit.active : true,
            lowStock: parseInt(stock) < 20,
            updatedAt: new Date().toISOString(),
            // Location Data
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            address: address || 'Location not provided'
        };

        try {
            if (productToEdit) {
                // Update existing
                const docRef = doc(db, 'products', productToEdit.id);
                await updateDoc(docRef, productData);
            } else {
                // Create new
                await addDoc(collection(db, 'products'), {
                    ...productData,
                    createdAt: new Date().toISOString(),
                    rating: 0,
                    reviews: 0
                });
            }

            Alert.alert(
                'Success',
                `Your listing for "${productName}" has been ${actionText.toLowerCase()}!`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (route.params?.onSave) route.params.onSave(); // Optional callback
                            navigation.goBack();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error("Error saving product:", error);
            Alert.alert('Error', 'Failed to save product to database.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{productToEdit ? 'Edit Product' : 'Add New Product'}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="help-circle-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Photo Upload Area */}
                <TouchableOpacity style={[styles.uploadContainer, errors.image && styles.errorBorder]} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.uploadedImage} />
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            <View style={styles.cameraCircle}>
                                <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
                            </View>
                            <Text style={styles.uploadTitle}>Add Product Photo</Text>
                            <Text style={styles.uploadSubtitle}>High quality photos increase sales by 40%</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

                {/* Product Name */}
                <Text style={styles.label}>PRODUCT NAME</Text>
                <TextInput
                    style={[styles.input, errors.name && styles.errorInput]}
                    placeholder="e.g. Organic Heritage Carrots"
                    placeholderTextColor="#999"
                    value={productName}
                    onChangeText={(t) => {
                        setProductName(t);
                        setErrors(prev => ({ ...prev, name: null }));
                    }}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                {/* Category Selection */}
                <Text style={styles.label}>CATEGORY</Text>
                <TouchableOpacity
                    style={[styles.dropdownInput, errors.category && styles.errorInput]}
                    onPress={() => setIsCategoryModalVisible(true)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {category ? (
                            <>
                                <View style={[styles.leafIconContainer, { backgroundColor: CATEGORIES.find(c => c.name === category)?.color || '#4CDE16' }]}>
                                    <MaterialCommunityIcons name={CATEGORIES.find(c => c.name === category)?.icon || 'leaf'} size={16} color="#FFF" />
                                </View>
                                <Text style={[styles.inputText, { color: '#000' }]}>{category}</Text>
                            </>
                        ) : (
                            <>
                                <View style={[styles.leafIconContainer, { backgroundColor: '#CCC' }]}>
                                    <MaterialCommunityIcons name="help" size={16} color="#FFF" />
                                </View>
                                <Text style={styles.inputText}>Select Category</Text>
                            </>
                        )}
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                {/* Price and Stock Row */}
                <View style={styles.row}>
                    <View style={styles.halfInputContainer}>
                        <Text style={styles.label}>PRICE PER {unit.toUpperCase()}</Text>
                        <View style={[styles.inputWrapper, errors.price && styles.errorInput]}>
                            <Text style={styles.greenText}>LKR</Text>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="0.00"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={(t) => {
                                    setPrice(t);
                                    setErrors(prev => ({ ...prev, price: null }));
                                }}
                            />
                        </View>
                    </View>

                    <View style={styles.halfInputContainer}>
                        <Text style={styles.label}>STOCK ({unit})</Text>
                        <View style={[styles.inputWrapper, errors.stock && styles.errorInput]}>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="0"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                textAlign="right"
                                value={stock}
                                onChangeText={(t) => {
                                    setStock(t);
                                    setErrors(prev => ({ ...prev, stock: null }));
                                }}
                            />
                            <TouchableOpacity onPress={() => setIsUnitModalVisible(true)}>
                                <Text style={[styles.greenText, { marginLeft: 5, textDecorationLine: 'underline' }]}>{unit}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.locationHeader}>
                    <Text style={styles.label}>PRODUCT LOCATION</Text>
                    <TouchableOpacity style={styles.useCurrentBtn} onPress={getCurrentLocation} disabled={loadingLocation}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#4CDE16" />
                        <Text style={styles.useCurrentText}>
                            {loadingLocation ? 'Fetching...' : 'Use Current'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Map Placeholder / Address Display */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <MaterialCommunityIcons name="map-marker-radius" size={40} color="rgba(255,255,255,0.5)" />
                    </View>
                    <View style={styles.addressOverlay}>
                        <Text style={styles.addressText}>
                            {address || 'No location set. Click "Use Current"'}
                        </Text>
                    </View>
                </View>

                {/* Publish Button */}
                <TouchableOpacity style={styles.publishButton} onPress={handleSave}>
                    <Text style={styles.publishButtonText}>{productToEdit ? 'Save Changes' : 'Publish Listing'}</Text>
                    <MaterialCommunityIcons name="send" size={20} color="#000" />
                </TouchableOpacity>

                {/* Spacer for Bottom Nav */}
                <View style={{ height: 100 }} />

            </ScrollView>

            {/* Category Modal */}
            <Modal visible={isCategoryModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <ScrollView contentContainerStyle={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setCategory(cat.name);
                                        setIsCategoryModalVisible(false);
                                        setErrors(prev => ({ ...prev, category: null }));
                                    }}
                                >
                                    <View style={[styles.catIconBig, { backgroundColor: cat.color }]}>
                                        <MaterialCommunityIcons name={cat.icon} size={28} color="#FFF" />
                                    </View>
                                    <Text style={styles.catName}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsCategoryModalVisible(false)}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Unit Selection Modal */}
            <Modal visible={isUnitModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: 'auto', paddingBottom: 30 }]}>
                        <Text style={styles.modalTitle}>Select Unit</Text>
                        <View style={styles.categoryGrid}>
                            {UNITS.map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    style={[
                                        styles.categoryOption,
                                        { width: '45%', backgroundColor: unit === u ? '#E8F5E9' : '#FFF', borderWidth: 1, borderColor: unit === u ? '#4CDE16' : '#E0E0E0', borderRadius: 12, padding: 10, marginBottom: 10 }
                                    ]}
                                    onPress={() => {
                                        setUnit(u);
                                        setIsUnitModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.catName, { fontWeight: unit === u ? 'bold' : 'normal' }]}>{u}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsUnitModalVisible(false)}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation Bar */}
            <FarmerBottomNav navigation={navigation} activeNav="add" />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    iconButton: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    uploadContainer: {
        backgroundColor: '#E8F5E9',
        borderWidth: 2,
        borderColor: '#4CDE16',
        borderStyle: 'dashed',
        borderRadius: 20,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    errorBorder: {
        borderColor: '#FF5252',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraPlaceholder: {
        alignItems: 'center',
    },
    cameraCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    uploadSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 8,
        marginTop: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 15,
        color: '#333',
    },
    errorInput: {
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 11,
        marginTop: 4,
        marginLeft: 5,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    leafIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CDE16',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    inputText: {
        fontSize: 15,
        color: '#999',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    halfInputContainer: {
        flex: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    greenText: {
        color: '#4CDE16',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 5,
    },
    halfInput: {
        flex: 1,
        marginBottom: 0,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 15,
    },
    useCurrentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    useCurrentText: {
        color: '#4CDE16',
        fontSize: 12,
        fontWeight: 'bold',
    },
    mapContainer: {
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 25,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#6b705c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    addressText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    publishButton: {
        backgroundColor: '#4CDE16',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
        shadowColor: "#4CDE16",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
    },
    categoryOption: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 15,
    },
    catIconBig: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    catName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    closeModalBtn: {
        marginTop: 20,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    closeText: {
        fontWeight: 'bold',
        color: '#666',
    },
});

export default AddProductScreen;
