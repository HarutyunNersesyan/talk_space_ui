import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faInstagram,
    faXTwitter,
    faLinkedin,
    faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import './SocialNetworks.css';
import BackIcon from '../assets/search/back.svg';
import SaveIcon from '../assets/network/save.svg';

interface SocialNetwork {
    platform: string;
    url: string;
}

interface SocialNetworksDto {
    userName: string;
    socialNetworks: SocialNetwork[];
}

const validPlatforms = [
    { platform: 'FACEBOOK', icon: faFacebook },
    { platform: 'INSTAGRAM', icon: faInstagram },
    { platform: 'X', icon: faXTwitter },
    { platform: 'LINKEDIN', icon: faLinkedin },
    { platform: 'YOUTUBE', icon: faYoutube },
];

const SocialNetworks: React.FC = () => {
    const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [newUrl, setNewUrl] = useState<string>('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (!token) {
                    showNotification('User not logged in.', 'error');
                    return;
                }

                const decodedToken = jwtDecode<{ sub: string }>(token);
                const email = decodedToken.sub;

                const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userName = response.data;
                setUserName(userName);
            } catch (err) {
                console.error('Error fetching userName:', err);
                showNotification('Failed to fetch userName. Please try again later.', 'error');
            }
        };

        fetchUserName();
    }, [token]);

    useEffect(() => {
        const fetchSocialNetworks = async () => {
            try {
                if (!userName) {
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/public/user/socialNetworks/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSocialNetworks(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching social networks:', err);
                setError('Failed to fetch social networks. Please try again later.');
                setLoading(false);
            }
        };

        if (userName) {
            fetchSocialNetworks();
        }
    }, [userName, token]);

    const handleUpdateSocialNetworks = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!userName || !selectedPlatform || !newUrl) {
                showNotification('Please select a platform and provide a valid URL.', 'error');
                return;
            }

            const existingNetworkIndex = socialNetworks.findIndex(
                (network) => network.platform === selectedPlatform
            );

            let updatedSocialNetworks: SocialNetwork[];
            if (existingNetworkIndex !== -1) {
                updatedSocialNetworks = socialNetworks.map((network, index) =>
                    index === existingNetworkIndex ? { ...network, url: newUrl } : network
                );
            } else {
                updatedSocialNetworks = [...socialNetworks, { platform: selectedPlatform, url: newUrl }];
            }

            const socialNetworksDto: SocialNetworksDto = {
                userName: userName,
                socialNetworks: updatedSocialNetworks.map((network) => ({
                    platform: network.platform,
                    url: network.url,
                })),
            };

            await axios.put('http://localhost:8080/api/public/user/update/socialNetworks', socialNetworksDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSocialNetworks(updatedSocialNetworks);
            setSelectedPlatform('');
            setNewUrl('');
            showNotification('Social networks updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating social networks:', err);
            showNotification('Please select a platform and provide a valid URL.', 'error');
        }
    };

    const handleIconClick = (platform: string) => {
        setSelectedPlatform(platform);
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (loading) {
        return <div className="social-networks-loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="social-networks-error-message">{error}</div>;
    }

    return (
        <div className="social-networks-container">
            <h1>Social Networks</h1>
            <div className="social-networks-list">
                {validPlatforms.map((platformData) => {
                    const network = socialNetworks.find((n) => n.platform === platformData.platform);
                    return (
                        <div key={platformData.platform} className="social-network-item">
                            <FontAwesomeIcon
                                icon={platformData.icon}
                                className="platform-icon"
                                onClick={() => handleIconClick(platformData.platform)}
                            />
                            <div className="platform-details">
                                {network ? (
                                    <a href={network.url} target="_blank" rel="noopener noreferrer">
                                        {network.url}
                                    </a>
                                ) : (
                                    <p>No link added</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <form onSubmit={handleUpdateSocialNetworks} className="social-networks-update-form">
                <div className="social-networks-form-group">
                    <label>Selected Platform: {selectedPlatform || 'None'}</label>
                </div>
                <div className="social-networks-form-group">
                    <label>New URL</label>
                    <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Enter new URL"
                        required
                    />
                </div>
                <div className="social-networks-form-buttons">
                    <button type="button" className="social-networks-cancel-button" onClick={handleCancel}>
                        <img src={BackIcon} alt="Cancel" className="social-networks-button-icon" />
                    </button>
                    <button type="submit" className="social-networks-update-button">
                        <img src={SaveIcon} alt="Update" className="social-networks-button-icon" />
                    </button>
                </div>
            </form>

            {notification && (
                <div className={`social-networks-notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default SocialNetworks;