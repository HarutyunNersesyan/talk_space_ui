import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface AuthContextType {
    isAuthenticated: boolean;
    userName: string | null;
    checkAuth: () => void;
    setUser: (userName: string | null) => void;
    redirectToSignUp: () => void;
    redirectToForgotPassword: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/verify', '/forgotPassword'];

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const decodeToken = (token: string): { userName: string } | null => {
        try {
            const [, payload] = token.split('.');
            const decodedPayload = atob(payload);
            const { userName } = JSON.parse(decodedPayload);
            return { userName };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const storedUserName = localStorage.getItem('userName');

        if (token) {
            try {
                const decodedToken = decodeToken(token);
                if (!decodedToken) {
                    throw new Error('Invalid token');
                }

                const [, payload] = token.split('.');
                const decodedPayload = JSON.parse(atob(payload));
                const currentTime = Date.now() / 1000;

                if (decodedPayload.exp > currentTime) {
                    setIsAuthenticated(true);
                    setUserName(decodedToken.userName);
                } else {
                    logout(); // Clear token and userName on token expiration
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                logout(); // Clear token and userName on error
            }
        } else {
            setIsAuthenticated(false);
            setUserName(null);
        }
    };

    const setUser = (userName: string | null) => {
        if (userName) {
            localStorage.setItem('userName', userName);
        } else {
            localStorage.removeItem('userName');
        }
        setUserName(userName);
    };

    const redirectToSignUp = () => {
        navigate('/signup');
    };

    const redirectToForgotPassword = () => {
        navigate('/forgotPassword');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        setUserName(null);
        navigate('/login');
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
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userName,
                checkAuth,
                setUser,
                redirectToSignUp,
                redirectToForgotPassword,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };