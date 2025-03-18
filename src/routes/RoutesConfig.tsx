import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/login/LoginPage';
import SignUp from '../pages/login/SignUpPage';
import Verify from '../pages/login/VerifyEmailPage';
import Forgot from '../pages/login/ForgotPasswordPage';
import Dashboard from '../pages/basic/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Profile from '../components/Profile';
import Hobbies from '../components/Hobbies';
import Specialities from '../components/Specialities';
import Education from '../components/Education'; // Import the Education component
import SocialNetworks from '../components/SocialNetworks'; // Import the SocialNetworks component

const RoutesConfig: React.FC = () => (
    <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute element={<Login />} />} />
            <Route path="/signUp" element={<PublicRoute element={<SignUp />} />} />
            <Route path="/verify" element={<PublicRoute element={<Verify />} />} />
            <Route path="/forgotPassword" element={<PublicRoute element={<Forgot />} />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/hobbies" element={<ProtectedRoute element={<Hobbies />} />} />
            <Route path="/specialities" element={<ProtectedRoute element={<Specialities />} />} />
            <Route path="/update-education" element={<ProtectedRoute element={<Education />} />} />
            <Route path="/social-networks" element={<ProtectedRoute element={<SocialNetworks />} />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

export default RoutesConfig;