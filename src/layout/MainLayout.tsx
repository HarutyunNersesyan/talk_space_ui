import React, { useContext, useEffect, useState } from 'react';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import Navbar from '../components/header/Navbar';
import RoutesConfig from '../routes/RoutesConfig';
import { AuthContext } from '../context/AuthContext';

const MainLayout: React.FC = () => {
    const { isAuthenticated, checkAuth } = useContext(AuthContext) || { isAuthenticated: false, checkAuth: () => {} };
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log('Checking authentication...'); // Debug log
            try {
                await checkAuth();
            } catch (error) {
                console.error('Authentication check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [checkAuth]);

    console.log('isAuthenticated:', isAuthenticated); // Debug log

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