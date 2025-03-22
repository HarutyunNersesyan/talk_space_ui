import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Search.css';
import defaultProfileImage from '../assets/default-profile-image.jpg'; // Import a local fallback image

interface SearchUser {
    firstName: string;
    lastName: string;
    userName: string;
    age: number;
    gender: string;
    zodiac: string;
    image?: string; // Updated to match the backend (now a string)
    about: string; // Added about field
    hobbies: string[];
    specialities: string[];
    socialNetworks: string[];
}

const Search: React.FC = () => {
    const [userProfile, setUserProfile] = useState<SearchUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const navigate = useNavigate();

    // Retrieve email from JWT token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode<{ sub: string }>(token);
                setEmail(decodedToken.sub);
            } catch (error) {
                console.error('Failed to decode JWT:', error);
            }
        }
    }, []);

    // Handle search by hobbies
    const handleSearchByHobbies = async () => {
        if (!email) {
            setError('Email not found in JWT token');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/public/user/searchByHobbies/${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data) {
                setUserProfile(response.data);
                setError(null); // Clear any previous errors
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError('Profiles are out of date, please try again later.');
                } else {
                    setError(error.response?.data || 'Failed to fetch data by hobbies.');
                }
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    // Handle search by specialities
    const handleSearchBySpecialities = async () => {
        if (!email) {
            setError('Email not found in JWT token');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/public/user/searchBySpecialities/${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data) {
                setUserProfile(response.data);
                setError(null); // Clear any previous errors
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError('Profiles are out of date, please try again later.');
                } else {
                    setError(error.response?.data || 'Failed to fetch data by specialities.');
                }
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="parent-container">
            <div className="search-container">
                {userProfile ? (
                    <>
                        <div className="image-container">
                            <div className="image-placeholder">
                                <img
                                    src={userProfile.image || defaultProfileImage} // Fallback to local image
                                    alt="Profile"
                                    className="profile-image"
                                />
                            </div>
                        </div>
                        <div className="search-info">
                            <div className="user-name">
                                {userProfile.firstName} {userProfile.lastName} ({userProfile.userName})
                            </div>
                            <div className="user-details">
                                <span className="detail-item">Age: {userProfile.age}</span>
                                <span className="detail-item">Gender: {userProfile.gender}</span>
                                <span className="detail-item">Zodiac: {userProfile.zodiac}</span>
                            </div>
                            <div className="user-about">
                                <strong>About:</strong> {userProfile.about}
                            </div>
                            <div className="user-hobbies">
                                <strong>Hobbies:</strong> {userProfile.hobbies.join(', ')}
                            </div>
                            <div className="user-specialities">
                                <strong>Specialities:</strong> {userProfile.specialities.join(', ')}
                            </div>
                            <div className="user-social-networks">
                                <strong>Social Networks:</strong> {userProfile.socialNetworks.join(', ')}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-profile">No profile data available.</div>
                )}
                {error && <div className="error-message">{error}</div>}
                <div className="search-buttons">
                    <button className="search-button" onClick={handleSearchByHobbies}>
                        Search By Hobbies
                    </button>
                    <button className="search-button" onClick={handleSearchBySpecialities}>
                        Search By Specialities
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Search;