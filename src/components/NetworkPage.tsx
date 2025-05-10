import React, { useState } from 'react';
import './NetworkPage.css';
import { useNavigate } from 'react-router-dom';
import hobbiesImage from '../assets/network/Hobbies.jpg';
import specialtiesImage from '../assets/network/Specialities.jpg';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const NetworkPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSearchingHobbies, setIsSearchingHobbies] = useState(false);
    const [isSearchingSpecialties, setIsSearchingSpecialties] = useState(false);
    const [hobbiesError, setHobbiesError] = useState('');
    const [specialtiesError, setSpecialtiesError] = useState('');

    const getCurrentUserName = async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decodedToken = jwtDecode<{ sub: string }>(token);
            const email = decodedToken.sub;

            const response = await axios.get(
                `http://localhost:8080/api/public/user/get/userName/${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch userName:', error);
            return null;
        }
    };

    const handleHobbiesSearch = async () => {
        setIsSearchingHobbies(true);
        setHobbiesError('');

        try {
            const currentUserName = await getCurrentUserName();
            if (!currentUserName) {
                setHobbiesError('User not authenticated');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/api/public/user/searchByHobbies/${currentUserName}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data) {
                navigate('/SearchByHobbies', { state: { initialProfile: response.data } });
            } else {
                setHobbiesError('No matching profiles found based on your hobbies. Please try different criteria.');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setHobbiesError('No matching profiles found based on your hobbies. Please try different criteria.');
                } else if (error.response?.status === 400) {
                    setHobbiesError('You have no hobbies selected. Please add at least one hobby and try again.');
                } else {
                    setHobbiesError('Failed to search by hobbies. Please try again later.');
                }
            } else {
                setHobbiesError('An unexpected error occurred while searching by hobbies.');
            }
        } finally {
            setIsSearchingHobbies(false);
        }
    };

    const handleSpecialtiesSearch = async () => {
        setIsSearchingSpecialties(true);
        setSpecialtiesError('');

        try {
            const currentUserName = await getCurrentUserName();
            if (!currentUserName) {
                setSpecialtiesError('User not authenticated');
                return;
            }

            const response = await axios.get(
                `http://localhost:8080/api/public/user/searchBySpecialities/${currentUserName}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data) {
                navigate('/SearchBySpecialities', { state: { initialProfile: response.data } });
            } else {
                setSpecialtiesError('No matching profiles found based on your specialties. Please try different criteria.');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setSpecialtiesError('No matching profiles found based on your specialties. Please try different criteria.');
                } else if (error.response?.status === 400) {
                    setSpecialtiesError('You have no specialties selected. Please add at least one specialty and try again.');
                } else {
                    setSpecialtiesError('Failed to search by specialties. Please try again later.');
                }
            } else {
                setSpecialtiesError('An unexpected error occurred while searching by specialties.');
            }
        } finally {
            setIsSearchingSpecialties(false);
        }
    };

    return (
        <div className="network-container">
            <div
                className="network-header"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard.jpg)`
                }}
            >
                <div className="header-content">
                    <h1>Network with purpose</h1>
                    <p>
                        Forge meaningful connections with individuals who share your passions, whether professional or personal.
                        Nurture friendships, spark collaborations, and discover relationships that inspire growth and possibility.
                    </p>
                </div>
            </div>

            <div className="network-options">
                <div className="option hobbies-option">
                    <div className="hobbies-image-container">
                        <img src={hobbiesImage} alt="Hobbies" className="hobbies-image" />
                        <button
                            className="hobbies-button"
                            disabled={isSearchingHobbies}
                            onClick={handleHobbiesSearch}
                        >
                            {isSearchingHobbies ? 'Searching...' : 'Search by Hobbies'}
                        </button>
                        {hobbiesError && <div className="hobbies-error">{hobbiesError}</div>}
                    </div>
                </div>

                <div className="divider"></div>

                <div className="option specialties-option">
                    <div className="specialties-image-container">
                        <img src={specialtiesImage} alt="Specialties" className="specialties-image" />
                        <button
                            className="specialties-button"
                            disabled={isSearchingSpecialties}
                            onClick={handleSpecialtiesSearch}
                        >
                            {isSearchingSpecialties ? 'Searching...' : 'Search by Specialties'}
                        </button>
                        {specialtiesError && <div className="specialties-error">{specialtiesError}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkPage;