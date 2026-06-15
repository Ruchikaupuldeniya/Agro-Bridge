// Mock Data Service for AgroBridge
// This file simulates a backend response. 
// In the future, replace these exports with API calls (e.g., fetch or axios).

export const USERS = {
    buyer: {
        id: 'u1',
        name: 'Ruchika',
        location: 'Kandy, Sri Lanka',
        avatar: require('../../assets/images/landing_background.png'), // Placeholder
    },
    farmer: {
        id: 'f1',
        name: 'Sunil Perera',
        farmName: 'Sunshine Acres Homestead',
        role: 'Farmer',
        verified: true,
        location: 'Anuradhapura, Sri Lanka',
        phone: '+94 77 123 4567',
        about: 'Sunshine Acres is a family-owned regenerative farm specializing in heirloom vegetables and pasture-raised poultry since 1995.',
        avatar: require('../../assets/images/landing_background.png'), // Placeholder
        rating: 4.9,
    }
};

export const CATEGORIES = [
    { id: 1, name: 'Vegetables', icon: 'leaf', color: '#4CDE16' },
    { id: 2, name: 'Fruits', icon: 'food-apple', color: '#8BC34A' },
    { id: 3, name: 'Grains', icon: 'barley', color: '#FFC107' },
    { id: 4, name: 'Spices', icon: 'shaker', color: '#FF5722' },
    { id: 5, name: 'Dairy', icon: 'cow', color: '#03A9F4' },
];

export const PRODUCTS = [
    {
        id: 1,
        name: 'Organic Carrots (Nuwara Eliya)',
        farm: 'Sunil Perera',
        price: 350,
        currency: 'LKR',
        unit: 'kg',
        distance: '1.2km',
        image: require('../../assets/images/landing_background.png'),
        tag: 'FRESH',
        category: 'Vegetables',
        coordinates: { top: '35%', left: '55%' } // Simulation for Map
    },
    {
        id: 2,
        name: 'Fresh Spinach (Gotukola)',
        farm: 'Amara Kumari',
        price: 150,
        currency: 'LKR',
        unit: 'bundle',
        distance: '0.8km',
        image: require('../../assets/images/landing_background.png'),
        tag: null,
        category: 'Vegetables',
        coordinates: { top: '45%', left: '30%' }
    },
    {
        id: 3,
        name: 'Red Onions (Jaffna)',
        farm: 'Nimal Jayasuriya',
        price: 450,
        currency: 'LKR',
        unit: 'kg',
        distance: '2.5km',
        image: require('../../assets/images/landing_background.png'),
        tag: null,
        category: 'Vegetables',
        coordinates: { top: '55%', left: '20%' }
    },
    {
        id: 4,
        name: 'Ceylon Cinnamon (Grade A)',
        farm: 'Kamala Silva',
        price: 1200,
        currency: 'LKR',
        unit: '100g',
        distance: '5.1km',
        image: require('../../assets/images/landing_background.png'),
        tag: 'PREMIUM',
        category: 'Spices',
        coordinates: { top: '65%', left: '70%' }
    },
];

export const MESSAGES = [
    {
        id: 'm1',
        senderId: 'f1', // Sunil
        text: 'Ayubowan! The Keeri Samba harvest is ready. It is from my field in Anuradhapura.',
        timestamp: '10:30 AM',
        type: 'text'
    },
    {
        id: 'm2',
        senderId: 'u1', // Buyer
        text: 'Great! Can you send a price for 10kg?',
        timestamp: '10:32 AM',
        type: 'text'
    },
];

export const OFFERS = [
    {
        id: 'o1',
        title: 'Organic Keeri Samba',
        quantity: '10kg',
        price: 4500,
        currency: 'LKR',
        image: require('../../assets/images/landing_background.png'),
        is3DVerified: true,
    }
];

export const FARMER_LISTINGS = [
    { id: 1, name: 'Organic Carrots', stock: '50 kg', price: 'LKR 350 / kg', image: require('../../assets/images/landing_background.png'), active: true, lowStock: false },
    { id: 2, name: 'Heirloom Tomatoes', stock: '40 kg (Low)', price: 'LKR 400 / kg', image: require('../../assets/images/landing_background.png'), active: true, lowStock: true },
    { id: 3, name: 'Gotukola', stock: '0 bundles', price: 'LKR 60 / bundle', image: require('../../assets/images/landing_background.png'), active: false, lowStock: false },
    { id: 4, name: 'Green Chilies', stock: '10 kg', price: 'LKR 800 / kg', image: require('../../assets/images/landing_background.png'), active: true, lowStock: false },
];

export const TRACKING_STEPS = [
    { id: 1, label: 'Ordered', completed: true },
    { id: 2, label: 'Prepared', completed: true },
    { id: 3, label: 'En Route', completed: true, active: true },
    { id: 4, label: 'Delivered', completed: false },
];
