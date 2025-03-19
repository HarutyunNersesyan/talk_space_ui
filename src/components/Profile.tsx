import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Profile.css'; // Ensure you have the corresponding CSS file

const Profile: React.FC = () => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize useNavigate

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // Handle file selection
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

    // Handle profile picture upload
    const handleUploadProfilePicture = async () => {
        try {
            if (!profilePicture) {
                alert('Please select a profile picture to upload.');
                return;
            }

            setLoading(true);
            setError(null);

            // Decode the token to get the sub (email)
            const decodedToken = jwtDecode<{ sub: string }>(token!);
            const email = decodedToken.sub;

            // Fetch userName from the backend
            const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userName = response.data;

            // Prepare the data to be sent to the backend
            const formData = new FormData();
            formData.append('file', dataURLtoFile(profilePicture, 'profile-picture.png'));
            formData.append('userName', userName);

            // Send the profile picture to the backend
            const uploadResponse = await axios.post('http://localhost:8080/api/public/user/images/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', uploadResponse.data); // Debug log
            alert('Profile picture uploaded successfully!');
        } catch (err) {
            console.error('Error uploading profile picture:', err); // Debug log
            setError('Failed to upload profile picture. Please try again later.');
            alert('Failed to upload profile picture. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Convert data URL to File object
    const dataURLtoFile = (dataUrl: string, filename: string): File => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
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

    const handleUpdateSocialNetworksClick = () => {
        navigate('/social-networks'); // Redirect to /social-networks
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
                <button onClick={handleUploadProfilePicture} className="upload-button" disabled={loading}>
                    {loading ? 'Uploading...' : 'Save Profile Picture'}
                </button>
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
                <button className="update-social-networks-button" onClick={handleUpdateSocialNetworksClick}>
                    Update Social Networks
                </button>
            </div>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Profile;