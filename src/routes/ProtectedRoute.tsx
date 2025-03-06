import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const token = localStorage.getItem('token');
    let isAuthenticated = false;
    const location = useLocation();

    if (token) {
        try {
            const [, payload] = token.split('.');
            const decodedToken = JSON.parse(atob(payload));
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp > currentTime) {
                isAuthenticated = true;
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('redirectPath', location.pathname);
        }
    }, [isAuthenticated, location]);

    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
