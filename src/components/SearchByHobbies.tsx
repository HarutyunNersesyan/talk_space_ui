// SearchByHobbies.tsx

import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './SearchByHobbies.css';
import defaultProfileImage from '../assets/default-profile-image.jpg';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faInstagram,
    faTwitter,
    faLinkedin,
    faYoutube
} from '@fortawesome/free-brands-svg-icons';
import likeIcon from '../assets/search/like.svg';
import searchIcon from '../assets/search/loop.svg';
import backIcon from '../assets/search/back.svg'; // Import the back icon
import femaleIcon from '../assets/gender/female-symbol.svg';
import maleIcon from '../assets/gender/male-symbol.svg';
import ariesIcon from '../assets/zodiac/aries.svg';
import taurusIcon from '../assets/zodiac/taurus.svg';
import geminiIcon from '../assets/zodiac/gemini.svg';
import cancerIcon from '../assets/zodiac/cancer.svg';
import leoIcon from '../assets/zodiac/leo.svg';
import virgoIcon from '../assets/zodiac/virgo.svg';
import libraIcon from '../assets/zodiac/libra.svg';
import scorpioIcon from '../assets/zodiac/scorpio.svg';
import sagittariusIcon from '../assets/zodiac/sagittarius.svg';
import capricornIcon from '../assets/zodiac/capricorn.svg';
import aquariusIcon from '../assets/zodiac/aquarius.svg';
import piscesIcon from '../assets/zodiac/horoscope-pisces-solid.svg';

interface SearchUser {
    firstName: string;
    lastName: string;
    userName: string;
    age: number;
    gender: string;
    zodiac: string;
    about: string;
    hobbies: string[];
    specialities: string[];
    socialNetworks: string[];
}

interface Like {
    liker: {
        userName: string;
    };
    liked: {
        userName: string;
    };
}

const socialIcons: { [key: string]: any } = {
    'facebook': faFacebook,
    'instagram': faInstagram,
    'twitter': faTwitter,
    'linkedin': faLinkedin,
    'youtube': faYoutube,
};

const zodiacIcons: { [key: string]: string } = {
    'ARIES': ariesIcon,
    'TAURUS': taurusIcon,
    'GEMINI': geminiIcon,
    'CANCER': cancerIcon,
    'LEO': leoIcon,
    'VIRGO': virgoIcon,
    'LIBRA': libraIcon,
    'SCORPIO': scorpioIcon,
    'SAGITTARIUS': sagittariusIcon,
    'CAPRICORN': capricornIcon,
    'AQUARIUS': aquariusIcon,
    'PISCES': piscesIcon,
};

const genderIcons: { [key: string]: string } = {
    'FEMALE': femaleIcon,
    'MALE': maleIcon
};

