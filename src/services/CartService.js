import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const addToCart = async (userId, product, quantity = 1) => {
    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const currentItems = cartSnap.data().items || [];
            const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const updatedItems = [...currentItems];
                updatedItems[existingItemIndex].quantity += quantity;
                await updateDoc(cartRef, { items: updatedItems });
            } else {
                // Add new item
                await updateDoc(cartRef, {
                    items: arrayUnion({ ...product, quantity })
                });
            }
        } else {
            // Create new cart
            await setDoc(cartRef, {
                items: [{ ...product, quantity }],
                updatedAt: new Date().toISOString()
            });
        }
        return true;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
};

export const removeFromCart = async (userId, productId) => {
    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const currentItems = cartSnap.data().items || [];
            const updatedItems = currentItems.filter(item => item.id !== productId);
            await updateDoc(cartRef, { items: updatedItems });
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
};

export const updateCartItemQuantity = async (userId, productId, delta) => {
    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const currentItems = cartSnap.data().items || [];
            const updatedItems = currentItems.map(item => {
                if (item.id === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            await updateDoc(cartRef, { items: updatedItems });
        }
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        throw error;
    }
};

export const clearCart = async (userId) => {
    try {
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items: [] });
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};
