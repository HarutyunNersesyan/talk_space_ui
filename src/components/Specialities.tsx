import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Specialities.css';

interface Speciality {
    id: number;
    name: string;
    parentId: number | null;
    children?: Speciality[]; // Optional array of child specialties
}

const Specialities: React.FC = () => {
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSpecialityId, setExpandedSpecialityId] = useState<number | null>(null); // Track expanded specialty
    const [selectedSpecialities, setSelectedSpecialities] = useState<Speciality[]>([]); // Track selected specialties

    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                console.log('Fetching specialities...'); // Debug log
                const response = await axios.get('http://localhost:8080/api/public/user/speciality', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token if required
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
    }, []);

    const handleSpecialityClick = (specialityId: number) => {
        if (expandedSpecialityId === specialityId) {
            setExpandedSpecialityId(null); // Collapse if already expanded
        } else {
            setExpandedSpecialityId(specialityId); // Expand the clicked specialty
        }
    };

    const handleSelectSpeciality = (speciality: Speciality) => {
        if (selectedSpecialities.some(selected => selected.id === speciality.id)) {
            // If the specialty is already selected, remove it
            setSelectedSpecialities(selectedSpecialities.filter((selected) => selected.id !== speciality.id));
        } else {
            // If the specialty is not selected, add it (if less than 5 are selected)
            if (selectedSpecialities.length < 5) {
                setSelectedSpecialities([...selectedSpecialities, speciality]);
            } else {
                alert('You can only select up to 5 specialties.'); // Notify the user
            }
        }
    };

    const handleSave = async () => {
        try {
            console.log('Saving selected specialties:', selectedSpecialities); // Debug log
            // Replace with your actual API endpoint
            const response = await axios.post('/api/public/user/save-specialities', {
                specialities: selectedSpecialities.map(speciality => speciality.id),
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token if required
                },
            });
            console.log('Save response:', response.data); // Debug log
            alert('Specialities saved successfully!');
        } catch (err) {
            console.error('Error saving specialties:', err); // Debug log
            alert('Failed to save specialties. Please try again later.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

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