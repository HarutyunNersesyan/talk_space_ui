import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Define the AuthContextType interface
export interface AuthContextType {
    isAuthenticated: boolean;
    checkAuth: () => void;
    redirectToSignUp: () => void;
}

// Create the AuthContext with the correct type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

// Define the AuthProvider component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    // Function to check authentication status
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

    // Function to redirect to the sign-up page
    const redirectToSignUp = () => {
        navigate('/signup');
    };

    // Check authentication status on component mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Redirect to login page if not authenticated and not on a public route
    useEffect(() => {
        if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate, location.pathname]);

    // Provide the context value to children
    return (
        <AuthContext.Provider value={{ isAuthenticated, checkAuth, redirectToSignUp }}>
            {children}
        </AuthContext.Provider>
    );
};

// Export AuthContext and AuthProvider
export { AuthProvider, AuthContext };