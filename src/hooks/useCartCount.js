import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const useCartCount = () => {
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        if (!auth.currentUser) return;

        const cartRef = doc(db, 'carts', auth.currentUser.uid);
        const unsubscribe = onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists()) {
                const items = docSnap.data().items || [];
                setCartItemCount(items.length);
            } else {
                setCartItemCount(0);
            }
        });

        return () => unsubscribe();
    }, []);

    return cartItemCount;
};
