import React, {
    useEffect,
    useState
} from 'react';

import './AdminDashboard.css';

import {
    useNavigate
} from 'react-router-dom';

import axios, {
    AxiosError
} from 'axios';

import {
    jwtDecode
} from 'jwt-decode';

import AdminPanelSettingsRoundedIcon
    from '@mui/icons-material/AdminPanelSettingsRounded';

import PeopleAltRoundedIcon
    from '@mui/icons-material/PeopleAltRounded';

import ReviewsRoundedIcon
    from '@mui/icons-material/ReviewsRounded';

import BlockRoundedIcon
    from '@mui/icons-material/BlockRounded';

import ArrowForwardRoundedIcon
    from '@mui/icons-material/ArrowForwardRounded';

import CloseRoundedIcon
    from '@mui/icons-material/CloseRounded';

import CheckRoundedIcon
    from '@mui/icons-material/CheckRounded';

import PersonOffRoundedIcon
    from '@mui/icons-material/PersonOffRounded';

import CalendarMonthRoundedIcon
    from '@mui/icons-material/CalendarMonthRounded';

import WarningAmberRoundedIcon
    from '@mui/icons-material/WarningAmberRounded';

import VerifiedUserRoundedIcon
    from '@mui/icons-material/VerifiedUserRounded';


interface JwtPayload {
    sub: string;
}


const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