const SearchByHobbies: React.FC = () => {
    const location = useLocation();
    const [userProfile, setUserProfile] = useState<SearchUser | null>(location.state?.initialProfile || null);
    const [error, setError] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);
    const [isLiking, setIsLiking] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

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

                setCurrentUserName(response.data);

                // If we didn't get an initial profile, search immediately
                if (!location.state?.initialProfile) {
                    handleSearchByHobbies();
                }
            } catch (error) {
                console.error('Failed to fetch userName:', error);
                setError('Failed to authenticate user');
            }
        };

        fetchUserName();
    }, []);

    useEffect(() => {
        if (userProfile) {
            const fetchImage = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8080/api/public/user/image/${userProfile.userName}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                            responseType: 'blob'
                        }
                    );

                    const imageUrl = URL.createObjectURL(response.data);
                    setImageUrls(prev => ({
                        ...prev,
                        [userProfile.userName]: imageUrl
                    }));
                } catch (error) {
                    console.error('Error fetching image:', error);
                }
            };

            fetchImage();
        }
    }, [userProfile]);

    useEffect(() => {
        return () => {
            Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageUrls]);

    const handleSearchByHobbies = async () => {
        if (!currentUserName) {
            setError('User not authenticated');
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const response = await axios.get(
                `http://localhost:8080/api/public/user/searchByHobbies/${currentUserName}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.data) {
                const userData = {
                    ...response.data,
                    hobbies: Array.isArray(response.data.hobbies) ? response.data.hobbies : [],
                    specialities: Array.isArray(response.data.specialities) ? response.data.specialities : [],
                    socialNetworks: Array.isArray(response.data.socialNetworks) ? response.data.socialNetworks : []
                };
                setUserProfile(userData);
            } else {
                setError('No matching profiles found, please try again later.');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError('No matching profiles found, please try again later.');
                } else {
                    setError(error.response?.data || 'Failed to fetch by hobbies');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleLike = async () => {
        if (!currentUserName || !userProfile || isLiking) return;

        setIsLiking(true);
        try {
            const response = await axios.post(
                'http://localhost:8080/api/public/user/like',
                {
                    liker: {userName: currentUserName},
                    liked: {userName: userProfile.userName}
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                alert('Like sent successfully!');
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    alert('You already liked this profile');
                } else if (error.response?.status === 404) {
                    alert('User not found');
                } else {
                    alert('Failed to send like: ' + error.response?.data);
                }
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsLiking(false);
        }
    };

    const handleNavigateToNetwork = () => {
        navigate('/choose');
    };

    const getPlatformFromUrl = (url: string): string => {
        if (url.includes('facebook.com')) return 'facebook';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('twitter.com')) return 'twitter';
        if (url.includes('linkedin.com')) return 'linkedin';
        if (url.includes('youtube.com')) return 'youtube';
        return 'unknown';
    };

    const formatZodiac = (zodiac: string) => {
        return zodiac.charAt(0).toUpperCase() + zodiac.slice(1).toLowerCase();
    };

    return (
        <div className="parent-container">
            <div className="search-container">
                {userProfile ? (
                    <>
                        <div className="image-container">
                            <div className="image-placeholder">
                                <img
                                    src={imageUrls[userProfile.userName] || defaultProfileImage}
                                    alt="Profile"
                                    className="profile-image"
                                    onError={(e) => {
                                        e.currentTarget.src = defaultProfileImage;
                                    }}
                                />
                            </div>
                        </div>
                        <div className="search-info">
                            <div className="user-name">
                                {userProfile.firstName} {userProfile.lastName} ({userProfile.userName})
                            </div>
                            <div className="user-details">
                                <span className="age-text">Age: {userProfile.age}</span>
                                <span className="gender-icon-container">
                                    {['FEMALE', 'MALE'].includes(userProfile.gender.toUpperCase()) && (
                                        <img
                                            src={genderIcons[userProfile.gender.toUpperCase()]}
                                            alt={userProfile.gender}
                                            className={`gender-icon ${
                                                userProfile.gender.toUpperCase() === 'FEMALE'
                                                    ? 'female-icon'
                                                    : 'male-icon'
                                            }`}
                                            title={userProfile.gender}
                                        />
                                    )}
                                </span>
                                <span className="zodiac-container">
                                    {formatZodiac(userProfile.zodiac)}
                                    <img
                                        src={zodiacIcons[userProfile.zodiac.toUpperCase()]}
                                        alt={userProfile.zodiac}
                                        className="zodiac-icon"
                                    />
                                </span>
                            </div>
                            <div className="user-about">
                                <strong>About:</strong> {userProfile.about || 'No information available'}
                            </div>
                            <div className="user-hobbies">
                                <strong>Hobbies:</strong> {userProfile.hobbies.length > 0 ? userProfile.hobbies.join(', ') : 'No hobbies listed'}
                            </div>
                            <div className="user-specialities">
                                <strong>Specialities:</strong> {userProfile.specialities.length > 0 ? userProfile.specialities.join(', ') : 'No specialities listed'}
                            </div>
                            <div className="user-social-networks">
                                <strong>Social Networks:</strong>
                                {userProfile.socialNetworks.length > 0 ? (
                                    <div className="social-icons">
                                        {userProfile.socialNetworks.map((url, index) => {
                                            const platform = getPlatformFromUrl(url);
                                            const icon = socialIcons[platform];
                                            return (
                                                <div key={index} className="social-network-item">
                                                    {icon && (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="social-icon-link"
                                                        >
                                                            <FontAwesomeIcon icon={icon} size="2x"/>
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span>No social networks listed</span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-profile">
                        {isSearching ? 'Searching for matching profiles...' : 'No profile data available'}
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                <div className="search-buttons">
                    <button className="back-button" onClick={handleNavigateToNetwork}>
                        <img src={backIcon} alt="Back" className="back-icon"/>
                    </button>

                    <button
                        className="like-button"
                        onClick={handleLike}
                        disabled={isLiking || !userProfile}
                    >
                        <img src={likeIcon} alt="Like" className="like-icon"/>
                        {isLiking ? 'Liking...' : 'Like'}
                    </button>
                    <button
                        className="search-button"
                        onClick={handleSearchByHobbies}
                        disabled={isSearching}
                    >
                        <img src={searchIcon} alt="Search" className="search-icon"/>
                        {isSearching ? 'Searching...' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchByHobbies;