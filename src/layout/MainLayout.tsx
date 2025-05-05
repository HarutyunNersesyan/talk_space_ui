import React, { useContext, useEffect, useState } from 'react';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import Navbar from '../components/header/Navbar';
import RoutesConfig from '../routes/RoutesConfig';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    roles?: string[];
}

const MainLayout: React.FC = () => {
    const { isAuthenticated, checkAuth } = useContext(AuthContext) || { isAuthenticated: false, checkAuth: () => {} };
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const initAuth = async () => {
            console.log('Checking authentication...');
            try {
                await checkAuth();

                // Check for admin role
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode<DecodedToken>(token);
                    if (decoded.roles && decoded.roles.includes('ADMIN')) {
                        setIsAdmin(true);
                    }
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [checkAuth]);

    console.log('isAuthenticated:', isAuthenticated);
    console.log('isAdmin:', isAdmin);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {isAuthenticated && <Navbar />}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                <RoutesConfig />
            </Box>
        </Box>
    );
};

export default MainLayout;