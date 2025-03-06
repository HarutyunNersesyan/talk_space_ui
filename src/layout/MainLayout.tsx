import React, { useContext, useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/header/Navbar';
import RoutesConfig from '../routes/RoutesConfig';
import { AuthContext } from '../context/AuthContext';

const MainLayout: React.FC = () => {
    const { isAuthenticated, checkAuth } = useContext(AuthContext) || { isAuthenticated: false, checkAuth: () => {} };
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            checkAuth();
            setIsLoading(false);
        };
        initAuth();
    }, [checkAuth]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {isAuthenticated && <Sidebar />}
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
