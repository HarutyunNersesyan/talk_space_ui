import React, { useState } from 'react';
import './NetworkPage.css';
import { useNavigate } from 'react-router-dom';
import hobbiesIcon from '../assets/search/hobbies-icon.svg';
import specialtiesIcon from '../assets/search/specialties-icon.svg';
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
                setHobbiesError('No matching profiles found. Please try different criteria.');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setHobbiesError('No matching profiles found. Please try different criteria.');
                } else {
                    setHobbiesError('You have no hobbies selected. Please add at least one and try again.');
                }
            } else {
                setHobbiesError('An unexpected error occurred');
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
                setSpecialtiesError('No matching profiles found. Please try different criteria.');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setSpecialtiesError('No matching profiles found. Please try different criteria.');
                } else {
                    setSpecialtiesError('You have no specialties selected. Please add at least one and try again.');
                }
            } else {
                setSpecialtiesError('An unexpected error occurred');
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
                    <h1>Network with Purpose</h1>
                    <p>
                        Connect with like-minded individuals based on your field or personal interests. <br />
                        Grow friendships, collaborations, or more.
                    </p>
                </div>
            </div>

            <div className="network-options">
                <div className="option" onClick={handleHobbiesSearch}>
                    <div className="icon-wrapper">
                        <img src={hobbiesIcon} alt="Hobbies" className="highlighted-icon" />
                    </div>
                    <p>Want to connect with people who share your interests?</p>
                    <button disabled={isSearchingHobbies}>
                        {isSearchingHobbies ? 'Searching...' : 'Search by Hobbies'}
                    </button>
                    {hobbiesError && <div className="search-error">{hobbiesError}</div>}
                </div>

                <div className="divider"></div>

                <div className="option" onClick={handleSpecialtiesSearch}>
                    <div className="icon-wrapper">
                        <img src={specialtiesIcon} alt="Specialties" className="highlighted-icon" />
                    </div>
                    <p>Want to connect with people who share your professional skills?</p>
                    <button disabled={isSearchingSpecialties}>
                        {isSearchingSpecialties ? 'Searching...' : 'Search by Specialties'}
                    </button>
                    {specialtiesError && <div className="search-error">{specialtiesError}</div>}
                </div>
            </div>
        </div>
    );
};

export default NetworkPage;