const AdminDashboard: React.FC = () => {
    const navigate =
        useNavigate();


    const token =
        localStorage.getItem('token');


    const [
        userName,
        setUserName
    ] = useState<string>('Admin');


    const [
        showBlockForm,
        setShowBlockForm
    ] = useState<boolean>(false);


    const [
        blockUsername,
        setBlockUsername
    ] = useState<string>('');


    const [
        blockMessage,
        setBlockMessage
    ] = useState<string>('');


    const [
        blockUntil,
        setBlockUntil
    ] = useState<string>('');


    const [
        errorMessage,
        setErrorMessage
    ] = useState<string>('');


    const [
        successMessage,
        setSuccessMessage
    ] = useState<string>('');


    const [
        isBlocking,
        setIsBlocking
    ] = useState<boolean>(false);


    /* =====================================================
       DEFAULT BLOCK DATE
       ===================================================== */

    const getTomorrowDate =
        (): string => {
            const tomorrow =
                new Date();


            tomorrow.setDate(
                tomorrow.getDate() + 1
            );


            return tomorrow
                .toISOString()
                .split('T')[0];
        };


    useEffect(() => {
        setBlockUntil(
            getTomorrowDate()
        );
    }, []);


    /* =====================================================
       RATE LIMIT
       ===================================================== */

    const handleRateLimitExceeded =
        () => {
            localStorage.removeItem(
                'token'
            );


            navigate(
                '/login',
                {
                    replace: true,
                    state: {
                        message:
                            'Too many requests were detected. Please log in again.'
                    }
                }
            );
        };


    /* =====================================================
       FETCH ADMIN USERNAME
       ===================================================== */

    useEffect(() => {
        const fetchUserName =
            async () => {
                if (!token) {
                    navigate(
                        '/login',
                        {
                            replace: true
                        }
                    );

                    return;
                }


                try {
                    const decodedToken =
                        jwtDecode<JwtPayload>(
                            token
                        );


                    const email =
                        decodedToken.sub;


                    const response =
                        await axios.get<string>(
                            `${API_URL}/api/public/user/get/userName/${email}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setUserName(
                        response.data ||
                        'Admin'
                    );

                } catch (error) {

                    const err =
                        error as AxiosError;


                    if (
                        err.response?.status ===
                        429
                    ) {
                        handleRateLimitExceeded();

                        return;
                    }


                    console.error(
                        'Error fetching admin username:',
                        error
                    );
                }
            };


        fetchUserName();

    }, [token]);


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const handleViewUsers =
        () => {
            navigate('/users');
        };


    const handleViewFeedbacks =
        () => {
            navigate('/feedbacks');
        };


    /* =====================================================
       BLOCK USER MODAL
       ===================================================== */

    const openBlockForm =
        () => {
            setErrorMessage('');
            setSuccessMessage('');

            setShowBlockForm(true);
        };


    const closeBlockForm =
        () => {
            if (isBlocking) {
                return;
            }


            setShowBlockForm(false);

            setBlockUsername('');
            setBlockMessage('');

            setBlockUntil(
                getTomorrowDate()
            );

            setErrorMessage('');
            setSuccessMessage('');
        };


    /* =====================================================
       BLOCK USER
       ===================================================== */

    const handleBlockSubmit =
        async (
            event:
                React.FormEvent<HTMLFormElement>
        ) => {
            event.preventDefault();


            setErrorMessage('');
            setSuccessMessage('');


            const username =
                blockUsername.trim();


            const reason =
                blockMessage.trim();


            if (!username) {
                setErrorMessage(
                    'Please enter the username you want to block.'
                );

                return;
            }


            if (!reason) {
                setErrorMessage(
                    'Please enter a reason for blocking this user.'
                );

                return;
            }


            if (!blockUntil) {
                setErrorMessage(
                    'Please select the date until which the user should remain blocked.'
                );

                return;
            }


            if (!token) {
                navigate(
                    '/login',
                    {
                        replace: true
                    }
                );

                return;
            }


            try {
                setIsBlocking(true);


                const response =
                    await axios.put(
                        `${API_URL}/api/private/admin/block`,
                        {
                            userName:
                            username,

                            blockMessage:
                            reason,

                            blockUntil:
                            blockUntil
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (
                    response.status ===
                    429
                ) {
                    handleRateLimitExceeded();

                    return;
                }


                setSuccessMessage(
                    `${username} has been blocked until ${new Date(
                        `${blockUntil}T00:00:00`
                    ).toLocaleDateString()}.`
                );


                setBlockUsername('');
                setBlockMessage('');

                setBlockUntil(
                    getTomorrowDate()
                );

            } catch (error) {

                const err =
                    error as AxiosError;


                if (
                    err.response?.status ===
                    429
                ) {
                    handleRateLimitExceeded();

                    return;
                }


                console.error(
                    'Error blocking user:',
                    error
                );


                if (
                    typeof err.response?.data ===
                    'string' &&
                    err.response.data.trim()
                ) {
                    setErrorMessage(
                        err.response.data
                    );

                } else {
                    setErrorMessage(
                        'Could not block this user. Please try again.'
                    );
                }

            } finally {
                setIsBlocking(false);
            }
        };


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="admin-dashboard">

            {/* HERO */}

            <section className="admin-dashboard-hero">

                <div className="admin-dashboard-glow admin-dashboard-glow-one" />
                <div className="admin-dashboard-glow admin-dashboard-glow-two" />


                <div className="admin-dashboard-hero-content">

                    <span className="admin-dashboard-eyebrow">

                        <AdminPanelSettingsRoundedIcon />

                        ADMINISTRATION

                    </span>


                    <h1>
                        Welcome back,
                        {' '}
                        <span>
                            {userName}
                        </span>
                    </h1>


                    <p>
                        Manage TalkSpace users,
                        review community feedback and
                        handle account restrictions
                        from one place.
                    </p>


                    <div className="admin-dashboard-security">

                        <VerifiedUserRoundedIcon />


                        <div>
                            <strong>
                                Administrator access
                            </strong>

                            <span>
                                Protected management
                                environment
                            </span>
                        </div>

                    </div>

                </div>


                <div className="admin-dashboard-hero-icon">

                    <AdminPanelSettingsRoundedIcon />

                </div>

            </section>


            {/* SECTION HEADER */}

            <section className="admin-dashboard-actions-section">

                <div className="admin-dashboard-section-header">

                    <div>
                        <span>
                            MANAGEMENT
                        </span>

                        <h2>
                            Admin tools
                        </h2>

                        <p>
                            Select the area you want
                            to manage.
                        </p>
                    </div>

                </div>


                {/* ACTIONS */}

                <div className="admin-dashboard-actions">

                    {/* USERS */}

                    <button
                        type="button"
                        className="admin-dashboard-action-card"
                        onClick={
                            handleViewUsers
                        }
                    >

                        <div className="admin-dashboard-card-header">

                            <span className="admin-dashboard-action-icon users">
                                <PeopleAltRoundedIcon />
                            </span>


                            <span className="admin-dashboard-card-number">
                                01
                            </span>

                        </div>


                        <div className="admin-dashboard-card-content">

                            <span>
                                USER MANAGEMENT
                            </span>


                            <h3>
                                Users
                            </h3>


                            <p>
                                View registered users,
                                account verification,
                                status and restriction
                                information.
                            </p>

                        </div>


                        <div className="admin-dashboard-card-link">

                            Manage users

                            <ArrowForwardRoundedIcon />

                        </div>

                    </button>


                    {/* FEEDBACK */}

                    <button
                        type="button"
                        className="admin-dashboard-action-card"
                        onClick={
                            handleViewFeedbacks
                        }
                    >

                        <div className="admin-dashboard-card-header">

                            <span className="admin-dashboard-action-icon feedback">
                                <ReviewsRoundedIcon />
                            </span>


                            <span className="admin-dashboard-card-number">
                                02
                            </span>

                        </div>


                        <div className="admin-dashboard-card-content">

                            <span>
                                COMMUNITY
                            </span>


                            <h3>
                                Feedback
                            </h3>


                            <p>
                                Review ratings and
                                messages submitted by
                                TalkSpace users.
                            </p>

                        </div>


                        <div className="admin-dashboard-card-link">

                            View feedback

                            <ArrowForwardRoundedIcon />

                        </div>

                    </button>


                    {/* BLOCK USER */}

                    <button
                        type="button"
                        className="admin-dashboard-action-card danger"
                        onClick={
                            openBlockForm
                        }
                    >

                        <div className="admin-dashboard-card-header">

                            <span className="admin-dashboard-action-icon block">
                                <BlockRoundedIcon />
                            </span>


                            <span className="admin-dashboard-card-number">
                                03
                            </span>

                        </div>


                        <div className="admin-dashboard-card-content">

                            <span>
                                ACCOUNT CONTROL
                            </span>


                            <h3>
                                Block user
                            </h3>


                            <p>
                                Temporarily restrict
                                access for a user and
                                provide the reason for
                                the restriction.
                            </p>

                        </div>


                        <div className="admin-dashboard-card-link danger">

                            Block account

                            <ArrowForwardRoundedIcon />

                        </div>

                    </button>

                </div>

            </section>


            {/* INFO */}

            <section className="admin-dashboard-info">

                <WarningAmberRoundedIcon />


                <div>
                    <strong>
                        Administrative actions
                    </strong>

                    <p>
                        Account restrictions should
                        only be applied when necessary.
                        Block reasons and expiration
                        dates are visible in the Users
                        management page.
                    </p>
                </div>

            </section>


            {/* BLOCK MODAL */}

            {showBlockForm && (

                <div
                    className="admin-block-backdrop"
                    onMouseDown={
                        event => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeBlockForm();
                            }
                        }
                    }
                >

                    <div className="admin-block-modal">

                        {/* MODAL HEADER */}

                        <div className="admin-block-modal-header">

                            <div className="admin-block-title">

                                <span>
                                    <PersonOffRoundedIcon />
                                </span>


                                <div>
                                    <small>
                                        ACCOUNT CONTROL
                                    </small>

                                    <h2>
                                        Block user
                                    </h2>
                                </div>

                            </div>


                            <button
                                type="button"
                                className="admin-block-close"
                                onClick={
                                    closeBlockForm
                                }
                                disabled={
                                    isBlocking
                                }
                                aria-label="Close"
                            >
                                <CloseRoundedIcon />
                            </button>

                        </div>


                        <p className="admin-block-description">
                            The selected user will be
                            unable to use the account
                            until the block expiration
                            date.
                        </p>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleBlockSubmit
                            }
                            className="admin-block-form"
                        >

                            {/* USERNAME */}

                            <div className="admin-block-field">

                                <label
                                    htmlFor="blockUsername"
                                >
                                    Username
                                </label>


                                <input
                                    id="blockUsername"
                                    type="text"
                                    value={
                                        blockUsername
                                    }
                                    onChange={
                                        event =>
                                            setBlockUsername(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Enter username"
                                    autoComplete="off"
                                    disabled={
                                        isBlocking
                                    }
                                />

                            </div>


                            {/* REASON */}

                            <div className="admin-block-field">

                                <div className="admin-block-label-row">

                                    <label
                                        htmlFor="blockMessage"
                                    >
                                        Block reason
                                    </label>


                                    <span>
                                        {blockMessage.length}
                                    </span>

                                </div>


                                <textarea
                                    id="blockMessage"
                                    value={
                                        blockMessage
                                    }
                                    onChange={
                                        event =>
                                            setBlockMessage(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Explain why this account is being blocked..."
                                    rows={4}
                                    disabled={
                                        isBlocking
                                    }
                                />

                            </div>


                            {/* DATE */}

                            <div className="admin-block-field">

                                <label
                                    htmlFor="blockUntil"
                                >
                                    Block until
                                </label>


                                <div className="admin-block-date">

                                    <CalendarMonthRoundedIcon />


                                    <input
                                        id="blockUntil"
                                        type="date"
                                        value={
                                            blockUntil
                                        }
                                        onChange={
                                            event =>
                                                setBlockUntil(
                                                    event.target.value
                                                )
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        disabled={
                                            isBlocking
                                        }
                                    />

                                </div>

                            </div>


                            {/* ERROR */}

                            {errorMessage && (

                                <div className="admin-block-message error">

                                    <WarningAmberRoundedIcon />

                                    <span>
                                        {errorMessage}
                                    </span>

                                </div>

                            )}


                            {/* SUCCESS */}

                            {successMessage && (

                                <div className="admin-block-message success">

                                    <CheckRoundedIcon />

                                    <span>
                                        {successMessage}
                                    </span>

                                </div>

                            )}


                            {/* BUTTONS */}

                            <div className="admin-block-actions">

                                <button
                                    type="button"
                                    className="admin-block-cancel"
                                    onClick={
                                        closeBlockForm
                                    }
                                    disabled={
                                        isBlocking
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-block-submit"
                                    disabled={
                                        isBlocking
                                    }
                                >

                                    {isBlocking ? (

                                        <>
                                            <span className="admin-block-spinner" />

                                            Blocking...
                                        </>

                                    ) : (

                                        <>
                                            <BlockRoundedIcon />

                                            Block user
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminDashboard;