// Edit.tsx
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
    const [error, setError] = useState<string | null>(null);
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

                    // Handle birth date more robustly
                    if (userData.birthDate) {
                        // Check if the date is already in the correct format (YYYY-MM-DD)
                        if (/^\d{4}-\d{2}-\d{2}$/.test(userData.birthDate)) {
                            setBirthDate(userData.birthDate);
                        } else {
                            // Parse and format the date if it's not in the correct format
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
                    setError('Failed to fetch user profile. Please try again later.');
                }
            }
        };

        fetchUserProfile();
    }, [token]);

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error('No token found.');
            }

            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;

            // Prepare the birth date for sending to the backend
            let formattedBirthDate = null;
            if (birthDate) {
                // Ensure the date is in the correct format
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
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again later.');
            alert('Failed to update profile. Please try again later.');
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
                <label htmlFor="aboutMe">About Me</label>
                <textarea
                    id="aboutMe"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
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
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Edit;