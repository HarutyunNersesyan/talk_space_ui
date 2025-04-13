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
import { faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';
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
    email: string;
    age: number;
    gender: string;
    zodiac: string;
    aboutMe: string;
    hobbies: string[];
    specialties: string[];
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

    const handlePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && userName) {
            try {
                setLoading(true);
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                formData.append('userName', userName);

                await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const response = await axios.get(`http://localhost:8080/api/public/user/image/${userName}`, {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const imageUrl = URL.createObjectURL(response.data);
                setPicture(imageUrl);
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                setError('Failed to upload profile picture. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeletePicture = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (userName) {
            setDeleteLoading(true);
            try {
                await axios.delete(`http://localhost:8080/api/public/user/image/delete/${userName}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPicture(null);
            } catch (err: any) {
                console.error('Error deleting profile picture:', err);
                setError(err.response?.data || 'Failed to delete profile picture.');
            } finally {
                setDeleteLoading(false);
            }
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
                        <div className="profile-image-container" onClick={handlePictureClick}>
                            {picture ? (
                                <div className="profile-image-wrapper">
                                    <img src={picture} alt="Profile" className="profile-image" />
                                    <button
                                        className="delete-image-button"
                                        onClick={handleDeletePicture}
                                        disabled={deleteLoading}
                                        aria-label="Delete profile picture"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    {deleteLoading && <div className="delete-loading">Deleting...</div>}
                                </div>
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
                            {loading && <div className="upload-loading">Uploading...</div>}
                        </div>
                        {userInfo && (
                            <>
                                <h2 className="profile-name">
                                    {userInfo.firstName} {userInfo.lastName}
                                    <span className="username-brackets"> ({userName})</span>
                                </h2>
                                <div className="profile-details">
                                    <span className="profile-detail">Age: {userInfo.age}</span>
                                    {userInfo.gender && (
                                        <span className="profile-detail gender-icon-container">
                                            Gender: {userInfo.gender.charAt(0).toUpperCase() + userInfo.gender.slice(1).toLowerCase()}
                                            {['FEMALE', 'MALE'].includes(userInfo.gender.toUpperCase()) && (
                                                <img
                                                    src={genderIcons[userInfo.gender.toUpperCase()]}
                                                    alt={userInfo.gender}
                                                    className={`gender-icon ${
                                                        userInfo.gender.toUpperCase() === 'FEMALE'
                                                            ? 'female-icon'
                                                            : 'male-icon'
                                                    }`}
                                                    title={userInfo.gender}
                                                />
                                            )}
                                        </span>
                                    )}
                                    {userInfo.zodiac && (
                                        <span className="profile-detail zodiac-container">
                                            Zodiac: {formatZodiac(userInfo.zodiac)}
                                            <img
                                                src={zodiacIcons[userInfo.zodiac.toUpperCase()]}
                                                alt={userInfo.zodiac}
                                                className="zodiac-icon"
                                            />
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="profile-section">
                            <p><b>About:</b> {userInfo?.aboutMe || "No information available"}</p>
                        </div>
                        <div className="profile-section">
                            <p><b>Hobbies:</b> {userInfo?.hobbies?.join(', ') || "No Hobbies"}</p>
                        </div>
                        <div className="profile-section">
                            <p><b>Specialties:</b> {userInfo?.specialties?.join(', ') || "No Specialties"}</p>
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
                        <h2 className="welcome-message">Welcome !</h2>
                        <p className="complete-profile-text">Complete your profile so others can find you more easily and get to know you better.</p>
                        <button className="action-item" onClick={handleUpdateHobbiesClick}>
                            Update Hobbies <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <button className="action-item" onClick={handleUpdateSpecialtiesClick}>
                            Update Specialties <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <button className="action-item" onClick={handleUpdateSocialNetworksClick}>
                            Update Social Networks <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Profile;