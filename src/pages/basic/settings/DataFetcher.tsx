import React, { useEffect } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;
const storeId = process.env.REACT_APP_STORE_ID;


interface DataFetcherProps {
    onDataFetched: (data: any) => void;
}

const DataFetcher: React.FC<DataFetcherProps> = ({ onDataFetched }) => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/private/store/${storeId}`,{
                    headers: {
                        'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });
                const data = await response.json();
                onDataFetched(data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, [onDataFetched]);

    return null;
};

export default DataFetcher;
