import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export interface AuthContextType {
    isAuthenticated: boolean;
    userName: string | null;
    userRole: string | null;
    checkAuth: () => void;
    setUser: (userName: string | null, userRole?: string | null) => void;
    redirectToSignUp: () => void;
    redirectToForgotPassword: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/', '/login', '/signup', '/verify', '/forgot-password'];

interface DecodedToken {
    roles: string[];
    sub: string;
    iat: number;
    exp: number;
}

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const decodeToken = (token: string): { userName: string; userRole: string } | null => {
        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            const role = decodedToken.roles.includes('ADMIN') ? 'ADMIN' : 'USER';
            return {
                userName: decodedToken.sub,
                userRole: role
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const storedUserName = localStorage.getItem('userName');
        const storedUserRole = localStorage.getItem('userRole');

        if (token) {
            try {
                const decodedToken = decodeToken(token);
                if (!decodedToken) {
                    throw new Error('Invalid token');
                }

                const decodedPayload = jwtDecode<DecodedToken>(token);
                const currentTime = Date.now() / 1000;

                if (decodedPayload.exp > currentTime) {
                    setIsAuthenticated(true);
                    setUserName(decodedToken.userName || storedUserName);
                    setUserRole(decodedToken.userRole || storedUserRole);
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                logout();
            }
        } else {
            setIsAuthenticated(false);
            setUserName(null);
            setUserRole(null);
        }
    };

    const setUser = (userName: string | null, userRole?: string | null) => {
        if (userName) {
            localStorage.setItem('userName', userName);
            setUserName(userName);
        } else {
            localStorage.removeItem('userName');
            setUserName(null);
        }

        if (userRole) {
            localStorage.setItem('userRole', userRole);
            setUserRole(userRole);
        } else {
            localStorage.removeItem('userRole');
            setUserRole(null);
        }
    };

    const redirectToSignUp = () => {
        navigate('/signup');
    };

    const redirectToForgotPassword = () => {
        navigate('/forgot-password');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserName(null);
        setUserRole(null);
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
                userRole,
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