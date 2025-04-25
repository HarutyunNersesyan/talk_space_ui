import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Hobbies.css';

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
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    const token = localStorage.getItem('token');

    // Fetch all hobbies from the backend
    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                console.log('Fetching hobbies...');
                const response = await axios.get('http://localhost:8080/api/public/user/hobby', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Hobbies response:', response.data);

                // Organize hobbies into parent-child relationships
                const hobbiesWithChildren = response.data.map((hobby: Hobby) => ({
                    ...hobby,
                    children: response.data.filter((child: Hobby) => child.parentId === hobby.id),
                }));

                // Filter out only parent hobbies (hobbies with no parentId)
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
                    alert('User not logged in.');
                    return;
                }

                // Decode the token to get the sub (email)
                const decodedToken = jwtDecode<{ sub: string }>(token);
                const email = decodedToken.sub;

                console.log('Fetching userName for email:', email);
                const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const fetchedUserName = response.data;

                console.log('Fetched userName:', fetchedUserName);
                setUserName(fetchedUserName);
            } catch (err) {
                console.error('Error fetching userName:', err);
                alert('Failed to fetch userName. Please try again later.');
            }
        };

        fetchUserName();
    }, [token]);

    // Fetch selected hobbies from the backend when userName is available
    useEffect(() => {
        const fetchSelectedHobbies = async () => {
            try {
                if (!userName) {
                    console.error('User name is not available.');
                    return;
                }

                console.log('Fetching selected hobbies for user:', userName);
                const response = await axios.get(`http://localhost:8080/api/public/user/get/hobbies/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Selected hobbies response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    const initialSelectedHobbies = response.data.map((hobby: Hobby) => ({
                        id: hobby.id,
                        name: hobby.name,
                    }));
                    setSelectedHobbies(initialSelectedHobbies);
                    setInitialSelectedHobbies(initialSelectedHobbies);
                } else {
                    console.error('Invalid response format:', response.data);
                    alert('Invalid response format received from the server.');
                }
            } catch (err) {
                console.error('Error fetching selected hobbies:', err);
                if (axios.isAxiosError(err)) {
                    console.error('Axios error details:', err.response?.data);
                    alert(`Failed to fetch selected hobbies: ${err.response?.data?.message || err.message}`);
                } else if (err instanceof Error) {
                    alert(`Failed to fetch selected hobbies: ${err.message}`);
                } else {
                    alert('Failed to fetch selected hobbies. Please try again later.');
                }
            }
        };

        if (userName) {
            fetchSelectedHobbies();
        }
    }, [userName, token]);

    // Handle expanding/collapsing a hobby
    const handleHobbyClick = (hobbyId: number) => {
        if (expandedHobbyId === hobbyId) {
            setExpandedHobbyId(null);
        } else {
            setExpandedHobbyId(hobbyId);
        }
    };

    // Handle selecting/deselecting a hobby
    const handleSelectHobby = (hobby: Hobby) => {
        const selectedHobby = { id: hobby.id, name: hobby.name };
        if (selectedHobbies.some((selected) => selected.id === hobby.id)) {
            setSelectedHobbies(selectedHobbies.filter((selected) => selected.id !== hobby.id));
        } else if (selectedHobbies.length < 5) {
            setSelectedHobbies([...selectedHobbies, selectedHobby]);
        }
    };

    // Handle saving selected hobbies
    const handleSave = async () => {
        try {
            if (!userName) {
                alert('User name not found. Please try again later.');
                return;
            }

            const hobbyDto: HobbyDto = {
                userName: userName,
                hobbies: selectedHobbies,
            };

            console.log('Saving selected hobbies:', hobbyDto);
            const response = await axios.put('http://localhost:8080/api/public/user/update/hobby', hobbyDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Save response:', response.data);
            setSaveSuccess(true);
            setInitialSelectedHobbies([...selectedHobbies]);

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving hobbies:', err);
            if (axios.isAxiosError(err)) {
                alert(`Failed to save hobbies: ${err.response?.data?.message || err.message}`);
            } else if (err instanceof Error) {
                alert(`Failed to save hobbies: ${err.message}`);
            } else {
                alert('Failed to save hobbies. Please try again later.');
            }
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    const handleCancelSelections = () => {
        setSelectedHobbies([]);
    };

    // Loading state
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    // Error state
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // No hobbies found
    if (hobbies.length === 0) {
        return <div>No hobbies found.</div>;
    }

    return (
        <div className="hobbies-container">
            <h1>Hobbies</h1>
            {saveSuccess && (
                <div className="success-message">
                    Hobbies saved successfully!
                </div>
            )}
            <div className="selected-hobbies-section">
                <h2>Selected Hobbies</h2>
                {selectedHobbies.length > 0 ? (
                    <ul className="selected-hobbies-list">
                        {selectedHobbies.map((hobby) => (
                            <li key={hobby.id} className="selected-hobby-item">
                                {hobby.name}
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
                    Cancel
                </button>
                <button className="action-button cancel-button" onClick={handleCancelSelections}>
                    Remove selected list
                </button>
                <button className="action-button save-button" onClick={handleSave}>
                    Save
                </button>
            </div>
        </div>
    );
};

export default Hobbies;