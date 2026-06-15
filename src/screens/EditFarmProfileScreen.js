import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditFarmProfileScreen = ({ navigation, route }) => {
    // Initial data from params or defaults
    const { currentProfile } = route.params || {};

    const [farmName, setFarmName] = useState(currentProfile?.farmName || "Green Valley Farm");
    const [about, setAbout] = useState(currentProfile?.about || "We are a family-owned farm dedicated to sustainable and organic farming practices.");
    const [phone, setPhone] = useState(currentProfile?.phone || "+94 77 123 4567");
    const [email, setEmail] = useState(currentProfile?.email || "");
    const [location, setLocation] = useState(currentProfile?.location || "Nuwara Eliya, Sri Lanka");
    const [coverImage, setCoverImage] = useState(currentProfile?.heroImage || null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setCoverImage({ uri: result.assets[0].uri });
        }
    };

    const handleSave = () => {
        // Validate
        if (!farmName.trim() || !location.trim()) {
            Alert.alert('Error', 'Farm Name and Location are required.');
            return;
        }

        // Simulate Save
        const updatedProfile = {
            farmName,
            about,
            phone,
            email,
            location,
            heroImage: coverImage
        };

        if (route.params?.onSave) {
            route.params.onSave(updatedProfile);
        }

        Alert.alert('Success', 'Profile updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Cover Image */}
                <Text style={styles.label}>Cover Photo</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {coverImage ? (
                        <Image source={coverImage} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <MaterialCommunityIcons name="camera-plus" size={32} color="#888" />
                            <Text style={styles.placeholderText}>Tap to change cover photo</Text>
                        </View>
                    )}
                    <View style={styles.editIconBadge}>
                        <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
                    </View>
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Farm Name</Text>
                        <TextInput
                            style={styles.input}
                            value={farmName}
                            onChangeText={setFarmName}
                            placeholder="e.g. Green Valley Farm"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio / About</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={about}
                            onChangeText={setAbout}
                            multiline
                            textAlignVertical="top"
                            placeholder="Tell buyers about your farm..."
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="map-marker" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputNoBorder}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="City, District"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Phone</Text>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="phone" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputNoBorder}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="+94 7X XXX XXXX"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputNoBorder}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholder="name@example.com"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    saveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B4D20',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 8,
        marginTop: 5,
        textTransform: 'uppercase',
    },
    imagePicker: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#EEE',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        color: '#888',
        fontSize: 12,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },
    formSection: {
        gap: 15,
    },
    inputGroup: {
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#EEE',
        color: '#333',
    },
    textArea: {
        height: 100,
    },
    inputIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    inputNoBorder: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
});

export default EditFarmProfileScreen;
