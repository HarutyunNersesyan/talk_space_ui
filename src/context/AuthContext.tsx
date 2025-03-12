import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface AuthContextType {
    isAuthenticated: boolean;
    checkAuth: () => void;
    redirectToSignUp: () => void;
    redirectToForgotPassword: () => void; // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/verify', '/forgotPassword']; // Add /forgotPassword to public routes

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const [, payload] = token.split('.');
                const decodedToken = JSON.parse(atob(payload));
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp > currentTime) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    };

    const redirectToSignUp = () => {
        navigate('/signup');
    };

    // New function to handle navigation to the Forgot Password page
    const redirectToForgotPassword = () => {
        navigate('/forgotPassword');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate, location.pathname]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, checkAuth, redirectToSignUp, redirectToForgotPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };