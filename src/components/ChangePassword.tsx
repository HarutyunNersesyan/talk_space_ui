import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showNewPasswordRepeat, setShowNewPasswordRepeat] = useState<boolean>(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!oldPassword) {
            errors.oldPassword = "Old password is required.";
        }
        if (!newPassword) {
            errors.newPassword = "New password is required.";
        }
        if (!newPasswordRepeat) {
            errors.newPasswordRepeat = "Repeat new password is required.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdatePassword = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            setValidationErrors({});

            if (!validateForm()) {
                return;
            }

            if (!token) {
                throw new Error('No token found.');
            }

            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;

            const changePasswordData = {
                oldPassword,
                newPassword,
                newPasswordRepeat,
            };

            const response = await axios.put(
                `http://localhost:8080/api/public/user/changePassword?email=${email}`,
                changePasswordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Password updated successfully:', response.data);
            setSuccessMessage(response.data);
            alert(response.data);
            navigate('/profile');
        } catch (err: any) {
            console.error('Error updating password:', err);

            if (err.response?.status === 400 && err.response?.data) {
                if (Array.isArray(err.response.data)) {
                    const errors: { [key: string]: string } = {};
                    err.response.data.forEach((error: string) => {
                        if (error.includes("oldPassword")) {
                            errors.oldPassword = error;
                        } else if (error.includes("newPassword")) {
                            errors.newPassword = error;
                        } else if (error.includes("newPasswordRepeat")) {
                            errors.newPasswordRepeat = error;
                        }
                    });
                    setValidationErrors(errors);
                } else {
                    setError(err.response.data.message || err.response.data);
                }
            } else {
                setError(err.message || 'Failed to update password. Please try again later.');
            }
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/edit');
    };

    return (
        <div className="change-password-container">
            <h1>Change Password</h1>
            <div className="form-group">
                <label htmlFor="oldPassword">Old Password</label>
                <div className="password-input-container">
                    <input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your old password"
                    />
                    <span className="eye-icon" onClick={() => setShowOldPassword(!showOldPassword)}>
                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {validationErrors.oldPassword && <div className="validation-error">{validationErrors.oldPassword}</div>}
            </div>
            <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-container">
                    <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                    />
                    <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {validationErrors.newPassword && <div className="validation-error">{validationErrors.newPassword}</div>}
            </div>
            <div className="form-group">
                <label htmlFor="newPasswordRepeat">Repeat New Password</label>
                <div className="password-input-container">
                    <input
                        id="newPasswordRepeat"
                        type={showNewPasswordRepeat ? "text" : "password"}
                        value={newPasswordRepeat}
                        onChange={(e) => setNewPasswordRepeat(e.target.value)}
                        placeholder="Repeat your new password"
                    />
                    <span className="eye-icon" onClick={() => setShowNewPasswordRepeat(!showNewPasswordRepeat)}>
                        {showNewPasswordRepeat ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {validationErrors.newPasswordRepeat && <div className="validation-error">{validationErrors.newPasswordRepeat}</div>}
            </div>
            <div className="buttons-container">
                <button onClick={handleBackClick} className="back-button">
                    <FaArrowLeft /> Cancel
                </button>
                <button onClick={handleUpdatePassword} className="update-button" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
    );
};

export default ChangePassword;