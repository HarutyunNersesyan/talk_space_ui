import React, {
    useEffect,
    useState
} from 'react';

import {
    NavLink,
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import HomeRoundedIcon
    from '@mui/icons-material/HomeRounded';

import PersonRoundedIcon
    from '@mui/icons-material/PersonRounded';

import ExploreRoundedIcon
    from '@mui/icons-material/ExploreRounded';

import ChatBubbleRoundedIcon
    from '@mui/icons-material/ChatBubbleRounded';

import PeopleAltRoundedIcon
    from '@mui/icons-material/PeopleAltRounded';

import RateReviewRoundedIcon
    from '@mui/icons-material/RateReviewRounded';

import MenuRoundedIcon
    from '@mui/icons-material/MenuRounded';

import CloseRoundedIcon
    from '@mui/icons-material/CloseRounded';

import AdminPanelSettingsRoundedIcon
    from '@mui/icons-material/AdminPanelSettingsRounded';


import LogoutForm
    from '../Logout';

import {
    getRoleFromToken,
    UserRole
} from '../../routes/ProtectedRoute';

import './Navbar.css';


/* =========================================================
   API
   ========================================================= */

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


/* =========================================================
   TYPES
   ========================================================= */

interface DecodedToken {
    sub: string;
}


/* =========================================================
   NAVBAR
   ========================================================= */

const Navbar: React.FC = () => {

    const navigate =
        useNavigate();


    const [
        role,
        setRole
    ] = useState<UserRole | null>(null);


    const [
        userName,
        setUserName
    ] = useState<string>('');


    const [
        loading,
        setLoading
    ] = useState<boolean>(true);


    const [
        mobileOpen,
        setMobileOpen
    ] = useState<boolean>(false);


    /* =====================================================
       LOAD ROLE FROM JWT
       ===================================================== */

    useEffect(() => {

        const loadNavbar =
            async () => {

                const token =
                    localStorage.getItem('token');


                if (!token) {

                    setRole(null);

                    setLoading(false);

                    return;
                }


                /* =========================================
                   ROLE COMES DIRECTLY FROM JWT
                   ========================================= */

                const tokenRole =
                    getRoleFromToken(token);


                if (!tokenRole) {

                    localStorage.removeItem('token');

                    localStorage.removeItem('userName');

                    localStorage.removeItem('userRole');


                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );


                    return;
                }


                setRole(tokenRole);


                /* =========================================
                   ADMIN
                   ========================================= */

                if (tokenRole === 'ADMIN') {

                    setUserName('Administrator');

                    setLoading(false);

                    return;
                }


                /* =========================================
                   USER
                   ========================================= */

                try {

                    /*
                     * JWT sub = email
                     */

                    const payload =
                        JSON.parse(
                            atob(
                                token
                                    .split('.')[1]
                                    .replace(/-/g, '+')
                                    .replace(/_/g, '/')
                            )
                        ) as DecodedToken;


                    const response =
                        await axios.get<string>(
                            `${API_URL}/api/public/user/get/userName/${payload.sub}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setUserName(
                        response.data
                    );


                    localStorage.setItem(
                        'userName',
                        response.data
                    );


                } catch (error) {

                    console.error(
                        'Unable to load username:',
                        error
                    );


                    /*
                     * Username request failure should not
                     * turn USER into ADMIN.
                     */
                    setUserName(
                        localStorage.getItem('userName') ||
                        'TalkSpace User'
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadNavbar();

    }, [navigate]);


    /* =====================================================
       CLOSE MOBILE MENU
       ===================================================== */

    const closeMobileMenu = () => {

        setMobileOpen(false);
    };


    /* =====================================================
       HOME BY ROLE
       ===================================================== */

    const handleBrandClick = () => {

        closeMobileMenu();


        if (role === 'ADMIN') {

            navigate('/admin');

            return;
        }


        navigate('/home');
    };


    /* =====================================================
       CHAT
       ===================================================== */

    const getChatPath = () => {

        if (!userName) {
            return '/home';
        }


        return `/chat/${encodeURIComponent(userName)}`;
    };


    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {

        return (

            <aside className="navbar navbar-loading-state">

                <div className="navbar-brand">

                    <div className="navbar-logo">
                        TS
                    </div>

                    <div className="navbar-brand-text">

                        <strong>
                            TalkSpace
                        </strong>

                        <span>
                            Loading...
                        </span>

                    </div>

                </div>

            </aside>
        );
    }


    /* =====================================================
       NAV LINK HELPER
       ===================================================== */

    const navClassName = ({
                              isActive
                          }: {
        isActive: boolean;
    }) => {

        return isActive
            ? 'navbar-link active'
            : 'navbar-link';
    };


    /* =====================================================
       NAVIGATION CONTENT
       ===================================================== */

    const navigationContent = (

        <>

            <div className="navbar-menu-label">
                MENU
            </div>


            {/* =============================================
                USER NAVIGATION
                ============================================= */}

            {role === 'USER' && (

                <div className="navbar-links">

                    <NavLink
                        to="/home"
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <HomeRoundedIcon />
                        </span>

                        <span>
                            Home
                        </span>

                    </NavLink>


                    <NavLink
                        to="/profile"
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <PersonRoundedIcon />
                        </span>

                        <span>
                            Profile
                        </span>

                    </NavLink>


                    <NavLink
                        to="/choose"
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <ExploreRoundedIcon />
                        </span>

                        <span>
                            Discover
                        </span>

                    </NavLink>


                    <NavLink
                        to={getChatPath()}
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <ChatBubbleRoundedIcon />
                        </span>

                        <span>
                            Messages
                        </span>

                    </NavLink>

                </div>

            )}


            {/* =============================================
                ADMIN NAVIGATION
                ============================================= */}

            {role === 'ADMIN' && (

                <div className="navbar-links">

                    <NavLink
                        to="/admin"
                        end
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <HomeRoundedIcon />
                        </span>

                        <span>
                            Home
                        </span>

                    </NavLink>


                    <NavLink
                        to="/users"
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <PeopleAltRoundedIcon />
                        </span>

                        <span>
                            Users
                        </span>

                    </NavLink>


                    <NavLink
                        to="/feedbacks"
                        className={navClassName}
                        onClick={closeMobileMenu}
                    >

                        <span className="navbar-link-icon">
                            <RateReviewRoundedIcon />
                        </span>

                        <span>
                            Feedbacks
                        </span>

                    </NavLink>

                </div>

            )}

        </>
    );


    /* =====================================================
       UI
       ===================================================== */

    return (

        <>

            {/* =================================================
                DESKTOP SIDEBAR
                ================================================= */}

            <aside className="navbar navbar-desktop">

                {/* BRAND */}

                <button
                    type="button"
                    className="navbar-brand"
                    onClick={handleBrandClick}
                >

                    <div className="navbar-logo">
                        TS
                    </div>


                    <div className="navbar-brand-text">

                        <strong>
                            TalkSpace
                        </strong>

                        <span>
                            Connect. Discover. Talk.
                        </span>

                    </div>

                </button>


                <div className="navbar-divider" />


                {/* NAVIGATION */}

                <div className="navbar-navigation">

                    {navigationContent}

                </div>


                {/* BOTTOM */}

                <div className="navbar-bottom">

                    <div className="navbar-user-card">

                        <div className="navbar-user-avatar">

                            {role === 'ADMIN' ? (

                                <AdminPanelSettingsRoundedIcon />

                            ) : (

                                userName
                                    .charAt(0)
                                    .toUpperCase() || 'U'

                            )}

                        </div>


                        <div className="navbar-user-info">

                            <strong>

                                {role === 'ADMIN'
                                    ? 'Administrator'
                                    : userName
                                }

                            </strong>


                            <span>

                                {role === 'ADMIN'
                                    ? 'Admin account'
                                    : 'TalkSpace member'
                                }

                            </span>

                        </div>

                    </div>


                    <LogoutForm />

                </div>

            </aside>


            {/* =================================================
                MOBILE HEADER
                ================================================= */}

            <header className="navbar-mobile">

                <button
                    type="button"
                    className="navbar-mobile-brand"
                    onClick={handleBrandClick}
                >

                    <div className="navbar-logo">
                        TS
                    </div>


                    <strong>
                        TalkSpace
                    </strong>

                </button>


                <button
                    type="button"
                    className="navbar-mobile-menu-button"
                    onClick={() =>
                        setMobileOpen(
                            current => !current
                        )
                    }
                    aria-label="Toggle menu"
                >

                    {mobileOpen ? (
                        <CloseRoundedIcon />
                    ) : (
                        <MenuRoundedIcon />
                    )}

                </button>

            </header>


            {/* =================================================
                MOBILE MENU
                ================================================= */}

            {mobileOpen && (

                <div className="navbar-mobile-panel">

                    <div className="navbar-mobile-navigation">

                        {navigationContent}

                    </div>


                    <div className="navbar-mobile-bottom">

                        <div className="navbar-user-card">

                            <div className="navbar-user-avatar">

                                {role === 'ADMIN' ? (

                                    <AdminPanelSettingsRoundedIcon />

                                ) : (

                                    userName
                                        .charAt(0)
                                        .toUpperCase() || 'U'

                                )}

                            </div>


                            <div className="navbar-user-info">

                                <strong>

                                    {role === 'ADMIN'
                                        ? 'Administrator'
                                        : userName
                                    }

                                </strong>


                                <span>

                                    {role === 'ADMIN'
                                        ? 'Admin account'
                                        : 'TalkSpace member'
                                    }

                                </span>

                            </div>

                        </div>


                        <LogoutForm />

                    </div>

                </div>

            )}

        </>
    );
};


export default Navbar;