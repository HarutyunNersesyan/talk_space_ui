import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Edit.css'; // Ensure you have the corresponding CSS file

const Edit: React.FC = () => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [aboutMe, setAboutMe] = useState<string>("");
    const [birthDate, setBirthDate] = useState<string>(""); // New state for birth date
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize useNavigate

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode<{ sub: string }>(token);
                    const email = decodedToken.sub;

                    // Fetch user profile data using the /api/public/user/get/{email} endpoint
                    const response = await axios.get(`http://localhost:8080/api/public/user/get/${email}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const userData = response.data;
                    setFirstName(userData.firstName || "");
                    setLastName(userData.lastName || "");
                    setAboutMe(userData.aboutMe || "");

                    // Format birthDate to yyyy-MM-dd for the input field
                    if (userData.birthDate) {
                        const formattedDate = new Date(userData.birthDate).toISOString().split('T')[0];
                        setBirthDate(formattedDate);
                    } else {
                        setBirthDate(""); // Handle null or undefined birthDate
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError('Failed to fetch user profile. Please try again later.');
                }
            }
        };

        fetchUserProfile();
    }, [token]);

    // Handle form submission
    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error('No token found.');
            }

            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;

            // Prepare the data to be sent to the backend
            const updatedProfile = {
                firstName,
                lastName,
                aboutMe,
                birthDate: birthDate || null, // Send null if birthDate is empty
            };

            // Send the updated profile data to the backend
            const response = await axios.put(
                `http://localhost:8080/api/public/user/editUser?email=${email}`, // Updated endpoint
                updatedProfile, // Request body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Profile updated successfully:', response.data); // Debug log
            alert('Profile updated successfully!');
            navigate('/profile'); // Redirect back to the profile page
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again later.');
            alert('Failed to update profile. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle navigation to the change password page
    const handleChangePasswordClick = () => {
        navigate('/changePassword');
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
            <div className="buttons-section">
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