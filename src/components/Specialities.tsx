import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Specialities.css';

interface Speciality {
    id: number;
    name: string;
    parentId: number | null;
    children?: Speciality[];
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
    const [expandedSpecialityId, setExpandedSpecialityId] = useState<number | null>(null);
    const [selectedSpecialities, setSelectedSpecialities] = useState<SpecialityRequest[]>([]);
    const [userName, setUserName] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    // Fetch all specialties from the backend
    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
                    return;
                }

                console.log('Fetching specialities...');
                const response = await axios.get('http://localhost:8080/api/public/user/speciality', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Specialities response:', response.data);

                // Organize specialties into parent-child relationships
                const specialitiesWithChildren = response.data.map((speciality: Speciality) => ({
                    ...speciality,
                    children: response.data.filter((child: Speciality) => child.parentId === speciality.id),
                }));

                // Filter out only parent specialties (specialties with no parentId)
                const parentSpecialities = specialitiesWithChildren.filter(
                    (speciality: Speciality) => speciality.parentId === null
                );

                setSpecialities(parentSpecialities);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching specialities:', err);
                setError('Failed to fetch specialities. Please try again later.');
                setLoading(false);
            }
        };

        fetchSpecialities();
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

    // Fetch selected specialties from the backend when userName is available
    useEffect(() => {
        const fetchSelectedSpecialities = async () => {
            try {
                if (!userName) {
                    console.error('User name is not available.');
                    return;
                }

                console.log('Fetching selected specialties for user:', userName);
                const response = await axios.get(`http://localhost:8080/api/public/user/get/specialities/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Selected specialties response:', response.data);

                if (response.data && Array.isArray(response.data)) {
                    const selectedSpecialities = response.data.map((speciality: Speciality) => ({
                        id: speciality.id,
                        name: speciality.name,
                    }));

                    setSelectedSpecialities(selectedSpecialities);
                } else {
                    console.error('Invalid response format:', response.data);
                    alert('Invalid response format received from the server.');
                }
            } catch (err) {
                console.error('Error fetching selected specialties:', err);
                if (axios.isAxiosError(err)) {
                    console.error('Axios error details:', err.response?.data);
                    alert(`Failed to fetch selected specialties: ${err.response?.data?.message || err.message}`);
                } else if (err instanceof Error) {
                    alert(`Failed to fetch selected specialties: ${err.message}`);
                } else {
                    alert('Failed to fetch selected specialties. Please try again later.');
                }
            }
        };

        if (userName) {
            fetchSelectedSpecialities();
        }
    }, [userName, token]);

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
        const selectedSpeciality = { id: speciality.id, name: speciality.name };
        if (selectedSpecialities.some((selected) => selected.id === speciality.id)) {
            // If the specialty is already selected, remove it
            setSelectedSpecialities(selectedSpecialities.filter((selected) => selected.id !== speciality.id));
        } else {
            // If the specialty is not selected, add it (if less than 5 are selected)
            if (selectedSpecialities.length < 5) {
                setSelectedSpecialities([...selectedSpecialities, selectedSpeciality]);
            } else {
                alert('You can only select up to 5 specialties.');
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
                userName: userName,
                specialities: selectedSpecialities,
            };

            console.log('Saving selected specialties:', specialityDto);
            const response = await axios.put('http://localhost:8080/api/public/user/update/speciality', specialityDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Save response:', response.data);
            alert('Specialities saved successfully!');
        } catch (err) {
            console.error('Error saving specialties:', err);
            if (axios.isAxiosError(err)) {
                alert(`Failed to save specialties: ${err.response?.data?.message || err.message}`);
            } else if (err instanceof Error) {
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

    // No specialties found
    if (specialities.length === 0) {
        return <div>No specialties found.</div>;
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
                        className={`speciality-item ${expandedSpecialityId === speciality.id ? 'expanded' : ''}`}
                    >
                        <div
                            className="speciality-name"
                            onClick={() => handleSpecialityClick(speciality.id)}
                        >
                            {speciality.name}
                        </div>
                        {expandedSpecialityId === speciality.id && speciality.children && speciality.children.length > 0 && (
                            <ul className="sub-specialities-list">
                                {speciality.children.map((child) => (
                                    <li
                                        key={child.id}
                                        className={`sub-speciality-item ${selectedSpecialities.some(selected => selected.id === child.id) ? 'selected' : ''}`}
                                        onClick={() => handleSelectSpeciality(child)}
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