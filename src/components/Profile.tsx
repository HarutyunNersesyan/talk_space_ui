import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Profile.css';

const Profile: React.FC = () => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateHobbiesClick = () => {
        navigate('/hobbies'); // Redirect to /hobbies
    };

    const handleUpdateSpecialtiesClick = () => {
        navigate('/specialities'); // Redirect to /specialities
    };

    const handleUpdateEducationClick = () => {
        navigate('/update-education'); // Redirect to /update-education
    };

    return (
        <div className="profile-container">
            <h1>Profile</h1>
            <div className="profile-picture-container">
                {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                ) : (
                    <div className="profile-picture-placeholder">No image selected</div>
                )}
            </div>
            <div className="upload-section">
                <label htmlFor="profile-picture-upload" className="upload-button">
                    Upload Profile Picture
                </label>
                <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>
            <div className="buttons-section">
                <button className="update-hobbies-button" onClick={handleUpdateHobbiesClick}>
                    Update Hobbies
                </button>
                <button className="update-specialties-button" onClick={handleUpdateSpecialtiesClick}>
                    Update Specialties
                </button>
                <button className="update-education-button" onClick={handleUpdateEducationClick}>
                    Update Education
                </button>
            </div>
        </div>
    );
};

export default Profile;