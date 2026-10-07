import React from 'react';

import {
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import ProtectedRoute, {
    getRoleFromToken
} from './ProtectedRoute';

import PublicRoute from './PublicRoute';


/* =========================================================
   AUTH PAGES
   ========================================================= */

import Login from '../pages/login/LoginPage';
import SignUp from '../pages/login/SignUpPage';
import Verify from '../pages/login/VerifyEmailPage';
import Forgot from '../pages/login/ForgotPasswordPage';


/* =========================================================
   USER PAGES
   ========================================================= */

import Dashboard from '../pages/basic/Dashboard';

import Profile from '../components/Profile';
import Edit from '../components/Edit';
import Image from '../components/Image';
import ChangePassword from '../components/ChangePassword';
import Delete from '../components/Delete';

import Hobbies from '../components/Hobbies';
import Specialities from '../components/Specialities';
import SocialNetworks from '../components/SocialNetworks';

import NetworkPage from '../components/NetworkPage';

import SearchByHobbies from '../components/SearchByHobbies';
import SearchBySpecialities from '../components/SearchBySpecialities';

import Chat from '../components/Chat';


/* =========================================================
   ADMIN PAGES
   ========================================================= */

import AdminDashboard from '../pages/basic/AdminDashboard';

import Users from '../components/Users';
import Feedbacks from '../components/Feedbacks';


/* =========================================================
   ROOT REDIRECT
   ========================================================= */

const RootRedirect: React.FC = () => {

    const token =
        localStorage.getItem('token');


    /* NO TOKEN */

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /* ROLE FROM JWT */

    const role =
        getRoleFromToken(token);


    /* INVALID / EXPIRED TOKEN */

    if (!role) {

        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('redirectPath');


        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /* ADMIN */

    if (role === 'ADMIN') {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }


    /* USER */

    return (
        <Navigate
            to="/home"
            replace
        />
    );
};


/* =========================================================
   ROUTES
   ========================================================= */

const RoutesConfig: React.FC = () => {

    return (

        <Routes>

            {/* =================================================
                ROOT
                ================================================= */}

            <Route
                path="/"
                element={
                    <RootRedirect />
                }
            />


            {/* =================================================
                PUBLIC ROUTES
                ================================================= */}

            <Route
                path="/login"
                element={
                    <PublicRoute
                        element={
                            <Login />
                        }
                    />
                }
            />


            <Route
                path="/signUp"
                element={
                    <PublicRoute
                        element={
                            <SignUp />
                        }
                    />
                }
            />


            <Route
                path="/verify"
                element={
                    <PublicRoute
                        element={
                            <Verify />
                        }
                    />
                }
            />


            <Route
                path="/forgot-password"
                element={
                    <PublicRoute
                        element={
                            <Forgot />
                        }
                    />
                }
            />


            {/* =================================================
                USER ONLY ROUTES
                ================================================= */}

            <Route
                path="/home"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Dashboard />
                        }
                    />
                }
            />


            <Route
                path="/profile"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Profile />
                        }
                    />
                }
            />


            <Route
                path="/edit"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Edit />
                        }
                    />
                }
            />


            <Route
                path="/image"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Image />
                        }
                    />
                }
            />


            <Route
                path="/changePassword"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <ChangePassword />
                        }
                    />
                }
            />


            <Route
                path="/delete"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Delete />
                        }
                    />
                }
            />


            <Route
                path="/hobbies"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Hobbies />
                        }
                    />
                }
            />


            <Route
                path="/specialities"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Specialities />
                        }
                    />
                }
            />


            <Route
                path="/social-networks"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <SocialNetworks />
                        }
                    />
                }
            />


            <Route
                path="/choose"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <NetworkPage />
                        }
                    />
                }
            />


            <Route
                path="/SearchByHobbies"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <SearchByHobbies />
                        }
                    />
                }
            />


            <Route
                path="/searchBySpecialities"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <SearchBySpecialities />
                        }
                    />
                }
            />


            <Route
                path="/chat/:userName"
                element={
                    <ProtectedRoute
                        allowedRoles={['USER']}
                        element={
                            <Chat />
                        }
                    />
                }
            />


            {/* =================================================
                ADMIN ONLY ROUTES
                ================================================= */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute
                        allowedRoles={['ADMIN']}
                        element={
                            <AdminDashboard />
                        }
                    />
                }
            />


            <Route
                path="/users"
                element={
                    <ProtectedRoute
                        allowedRoles={['ADMIN']}
                        element={
                            <Users />
                        }
                    />
                }
            />


            <Route
                path="/feedbacks"
                element={
                    <ProtectedRoute
                        allowedRoles={['ADMIN']}
                        element={
                            <Feedbacks />
                        }
                    />
                }
            />


            {/* =================================================
                UNKNOWN ROUTE
                ================================================= */}

            <Route
                path="*"
                element={
                    <RootRedirect />
                }
            />

        </Routes>
    );
};


export default RoutesConfig;