import React from 'react';
import MainLayout from './layout/MainLayout';
import {AuthProvider} from "./context/AuthContext";

const App: React.FC = () => (
    <AuthProvider>
        <MainLayout />
    </AuthProvider>
);

export default App;
