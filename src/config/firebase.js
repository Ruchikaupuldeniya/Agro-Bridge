import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADiy6N587z9flghSloz_gbwFcAz3HGiro",
    authDomain: "agrobridge-app-v1.firebaseapp.com",
    projectId: "agrobridge-app-v1",
    storageBucket: "agrobridge-app-v1.firebasestorage.app",
    messagingSenderId: "502474875072",
    appId: "1:502474875072:web:036b4533f13f0861160d25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
