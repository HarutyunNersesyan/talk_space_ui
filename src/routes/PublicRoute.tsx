import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    element: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
    const token = localStorage.getItem('token');
    let isAuthenticated = false;

    if (token) {
        try {
            const [, payload] = token.split('.');
            const decodedToken = JSON.parse(atob(payload));
            const currentTime = Date.now() / 1000;

            isAuthenticated = decodedToken.exp > currentTime;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    const redirectPath = localStorage.getItem("redirectPath");

    if (isAuthenticated) {
        return <Navigate to={redirectPath || '/'} replace />;
    }

    return element;
};

export default PublicRoute;
