import React, {
    FormEvent,
    useContext,
    useState
} from 'react';

import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { AuthContext } from '../../context/AuthContext';

import {
    getRoleFromToken
} from '../../routes/ProtectedRoute';

import './LoginForm.css';


/* =========================================================
   API
   ========================================================= */

const apiUrl =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


/* =========================================================
   COMPONENT
   ========================================================= */

const LoginForm: React.FC = () => {

    const [email, setEmail] =
        useState<string>('');

    const [password, setPassword] =
        useState<string>('');

    const [showPassword, setShowPassword] =
        useState<boolean>(false);

    const [error, setError] =
        useState<string>('');

    const [isSubmitting, setIsSubmitting] =
        useState<boolean>(false);


    const navigate = useNavigate();

    const authContext =
        useContext(AuthContext);


    /* =====================================================
       LOGIN
       ===================================================== */

    const handleLogin = async (
        e: FormEvent
    ) => {

        e.preventDefault();


        if (isSubmitting) {
            return;
        }


        setError('');

        setIsSubmitting(true);


        try {

            /* =============================================
               AUTH REQUEST
               ============================================= */

            const response =
                await axios.post(
                    `${apiUrl}/account/auth`,
                    {
                        email: email.trim(),
                        password
                    }
                );


            /* =============================================
               RATE LIMIT
               ============================================= */

            if (response.status === 429) {

                localStorage.removeItem(
                    'token'
                );

                localStorage.removeItem(
                    'userName'
                );

                localStorage.removeItem(
                    'userRole'
                );


                setError(
                    'Your IP address has been blocked for security reasons due to a suspected DDoS attack.'
                );


                return;
            }


            /* =============================================
               SUCCESS
               ============================================= */

            if (response.status === 200) {

                const token =
                    response.data?.token;


                /* =========================================
                   TOKEN CHECK
                   ========================================= */

                if (!token) {

                    setError(
                        'Authentication token was not received.'
                    );

                    return;
                }


                /* =========================================
                   ROLE FROM JWT
                   ========================================= */

                const userRole =
                    getRoleFromToken(token);


                if (!userRole) {

                    localStorage.removeItem(
                        'token'
                    );

                    localStorage.removeItem(
                        'userName'
                    );

                    localStorage.removeItem(
                        'userRole'
                    );


                    setError(
                        'Invalid or expired authentication token.'
                    );


                    return;
                }


                /* =========================================
                   SAVE TOKEN
                   ========================================= */

                localStorage.setItem(
                    'token',
                    token
                );


                /*
                 * Սա UI/context-ի համար է։
                 *
                 * Route authorization-ը role-ը
                 * կրկին JWT-ից է կարդում։
                 */

                localStorage.setItem(
                    'userRole',
                    userRole
                );


                /* =========================================
                   AUTH CONTEXT
                   ========================================= */

                if (authContext) {

                    authContext.setUser(
                        email.trim(),
                        userRole
                    );


                    authContext.checkAuth();
                }


                /* =========================================
                   NAVIGATION BY JWT ROLE
                   ========================================= */

                if (userRole === 'ADMIN') {

                    navigate(
                        '/admin',
                        {
                            replace: true
                        }
                    );


                    return;
                }


                if (userRole === 'USER') {

                    navigate(
                        '/home',
                        {
                            replace: true
                        }
                    );


                    return;
                }
            }


        } catch (err: unknown) {

            const loginError =
                err as AxiosError;


            console.error(
                'Login error:',
                loginError
            );


            /* =============================================
               RATE LIMIT
               ============================================= */

            if (
                loginError.response?.status === 429
            ) {

                localStorage.removeItem(
                    'token'
                );

                localStorage.removeItem(
                    'userName'
                );

                localStorage.removeItem(
                    'userRole'
                );


                setError(
                    'Your IP address has been blocked for security reasons due to a suspected DDoS attack.'
                );


                return;
            }


            /* =============================================
               WRONG CREDENTIALS
               ============================================= */

            if (
                loginError.response?.status === 403
            ) {

                const serverMessage =
                    loginError.response.data;


                if (
                    typeof serverMessage === 'string' &&
                    serverMessage.trim()
                ) {

                    setError(
                        serverMessage
                    );

                } else {

                    setError(
                        'Wrong email or password'
                    );
                }


                return;
            }


            /* =============================================
               OTHER ERROR
               ============================================= */

            setError(
                'Wrong email or password'
            );


        } finally {

            setIsSubmitting(false);
        }
    };


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    const handleForgotPassword = () => {

        navigate(
            '/forgot-password'
        );
    };


    /* =====================================================
       SIGN UP
       ===================================================== */

    const handleSignUp = () => {

        if (
            authContext?.redirectToSignUp
        ) {

            authContext.redirectToSignUp();

        } else {

            navigate(
                '/signUp'
            );
        }
    };


    /* =====================================================
       UI
       ===================================================== */

    return (

        <div className="login-page">


            {/* =================================================
                LEFT SIDE
                ================================================= */}

            <section className="login-brand-section">


                {/* BACKGROUND DECORATIONS */}

                <div
                    className="
                        login-background-decoration
                        login-decoration-one
                    "
                />

                <div
                    className="
                        login-background-decoration
                        login-decoration-two
                    "
                />

                <div
                    className="
                        login-background-decoration
                        login-decoration-three
                    "
                />


                <div className="login-brand-content">


                    {/* BRAND */}

                    <button
                        type="button"
                        className="login-brand"

                        onClick={() =>
                            navigate('/')
                        }
                    >

                        <span className="login-brand-icon">
                            TS
                        </span>


                        <span className="login-brand-name">
                            TalkSpace
                        </span>

                    </button>


                    {/* =================================================
                        HERO
                        ================================================= */}

                    <div className="login-hero">


                        <div className="login-hero-badge">

                            <AutoAwesomeRoundedIcon />


                            <span>
                                Your space to connect
                            </span>

                        </div>


                        <h1>

                            Conversations that

                            <span>
                                {' '}bring people closer.
                            </span>

                        </h1>


                        <p>

                            Discover new people, build meaningful
                            connections and keep every conversation
                            in one beautiful space.

                        </p>


                        {/* =================================================
                            FEATURES
                            ================================================= */}

                        <div className="login-features">


                            {/* DISCOVER */}

                            <div className="login-feature">

                                <div className="login-feature-icon">

                                    <PeopleAltRoundedIcon />

                                </div>


                                <div>

                                    <strong>
                                        Discover people
                                    </strong>


                                    <span>

                                        Find people with similar
                                        interests.

                                    </span>

                                </div>

                            </div>


                            {/* CHAT */}

                            <div className="login-feature">

                                <div className="login-feature-icon">

                                    <ForumRoundedIcon />

                                </div>


                                <div>

                                    <strong>
                                        Real-time conversations
                                    </strong>


                                    <span>

                                        Stay connected through
                                        instant messaging.

                                    </span>

                                </div>

                            </div>


                            {/* SECURITY */}

                            <div className="login-feature">

                                <div className="login-feature-icon">

                                    <SecurityRoundedIcon />

                                </div>


                                <div>

                                    <strong>
                                        Your private space
                                    </strong>


                                    <span>

                                        Your account and conversations
                                        stay protected.

                                    </span>

                                </div>

                            </div>


                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="login-brand-footer">

                        TalkSpace © {new Date().getFullYear()}

                    </div>


                </div>

            </section>


            {/* =================================================
                LOGIN SIDE
                ================================================= */}

            <section className="login-form-section">


                {/* MOBILE BRAND */}

                <div className="login-mobile-brand">

                    <span className="login-mobile-logo">
                        TS
                    </span>


                    <span>
                        TalkSpace
                    </span>

                </div>


                {/* =================================================
                    LOGIN FORM WRAPPER
                    ================================================= */}

                <div className="login-form-wrapper">


                    {/* HEADING */}

                    <div className="login-form-heading">


                        <span className="login-welcome">
                            Welcome back
                        </span>


                        <h2>
                            Sign in to TalkSpace
                        </h2>


                        <p>
                            Enter your account details to continue.
                        </p>


                    </div>


                    {/* =================================================
                        FORM
                        ================================================= */}

                    <form
                        className="modern-login-form"
                        onSubmit={handleLogin}
                    >


                        {/* =================================================
                            EMAIL
                            ================================================= */}

                        <div className="login-field">


                            <label htmlFor="login-email">
                                Email address
                            </label>


                            <div className="login-input-wrapper">


                                <EmailRoundedIcon
                                    className="login-input-icon"
                                />


                                <input
                                    id="login-email"

                                    type="email"

                                    value={email}

                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }

                                    placeholder="name@example.com"

                                    autoComplete="email"

                                    required
                                />


                            </div>

                        </div>


                        {/* =================================================
                            PASSWORD
                            ================================================= */}

                        <div className="login-field">


                            <div className="password-label-row">


                                <label htmlFor="login-password">
                                    Password
                                </label>


                                <button
                                    type="button"

                                    className="forgot-password-button"

                                    onClick={
                                        handleForgotPassword
                                    }
                                >

                                    Forgot password?

                                </button>


                            </div>


                            <div className="login-input-wrapper">


                                <LockRoundedIcon
                                    className="login-input-icon"
                                />


                                <input
                                    id="login-password"

                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }

                                    value={password}

                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }

                                    placeholder="Enter your password"

                                    autoComplete="current-password"

                                    required
                                />


                                <button
                                    type="button"

                                    className="password-toggle-button"

                                    onClick={() =>
                                        setShowPassword(
                                            previous =>
                                                !previous
                                        )
                                    }

                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >

                                    {showPassword ? (

                                        <VisibilityOffRoundedIcon />

                                    ) : (

                                        <VisibilityRoundedIcon />

                                    )}

                                </button>


                            </div>

                        </div>


                        {/* =================================================
                            ERROR
                            ================================================= */}

                        {error && (

                            <div
                                className="login-error-message"
                                role="alert"
                            >

                                <span className="error-dot" />


                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        {/* =================================================
                            SUBMIT
                            ================================================= */}

                        <button
                            type="submit"

                            className="login-submit-button"

                            disabled={
                                isSubmitting
                            }
                        >

                            {isSubmitting ? (

                                <>

                                    <span className="login-spinner" />

                                    Signing in...

                                </>

                            ) : (

                                <>

                                    <span>
                                        Sign in
                                    </span>

                                    <ArrowForwardRoundedIcon />

                                </>

                            )}

                        </button>


                    </form>


                    {/* =================================================
                        SIGN UP
                        ================================================= */}

                    <div className="login-signup">


                        <span>
                            Don't have an account?
                        </span>


                        <button
                            type="button"

                            onClick={
                                handleSignUp
                            }
                        >

                            Create account

                        </button>


                    </div>


                </div>


                {/* =================================================
                    RIGHT SIDE FOOTER
                    ================================================= */}

                <div className="login-form-footer">


                    <span>
                        TalkSpace
                    </span>


                    <span className="footer-dot">
                        •
                    </span>


                    <span>
                        Connect. Discover. Talk.
                    </span>


                </div>


            </section>


        </div>
    );
};


export default LoginForm;