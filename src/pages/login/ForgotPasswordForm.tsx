import React, {
    FormEvent,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import './ForgotPasswordForm.css';

const apiUrl =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';

const ForgotPasswordForm: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState<string>('');

    const [error, setError] =
        useState<string>('');

    const [isLoading, setIsLoading] =
        useState<boolean>(false);

    const handleForgotPassword = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        setError('');
        setIsLoading(true);

        try {
            const response = await axios.put(
                `${apiUrl}/api/public/user/forgotPassword`,
                {
                    email
                }
            );

            if (response.status === 200) {
                navigate(
                    '/login',
                    {
                        state: {
                            message:
                                'A new password has been sent to your email.'
                        }
                    }
                );
            }

        } catch (err: any) {

            if (err.response) {

                setError(
                    err.response.status === 500
                        ? 'No account found with this email address.'
                        : err.response.data ||
                        'Failed to reset password. Please try again.'
                );

            } else if (err.request) {

                setError(
                    'No response from the server. Please check your connection and try again.'
                );

            } else {

                setError(
                    'An unexpected error occurred. Please try again.'
                );

            }

        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="forgot-page">

            {/* =============================================
                BACKGROUND
               ============================================= */}

            <div className="forgot-shape forgot-shape-one" />
            <div className="forgot-shape forgot-shape-two" />
            <div className="forgot-shape forgot-shape-three" />


            {/* =============================================
                HEADER
               ============================================= */}

            <header className="forgot-header">

                <button
                    type="button"
                    className="forgot-logo"
                    onClick={handleBackToLogin}
                >

                    <span className="forgot-logo-icon">
                        TS
                    </span>

                    <span className="forgot-logo-name">
                        TalkSpace
                    </span>

                </button>

            </header>


            {/* =============================================
                MAIN
               ============================================= */}

            <main className="forgot-main">

                <div className="forgot-card">

                    {/* Icon */}

                    <div className="forgot-icon-container">

                        <div className="forgot-main-icon">
                            <LockResetRoundedIcon />
                        </div>

                        <div className="forgot-email-badge">
                            <MarkEmailReadRoundedIcon />
                        </div>

                    </div>


                    {/* Heading */}

                    <div className="forgot-heading">

                        <span className="forgot-label">
                            PASSWORD RECOVERY
                        </span>

                        <h1>
                            Forgot your password?
                        </h1>

                        <p>
                            No worries. Enter the email address
                            associated with your TalkSpace account
                            and we'll send you a new password.
                        </p>

                    </div>


                    {/* =====================================
                        FORM
                       ===================================== */}

                    <form
                        className="forgot-form"
                        onSubmit={handleForgotPassword}
                    >

                        <div className="forgot-field">

                            <label htmlFor="forgot-email">
                                Email address
                            </label>

                            <div className="forgot-input-wrapper">

                                <EmailRoundedIcon
                                    className="forgot-input-icon"
                                />

                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(
                                            event.target.value
                                        );

                                        if (error) {
                                            setError('');
                                        }
                                    }}
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* Error */}

                        {error && (
                            <div
                                className="forgot-error"
                                role="alert"
                            >

                                <span className="forgot-error-dot" />

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        {/* Submit */}

                        <button
                            type="submit"
                            className="forgot-submit-button"
                            disabled={
                                isLoading ||
                                !email.trim()
                            }
                        >

                            {isLoading ? (
                                <>
                                    <span className="forgot-spinner" />

                                    <span>
                                        Sending...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <SendRoundedIcon />

                                    <span>
                                        Send new password
                                    </span>
                                </>
                            )}

                        </button>


                        {/* Back */}

                        <button
                            type="button"
                            className="forgot-back-button"
                            onClick={handleBackToLogin}
                            disabled={isLoading}
                        >

                            <ArrowBackRoundedIcon />

                            <span>
                                Back to sign in
                            </span>

                        </button>

                    </form>


                    {/* =====================================
                        SECURITY INFORMATION
                       ===================================== */}

                    <div className="forgot-security">

                        <div className="forgot-security-icon">
                            <SecurityRoundedIcon />
                        </div>

                        <div>
                            <strong>
                                Secure password recovery
                            </strong>

                            <p>
                                Password recovery information
                                will only be sent to the email
                                connected to your account.
                            </p>
                        </div>

                    </div>

                </div>

            </main>


            {/* =============================================
                FOOTER
               ============================================= */}

            <footer className="forgot-footer">

                <span>
                    TalkSpace ©{' '}
                    {new Date().getFullYear()}
                </span>

                <span>
                    •
                </span>

                <span>
                    Connect. Discover. Talk.
                </span>

            </footer>

        </div>
    );
};

export default ForgotPasswordForm;