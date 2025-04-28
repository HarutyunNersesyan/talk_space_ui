import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [initialSelectedSpecialities, setInitialSelectedSpecialities] = useState<SpecialityRequest[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const token = localStorage.getItem('token');

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                if (!token) {
                    showNotification('User not logged in.', 'error');
                    return;
                }

                const response = await axios.get('http://localhost:8080/api/public/user/speciality', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const specialitiesWithChildren = response.data.map((speciality: Speciality) => ({
                    ...speciality,
                    children: response.data.filter((child: Speciality) => child.parentId === speciality.id),
                }));

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

    useEffect(() => {
        const fetchSelectedSpecialities = async () => {
            try {
                if (!userName) return;

                const response = await axios.get(`http://localhost:8080/api/public/user/get/specialities/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && Array.isArray(response.data)) {
                    const initialSelectedSpecialities = response.data.map((speciality: Speciality) => ({
                        id: speciality.id,
                        name: speciality.name,
                    }));
                    setSelectedSpecialities(initialSelectedSpecialities);
                    setInitialSelectedSpecialities(initialSelectedSpecialities);
                }
            } catch (err) {
                console.error('Error fetching selected specialities:', err);
                if (axios.isAxiosError(err)) {
                    showNotification(`Failed to fetch selected specialities: ${err.response?.data?.message || err.message}`, 'error');
                }
            }
        };

        if (userName) {
            fetchSelectedSpecialities();
        }
    }, [userName, token]);

    const handleSpecialityClick = (specialityId: number) => {
        setExpandedSpecialityId(expandedSpecialityId === specialityId ? null : specialityId);
    };

    const handleSelectSpeciality = (speciality: Speciality) => {
        const selectedSpeciality = { id: speciality.id, name: speciality.name };
        if (selectedSpecialities.some((selected) => selected.id === speciality.id)) {
            setSelectedSpecialities(selectedSpecialities.filter((selected) => selected.id !== speciality.id));
        } else if (selectedSpecialities.length < 5) {
            setSelectedSpecialities([...selectedSpecialities, selectedSpeciality]);
        }
    };

    const handleSave = async () => {
        try {
            if (!userName) {
                showNotification('User name not found. Please try again later.', 'error');
                return;
            }

            const specialityDto: SpecialityDto = {
                userName: userName,
                specialities: selectedSpecialities,
            };

            await axios.put('http://localhost:8080/api/public/user/update/speciality', specialityDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showNotification('Specialities saved successfully!', 'success');
            setInitialSelectedSpecialities([...selectedSpecialities]);
        } catch (err) {
            console.error('Error saving specialities:', err);
            if (axios.isAxiosError(err)) {
                showNotification(`Failed to save specialities: ${err.response?.data?.message || err.message}`, 'error');
            }
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    const handleCancelSelections = () => {
        setSelectedSpecialities([]);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (specialities.length === 0) {
        return <div>No specialities found.</div>;
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
                                        className={`sub-speciality-item ${selectedSpecialities.some(selected => selected.id === child.id) ? 'selected' : ''} ${selectedSpecialities.length >= 5 && !selectedSpecialities.some(selected => selected.id === child.id) ? 'disabled' : ''}`}
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

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Specialities;