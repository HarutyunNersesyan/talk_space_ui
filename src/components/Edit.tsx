import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Edit.css';

const Edit: React.FC = () => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [aboutMe, setAboutMe] = useState<string>("");
    const [birthDate, setBirthDate] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode<{ sub: string }>(token);
                    const email = decodedToken.sub;

                    const response = await axios.get(`http://localhost:8080/api/public/user/edit/${email}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const userData = response.data;
                    setFirstName(userData.firstName || "");
                    setLastName(userData.lastName || "");
                    setAboutMe(userData.aboutMe || "");

                    if (userData.birthDate) {
                        if (/^\d{4}-\d{2}-\d{2}$/.test(userData.birthDate)) {
                            setBirthDate(userData.birthDate);
                        } else {
                            const date = new Date(userData.birthDate);
                            if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                setBirthDate(`${year}-${month}-${day}`);
                            }
                        }
                    } else {
                        setBirthDate("");
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setNotification({ message: 'Failed to fetch user profile. Please try again later.', type: 'error' });
                }
            }
        };

        fetchUserProfile();
    }, [token]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const formatErrorMessage = (error: string): string => {
        if (error.includes('value too long for type character varying(250)')) {
            return 'Your information should not exceed 250 characters';
        }
        if (error.includes('Validation failed for object=\'editUser\'')) {
            return 'First name and last name must start with a capital letter followed by lowercase letters';
        }
        return error;
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setNotification(null);

            if (!token) {
                throw new Error('No token found.');
            }

            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;

            let formattedBirthDate = null;
            if (birthDate) {
                const date = new Date(birthDate);
                if (!isNaN(date.getTime())) {
                    formattedBirthDate = date.toISOString().split('T')[0];
                }
            }

            const updatedProfile = {
                firstName,
                lastName,
                aboutMe,
                birthDate: formattedBirthDate,
            };

            const response = await axios.put(
                `http://localhost:8080/api/public/user/editUser?email=${email}`,
                updatedProfile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Profile updated successfully:', response.data);
            setNotification({ message: 'Profile updated successfully!', type: 'success' });
        } catch (err: any) {
            console.error('Error updating profile:', err);
            let errorMessage = err.response?.data?.message || err.message || 'Failed to update profile. Please try again later.';
            errorMessage = formatErrorMessage(errorMessage);
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePasswordClick = () => {
        navigate('/changePassword');
    };

    const handleBackClick = () => {
        navigate('/profile');
    };

    return (
        <div className="edit-container">
            <h1>Edit Profile</h1>
            <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    pattern="[A-Z][a-z]*"
                    title="First name must start with a capital letter followed by lowercase letters"
                />
            </div>
            <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    pattern="[A-Z][a-z]*"
                    title="Last name must start with a capital letter followed by lowercase letters"
                />
            </div>
            <div className="form-group">
                <label htmlFor="birthDate">Birth Date</label>
                <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="aboutMe">About Me <span className="character-count">({aboutMe.length}/250)</span></label>
                <textarea
                    id="aboutMe"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Tell us about yourself (max 250 characters)"
                    rows={4}
                    maxLength={250}
                />
            </div>
            <div className="buttons-container">
                <button onClick={handleBackClick} className="back-button">
                    Cancel
                </button>
                <button onClick={handleSave} className="save-button" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleChangePasswordClick} className="change-password-button">
                    Change Password
                </button>
            </div>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Edit;