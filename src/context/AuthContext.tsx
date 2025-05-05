import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface AuthContextType {
    isAuthenticated: boolean;
    userName: string | null;
    userRole: string | null;
    checkAuth: () => void;
    setUser: (userName: string | null, userRole: string | null) => void;
    redirectToSignUp: () => void;
    redirectToForgotPassword: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/verify', '/forgotPassword'];

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const decodeToken = (token: string): { userName: string; userRole: string } | null => {
        try {
            const [, payload] = token.split('.');
            const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            const { sub, roles } = JSON.parse(decodedPayload);
            return {
                userName: sub,
                userRole: roles && roles.length > 0 ? roles[0] : 'USER'
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

                const [, payload] = token.split('.');
                const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                const currentTime = Date.now() / 1000;

                if (decodedPayload.exp > currentTime) {
                    setIsAuthenticated(true);
                    setUserName(decodedToken.userName);
                    setUserRole(decodedToken.userRole);
                    localStorage.setItem('userName', decodedToken.userName);
                    localStorage.setItem('userRole', decodedToken.userRole);
                } else {
                    logout(); // Clear token and user data on token expiration
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                logout(); // Clear token and user data on error
            }
        } else {
            setIsAuthenticated(false);
            setUserName(null);
            setUserRole(null);
        }
    };

    const setUser = (userName: string | null, userRole: string | null) => {
        if (userName && userRole) {
            localStorage.setItem('userName', userName);
            localStorage.setItem('userRole', userRole);
        } else {
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
        }
        setUserName(userName);
        setUserRole(userRole);
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
        if (isAuthenticated) {
            if (userRole === 'ADMIN' && !location.pathname.startsWith('/admin')) {
                navigate('/admin');
            } else if (userRole === 'USER' && !location.pathname.startsWith('/home')) {
                navigate('/home');
            }
        } else if (!publicRoutes.includes(location.pathname)) {
            navigate('/login');
        }
    }, [isAuthenticated, userRole, navigate, location.pathname]);

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