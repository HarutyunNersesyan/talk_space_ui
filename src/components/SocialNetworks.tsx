import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faInstagram,
    faTwitter,
    faLinkedin,
    faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import './SocialNetworks.css';

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
    { platform: 'TWITTER', icon: faTwitter },
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
    const navigate = useNavigate();

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // Fetch userName from the token
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                // Decode the token to get the sub (email)
                const decodedToken = jwtDecode<{ sub: string }>(token);
                const email = decodedToken.sub;

                // Fetch userName from the backend
                const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userName = response.data;
                setUserName(userName);
            } catch (err) {
                console.error('Error fetching userName:', err);
                alert('Failed to fetch userName. Please try again later.');
            }
        };

        fetchUserName();
    }, [token]);

    // Fetch social networks for the user
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

    // Handle updating social networks
    const handleUpdateSocialNetworks = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!userName || !selectedPlatform || !newUrl) {
                alert('Please select a platform and provide a valid URL.');
                return;
            }

            // Check if the platform already exists in the user's social networks
            const existingNetworkIndex = socialNetworks.findIndex(
                (network) => network.platform === selectedPlatform
            );

            let updatedSocialNetworks: SocialNetwork[];
            if (existingNetworkIndex !== -1) {
                // Update the existing platform's URL
                updatedSocialNetworks = socialNetworks.map((network, index) =>
                    index === existingNetworkIndex ? { ...network, url: newUrl } : network
                );
            } else {
                // Add a new platform
                updatedSocialNetworks = [...socialNetworks, { platform: selectedPlatform, url: newUrl }];
            }

            // Prepare the data to be sent to the backend
            const socialNetworksDto: SocialNetworksDto = {
                userName: userName, // Set the userName at the root level
                socialNetworks: updatedSocialNetworks.map((network) => ({
                    platform: network.platform,
                    url: network.url,
                })), // Ensure socialNetworks contains only platform and url
            };

            console.log('Updating social networks:', socialNetworksDto); // Debug log

            // Send the PUT request to the backend
            const response = await axios.put('http://localhost:8080/api/public/user/update/socialNetworks', socialNetworksDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Update response:', response.data); // Debug log

            // Update the local state with the new data
            setSocialNetworks(updatedSocialNetworks);
            setSelectedPlatform('');
            setNewUrl('');
            alert('Social networks updated successfully!');
        } catch (err) {
            console.error('Error updating social networks:', err);
            alert('Failed to update social networks. Please try again later.');
        }
    };

    // Handle clicking on an icon to select the platform
    const handleIconClick = (platform: string) => {
        setSelectedPlatform(platform);
    };

    // Handle cancel button click
    const handleCancel = () => {
        navigate('/profile');
    };

    // Loading state
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    // Error state
    if (error) {
        return <div className="error-message">{error}</div>;
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
            <form onSubmit={handleUpdateSocialNetworks} className="update-form">
                <div className="form-group">
                    <label>Selected Platform: {selectedPlatform || 'None'}</label>
                </div>
                <div className="form-group">
                    <label>New URL</label>
                    <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Enter new URL"
                        required
                    />
                </div>
                <div className="form-buttons">
                    <button type="button" className="cancel-button" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="update-button">
                        Update
                    </button>

                </div>
            </form>
        </div>
    );
};

export default SocialNetworks;