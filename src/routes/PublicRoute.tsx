import React from 'react';

import {
    Navigate
} from 'react-router-dom';

import {
    getRoleFromToken
} from './ProtectedRoute';


/* =========================================================
   PROPS
   ========================================================= */

interface PublicRouteProps {
    element: React.ReactElement;
}


/* =========================================================
   CLEAR AUTH
   ========================================================= */

const clearAuthData = () => {

    localStorage.removeItem('token');

    localStorage.removeItem('userName');

    localStorage.removeItem('userRole');

    localStorage.removeItem('redirectPath');
};


/* =========================================================
   PUBLIC ROUTE
   ========================================================= */

const PublicRoute: React.FC<PublicRouteProps> = ({
                                                     element
                                                 }) => {

    const token =
        localStorage.getItem('token');


    /* =====================================================
       NO TOKEN
       ===================================================== */

    if (!token) {

        return element;
    }


    /* =====================================================
       ROLE DIRECTLY FROM JWT
       ===================================================== */

    const role =
        getRoleFromToken(token);


    /* =====================================================
       INVALID / EXPIRED TOKEN
       ===================================================== */

    if (!role) {

        clearAuthData();

        return element;
    }


    /* =====================================================
       ADMIN
       ===================================================== */

    if (role === 'ADMIN') {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }


    /* =====================================================
       USER
       ===================================================== */

    return (
        <Navigate
            to="/home"
            replace
        />
    );
};


export default PublicRoute;