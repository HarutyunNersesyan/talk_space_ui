import React, {
    FormEvent,
    useMemo,
    useState
} from 'react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import './ChangePassword.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface ValidationErrors {
    oldPassword?: string;
    newPassword?: string;
    newPasswordRepeat?: string;
}


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const ChangePassword: React.FC = () => {
    const navigate = useNavigate();

    const token =
        localStorage.getItem('token');


    const [
        oldPassword,
        setOldPassword
    ] = useState<string>('');


    const [
        newPassword,
        setNewPassword
    ] = useState<string>('');


    const [
        newPasswordRepeat,
        setNewPasswordRepeat
    ] = useState<string>('');


    const [
        loading,
        setLoading
    ] = useState<boolean>(false);


    const [
        notification,
        setNotification
    ] = useState<NotificationState | null>(
        null
    );


    const [
        validationErrors,
        setValidationErrors
    ] = useState<ValidationErrors>({});


    const [
        showOldPassword,
        setShowOldPassword
    ] = useState<boolean>(false);


    const [
        showNewPassword,
        setShowNewPassword
    ] = useState<boolean>(false);


    const [
        showNewPasswordRepeat,
        setShowNewPasswordRepeat
    ] = useState<boolean>(false);


    /* =====================================================
       PASSWORD RULES
       ===================================================== */

    const passwordRules = useMemo(() => {
        return {
            length:
                newPassword.length >= 8,

            uppercase:
                /[A-Z]/.test(
                    newPassword
                ),

            lowercase:
                /[a-z]/.test(
                    newPassword
                ),

            number:
                /\d/.test(
                    newPassword
                ),

            special:
                /[^A-Za-z0-9]/.test(
                    newPassword
                )
        };
    }, [newPassword]);


    const passwordStrength =
        Object.values(
            passwordRules
        ).filter(Boolean).length;


    const passwordsMatch =
        newPassword.length > 0 &&
        newPasswordRepeat.length > 0 &&
        newPassword ===
        newPasswordRepeat;


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    const showNotification = (
        message: string,
        type: 'success' | 'error'
    ) => {
        setNotification({
            message,
            type
        });


        window.setTimeout(() => {
            setNotification(null);
        }, 4000);
    };


    /* =====================================================
       VALIDATION
       ===================================================== */

    const validateForm = () => {
        const errors:
            ValidationErrors = {};


        if (!oldPassword.trim()) {
            errors.oldPassword =
                'Current password is required.';
        }


        if (!newPassword) {
            errors.newPassword =
                'New password is required.';

        } else if (
            newPassword.length < 8
        ) {
            errors.newPassword =
                'Password must contain at least 8 characters.';

        } else if (
            !passwordRules.uppercase ||
            !passwordRules.lowercase ||
            !passwordRules.number ||
            !passwordRules.special
        ) {
            errors.newPassword =
                'Password does not meet all security requirements.';

        } else if (
            oldPassword === newPassword
        ) {
            errors.newPassword =
                'New password must be different from the current password.';
        }


        if (!newPasswordRepeat) {
            errors.newPasswordRepeat =
                'Please confirm your new password.';

        } else if (
            newPassword !==
            newPasswordRepeat
        ) {
            errors.newPasswordRepeat =
                'Passwords do not match.';
        }


        setValidationErrors(
            errors
        );


        return (
            Object.keys(errors)
                .length === 0
        );
    };


    /* =====================================================
       INPUT CHANGE
       ===================================================== */

    const clearFieldError = (
        field: keyof ValidationErrors
    ) => {
        if (
            validationErrors[field]
        ) {
            setValidationErrors(
                previous => ({
                    ...previous,
                    [field]: undefined
                })
            );
        }
    };


    /* =====================================================
       UPDATE PASSWORD
       ===================================================== */

    const handleUpdatePassword =
        async (
            event?: FormEvent
        ) => {
            event?.preventDefault();


            setNotification(null);


            if (!validateForm()) {
                return;
            }


            if (!token) {
                showNotification(
                    'Your session has expired. Please log in again.',
                    'error'
                );

                return;
            }


            try {
                setLoading(true);


                const decodedToken =
                    jwtDecode<{
                        sub: string;
                    }>(token);


                const email =
                    decodedToken.sub;


                const changePasswordData = {
                    oldPassword,
                    newPassword,
                    newPasswordRepeat
                };


                await axios.put(
                    `${API_BASE_URL}/public/user/changePassword?email=${encodeURIComponent(
                        email
                    )}`,
                    changePasswordData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );


                showNotification(
                    'Password changed successfully.',
                    'success'
                );


                setOldPassword('');
                setNewPassword('');
                setNewPasswordRepeat('');


                window.setTimeout(() => {
                    navigate('/profile');
                }, 1500);

            } catch (err: any) {

                console.error(
                    'Error updating password:',
                    err
                );


                if (
                    err.response?.status ===
                    400 &&
                    err.response?.data
                ) {

                    if (
                        Array.isArray(
                            err.response.data
                        )
                    ) {
                        const errors:
                            ValidationErrors = {};


                        err.response.data.forEach(
                            (error: string) => {

                                if (
                                    error.includes(
                                        'oldPassword'
                                    )
                                ) {
                                    errors.oldPassword =
                                        error;

                                } else if (
                                    error.includes(
                                        'newPasswordRepeat'
                                    )
                                ) {
                                    errors.newPasswordRepeat =
                                        error;

                                } else if (
                                    error.includes(
                                        'newPassword'
                                    )
                                ) {
                                    errors.newPassword =
                                        error;
                                }

                            }
                        );


                        setValidationErrors(
                            errors
                        );

                    } else {

                        const message =
                            typeof err.response.data ===
                            'string'
                                ? err.response.data
                                : err.response.data
                                    ?.message;


                        showNotification(
                            message ||
                            'Unable to change password.',
                            'error'
                        );
                    }

                } else {

                    showNotification(
                        err.response?.data?.message ||
                        err.message ||
                        'Failed to update password. Please try again later.',
                        'error'
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
        <div className="change-password-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="change-password-header">

                <button
                    type="button"
                    className="change-password-back"
                    onClick={() =>
                        navigate('/edit')
                    }
                >
                    <ArrowBackRoundedIcon />

                    Back to settings
                </button>


                <span className="change-password-label">
                    <ShieldRoundedIcon />

                    SECURITY
                </span>


                <h1>
                    Change password
                </h1>


                <p>
                    Keep your TalkSpace account
                    protected by using a strong,
                    unique password.
                </p>

            </section>


            {/* =============================================
                CONTENT
               ============================================= */}

            <div className="change-password-layout">

                {/* =========================================
                    PASSWORD FORM
                   ========================================= */}

                <section className="change-password-card">

                    <div className="change-password-card-heading">

                        <div className="change-password-heading-icon">
                            <LockResetRoundedIcon />
                        </div>


                        <div>

                            <span>
                                PASSWORD
                            </span>


                            <h2>
                                Update your password
                            </h2>


                            <p>
                                Enter your current password
                                and choose a new secure one.
                            </p>

                        </div>

                    </div>


                    <form
                        className="change-password-form"
                        onSubmit={
                            handleUpdatePassword
                        }
                    >

                        {/* Current password */}

                        <div className="change-password-field">

                            <label htmlFor="oldPassword">
                                Current password
                            </label>


                            <div
                                className={
                                    `change-password-input ${
                                        validationErrors
                                            .oldPassword
                                            ? 'error'
                                            : ''
                                    }`
                                }
                            >

                                <LockRoundedIcon className="change-password-input-icon" />


                                <input
                                    id="oldPassword"
                                    type={
                                        showOldPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        oldPassword
                                    }
                                    onChange={event => {
                                        setOldPassword(
                                            event.target.value
                                        );

                                        clearFieldError(
                                            'oldPassword'
                                        );
                                    }}
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                />


                                <button
                                    type="button"
                                    className="change-password-eye"
                                    onClick={() =>
                                        setShowOldPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showOldPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >

                                    {showOldPassword ? (
                                        <VisibilityOffRoundedIcon />
                                    ) : (
                                        <VisibilityRoundedIcon />
                                    )}

                                </button>

                            </div>


                            {validationErrors
                                .oldPassword && (
                                <div className="change-password-error">

                                    <ErrorRoundedIcon />

                                    {
                                        validationErrors
                                            .oldPassword
                                    }

                                </div>
                            )}

                        </div>


                        {/* New password */}

                        <div className="change-password-field">

                            <label htmlFor="newPassword">
                                New password
                            </label>


                            <div
                                className={
                                    `change-password-input ${
                                        validationErrors
                                            .newPassword
                                            ? 'error'
                                            : ''
                                    }`
                                }
                            >

                                <LockRoundedIcon className="change-password-input-icon" />


                                <input
                                    id="newPassword"
                                    type={
                                        showNewPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        newPassword
                                    }
                                    onChange={event => {
                                        setNewPassword(
                                            event.target.value
                                        );

                                        clearFieldError(
                                            'newPassword'
                                        );
                                    }}
                                    placeholder="Create a new password"
                                    autoComplete="new-password"
                                />


                                <button
                                    type="button"
                                    className="change-password-eye"
                                    onClick={() =>
                                        setShowNewPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >

                                    {showNewPassword ? (
                                        <VisibilityOffRoundedIcon />
                                    ) : (
                                        <VisibilityRoundedIcon />
                                    )}

                                </button>

                            </div>


                            {validationErrors
                                .newPassword && (
                                <div className="change-password-error">

                                    <ErrorRoundedIcon />

                                    {
                                        validationErrors
                                            .newPassword
                                    }

                                </div>
                            )}


                            {/* Strength */}

                            {newPassword && (
                                <div className="change-password-strength">

                                    <div className="change-password-strength-bars">

                                        {[1, 2, 3, 4, 5].map(
                                            level => (
                                                <span
                                                    key={
                                                        level
                                                    }
                                                    className={
                                                        level <=
                                                        passwordStrength
                                                            ? 'active'
                                                            : ''
                                                    }
                                                />
                                            )
                                        )}

                                    </div>


                                    <span>
                                        {passwordStrength <= 2
                                            ? 'Weak'
                                            : passwordStrength <= 4
                                                ? 'Good'
                                                : 'Strong'}
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* Repeat password */}

                        <div className="change-password-field">

                            <label htmlFor="newPasswordRepeat">
                                Confirm new password
                            </label>


                            <div
                                className={
                                    `change-password-input ${
                                        validationErrors
                                            .newPasswordRepeat
                                            ? 'error'
                                            : passwordsMatch
                                                ? 'valid'
                                                : ''
                                    }`
                                }
                            >

                                <LockRoundedIcon className="change-password-input-icon" />


                                <input
                                    id="newPasswordRepeat"
                                    type={
                                        showNewPasswordRepeat
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        newPasswordRepeat
                                    }
                                    onChange={event => {
                                        setNewPasswordRepeat(
                                            event.target.value
                                        );

                                        clearFieldError(
                                            'newPasswordRepeat'
                                        );
                                    }}
                                    placeholder="Repeat new password"
                                    autoComplete="new-password"
                                />


                                {passwordsMatch && (
                                    <CheckCircleRoundedIcon className="change-password-valid-icon" />
                                )}


                                <button
                                    type="button"
                                    className="change-password-eye"
                                    onClick={() =>
                                        setShowNewPasswordRepeat(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showNewPasswordRepeat
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >

                                    {showNewPasswordRepeat ? (
                                        <VisibilityOffRoundedIcon />
                                    ) : (
                                        <VisibilityRoundedIcon />
                                    )}

                                </button>

                            </div>


                            {validationErrors
                                .newPasswordRepeat && (
                                <div className="change-password-error">

                                    <ErrorRoundedIcon />

                                    {
                                        validationErrors
                                            .newPasswordRepeat
                                    }

                                </div>
                            )}

                        </div>


                        {/* Actions */}

                        <div className="change-password-actions">

                            <button
                                type="button"
                                className="change-password-cancel"
                                onClick={() =>
                                    navigate('/edit')
                                }
                                disabled={
                                    loading
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="change-password-save"
                                disabled={
                                    loading
                                }
                            >

                                {loading ? (
                                    <span className="change-password-spinner" />
                                ) : (
                                    <SaveRoundedIcon />
                                )}


                                {loading
                                    ? 'Updating...'
                                    : 'Update password'}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =========================================
                    SECURITY INFO
                   ========================================= */}

                <aside className="change-password-side">

                    <section className="change-password-security-card">

                        <div className="change-password-security-icon">
                            <ShieldRoundedIcon />
                        </div>


                        <span className="change-password-side-label">
                            PASSWORD SECURITY
                        </span>


                        <h2>
                            Create a strong password
                        </h2>


                        <p>
                            A strong password makes your
                            TalkSpace account harder to
                            access without permission.
                        </p>


                        <div className="change-password-rules">

                            <div
                                className={
                                    passwordRules.length
                                        ? 'valid'
                                        : ''
                                }
                            >
                                <CheckCircleRoundedIcon />

                                At least 8 characters
                            </div>


                            <div
                                className={
                                    passwordRules.uppercase
                                        ? 'valid'
                                        : ''
                                }
                            >
                                <CheckCircleRoundedIcon />

                                One uppercase letter
                            </div>


                            <div
                                className={
                                    passwordRules.lowercase
                                        ? 'valid'
                                        : ''
                                }
                            >
                                <CheckCircleRoundedIcon />

                                One lowercase letter
                            </div>


                            <div
                                className={
                                    passwordRules.number
                                        ? 'valid'
                                        : ''
                                }
                            >
                                <CheckCircleRoundedIcon />

                                One number
                            </div>


                            <div
                                className={
                                    passwordRules.special
                                        ? 'valid'
                                        : ''
                                }
                            >
                                <CheckCircleRoundedIcon />

                                One special character
                            </div>

                        </div>

                    </section>


                    {/* Delete account */}

                    <section className="change-password-danger-card">

                        <div className="change-password-danger-heading">

                            <DeleteOutlineRoundedIcon />


                            <div>
                                <strong>
                                    Delete account
                                </strong>

                                <span>
                                    Permanently remove
                                    your TalkSpace account.
                                </span>
                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate('/delete')
                            }
                        >
                            Delete account
                        </button>

                    </section>

                </aside>

            </div>


            {/* =============================================
                SECURITY TIP
               ============================================= */}

            <section className="change-password-tip">

                <div>
                    <AutoAwesomeRoundedIcon />
                </div>


                <p>
                    <strong>
                        Keep your account secure
                    </strong>

                    Avoid reusing passwords from other
                    services and never share your
                    TalkSpace password with anyone.
                </p>

            </section>


            {/* =============================================
                NOTIFICATION
               ============================================= */}

            {notification && (
                <div
                    className={
                        `change-password-notification ${notification.type}`
                    }
                >

                    <div className="change-password-notification-icon">

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
                                ? 'Password updated'
                                : 'Unable to update'}
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

export default ChangePassword;