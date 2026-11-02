import React from 'react';
import { NetworkProvider } from './features/network/NetworkContext';
import MainLayout from './layout/MainLayout';
import {AuthProvider} from "./context/AuthContext";

const App: React.FC = () => (
    <AuthProvider>
        <NetworkProvider>
            <MainLayout />
        </NetworkProvider>
    </AuthProvider>
);

export default App;
