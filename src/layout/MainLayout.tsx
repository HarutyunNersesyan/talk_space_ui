import React, {
    useContext,
    useEffect,
    useState
} from 'react';

import {
    Box,
    CircularProgress,
    CssBaseline,
    Typography
} from '@mui/material';

import {
    jwtDecode
} from 'jwt-decode';

import Navbar
    from '../components/header/Navbar';

import RoutesConfig
    from '../routes/RoutesConfig';

import {
    AuthContext
} from '../context/AuthContext';


/* =========================================================
   TOKEN TYPE
   ========================================================= */

interface DecodedToken {
    sub: string;
    roles?: string[];
}


/* =========================================================
   CONSTANTS
   ========================================================= */

const SIDEBAR_WIDTH = 270;


/* =========================================================
   MAIN LAYOUT
   ========================================================= */

const MainLayout: React.FC = () => {

    const authContext =
        useContext(AuthContext);


    const isAuthenticated =
        authContext?.isAuthenticated ??
        false;


    const checkAuth =
        authContext?.checkAuth;


    const [
        isLoading,
        setIsLoading
    ] = useState<boolean>(true);


    const [
        isAdmin,
        setIsAdmin
    ] = useState<boolean>(false);


    /* =====================================================
       AUTH INITIALIZATION
       ===================================================== */

    useEffect(() => {

        const initializeAuthentication =
            async () => {

                try {

                    if (checkAuth) {
                        await checkAuth();
                    }


                    const token =
                        localStorage.getItem(
                            'token'
                        );


                    if (!token) {

                        setIsAdmin(false);

                        return;
                    }


                    try {

                        const decoded =
                            jwtDecode<DecodedToken>(
                                token
                            );


                        const roles =
                            decoded.roles ?? [];


                        setIsAdmin(
                            roles.includes(
                                'ADMIN'
                            )
                        );

                    } catch (error) {

                        console.error(
                            'Failed to decode authentication token:',
                            error
                        );


                        setIsAdmin(false);
                    }

                } catch (error) {

                    console.error(
                        'Authentication check failed:',
                        error
                    );

                } finally {

                    setIsLoading(
                        false
                    );
                }
            };


        initializeAuthentication();

    }, [checkAuth]);


    /* =====================================================
       LOADING SCREEN
       ===================================================== */

    if (isLoading) {

        return (

            <Box
                sx={{
                    width: '100%',
                    minHeight: '100vh',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    position: 'relative',
                    overflow: 'hidden',

                    background:
                        `
                        radial-gradient(
                            circle at 15% 15%,
                            rgba(109, 93, 252, 0.12),
                            transparent 32%
                        ),
                        radial-gradient(
                            circle at 85% 85%,
                            rgba(139, 92, 246, 0.10),
                            transparent 30%
                        ),
                        linear-gradient(
                            135deg,
                            #f8f9ff 0%,
                            #ffffff 50%,
                            #f7f5ff 100%
                        )
                        `
                }}
            >

                {/* DECORATION */}

                <Box
                    sx={{
                        position: 'absolute',

                        width: 360,
                        height: 360,

                        borderRadius: '50%',

                        top: -160,
                        right: -100,

                        background:
                            'rgba(109, 93, 252, 0.06)',

                        filter:
                            'blur(4px)'
                    }}
                />


                <Box
                    sx={{
                        position: 'absolute',

                        width: 300,
                        height: 300,

                        borderRadius: '50%',

                        bottom: -150,
                        left: -100,

                        background:
                            'rgba(139, 92, 246, 0.06)',

                        filter:
                            'blur(4px)'
                    }}
                />


                {/* LOADING CONTENT */}

                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2,

                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',

                        gap: 2
                    }}
                >

                    {/* LOGO */}

                    <Box
                        sx={{
                            width: 64,
                            height: 64,

                            borderRadius:
                                '20px',

                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',

                            background:
                                'linear-gradient(135deg, #6d5dfc, #8b5cf6)',

                            boxShadow:
                                '0 16px 40px rgba(109, 93, 252, 0.28)'
                        }}
                    >

                        <Typography
                            sx={{
                                color: '#ffffff',

                                fontSize:
                                    '20px',

                                fontWeight:
                                    800,

                                letterSpacing:
                                    '-0.04em'
                            }}
                        >
                            TS
                        </Typography>

                    </Box>


                    <CircularProgress
                        size={28}
                        thickness={4}
                        sx={{
                            color:
                                '#6d5dfc'
                        }}
                    />


                    <Typography
                        sx={{
                            fontSize:
                                '13px',

                            fontWeight:
                                600,

                            color:
                                '#7b8198'
                        }}
                    >
                        Loading TalkSpace...
                    </Typography>

                </Box>

            </Box>
        );
    }


    /* =====================================================
       MAIN VIEW
       ===================================================== */

    return (

        <>

            <CssBaseline />


            <Box
                sx={{
                    width: '100%',
                    minHeight: '100vh',

                    position: 'relative',

                    overflowX: 'hidden',

                    background:
                        isAuthenticated
                            ? '#f7f8fc'
                            : '#ffffff'
                }}
            >

                {/* =========================================
                    AUTHENTICATED NAVBAR
                    ========================================= */}

                {isAuthenticated && (

                    <Navbar />

                )}


                {/* =========================================
                    BACKGROUND DECORATION
                    ========================================= */}

                {isAuthenticated && (

                    <>

                        <Box
                            aria-hidden="true"
                            sx={{
                                position:
                                    'fixed',

                                width:
                                    420,

                                height:
                                    420,

                                borderRadius:
                                    '50%',

                                top:
                                    -180,

                                right:
                                    -160,

                                zIndex:
                                    0,

                                pointerEvents:
                                    'none',

                                background:
                                    'rgba(109, 93, 252, 0.045)',

                                filter:
                                    'blur(2px)'
                            }}
                        />


                        <Box
                            aria-hidden="true"
                            sx={{
                                position:
                                    'fixed',

                                width:
                                    360,

                                height:
                                    360,

                                borderRadius:
                                    '50%',

                                bottom:
                                    -200,

                                left:
                                    180,

                                zIndex:
                                    0,

                                pointerEvents:
                                    'none',

                                background:
                                    'rgba(139, 92, 246, 0.04)'
                            }}
                        />

                    </>

                )}


                {/* =========================================
                    PAGE CONTENT
                    ========================================= */}

                <Box
                    component="main"

                    sx={{

                        position:
                            'relative',

                        zIndex:
                            1,

                        width:
                            isAuthenticated
                                ? {
                                    xs:
                                        '100%',

                                    md:
                                        `calc(100% - ${SIDEBAR_WIDTH}px)`
                                }
                                : '100%',


                        marginLeft:
                            isAuthenticated
                                ? {
                                    xs:
                                        0,

                                    md:
                                        `${SIDEBAR_WIDTH}px`
                                }
                                : 0,


                        minHeight:
                            '100vh',


                        /*
                         * Կարևոր է.
                         *
                         * Այստեղ padding չենք տալիս։
                         *
                         * Յուրաքանչյուր էջ արդեն ունի
                         * իր սեփական spacing-ը։
                         *
                         * Այդ պատճառով Login, Profile,
                         * Dashboard, Chat և մյուս էջերի
                         * դիզայնը չի խախտվի։
                         */
                        padding:
                            0,


                        transition:
                            `
                            width 0.25s ease,
                            margin-left 0.25s ease
                            `
                    }}
                >

                    <RoutesConfig />

                </Box>


                {/* =========================================
                    DEVELOPMENT ROLE MARKER
                    =========================================

                    isAdmin-ը պահում ենք այստեղ, որովհետև
                    MainLayout-ը ճանաչում է role-ը և այն
                    հետագայում կարող ենք օգտագործել
                    role-specific layout-ի համար։

                    Այս պահին UI-ում ոչինչ չենք ցուցադրում։
                    ========================================= */}

                {isAdmin && null}

            </Box>

        </>
    );
};


export default MainLayout;