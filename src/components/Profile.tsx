// Profile.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faInstagram,
    faTwitter,
    faLinkedin,
    faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faTimes, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import editIcon from '../assets/edit.svg';
import hobbiesIcon from '../assets/search/hobbies-icon.svg';
import specialtiesIcon from '../assets/search/specialties-icon.svg';
import internetIcon from '../assets/search/internet.svg';
import aboutIcon from '../assets/info.svg'; // Import an icon for "About"

interface SearchUser {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    age: number;
    gender: string;
    zodiac: string;
    about: string;
    hobbies: string[];
    specialities: string[];
    socialNetworks: string[] | undefined;
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

const getPlatformFromUrl = (url: string): string => {
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('twitter.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('youtube.com')) return 'youtube';
    return 'default';
};

const Profile: React.FC = () => {
    const [picture, setPicture] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<SearchUser | null>(null);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode<{ sub: string }>(token);
                    const email = decodedToken.sub;

                    const nameResponse = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserName(nameResponse.data);

                    const infoResponse = await axios.get(`http://localhost:8080/api/public/user/profile/${email}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserInfo(infoResponse.data);
                } catch (err) {
                    console.error('Error fetching user information:', err);
                    setError('Failed to fetch user information. Please try again later.');
                }
            }
        };

        fetchUserInfo();
    }, [token]);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (!userName) return;
            try {
                const response = await axios.get(`http://localhost:8080/api/public/user/image/${userName}`, {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const imageUrl = URL.createObjectURL(response.data);
                setPicture(imageUrl);
            } catch (err) {
                console.error('No profile picture found:', err);
                setPicture(null);
            }
        };

        if (userName) fetchProfilePicture();
    }, [userName, token]);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (picture) {
            setIsFullScreen(true);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleEditUsernameClick = () => {
        navigate('/edit');
    };

    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && userName) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setPicture(previewUrl);
            setIsFullScreen(true);
        }
    };

    const handleCloseFullScreen = () => {
        setIsFullScreen(false);
        setSelectedFile(null);
        window.location.reload();
    };

    const handleSavePicture = async () => {
        if (selectedFile && userName) {
            try {
                setLoading(true);
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('userName', userName);

                await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });

                window.location.reload();
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                setError('Failed to upload profile picture. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeletePicture = async () => {
        if (userName) {
            setDeleteLoading(true);
            try {
                await axios.delete(`http://localhost:8080/api/public/user/image/delete/${userName}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                window.location.reload();
            } catch (err: any) {
                console.error('Error deleting profile picture:', err);
                setError(err.response?.data || 'Failed to delete profile picture.');
            } finally {
                setDeleteLoading(false);
            }
        }
    };

    const handleViewPicture = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (picture) {
            setIsFullScreen(true);
        }
    };

    const handleUpdateHobbiesClick = () => navigate('/hobbies');
    const handleUpdateSpecialtiesClick = () => navigate('/specialities');
    const handleUpdateSocialNetworksClick = () => navigate('/social-networks');

    const formatZodiac = (zodiac: string) =>
        zodiac.charAt(0).toUpperCase() + zodiac.slice(1).toLowerCase();

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-content">
                    <div className="profile-info">
                        <div className="profile-image-wrapper">
                            <div className="profile-image-container" onClick={handleViewPicture}>
                                {picture ? (
                                    <img src={picture} alt="Profile" className="profile-image" />
                                ) : (
                                    <div className="profile-image-placeholder"></div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePictureChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <button
                                className="edit-image-button"
                                onClick={handleEditClick}
                                aria-label="Edit profile picture"
                            >
                                <img src={editIcon} alt="Edit" className="edit-icon" />
                            </button>
                        </div>
                        {userInfo && (
                            <>
                                <h2 className="profile-name">
                                    {userInfo.firstName} {userInfo.lastName}
                                    <span className="username-brackets"> ({userName})</span>
                                    <button
                                        className="edit-username-button"
                                        onClick={handleEditUsernameClick}
                                        aria-label="Edit username"
                                    >
                                        <img src={editIcon} alt="Edit" className="edit-username-icon" />
                                    </button>
                                </h2>
                                <div className="profile-details">
                                    <span className="profile-detail">Age: {userInfo.age}</span>
                                    {userInfo.gender && (
                                        <span className="profile-detail gender-icon-container">
                                            {['FEMALE', 'MALE'].includes(userInfo.gender.toUpperCase()) && (
                                                <img
                                                    src={genderIcons[userInfo.gender.toUpperCase()]}
                                                    alt={userInfo.gender}
                                                    className={`gender-icon ${
                                                        userInfo.gender.toUpperCase() === 'FEMALE'
                                                            ? 'female-icon'
                                                            : 'male-icon'
                                                    }`}
                                                    title={userInfo.gender.toUpperCase()}
                                                />
                                            )}
                                        </span>
                                    )}
                                    {userInfo.zodiac && (
                                        <span className="profile-detail zodiac-container">
                                            Zodiac:
                                            <img
                                                src={zodiacIcons[userInfo.zodiac.toUpperCase()]}
                                                alt={userInfo.zodiac}
                                                className="zodiac-icon"
                                                title={formatZodiac(userInfo.zodiac)}
                                            />
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="profile-section">
                            <p><b>About me:</b> {userInfo?.about || "No information available"}</p>
                        </div>
                        <div className="profile-section">
                            <p><b>Hobbies:</b> {userInfo?.hobbies?.join(', ') || "No Hobbies"}</p>
                        </div>
                        <div className="profile-section">
                            <p><b>Specialities:</b> {userInfo?.specialities?.join(', ') || "No Specialties"}</p>
                        </div>
                        <div className="profile-section social-networks-section">
                            <p className="social-networks-title"><b>Social Networks:</b></p>
                            <div className="social-icons-container">
                                {userInfo?.socialNetworks && userInfo.socialNetworks.length > 0 ? (
                                    userInfo.socialNetworks.map((url, index) => {
                                        const platform = getPlatformFromUrl(url);
                                        const icon = socialIcons[platform];
                                        if (!icon) return null;
                                        return (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link"
                                            >
                                                <FontAwesomeIcon icon={icon} />
                                            </a>
                                        );
                                    })
                                ) : (
                                    <span className="no-social">No Social Networks</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <div className="welcome-container">
                            <h2 className="welcome-message">Welcome !</h2>
                        </div>
                        <p className="complete-profile-text">Complete your profile so others can find you more easily and get to know you better.</p>
                        <button className="action-item" onClick={handleUpdateHobbiesClick}>
                            <img src={hobbiesIcon} alt="Hobbies" className="action-icon" />
                            Update Hobbies <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <button className="action-item" onClick={handleUpdateSpecialtiesClick}>
                            <img src={specialtiesIcon} alt="Specialties" className="action-icon" />
                            Update Specialties <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <button className="action-item" onClick={handleUpdateSocialNetworksClick}>
                            <img src={internetIcon} alt="Social Networks" className="action-icon" />
                            Update Social Networks <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>
            </div>

            {isFullScreen && picture && (
                <div className="fullscreen-image-overlay">
                    <div className="fullscreen-image-container">
                        <img src={picture} alt="Profile Preview" className="fullscreen-image" />
                        <div className="fullscreen-image-controls">
                            <button
                                className="fullscreen-button delete-button"
                                onClick={handleDeletePicture}
                                disabled={deleteLoading}
                            >
                                <FontAwesomeIcon icon={faTrash} /> {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                            {selectedFile && (
                                <button
                                    className="fullscreen-button save-button"
                                    onClick={handleSavePicture}
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={faSave} /> {loading ? 'Saving...' : 'Save'}
                                </button>
                            )}
                            <button
                                className="fullscreen-button close-button"
                                onClick={handleCloseFullScreen}
                            >
                                <FontAwesomeIcon icon={faTimes} /> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Profile;