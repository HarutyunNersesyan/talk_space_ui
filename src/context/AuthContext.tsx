import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import {
    jwtDecode
} from 'jwt-decode';

import {
    getRoleFromToken,
    UserRole
} from '../routes/ProtectedRoute';


/* =========================================================
   TYPES
   ========================================================= */

interface DecodedToken {
    sub: string;
    exp?: number;
}


export interface AuthContextType {

    isAuthenticated: boolean;

    userName: string | null;

    userRole: UserRole | null;

    checkAuth: () => void;

    setUser: (
        userName: string | null,
        userRole?: UserRole | null
    ) => void;

    redirectToSignUp: () => void;

    redirectToForgotPassword: () => void;

    logout: () => void;
}


/* =========================================================
   CONTEXT
   ========================================================= */

const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );


/* =========================================================
   PROVIDER
   ========================================================= */

const AuthProvider: React.FC<{
    children: ReactNode;
}> = ({
          children
      }) => {

    const navigate =
        useNavigate();


    const [
        isAuthenticated,
        setIsAuthenticated
    ] = useState<boolean>(false);


    const [
        userName,
        setUserName
    ] = useState<string | null>(null);


    const [
        userRole,
        setUserRole
    ] = useState<UserRole | null>(null);


    /* =====================================================
       CLEAR AUTH
       ===================================================== */

    const clearAuthData =
        useCallback(() => {

            localStorage.removeItem(
                'token'
            );

            localStorage.removeItem(
                'userName'
            );

            localStorage.removeItem(
                'userRole'
            );

            localStorage.removeItem(
                'redirectPath'
            );


            setIsAuthenticated(false);

            setUserName(null);

            setUserRole(null);

        }, []);


    /* =====================================================
       CHECK AUTH
       ===================================================== */

    const checkAuth =
        useCallback(() => {

            const token =
                localStorage.getItem('token');


            if (!token) {

                setIsAuthenticated(false);

                setUserName(null);

                setUserRole(null);

                return;
            }


            try {

                /*
                 * IMPORTANT
                 *
                 * Role-ը վերցնում ենք միայն JWT-ից։
                 */
                const role =
                    getRoleFromToken(token);


                if (!role) {

                    clearAuthData();

                    return;
                }


                const decoded =
                    jwtDecode<DecodedToken>(
                        token
                    );


                /* =========================================
                   TOKEN EXPIRATION
                   ========================================= */

                if (
                    decoded.exp &&
                    decoded.exp <= Date.now() / 1000
                ) {

                    clearAuthData();

                    return;
                }


                /* =========================================
                   AUTHENTICATED
                   ========================================= */

                setIsAuthenticated(true);

                setUserRole(role);


                /*
                 * userRole-ը localStorage-ում պահվում է
                 * միայն UI state-ի համար։
                 *
                 * Authorization-ի համար չենք վստահում դրան։
                 */
                localStorage.setItem(
                    'userRole',
                    role
                );


                const storedUserName =
                    localStorage.getItem(
                        'userName'
                    );


                /*
                 * USER-ի իրական username-ը Navbar/Profile-ը
                 * backend-ից կարող են ստանալ։
                 *
                 * Եթե դեռ չունենք՝ ժամանակավորապես JWT sub։
                 */
                setUserName(
                    storedUserName ||
                    decoded.sub
                );


            } catch (error) {

                console.error(
                    'Authentication check failed:',
                    error
                );


                clearAuthData();
            }

        }, [clearAuthData]);


    /* =====================================================
       SET USER
       ===================================================== */

    const setUser =
        useCallback((
            newUserName: string | null,
            newUserRole?: UserRole | null
        ) => {

            if (newUserName) {

                localStorage.setItem(
                    'userName',
                    newUserName
                );

                setUserName(
                    newUserName
                );

            } else {

                localStorage.removeItem(
                    'userName'
                );

                setUserName(null);
            }


            /*
             * LoginForm-ից եկող role-ը արդեն JWT-ից է
             * ստացված։
             */
            if (newUserRole) {

                localStorage.setItem(
                    'userRole',
                    newUserRole
                );

                setUserRole(
                    newUserRole
                );
            }


            setIsAuthenticated(
                Boolean(newUserName)
            );

        }, []);


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logout =
        useCallback(() => {

            clearAuthData();


            navigate(
                '/login',
                {
                    replace: true
                }
            );

        }, [
            clearAuthData,
            navigate
        ]);


    /* =====================================================
       SIGN UP
       ===================================================== */

    const redirectToSignUp =
        useCallback(() => {

            navigate(
                '/signUp'
            );

        }, [navigate]);


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    const redirectToForgotPassword =
        useCallback(() => {

            navigate(
                '/forgot-password'
            );

        }, [navigate]);


    /* =====================================================
       INITIAL TOKEN CHECK
       ===================================================== */

    useEffect(() => {

        checkAuth();

    }, [checkAuth]);


    /* =====================================================
       PROVIDER
       ===================================================== */

    return (

        <AuthContext.Provider
            value={{
                isAuthenticated,

                userName,

                userRole,

                checkAuth,

                setUser,

                redirectToSignUp,

                redirectToForgotPassword,

                logout
            }}
        >

            {children}

        </AuthContext.Provider>
    );
};


export {
    AuthProvider,
    AuthContext
};