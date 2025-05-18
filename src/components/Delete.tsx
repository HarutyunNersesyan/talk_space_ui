import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Delete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faExclamationTriangle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface DeleteProps {
    onClose?: () => void;
    isModal?: boolean;
}

interface JwtPayload {
    sub: string;
    [key: string]: any;
}

const Delete: React.FC<DeleteProps> = ({ onClose, isModal = true }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode<JwtPayload>(token) : null;
    const email = decodedToken?.sub || '';
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!email) {
            setError('No email found in token');
            return;
        }

        if (!password) {
            setError('Please enter your password');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await axios.delete('http://localhost:8080/api/public/user/delete/account', {
                data: { email, password },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setSuccess('Account deleted successfully. Redirecting...');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }, 2000);
            }
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.message || err.response.data || 'Failed to delete account');
            } else if (err.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (isModal && onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`delete-container ${isModal ? 'delete-modal' : 'delete-standalone'}`}>
            <div className="delete-content">
                {isModal ? (
                    <button
                        className="delete-close-button"
                        onClick={() => {
                            if (onClose) onClose();
                            navigate('/edit');
                        }}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                ) : (
                    <button className="delete-back-button" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                )}
                <h2 className="delete-title">Delete Account</h2>
                <div className="delete-warning-box">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                    <p className="delete-warning">
                        Warning: Deleting your account will permanently remove all your information and chats.
                        This action cannot be undone.
                    </p>
                </div>
                <div className="delete-input-group">
                    <label htmlFor="password" className="delete-label">
                        <strong>Enter your password to confirm</strong>
                    </label>
                    <div className="password-input-container">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="delete-input"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                {error && <p className="delete-error">{error}</p>}
                {success && <p className="delete-success">{success}</p>}
                <div className="delete-button-container">
                    <button
                        className="delete-confirm-button"
                        onClick={handleDelete}
                        disabled={loading || !!success}
                    >
                        {loading ? 'Deleting...' : 'Delete account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Delete;