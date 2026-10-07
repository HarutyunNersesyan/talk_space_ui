import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


export type UserRole = 'USER' | 'ADMIN';


interface ProtectedRouteProps {
    element: React.ReactElement;
    allowedRoles?: UserRole[];
}


interface DecodedToken {
    sub: string;
    roles?: string[];
    exp?: number;
}


/* =========================================================
   GET ROLE DIRECTLY FROM JWT
   ========================================================= */

export const getRoleFromToken = (
    token: string
): UserRole | null => {

    try {

        const decoded =
            jwtDecode<DecodedToken>(token);


        /* TOKEN EXPIRATION */

        if (
            decoded.exp &&
            decoded.exp <= Date.now() / 1000
        ) {
            return null;
        }


        const roles =
            (decoded.roles || [])
                .map(role =>
                    String(role)
                        .toUpperCase()
                        .replace('ROLE_', '')
                );


        if (roles.includes('ADMIN')) {
            return 'ADMIN';
        }


        if (roles.includes('USER')) {
            return 'USER';
        }


        /*
         * Եթե backend-ը role չի վերադարձրել,
         * access չենք տալիս։
         */
        return null;

    } catch (error) {

        console.error(
            'Cannot decode JWT:',
            error
        );

        return null;
    }
};


/* =========================================================
   CLEAR AUTH
   ========================================================= */

const clearAuthentication = () => {

    localStorage.removeItem('token');

    localStorage.removeItem('userName');

    localStorage.removeItem('userRole');

    localStorage.removeItem('redirectPath');
};


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

const ProtectedRoute: React.FC<
    ProtectedRouteProps
    > = ({
             element,
             allowedRoles
         }) => {

    const token =
        localStorage.getItem('token');


    /* NOT LOGGED IN */

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /* GET ROLE FROM TOKEN */

    const role =
        getRoleFromToken(token);


    /* INVALID / EXPIRED TOKEN */

    if (!role) {

        clearAuthentication();


        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /* CHECK PAGE PERMISSION */

    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {

        /*
         * ADMIN attempted USER route
         */
        if (role === 'ADMIN') {

            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }


        /*
         * USER attempted ADMIN route
         */
        return (
            <Navigate
                to="/home"
                replace
            />
        );
    }


    return element;
};


export default ProtectedRoute;