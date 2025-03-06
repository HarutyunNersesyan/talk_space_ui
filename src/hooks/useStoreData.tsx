import { useEffect, useState } from 'react';

interface StoreData {
    storeName: string | null;
    email: string | null;
    loading: boolean;
}

const decodeJwt = (token: string): any => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const useStoreData = (): StoreData => {
    const [storeName, setStoreName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            const apiUrl = process.env.REACT_APP_API_URL;
            const storeId = process.env.REACT_APP_STORE_ID;
            try {
                const response = await fetch(`${apiUrl}/api/private/store/${storeId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });
                const data = await response.json();
                setStoreName(data.name || null);
            } catch (error) {
                console.error('Data loading error', error);
            }
        };

        fetchStoreData();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = decodeJwt(token);
                setEmail(decodedToken?.sub || null);
            } catch (error) {
                console.error('Token Decode Error', error);
            }
        }
        setLoading(false);
    }, []);

    return { storeName, email, loading };
};

export default useStoreData;
