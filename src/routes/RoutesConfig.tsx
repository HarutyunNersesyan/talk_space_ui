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
import Chat from "../components/Chat";
import NetworkPage from "../components/NetworkPage";
import SearchByHobbies from "../components/SearchByHobbies";
import SearchBySpecialities from "../components/SearchBySpecialities";
import AdminDashboard from "../pages/basic/AdminDashboard";
import FeedBacks from "../components/Feedbacks";
import Users from "../components/Users";
import ViewChats from "../components/ViewChats";
import Delete from "../components/Delete";


const RoutesConfig: React.FC = () => (
    <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<PublicRoute element={<Login/>}/>}/>
        <Route path="/signUp" element={<PublicRoute element={<SignUp/>}/>}/>
        <Route path="/verify" element={<PublicRoute element={<Verify/>}/>}/>
        <Route path="/forgot-password" element={<PublicRoute element={<Forgot/>}/>}/>

        {/* Main App Routes */}
        <Route path="/home" element={<ProtectedRoute element={<Dashboard/>}/>}/>
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard/>}/>}/>


        {/* Profile Management Routes */}
        <Route path="/profile" element={<ProtectedRoute element={<Profile/>}/>}/>
        <Route path="/edit" element={<ProtectedRoute element={<Edit/>}/>}/>
        <Route path="/image" element={<ProtectedRoute element={<Image/>}/>}/>
        <Route path="/changePassword" element={<ProtectedRoute element={<ChangePassword/>}/>}/>
        <Route path="/delete" element={<ProtectedRoute element={<Delete/>}/>}/>


        {/* Interest Routes */}
        <Route path="/hobbies" element={<ProtectedRoute element={<Hobbies/>}/>}/>
        <Route path="/specialities" element={<ProtectedRoute element={<Specialities/>}/>}/>
        <Route path="/social-networks" element={<ProtectedRoute element={<SocialNetworks/>}/>}/>
        <Route path="/choose" element={<ProtectedRoute element={<NetworkPage/>}/>}/>

        <Route path="/feedbacks" element={<ProtectedRoute element={<FeedBacks/>}/>}/>
        <Route path="/users" element={<ProtectedRoute element={<Users/>}/>}/>

        <Route path="/view" element={<ProtectedRoute element={<ViewChats/>}/>}/>


        {/* Discovery Routes */}
        {/*<Route path="/search" element={<ProtectedRoute element={<Search/>}/>}/>*/}
        <Route path="/SearchByHobbies" element={<ProtectedRoute element={<SearchByHobbies/>}/>}/>
        <Route path="/searchBySpecialities" element={<ProtectedRoute element={<SearchBySpecialities/>}/>}/>


        {/* Chat Route */}
        <Route path="/chat/:userName" element={<ProtectedRoute element={<Chat/>}/>}/>


        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>

    </Routes>
);

export default RoutesConfig;