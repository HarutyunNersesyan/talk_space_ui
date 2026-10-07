import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import './Edit.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const Edit: React.FC = () => {
    const navigate = useNavigate();

    const token =
        localStorage.getItem('token');

    const [firstName, setFirstName] =
        useState<string>('');

    const [lastName, setLastName] =
        useState<string>('');

    const [aboutMe, setAboutMe] =
        useState<string>('');

    const [birthDate, setBirthDate] =
        useState<string>('');

    const [loading, setLoading] =
        useState<boolean>(false);

    const [pageLoading, setPageLoading] =
        useState<boolean>(true);

    const [notification, setNotification] =
        useState<NotificationState | null>(null);


    /* =====================================================
       LOAD PROFILE
       ===================================================== */

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                setPageLoading(false);
                return;
            }

            try {
                const decodedToken =
                    jwtDecode<{
                        sub: string;
                    }>(token);

                const email =
                    decodedToken.sub;


                const response =
                    await axios.get(
                        `${API_BASE_URL}/public/user/edit/${email}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const userData =
                    response.data;


                setFirstName(
                    userData.firstName || ''
                );

                setLastName(
                    userData.lastName || ''
                );

                setAboutMe(
                    userData.aboutMe || ''
                );


                if (userData.birthDate) {
                    if (
                        /^\d{4}-\d{2}-\d{2}$/.test(
                            userData.birthDate
                        )
                    ) {
                        setBirthDate(
                            userData.birthDate
                        );
                    } else {
                        const date =
                            new Date(
                                userData.birthDate
                            );

                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {
                            const year =
                                date.getFullYear();

                            const month =
                                String(
                                    date.getMonth() +
                                    1
                                ).padStart(
                                    2,
                                    '0'
                                );

                            const day =
                                String(
                                    date.getDate()
                                ).padStart(
                                    2,
                                    '0'
                                );

                            setBirthDate(
                                `${year}-${month}-${day}`
                            );
                        }
                    }
                } else {
                    setBirthDate('');
                }

            } catch (error) {

                console.error(
                    'Error fetching user profile:',
                    error
                );

                setNotification({
                    message:
                        'Failed to fetch user profile. Please try again later.',
                    type: 'error'
                });

            } finally {

                setPageLoading(false);

            }
        };


        fetchUserProfile();

    }, [token]);


    /* =====================================================
       AUTO HIDE NOTIFICATION
       ===================================================== */

    useEffect(() => {
        if (!notification) {
            return;
        }

        const timer =
            window.setTimeout(
                () => {
                    setNotification(null);
                },
                5000
            );

        return () =>
            window.clearTimeout(timer);

    }, [notification]);


    /* =====================================================
       ERRORS
       ===================================================== */

    const formatErrorMessage = (
        error: string
    ): string => {

        if (
            error.includes(
                'value too long for type character varying(250)'
            )
        ) {
            return 'Your information should not exceed 250 characters.';
        }


        if (
            error.includes(
                "Validation failed for object='editUser'"
            )
        ) {
            return 'First name and last name must start with a capital letter followed by lowercase letters.';
        }


        return error;
    };


    /* =====================================================
       SAVE
       ===================================================== */

    const handleSave = async () => {
        try {
            setLoading(true);
            setNotification(null);


            if (!token) {
                throw new Error(
                    'No token found.'
                );
            }


            const decodedToken =
                jwtDecode<{
                    sub: string;
                }>(token);

            const email =
                decodedToken.sub;


            let formattedBirthDate:
                string | null = null;


            if (birthDate) {
                const date =
                    new Date(
                        birthDate
                    );

                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {
                    formattedBirthDate =
                        date
                            .toISOString()
                            .split('T')[0];
                }
            }


            const updatedProfile = {
                firstName,
                lastName,
                aboutMe,
                birthDate:
                formattedBirthDate
            };


            await axios.put(
                `${API_BASE_URL}/public/user/editUser?email=${encodeURIComponent(email)}`,
                updatedProfile,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'
                    }
                }
            );


            setNotification({
                message:
                    'Profile updated successfully!',
                type: 'success'
            });

        } catch (err: any) {

            console.error(
                'Error updating profile:',
                err
            );


            let errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                'Failed to update profile. Please try again later.';


            if (
                typeof errorMessage !==
                'string'
            ) {
                errorMessage =
                    'Failed to update profile. Please try again later.';
            }


            errorMessage =
                formatErrorMessage(
                    errorMessage
                );


            setNotification({
                message:
                errorMessage,
                type: 'error'
            });

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const handleBackClick = () => {
        navigate('/profile');
    };


    const handleChangePasswordClick =
        () => {
            navigate(
                '/changePassword'
            );
        };


    /* =====================================================
       LOADING
       ===================================================== */

    if (pageLoading) {
        return (
            <div className="edit-page-loading">

                <div className="edit-loading-header" />

                <div className="edit-loading-card">

                    <div className="edit-loading-line large" />

                    <div className="edit-loading-line" />

                    <div className="edit-loading-input" />

                    <div className="edit-loading-input" />

                    <div className="edit-loading-input" />

                </div>

            </div>
        );
    }


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="edit-profile-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="edit-page-header">

                <div>

                    <button
                        type="button"
                        className="edit-back-link"
                        onClick={
                            handleBackClick
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to profile
                    </button>


                    <span className="edit-page-label">
                        <PersonRoundedIcon />

                        PROFILE SETTINGS
                    </span>


                    <h1>
                        Edit your profile
                    </h1>


                    <p>
                        Keep your personal information
                        accurate and help people get to
                        know you better.
                    </p>

                </div>


                <button
                    type="button"
                    className="edit-header-save"
                    onClick={
                        handleSave
                    }
                    disabled={
                        loading
                    }
                >
                    {loading ? (
                        <span className="edit-spinner light" />
                    ) : (
                        <SaveRoundedIcon />
                    )}

                    {loading
                        ? 'Saving...'
                        : 'Save changes'}
                </button>

            </section>


            {/* =============================================
                CONTENT
               ============================================= */}

            <div className="edit-profile-layout">

                {/* =========================================
                    FORM
                   ========================================= */}

                <section className="edit-form-card">

                    <div className="edit-card-heading">

                        <div className="edit-heading-icon">
                            <BadgeRoundedIcon />
                        </div>


                        <div>
                            <span>
                                PERSONAL INFORMATION
                            </span>

                            <h2>
                                Basic information
                            </h2>

                            <p>
                                Update your name,
                                birthday and profile
                                description.
                            </p>
                        </div>

                    </div>


                    <div className="edit-form">

                        {/* First name */}

                        <div className="edit-field">

                            <label htmlFor="firstName">
                                First name
                            </label>


                            <div className="edit-input-wrapper">

                                <PersonRoundedIcon />

                                <input
                                    id="firstName"
                                    type="text"
                                    value={
                                        firstName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFirstName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your first name"
                                    pattern="[A-Z][a-z]*"
                                    title="First name must start with a capital letter followed by lowercase letters"
                                    autoComplete="given-name"
                                />

                            </div>

                        </div>


                        {/* Last name */}

                        <div className="edit-field">

                            <label htmlFor="lastName">
                                Last name
                            </label>


                            <div className="edit-input-wrapper">

                                <BadgeRoundedIcon />

                                <input
                                    id="lastName"
                                    type="text"
                                    value={
                                        lastName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setLastName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your last name"
                                    pattern="[A-Z][a-z]*"
                                    title="Last name must start with a capital letter followed by lowercase letters"
                                    autoComplete="family-name"
                                />

                            </div>

                        </div>


                        {/* Birth date */}

                        <div className="edit-field edit-field-full">

                            <label htmlFor="birthDate">
                                Birth date
                            </label>


                            <div className="edit-input-wrapper">

                                <CalendarMonthRoundedIcon />

                                <input
                                    id="birthDate"
                                    type="date"
                                    value={
                                        birthDate
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setBirthDate(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* About */}

                        <div className="edit-field edit-field-full">

                            <div className="edit-field-label-row">

                                <label htmlFor="aboutMe">
                                    About me
                                </label>


                                <span
                                    className={
                                        aboutMe.length >= 230
                                            ? 'edit-character-count warning'
                                            : 'edit-character-count'
                                    }
                                >
                                    {aboutMe.length}/250
                                </span>

                            </div>


                            <div className="edit-textarea-wrapper">

                                <NotesRoundedIcon />

                                <textarea
                                    id="aboutMe"
                                    value={
                                        aboutMe
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAboutMe(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tell people a little about yourself..."
                                    rows={6}
                                    maxLength={250}
                                />

                            </div>


                            <span className="edit-field-help">
                                A short introduction
                                helps other people know
                                more about you.
                            </span>

                        </div>

                    </div>


                    {/* Bottom buttons */}

                    <div className="edit-form-footer">

                        <button
                            type="button"
                            className="edit-cancel-button"
                            onClick={
                                handleBackClick
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            className="edit-save-button"
                            onClick={
                                handleSave
                            }
                            disabled={
                                loading
                            }
                        >
                            {loading ? (
                                <span className="edit-spinner light" />
                            ) : (
                                <SaveRoundedIcon />
                            )}

                            {loading
                                ? 'Saving...'
                                : 'Save changes'}
                        </button>

                    </div>

                </section>


                {/* =========================================
                    SIDE
                   ========================================= */}

                <aside className="edit-side-column">

                    {/* Password */}

                    <section className="edit-security-card">

                        <div className="edit-security-icon">
                            <LockResetRoundedIcon />
                        </div>


                        <span>
                            SECURITY
                        </span>


                        <h2>
                            Change password
                        </h2>


                        <p>
                            Keep your TalkSpace account
                            protected by updating your
                            password when necessary.
                        </p>


                        <button
                            type="button"
                            onClick={
                                handleChangePasswordClick
                            }
                        >
                            Change password

                            <ArrowForwardRoundedIcon />
                        </button>

                    </section>


                    {/* Tip */}

                    <section className="edit-tip-card">

                        <div className="edit-tip-icon">
                            <AutoAwesomeRoundedIcon />
                        </div>


                        <div>
                            <strong>
                                Profile tip
                            </strong>

                            <p>
                                Complete profiles make it
                                easier for other TalkSpace
                                users to understand your
                                interests and connect with
                                you.
                            </p>
                        </div>

                    </section>

                </aside>

            </div>


            {/* =============================================
                NOTIFICATION
               ============================================= */}

            {notification && (
                <div
                    className={`edit-notification ${notification.type}`}
                >

                    <div className="edit-notification-icon">

                        {notification.type ===
                        'success' ? (
                            <CheckCircleRoundedIcon />
                        ) : (
                            <ErrorRoundedIcon />
                        )}

                    </div>


                    <div>

                        <strong>
                            {notification.type ===
                            'success'
                                ? 'Success'
                                : 'Something went wrong'}
                        </strong>

                        <span>
                            {notification.message}
                        </span>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Edit;