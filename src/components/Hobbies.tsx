import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
                const userName = response.data;

                console.log('Fetched userName:', userName);
                setUserName(userName);
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
                    const selectedHobbies = response.data.map((hobby: Hobby) => ({
                        id: hobby.id,
                        name: hobby.name,
                    }));

                    setSelectedHobbies(selectedHobbies);
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
            setExpandedHobbyId(null); // Collapse if already expanded
        } else {
            setExpandedHobbyId(hobbyId); // Expand the clicked hobby
        }
    };

    // Handle selecting/deselecting a hobby
    const handleSelectHobby = (hobby: Hobby) => {
        const selectedHobby = { id: hobby.id, name: hobby.name };
        if (selectedHobbies.some((selected) => selected.id === hobby.id)) {
            // If the hobby is already selected, remove it
            setSelectedHobbies(selectedHobbies.filter((selected) => selected.id !== hobby.id));
        } else {
            // If the hobby is not selected, add it (if less than 5 are selected)
            if (selectedHobbies.length < 5) {
                setSelectedHobbies([...selectedHobbies, selectedHobby]);
            } else {
                alert('You can only select up to 5 hobbies.');
            }
        }
    };

    // Handle saving selected hobbies
    const handleSave = async () => {
        try {
            if (!userName) {
                alert('User name not found. Please try again later.');
                return;
            }

            // Prepare the data to be sent to the backend
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
            alert('Hobbies saved successfully!');
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
                                        className={`sub-hobby-item ${selectedHobbies.some((selected) => selected.id === child.id) ? 'selected' : ''}`}
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
            <button className="save-button" onClick={handleSave}>
                Save
            </button>
        </div>
    );
};

export default Hobbies;