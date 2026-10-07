import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import MaleRoundedIcon from '@mui/icons-material/MaleRounded';
import FemaleRoundedIcon from '@mui/icons-material/FemaleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

import './SignUpForm.css';

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm: React.FC = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('2000-01-01');
    const [gender, setGender] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();

        setError([]);
        setIsSubmitting(true);

        try {
            await axios.post(
                `${apiUrl}/api/public/user/signUp`,
                {
                    firstName,
                    lastName,
                    userName,
                    birthDate,
                    gender,
                    email,
                    password
                }
            );

            navigate('/verify', {
                state: {
                    email
                }
            });

        } catch (err: any) {

            if (err.response?.data) {
                const errorData = err.response.data;

                if (Array.isArray(errorData)) {
                    setError(errorData);
                } else if (typeof errorData === 'string') {
                    setError([errorData]);
                } else if (errorData.message) {
                    setError([errorData.message]);
                } else {
                    setError([
                        'Sign up failed. Please try again.'
                    ]);
                }

            } else if (err.request) {

                setError([
                    'No response from server. Please check your connection.'
                ]);

            } else {

                setError([
                    'Sign up failed. Please try again.'
                ]);

            }

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const getPasswordStrength = () => {
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return strength;
    };

    const passwordStrength = getPasswordStrength();

    const getPasswordStrengthText = () => {
        if (!password) return '';

        if (passwordStrength <= 2) {
            return 'Weak password';
        }

        if (passwordStrength <= 4) {
            return 'Good password';
        }

        return 'Strong password';
    };

    return (
        <div className="signup-page">

            {/* =============================================
                LEFT BRAND SECTION
               ============================================= */}

            <section className="signup-brand-section">

                <div className="signup-decoration signup-decoration-one" />
                <div className="signup-decoration signup-decoration-two" />
                <div className="signup-decoration signup-decoration-three" />

                <div className="signup-brand-content">

                    <button
                        type="button"
                        className="signup-brand"
                        onClick={() => navigate('/')}
                    >
                        <span className="signup-brand-icon">
                            TS
                        </span>

                        <span className="signup-brand-name">
                            TalkSpace
                        </span>
                    </button>


                    <div className="signup-hero">

                        <div className="signup-hero-badge">
                            <AutoAwesomeRoundedIcon />

                            <span>
                                Join the community
                            </span>
                        </div>

                        <h1>
                            Your next connection
                            <span> starts here.</span>
                        </h1>

                        <p>
                            Create your TalkSpace account,
                            discover people who share your
                            interests and start meaningful
                            conversations.
                        </p>


                        <div className="signup-benefits">

                            <div className="signup-benefit">

                                <div className="signup-benefit-icon">
                                    <PeopleAltRoundedIcon />
                                </div>

                                <div>
                                    <strong>
                                        Meet new people
                                    </strong>

                                    <span>
                                        Discover people based on
                                        interests and specialities.
                                    </span>
                                </div>

                            </div>


                            <div className="signup-benefit">

                                <div className="signup-benefit-icon">
                                    <ForumRoundedIcon />
                                </div>

                                <div>
                                    <strong>
                                        Start conversations
                                    </strong>

                                    <span>
                                        Connect and communicate
                                        through real-time messages.
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>


                    <div className="signup-brand-footer">
                        TalkSpace © {new Date().getFullYear()}
                    </div>

                </div>

            </section>


            {/* =============================================
                FORM SECTION
               ============================================= */}

            <section className="signup-form-section">

                <div className="signup-mobile-brand">

                    <span className="signup-mobile-logo">
                        TS
                    </span>

                    <span>
                        TalkSpace
                    </span>

                </div>


                <div className="signup-form-wrapper">

                    <div className="signup-form-heading">

                        <span className="signup-heading-label">
                            GET STARTED
                        </span>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Fill in your details and join TalkSpace.
                        </p>

                    </div>


                    <form
                        className="modern-signup-form"
                        onSubmit={handleSignUp}
                    >

                        {/* =================================
                            FIRST NAME + LAST NAME
                           ================================= */}

                        <div className="signup-two-columns">

                            <div className="signup-field">

                                <label htmlFor="firstName">
                                    First name
                                </label>

                                <div className="signup-input-wrapper">

                                    <PersonRoundedIcon
                                        className="signup-input-icon"
                                    />

                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="First name"
                                        autoComplete="given-name"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="signup-field">

                                <label htmlFor="lastName">
                                    Last name
                                </label>

                                <div className="signup-input-wrapper">

                                    <PersonRoundedIcon
                                        className="signup-input-icon"
                                    />

                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Last name"
                                        autoComplete="family-name"
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            USERNAME
                           ================================= */}

                        <div className="signup-field">

                            <label htmlFor="userName">
                                Username
                            </label>

                            <div className="signup-input-wrapper">

                                <AlternateEmailRoundedIcon
                                    className="signup-input-icon"
                                />

                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    value={userName}
                                    onChange={(e) =>
                                        setUserName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Choose a username"
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================
                            BIRTH DATE
                           ================================= */}

                        <div className="signup-field">

                            <label htmlFor="birthDate">
                                Date of birth
                            </label>

                            <div className="signup-input-wrapper">

                                <CalendarMonthRoundedIcon
                                    className="signup-input-icon"
                                />

                                <input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) =>
                                        setBirthDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================
                            GENDER
                           ================================= */}

                        <div className="signup-field">

                            <label>
                                Gender
                            </label>

                            <div className="signup-gender-options">

                                <button
                                    type="button"
                                    className={
                                        gender === 'MALE'
                                            ? 'gender-option active'
                                            : 'gender-option'
                                    }
                                    onClick={() =>
                                        setGender('MALE')
                                    }
                                >
                                    <MaleRoundedIcon />

                                    <span>
                                        Male
                                    </span>
                                </button>


                                <button
                                    type="button"
                                    className={
                                        gender === 'FEMALE'
                                            ? 'gender-option active'
                                            : 'gender-option'
                                    }
                                    onClick={() =>
                                        setGender('FEMALE')
                                    }
                                >
                                    <FemaleRoundedIcon />

                                    <span>
                                        Female
                                    </span>
                                </button>

                            </div>

                        </div>


                        {/* =================================
                            EMAIL
                           ================================= */}

                        <div className="signup-field">

                            <label htmlFor="signup-email">
                                Email address
                            </label>

                            <div className="signup-input-wrapper">

                                <EmailRoundedIcon
                                    className="signup-input-icon"
                                />

                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="name@gmail.com"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* =================================
                            PASSWORD
                           ================================= */}

                        <div className="signup-field">

                            <label htmlFor="signup-password">
                                Password
                            </label>

                            <div className="signup-input-wrapper">

                                <LockRoundedIcon
                                    className="signup-input-icon"
                                />

                                <input
                                    id="signup-password"
                                    name="password"
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
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
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


                            {password && (
                                <div className="password-strength">

                                    <div className="password-strength-bars">

                                        {[1, 2, 3, 4, 5].map(
                                            (level) => (
                                                <span
                                                    key={level}
                                                    className={
                                                        passwordStrength >=
                                                        level
                                                            ? `strength-bar active strength-${passwordStrength}`
                                                            : 'strength-bar'
                                                    }
                                                />
                                            )
                                        )}

                                    </div>

                                    <span
                                        className={`password-strength-text strength-text-${passwordStrength}`}
                                    >
                                        {getPasswordStrengthText()}
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* =================================
                            ERRORS
                           ================================= */}

                        {error.length > 0 && (
                            <div className="signup-error-container">

                                {error.map(
                                    (message, index) => (
                                        <div
                                            className="signup-error-message"
                                            key={index}
                                        >
                                            <span className="signup-error-dot" />

                                            <span>
                                                {message}
                                            </span>
                                        </div>
                                    )
                                )}

                            </div>
                        )}


                        {/* =================================
                            SUBMIT
                           ================================= */}

                        <button
                            type="submit"
                            className="signup-submit-button"
                            disabled={
                                isSubmitting ||
                                !gender
                            }
                        >

                            {isSubmitting ? (
                                <>
                                    <span className="signup-spinner" />

                                    <span>
                                        Creating account...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>
                                        Create account
                                    </span>

                                    <ArrowForwardRoundedIcon />
                                </>
                            )}

                        </button>

                    </form>


                    {/* =====================================
                        LOGIN
                       ===================================== */}

                    <div className="signup-login-link">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={handleLoginRedirect}
                        >
                            Sign in
                        </button>

                    </div>

                </div>


                <div className="signup-form-footer">
                    <span>
                        TalkSpace
                    </span>

                    <span>•</span>

                    <span>
                        Connect. Discover. Talk.
                    </span>
                </div>

            </section>

        </div>
    );
};

export default SignUpForm;