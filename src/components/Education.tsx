import React, { useState } from 'react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error state
        setSuccess(false); // Reset success state

        const educationDto: EducationDto = {
            userName: 'currentUser', // Replace with actual username or fetch from context
            education: selectedEducation, // Send as string
        };

        try {
            const response = await fetch('/api/public/user/update/education', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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