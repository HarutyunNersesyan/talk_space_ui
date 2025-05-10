import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Hobbies.css';
import HobbiesIcon from '../assets/search/hobbies-icon.svg';
import BackIcon from '../assets/search/back.svg';
import SaveIcon from '../assets/network/save.svg';
import RemoveIcon from '../assets/network/remove.svg';

interface Hobby {
    id: number;
    name: string;
    parentId: number | null;
    children?: Hobby[];
}

interface HobbyRequest {
    id: number;
    name: string;
}

interface HobbyDto {
    userName: string;
    hobbies: HobbyRequest[];
}

const Hobbies: React.FC = () => {
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedHobbyId, setExpandedHobbyId] = useState<number | null>(null);
    const [selectedHobbies, setSelectedHobbies] = useState<HobbyRequest[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();
    const [initialSelectedHobbies, setInitialSelectedHobbies] = useState<HobbyRequest[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const token = localStorage.getItem('token');

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch all hobbies from the backend
    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                if (!token) {
                    showNotification('User not logged in.', 'error');
                    return;
                }

                const response = await axios.get('http://localhost:8080/api/public/user/hobby', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const hobbiesWithChildren = response.data.map((hobby: Hobby) => ({
                    ...hobby,
                    children: response.data.filter((child: Hobby) => child.parentId === hobby.id),
                }));

                const parentHobbies = hobbiesWithChildren.filter(
                    (hobby: Hobby) => hobby.parentId === null
                );

                setHobbies(parentHobbies);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching hobbies:', err);
                setError('Failed to fetch hobbies. Please try again later.');
                setLoading(false);
            }
        };

        fetchHobbies();
    }, [token]);

    // Fetch userName from the backend using the token
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
                setUserName(response.data);
            } catch (err) {
                console.error('Error fetching userName:', err);
                showNotification('Failed to fetch userName. Please try again later.', 'error');
            }
        };

        fetchUserName();
    }, [token]);

    // Fetch selected hobbies from the backend when userName is available
    useEffect(() => {
        const fetchSelectedHobbies = async () => {
            try {
                if (!userName) return;

                const response = await axios.get(`http://localhost:8080/api/public/user/get/hobbies/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && Array.isArray(response.data)) {
                    const initialSelectedHobbies = response.data.map((hobby: Hobby) => ({
                        id: hobby.id,
                        name: hobby.name,
                    }));
                    setSelectedHobbies(initialSelectedHobbies);
                    setInitialSelectedHobbies(initialSelectedHobbies);
                }
            } catch (err) {
                console.error('Error fetching selected hobbies:', err);
                if (axios.isAxiosError(err)) {
                    showNotification(`Failed to fetch selected hobbies: ${err.response?.data?.message || err.message}`, 'error');
                }
            }
        };

        if (userName) {
            fetchSelectedHobbies();
        }
    }, [userName, token]);

    const handleHobbyClick = (hobbyId: number) => {
        setExpandedHobbyId(expandedHobbyId === hobbyId ? null : hobbyId);
    };

    const handleSelectHobby = (hobby: Hobby) => {
        const selectedHobby = { id: hobby.id, name: hobby.name };
        if (selectedHobbies.some((selected) => selected.id === hobby.id)) {
            setSelectedHobbies(selectedHobbies.filter((selected) => selected.id !== hobby.id));
        } else if (selectedHobbies.length < 5) {
            setSelectedHobbies([...selectedHobbies, selectedHobby]);
        }
    };

    const handleDeleteHobby = (hobbyId: number) => {
        setSelectedHobbies(selectedHobbies.filter((hobby) => hobby.id !== hobbyId));
    };

    const handleSave = async () => {
        try {
            if (!userName) {
                showNotification('User name not found. Please try again later.', 'error');
                return;
            }

            const hobbyDto: HobbyDto = {
                userName: userName,
                hobbies: selectedHobbies,
            };

            await axios.put('http://localhost:8080/api/public/user/update/hobby', hobbyDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showNotification('Hobbies saved successfully!', 'success');
            setInitialSelectedHobbies([...selectedHobbies]);
        } catch (err) {
            console.error('Error saving hobbies:', err);
            if (axios.isAxiosError(err)) {
                showNotification(`Failed to save hobbies: ${err.response?.data?.message || err.message}`, 'error');
            }
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    const handleCancelSelections = () => {
        setSelectedHobbies([]);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (hobbies.length === 0) {
        return <div>No hobbies found.</div>;
    }

    return (
        <div className="hobbies-container">
            <h1 className="hobbies-title">
                Hobbies
                <img src={HobbiesIcon} alt="Hobbies Icon" className="hobbies-icon" />
            </h1>
            <div className="selected-hobbies-section">
                <h2>Selected hobbies</h2>
                {selectedHobbies.length > 0 ? (
                    <ul className="selected-hobbies-list">
                        {selectedHobbies.map((hobby) => (
                            <li key={hobby.id} className="selected-hobby-item">
                                {hobby.name}
                                <button
                                    className="delete-hobby-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHobby(hobby.id);
                                    }}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hobbies selected yet.</p>
                )}
            </div>
            <div className="hobbies-list">
                {hobbies.map((hobby) => (
                    <div
                        key={hobby.id}
                        className={`hobby-item ${expandedHobbyId === hobby.id ? 'expanded' : ''}`}
                    >
                        <div
                            className="hobby-name"
                            onClick={() => handleHobbyClick(hobby.id)}
                        >
                            {hobby.name}
                        </div>
                        {expandedHobbyId === hobby.id && hobby.children && hobby.children.length > 0 && (
                            <div className="sub-hobbies-list">
                                {hobby.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className={`sub-hobby-item ${selectedHobbies.some(selected => selected.id === child.id) ? 'selected' : ''} ${selectedHobbies.length >= 5 && !selectedHobbies.some(selected => selected.id === child.id) ? 'disabled' : ''}`}
                                        onClick={() => handleSelectHobby(child)}
                                    >
                                        {child.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="button-group">
                <button className="action-button back-button" onClick={handleBack}>
                    <img src={BackIcon} alt="Back" className="button-icon" />
                </button>
                <button className="action-button cancel-button" onClick={handleCancelSelections}>
                    <img src={RemoveIcon} alt="Remove Selections" className="button-icon" />
                </button>
                <button className="action-button save-button" onClick={handleSave}>
                    <img src={SaveIcon} alt="Save" className="button-icon" />
                </button>
            </div>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Hobbies;