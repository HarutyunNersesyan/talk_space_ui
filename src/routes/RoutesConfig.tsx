import React from 'react';
import {Route, Routes, Navigate} from 'react-router-dom';
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
import SocialNetworks from '../components/SocialNetworks';
import Image from '../components/Image';
import Edit from "../components/Edit";
import ChangePassword from "../components/ChangePassword";
import Search from "../components/Search";
import Chat from "../components/Chat";
import NetworkPage from "../components/NetworkPage";
import SearchByHobbies from "../components/SearchByHobbies";
import SearchBySpecialities from "../components/SearchBySpecialities";


const RoutesConfig: React.FC = () => (
    <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<PublicRoute element={<Login/>}/>}/>
        <Route path="/signUp" element={<PublicRoute element={<SignUp/>}/>}/>
        <Route path="/verify" element={<PublicRoute element={<Verify/>}/>}/>
        <Route path="/forgotPassword" element={<PublicRoute element={<Forgot/>}/>}/>

        {/* Main App Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard/>}/>}/>

        {/* Profile Management Routes */}
        <Route path="/profile" element={<ProtectedRoute element={<Profile/>}/>}/>
        <Route path="/edit" element={<ProtectedRoute element={<Edit/>}/>}/>
        <Route path="/image" element={<ProtectedRoute element={<Image/>}/>}/>
        <Route path="/changePassword" element={<ProtectedRoute element={<ChangePassword/>}/>}/>

        {/* Interest Routes */}
        <Route path="/hobbies" element={<ProtectedRoute element={<Hobbies/>}/>}/>
        <Route path="/specialities" element={<ProtectedRoute element={<Specialities/>}/>}/>
        <Route path="/social-networks" element={<ProtectedRoute element={<SocialNetworks/>}/>}/>
        <Route path="/choose" element={<ProtectedRoute element={<NetworkPage/>}/>}/>
        {/* Discovery Routes */}
        <Route path="/search" element={<ProtectedRoute element={<Search/>}/>}/>
        <Route path="/SearchByHobbies" element={<ProtectedRoute element={<SearchByHobbies/>}/>}/>
        <Route path="/searchBySpecialities" element={<ProtectedRoute element={<SearchBySpecialities/>}/>}/>


        {/* Chat Route */}
        <Route path="/chat/:userName" element={<ProtectedRoute element={<Chat/>}/>}/>


        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>

    </Routes>
);

export default RoutesConfig;