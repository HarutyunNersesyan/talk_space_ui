import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwtDecode
import './Education.css';

interface EducationDto {
    userName: string;
    education: string; // Send as string, backend will map to enum
}

const Education: React.FC = () => {
    // Hardcoded enum values
    const educationLevels = [
        'BACHELOR',
        'COLLEGE',
        'SCHOOL',
        'POSTGRADUATE',
        'MASTERDEGREE',
        'TECHNICALSCHOOL',
    ];

    const [selectedEducation, setSelectedEducation] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null); // Track userName
    const [loading, setLoading] = useState<boolean>(true); // Track loading state

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

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
                setLoading(false); // Set loading to false
            } catch (err) {
                console.error('Error fetching userName:', err); // Debug log
                alert('Failed to fetch userName. Please try again later.');
                setLoading(false); // Set loading to false
            }
        };

        fetchUserName();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error state
        setSuccess(false); // Reset success state

        if (!userName) {
            alert('User name not found. Please try again later.');
            return;
        }

        const educationDto: EducationDto = {
            userName: userName, // Use the fetched userName
            education: selectedEducation, // Send as string
        };

        try {
            const response = await fetch('http://localhost:8080/api/public/user/update/education', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add token to the request headers
                },
                body: JSON.stringify(educationDto),
            });

            // Log the response for debugging
            console.log('Response status:', response.status);
            console.log('Response status text:', response.statusText);

            if (response.ok) {
                setSuccess(true); // Show success message
                alert('Education updated successfully!');
            } else {
                // Handle backend errors
                const errorData = await response.json();
                console.error('Error response:', errorData);
                setError(errorData.message || 'Failed to update education.');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while updating education.');
        }
    };

    // Loading state
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="education-container">
            <h2>Update Education</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Education updated successfully!</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Education Level</label>
                    <select
                        value={selectedEducation}
                        onChange={(e) => setSelectedEducation(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select an education level</option>
                        {educationLevels.map((level, index) => (
                            <option key={index} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="update-button">
                    Update Education
                </button>
            </form>
        </div>
    );
};

export default Education;