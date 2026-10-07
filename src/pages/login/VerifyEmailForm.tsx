import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    useLocation,
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

import './VerifyEmailForm.css';

const MAX_ATTEMPTS = 3;

const apiUrl =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';

const VerifyEmailForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [pinArray, setPinArray] = useState<string[]>([
        '',
        '',
        '',
        '',
        '',
        ''
    ]);

    const [error, setError] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState<boolean>(false);

    const [isCancelling, setIsCancelling] =
        useState<boolean>(false);

    const [attemptsLeft, setAttemptsLeft] =
        useState<number>(MAX_ATTEMPTS);

    const inputRefs =
        useRef<(HTMLInputElement | null)[]>([]);

    const email =
        location.state?.email ||
        new URLSearchParams(
            location.search
        ).get('email') ||
        '';

    /*
     * Automatically focus the first PIN field.
     */
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    /*
     * Prevent page scrolling while verification
     * screen is visible.
     */
    useEffect(() => {
        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow =
                originalOverflow;
        };
    }, []);

    const handleInputChange = (
        index: number,
        value: string
    ) => {
        if (!/^[0-9]?$/.test(value)) {
            return;
        }

        setError(null);

        const newPinArray = [...pinArray];

        newPinArray[index] = value;

        setPinArray(newPinArray);

        if (
            value &&
            index < pinArray.length - 1
        ) {
            inputRefs.current[
            index + 1
                ]?.focus();
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (
            event.key === 'Backspace' &&
            !pinArray[index] &&
            index > 0
        ) {
            inputRefs.current[
            index - 1
                ]?.focus();
        }

        if (
            event.key === 'ArrowLeft' &&
            index > 0
        ) {
            inputRefs.current[
            index - 1
                ]?.focus();
        }

        if (
            event.key === 'ArrowRight' &&
            index < pinArray.length - 1
        ) {
            inputRefs.current[
            index + 1
                ]?.focus();
        }

        if (event.key === 'Enter') {
            handleVerify();
        }
    };

    /*
     * Allows the user to paste the entire
     * six-digit verification code.
     */
    const handlePaste = (
        event: React.ClipboardEvent<HTMLInputElement>
    ) => {
        event.preventDefault();

        const pastedValue =
            event.clipboardData
                .getData('text')
                .replace(/\D/g, '')
                .slice(0, 6);

        if (!pastedValue) {
            return;
        }

        const newPinArray =
            Array(6).fill('');

        pastedValue
            .split('')
            .forEach((digit, index) => {
                newPinArray[index] = digit;
            });

        setPinArray(newPinArray);
        setError(null);

        const nextIndex = Math.min(
            pastedValue.length,
            5
        );

        inputRefs.current[
            nextIndex
            ]?.focus();
    };

    const handleVerify = async () => {
        const pin = pinArray.join('');

        if (pin.length !== 6) {
            setError(
                'Please enter the complete 6-digit verification code.'
            );

            return;
        }

        if (!email) {
            setError(
                'No email address is associated with this verification.'
            );

            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await axios.put(
                `${apiUrl}/api/public/user/verify`,
                {
                    email,
                    pin
                },
                {
                    headers: {
                        'Content-Type':
                            'application/json'
                    }
                }
            );

            /*
             * Verification successful.
             *
             * The old application navigated to
             * /success-page, but that route is not
             * currently defined.
             *
             * Send the verified user directly
             * to login instead.
             */
            navigate('/login', {
                replace: true
            });

        } catch (verifyError) {

            if (
                axios.isAxiosError(
                    verifyError
                )
            ) {
                if (verifyError.response) {

                    const newAttemptsLeft =
                        attemptsLeft - 1;

                    setAttemptsLeft(
                        newAttemptsLeft
                    );

                    if (
                        newAttemptsLeft > 0
                    ) {
                        setError(
                            `Incorrect verification code. ${newAttemptsLeft} ${
                                newAttemptsLeft === 1
                                    ? 'attempt'
                                    : 'attempts'
                            } left.`
                        );

                        setPinArray([
                            '',
                            '',
                            '',
                            '',
                            '',
                            ''
                        ]);

                        setTimeout(() => {
                            inputRefs.current[
                                0
                                ]?.focus();
                        }, 50);

                    } else {

                        setError(
                            'Maximum verification attempts reached.'
                        );

                        await handleCancel(
                            true
                        );
                    }

                } else {

                    setError(
                        'Network error. Please check your connection.'
                    );

                }

            } else {

                setError(
                    'An unexpected error occurred.'
                );

            }

        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (
        automatic: boolean = false
    ) => {
        if (!email) {
            setError(
                'No email address was provided.'
            );

            return;
        }

        setIsCancelling(true);

        if (!automatic) {
            setError(null);
        }

        try {
            await axios.delete(
                `${apiUrl}/api/public/user/delete/verify/${encodeURIComponent(
                    email
                )}`,
                {
                    headers: {
                        'Content-Type':
                            'application/json'
                    }
                }
            );

            navigate('/signUp', {
                replace: true
            });

        } catch (cancelError) {

            if (
                axios.isAxiosError(
                    cancelError
                )
            ) {
                if (
                    cancelError.response
                ) {
                    setError(
                        typeof cancelError
                            .response.data ===
                        'string'
                            ? cancelError
                                .response
                                .data
                            : 'Failed to cancel verification.'
                    );
                } else {
                    setError(
                        'Network error. Please check your connection.'
                    );
                }

            } else {

                setError(
                    'An unexpected error occurred.'
                );

            }

        } finally {
            setIsCancelling(false);
        }
    };

    const isPinComplete =
        pinArray.every(
            (digit) => digit !== ''
        );

    return (
        <div className="verify-page">

            {/* Background */}

            <div className="verify-background-shape verify-shape-one" />
            <div className="verify-background-shape verify-shape-two" />
            <div className="verify-background-shape verify-shape-three" />


            {/* Header */}

            <header className="verify-header">

                <button
                    type="button"
                    className="verify-logo"
                    onClick={() =>
                        navigate('/login')
                    }
                >
                    <span className="verify-logo-icon">
                        TS
                    </span>

                    <span>
                        TalkSpace
                    </span>
                </button>

            </header>


            {/* Main */}

            <main className="verify-main">

                <div className="verify-card">

                    {/* Icon */}

                    <div className="verify-icon-wrapper">

                        <div className="verify-icon-circle">
                            <MarkEmailReadRoundedIcon />
                        </div>

                        <span className="verify-icon-badge">
                            <VerifiedRoundedIcon />
                        </span>

                    </div>


                    {/* Heading */}

                    <div className="verify-heading">

                        <span className="verify-label">
                            EMAIL VERIFICATION
                        </span>

                        <h1>
                            Check your email
                        </h1>

                        <p>
                            We sent a 6-digit verification
                            code to
                        </p>

                        <strong className="verify-email">
                            {email ||
                                'your email address'}
                        </strong>

                    </div>


                    {/* PIN */}

                    <div className="verify-pin-container">

                        {pinArray.map(
                            (digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[
                                            index
                                            ] =
                                            element;
                                    }}
                                    className={
                                        error
                                            ? 'verify-pin-input error'
                                            : digit
                                                ? 'verify-pin-input filled'
                                                : 'verify-pin-input'
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={
                                        index === 0
                                            ? 'one-time-code'
                                            : 'off'
                                    }
                                    maxLength={1}
                                    value={digit}
                                    onChange={(
                                        event
                                    ) =>
                                        handleInputChange(
                                            index,
                                            event.target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) =>
                                        handleKeyDown(
                                            event,
                                            index
                                        )
                                    }
                                    onPaste={
                                        handlePaste
                                    }
                                    aria-label={`Verification digit ${
                                        index + 1
                                    }`}
                                />
                            )
                        )}

                    </div>


                    {/* Attempts */}

                    <div className="verify-attempts">

                        <SecurityRoundedIcon />

                        <span>
                            {attemptsLeft ===
                            MAX_ATTEMPTS
                                ? 'You have 3 verification attempts.'
                                : `${attemptsLeft} ${
                                    attemptsLeft ===
                                    1
                                        ? 'attempt'
                                        : 'attempts'
                                } remaining.`}
                        </span>

                    </div>


                    {/* Error */}

                    {error && (
                        <div
                            className="verify-error"
                            role="alert"
                        >
                            <span className="verify-error-dot" />

                            <span>
                                {error}
                            </span>
                        </div>
                    )}


                    {/* Verify button */}

                    <button
                        type="button"
                        className="verify-submit-button"
                        onClick={
                            handleVerify
                        }
                        disabled={
                            isLoading ||
                            isCancelling ||
                            attemptsLeft <= 0 ||
                            !isPinComplete
                        }
                    >

                        {isLoading ? (
                            <>
                                <span className="verify-spinner" />

                                <span>
                                    Verifying...
                                </span>
                            </>
                        ) : (
                            <>
                                <VerifiedRoundedIcon />

                                <span>
                                    Verify email
                                </span>
                            </>
                        )}

                    </button>


                    {/* Cancel */}

                    <button
                        type="button"
                        className="verify-cancel-button"
                        onClick={() =>
                            handleCancel(false)
                        }
                        disabled={
                            isCancelling ||
                            isLoading
                        }
                    >

                        {isCancelling ? (
                            <>
                                <span className="verify-small-spinner" />

                                Cancelling...
                            </>
                        ) : (
                            <>
                                <ArrowBackRoundedIcon />

                                Back to sign up
                            </>
                        )}

                    </button>


                    {/* Information */}

                    <div className="verify-information">

                        <SecurityRoundedIcon />

                        <p>
                            This verification step helps
                            keep your TalkSpace account
                            secure.
                        </p>

                    </div>

                </div>

            </main>


            {/* Footer */}

            <footer className="verify-footer">

                <span>
                    TalkSpace ©{' '}
                    {new Date().getFullYear()}
                </span>

                <span className="verify-footer-dot">
                    •
                </span>

                <span>
                    Connect. Discover. Talk.
                </span>

            </footer>

        </div>
    );
};

export default VerifyEmailForm;