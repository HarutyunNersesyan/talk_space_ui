import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwtDecode
import './Hobbies.css';

interface Hobby {
    id: number;
    name: string;
    parentId: number | null;
    children?: Hobby[]; // Optional array of child hobbies
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
    const [expandedHobbyId, setExpandedHobbyId] = useState<number | null>(null); // Track expanded hobby
    const [selectedHobbies, setSelectedHobbies] = useState<HobbyRequest[]>([]); // Track selected hobbies
    const [userName, setUserName] = useState<string | null>(null); // Track userName

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // Fetch hobbies from the backend
    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                console.log('Fetching hobbies...'); // Debug log
                const response = await axios.get('http://localhost:8080/api/public/user/hobby', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the request headers
                    },
                });
                console.log('Response:', response.data); // Debug log

                // Organize hobbies into parent-child relationships
                const hobbiesWithChildren = response.data.map((hobby: Hobby) => ({
                    ...hobby,
                    children: response.data.filter((child: Hobby) => child.parentId === hobby.id),
                }));

                // Filter out only parent hobbies (hobbies with no parentId)
                const parentHobbies = hobbiesWithChildren.filter((hobby: Hobby) => hobby.parentId === null);

                setHobbies(parentHobbies);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching hobbies:', err); // Debug log
                setError('Failed to fetch hobbies. Please try again later.');
                setLoading(false);
            }
        };

        fetchHobbies();
    }, [token]);

    // Fetch userName from the backend using sub (email) from the token
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                // Decode the token to get the sub (email)
                const decodedToken = jwtDecode<{ sub: string }>(token); // Decode the token
                const email = decodedToken.sub; // Extract the sub (email)

                console.log('Fetching userName for email:', email); // Debug log

                // Fetch userName from the backend
                const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userName = response.data; // Extract the userName from the response

                console.log('Fetched userName:', userName); // Debug log
                setUserName(userName); // Set the userName in state
            } catch (err) {
                console.error('Error fetching userName:', err); // Debug log
                alert('Failed to fetch userName. Please try again later.');
            }
        };

        fetchUserName();
    }, [token]);

    // Load selected hobbies from localStorage when the component mounts
    useEffect(() => {
        const savedSelectedHobbies = localStorage.getItem('selectedHobbies');
        if (savedSelectedHobbies) {
            setSelectedHobbies(JSON.parse(savedSelectedHobbies));
        }
    }, []);

    // Save selected hobbies to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('selectedHobbies', JSON.stringify(selectedHobbies));
    }, [selectedHobbies]);

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
        const selectedHobby = { id: hobby.id, name: hobby.name }; // Simplified hobby object
        if (selectedHobbies.some((selected) => selected.id === hobby.id)) {
            // If the hobby is already selected, remove it
            setSelectedHobbies(selectedHobbies.filter((selected) => selected.id !== hobby.id));
        } else {
            // If the hobby is not selected, add it (if less than 5 are selected)
            if (selectedHobbies.length < 5) {
                setSelectedHobbies([...selectedHobbies, selectedHobby]);
            } else {
                alert('You can only select up to 5 hobbies.'); // Notify the user
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
                userName: userName, // Use the fetched userName
                hobbies: selectedHobbies,
            };

            console.log('Saving selected hobbies:', hobbyDto); // Debug log
            console.log('Endpoint:', 'http://localhost:8080/api/public/user/update/hobby'); // Debug log

            const response = await axios.put('http://localhost:8080/api/public/user/update/hobby', hobbyDto, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token to the request headers
                },
            });
            console.log('Save response:', response.data); // Debug log
            alert('Hobbies saved successfully!');
        } catch (err) {
            console.error('Error saving hobbies:', err); // Debug log
            if (axios.isAxiosError(err)) { // Check if the error is an Axios error
                // Backend returned an error response
                alert(`Failed to save hobbies: ${err.response?.data?.message || err.message}`);
            } else if (err instanceof Error) { // Check if it's a generic Error
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
        return <div>No hobbies found.</div>; // Fallback for empty data
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
                        className={`hobby-item ${expandedHobbyId === hobby.id ? 'expanded' : ''}`} // Add 'expanded' class
                    >
                        <div
                            className="hobby-name"
                            onClick={() => handleHobbyClick(hobby.id)} // Handle click
                        >
                            {hobby.name}
                        </div>
                        {expandedHobbyId === hobby.id && hobby.children && hobby.children.length > 0 && (
                            <div className="sub-hobbies-list">
                                {hobby.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className={`sub-hobby-item ${selectedHobbies.some((selected) => selected.id === child.id) ? 'selected' : ''}`}
                                        onClick={() => handleSelectHobby(child)} // Handle selection
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