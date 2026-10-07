import React, {
    FormEvent,
    useState
} from 'react';

import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import './Delete.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface DeleteProps {
    onClose?: () => void;
    isModal?: boolean;
}


interface JwtPayload {
    sub: string;
    [key: string]: any;
}


const Delete: React.FC<DeleteProps> = ({
                                           onClose,
                                           isModal = true
                                       }) => {
    const navigate =
        useNavigate();


    const [
        password,
        setPassword
    ] = useState<string>('');


    const [
        showPassword,
        setShowPassword
    ] = useState<boolean>(false);


    const [
        confirmation,
        setConfirmation
    ] = useState<string>('');


    const [
        error,
        setError
    ] = useState<string>('');


    const [
        success,
        setSuccess
    ] = useState<string>('');


    const [
        loading,
        setLoading
    ] = useState<boolean>(false);


    const token =
        localStorage.getItem('token');


    let email = '';


    if (token) {
        try {
            const decodedToken =
                jwtDecode<JwtPayload>(
                    token
                );


            email =
                decodedToken?.sub || '';

        } catch (err) {

            console.error(
                'Invalid token:',
                err
            );

        }
    }


    const confirmationIsValid =
        confirmation.trim().toUpperCase() ===
        'DELETE';


    /* =====================================================
       BACK
       ===================================================== */

    const handleBack = () => {
        if (
            isModal &&
            onClose
        ) {
            onClose();

            return;
        }


        navigate('/edit');
    };


    /* =====================================================
       DELETE ACCOUNT
       ===================================================== */

    const handleDelete =
        async (
            event?: FormEvent
        ) => {
            event?.preventDefault();


            setError('');
            setSuccess('');


            if (!email) {
                setError(
                    'Your session information could not be found. Please log in again.'
                );

                return;
            }


            if (!password.trim()) {
                setError(
                    'Please enter your password.'
                );

                return;
            }


            if (!confirmationIsValid) {
                setError(
                    'Type DELETE to confirm account deletion.'
                );

                return;
            }


            try {
                setLoading(true);


                const response =
                    await axios.delete(
                        `${API_BASE_URL}/public/user/delete/account`,
                        {
                            data: {
                                email,
                                password
                            },

                            headers: {
                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (
                    response.status === 200
                ) {
                    setSuccess(
                        'Your account has been deleted successfully.'
                    );


                    window.setTimeout(() => {
                        localStorage.removeItem(
                            'token'
                        );


                        window.location.href =
                            '/login';

                    }, 1800);
                }

            } catch (err: any) {

                console.error(
                    'Error deleting account:',
                    err
                );


                if (err.response) {

                    const responseData =
                        err.response.data;


                    const message =
                        typeof responseData ===
                        'string'
                            ? responseData
                            : responseData
                                ?.message;


                    setError(
                        message ||
                        'Failed to delete account.'
                    );

                } else if (
                    err.request
                ) {

                    setError(
                        'No response from server. Please try again.'
                    );

                } else {

                    setError(
                        'An unexpected error occurred.'
                    );

                }

            } finally {

                setLoading(false);

            }
        };


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div
            className={
                `delete-page ${
                    isModal
                        ? 'delete-page-modal'
                        : 'delete-page-standalone'
                }`
            }
        >

            <section className="delete-card">

                {/* =========================================
                    CLOSE / BACK
                   ========================================= */}

                {isModal ? (
                    <button
                        type="button"
                        className="delete-close-button"
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                navigate('/edit');
                            }
                        }}
                        disabled={loading}
                        aria-label="Close"
                    >
                        <CloseRoundedIcon />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="delete-back-button"
                        onClick={
                            handleBack
                        }
                        disabled={
                            loading
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to settings
                    </button>
                )}


                {/* =========================================
                    HEADER
                   ========================================= */}

                <div className="delete-header">

                    <div className="delete-main-icon">
                        <DeleteForeverRoundedIcon />
                    </div>


                    <span className="delete-label">
                        DANGER ZONE
                    </span>


                    <h1>
                        Delete your account?
                    </h1>


                    <p>
                        This action permanently removes
                        your TalkSpace account and cannot
                        be undone.
                    </p>

                </div>


                {/* =========================================
                    WARNING
                   ========================================= */}

                <div className="delete-warning-card">

                    <div className="delete-warning-icon">
                        <WarningAmberRoundedIcon />
                    </div>


                    <div>

                        <strong>
                            This action is permanent
                        </strong>


                        <p>
                            Deleting your account will
                            permanently remove your
                            information and chats.
                            You will not be able to
                            recover them afterwards.
                        </p>

                    </div>

                </div>


                {/* =========================================
                    FORM
                   ========================================= */}

                <form
                    className="delete-form"
                    onSubmit={
                        handleDelete
                    }
                >

                    {/* Password */}

                    <div className="delete-field">

                        <label htmlFor="deletePassword">
                            Confirm your password
                        </label>


                        <div className="delete-input-wrapper">

                            <LockRoundedIcon className="delete-input-icon" />


                            <input
                                id="deletePassword"
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                value={
                                    password
                                }
                                onChange={event => {
                                    setPassword(
                                        event.target.value
                                    );

                                    if (error) {
                                        setError('');
                                    }
                                }}
                                placeholder="Enter your password"
                                disabled={
                                    loading ||
                                    !!success
                                }
                                autoComplete="current-password"
                            />


                            <button
                                type="button"
                                className="delete-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        previous =>
                                            !previous
                                    )
                                }
                                disabled={
                                    loading ||
                                    !!success
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


                    {/* DELETE confirmation */}

                    <div className="delete-field">

                        <label htmlFor="deleteConfirmation">
                            Type
                            <strong>
                                {' '}DELETE{' '}
                            </strong>
                            to confirm
                        </label>


                        <div
                            className={
                                `delete-input-wrapper ${
                                    confirmationIsValid
                                        ? 'valid'
                                        : ''
                                }`
                            }
                        >

                            <ShieldRoundedIcon className="delete-input-icon" />


                            <input
                                id="deleteConfirmation"
                                type="text"
                                value={
                                    confirmation
                                }
                                onChange={event => {
                                    setConfirmation(
                                        event.target.value
                                    );

                                    if (error) {
                                        setError('');
                                    }
                                }}
                                placeholder="Type DELETE"
                                disabled={
                                    loading ||
                                    !!success
                                }
                                autoComplete="off"
                            />


                            {confirmationIsValid && (
                                <CheckCircleRoundedIcon className="delete-valid-icon" />
                            )}

                        </div>

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="delete-message error">

                            <ErrorRoundedIcon />


                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* Success */}

                    {success && (
                        <div className="delete-message success">

                            <CheckCircleRoundedIcon />


                            <span>
                                {success}
                                {' '}
                                Redirecting...
                            </span>

                        </div>
                    )}


                    {/* Actions */}

                    <div className="delete-actions">

                        <button
                            type="button"
                            className="delete-cancel-button"
                            onClick={
                                handleBack
                            }
                            disabled={
                                loading ||
                                !!success
                            }
                        >
                            Keep my account
                        </button>


                        <button
                            type="submit"
                            className="delete-confirm-button"
                            disabled={
                                loading ||
                                !!success ||
                                !password ||
                                !confirmationIsValid
                            }
                        >

                            {loading ? (
                                <span className="delete-spinner" />
                            ) : (
                                <DeleteForeverRoundedIcon />
                            )}


                            {loading
                                ? 'Deleting...'
                                : 'Delete account'}

                        </button>

                    </div>

                </form>

            </section>

        </div>
    );
};

export default Delete;