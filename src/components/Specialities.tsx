import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwtDecode
import './Specialities.css';

interface Speciality {
    id: number;
    name: string;
    parentId: number | null;
    children?: Speciality[]; // Optional array of child specialties
}

interface SpecialityRequest {
    id: number;
    name: string;
}

interface SpecialityDto {
    userName: string;
    specialities: SpecialityRequest[];
}

const Specialities: React.FC = () => {
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSpecialityId, setExpandedSpecialityId] = useState<number | null>(null); // Track expanded specialty
    const [selectedSpecialities, setSelectedSpecialities] = useState<SpecialityRequest[]>([]); // Track selected specialties
    const [userName, setUserName] = useState<string | null>(null); // Track userName

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // Fetch specialities from the backend
    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                console.log('Fetching specialities...'); // Debug log
                const response = await axios.get('http://localhost:8080/api/public/user/speciality', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to the request headers
                    },
                });
                console.log('Response:', response.data); // Debug log

                // Organize specialities into parent-child relationships
                const specialitiesWithChildren = response.data.map((speciality: Speciality) => ({
                    ...speciality,
                    children: response.data.filter((child: Speciality) => child.parentId === speciality.id),
                }));

                // Filter out only parent specialities (specialities with no parentId)
                const parentSpecialities = specialitiesWithChildren.filter((speciality: Speciality) => speciality.parentId === null);

                setSpecialities(parentSpecialities);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching specialities:', err); // Debug log
                setError('Failed to fetch specialities. Please try again later.');
                setLoading(false);
            }
        };

        fetchSpecialities();
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

    // Load selected specialities from localStorage when the component mounts
    useEffect(() => {
        const savedSelectedSpecialities = localStorage.getItem('selectedSpecialities');
        if (savedSelectedSpecialities) {
            setSelectedSpecialities(JSON.parse(savedSelectedSpecialities));
        }
    }, []);

    // Save selected specialities to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('selectedSpecialities', JSON.stringify(selectedSpecialities));
    }, [selectedSpecialities]);

    // Handle expanding/collapsing a specialty
    const handleSpecialityClick = (specialityId: number) => {
        if (expandedSpecialityId === specialityId) {
            setExpandedSpecialityId(null); // Collapse if already expanded
        } else {
            setExpandedSpecialityId(specialityId); // Expand the clicked specialty
        }
    };

    // Handle selecting/deselecting a specialty
    const handleSelectSpeciality = (speciality: Speciality) => {
        const selectedSpeciality = { id: speciality.id, name: speciality.name }; // Simplified specialty object
        if (selectedSpecialities.some((selected) => selected.id === speciality.id)) {
            // If the specialty is already selected, remove it
            setSelectedSpecialities(selectedSpecialities.filter((selected) => selected.id !== speciality.id));
        } else {
            // If the specialty is not selected, add it (if less than 5 are selected)
            if (selectedSpecialities.length < 5) {
                setSelectedSpecialities([...selectedSpecialities, selectedSpeciality]);
            } else {
                alert('You can only select up to 5 specialties.'); // Notify the user
            }
        }
    };

    // Handle saving selected specialties
    const handleSave = async () => {
        try {
            if (!userName) {
                alert('User name not found. Please try again later.');
                return;
            }

            // Prepare the data to be sent to the backend
            const specialityDto: SpecialityDto = {
                userName: userName, // Use the fetched userName
                specialities: selectedSpecialities,
            };

            console.log('Saving selected specialties:', specialityDto); // Debug log
            console.log('Endpoint:', 'http://localhost:8080/api/public/user/update/speciality'); // Debug log

            const response = await axios.put('http://localhost:8080/api/public/user/update/speciality', specialityDto, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token to the request headers
                },
            });
            console.log('Save response:', response.data); // Debug log
            alert('Specialities saved successfully!');
        } catch (err) {
            console.error('Error saving specialties:', err); // Debug log
            if (axios.isAxiosError(err)) { // Check if the error is an Axios error
                // Backend returned an error response
                alert(`Failed to save specialties: ${err.response?.data?.message || err.message}`);
            } else if (err instanceof Error) { // Check if it's a generic Error
                alert(`Failed to save specialties: ${err.message}`);
            } else {
                alert('Failed to save specialties. Please try again later.');
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

    // No specialities found
    if (specialities.length === 0) {
        return <div>No specialities found.</div>; // Fallback for empty data
    }

    return (
        <div className="specialities-container">
            <h1>Specialities</h1>
            <div className="selected-specialities-section">
                <h2>Selected Specialities</h2>
                {selectedSpecialities.length > 0 ? (
                    <ul className="selected-specialities-list">
                        {selectedSpecialities.map((speciality) => (
                            <li key={speciality.id} className="selected-speciality-item">
                                {speciality.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No specialities selected yet.</p>
                )}
            </div>
            <ul className="specialities-list">
                {specialities.map((speciality) => (
                    <li
                        key={speciality.id}
                        className={`speciality-item ${expandedSpecialityId === speciality.id ? 'expanded' : ''}`} // Add 'expanded' class
                    >
                        <div
                            className="speciality-name"
                            onClick={() => handleSpecialityClick(speciality.id)} // Handle click
                        >
                            {speciality.name}
                        </div>
                        {expandedSpecialityId === speciality.id && speciality.children && speciality.children.length > 0 && (
                            <ul className="sub-specialities-list">
                                {speciality.children.map((child) => (
                                    <li
                                        key={child.id}
                                        className={`sub-speciality-item ${selectedSpecialities.some(selected => selected.id === child.id) ? 'selected' : ''}`}
                                        onClick={() => handleSelectSpeciality(child)} // Handle selection
                                    >
                                        {child.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <button className="save-button" onClick={handleSave}>Save</button>
        </div>
    );
};

export default Specialities;