import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Profile.css'; // Ensure you have the corresponding CSS file

const Profile: React.FC = () => {
    const [picture, setPicture] = useState<string | null>(null); // Single picture state
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize useNavigate

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserName = async () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode<{ sub: string }>(token);
                    const email = decodedToken.sub;

                    const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUserName(response.data);
                } catch (err) {
                    console.error('Error fetching user name:', err);
                    setError('Failed to fetch user name. Please try again later.');
                }
            }
        };

        fetchUserName();
    }, [token]);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicture(reader.result as string); // Set the single picture
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile picture upload
    const handleUploadPicture = async () => {
        try {
            if (!picture) {
                alert('Please select a picture to upload.');
                return;
            }

            setLoading(true);
            setError(null);

            if (!userName) {
                throw new Error('User name is not available.');
            }

            // Prepare the data to be sent to the backend
            const formData = new FormData();
            formData.append('file', dataURLtoFile(picture, `profile_picture.png`)); // Append the single file
            formData.append('userName', userName);

            // Send the profile picture to the backend
            const uploadResponse = await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', uploadResponse.data); // Debug log
            alert('Profile picture uploaded successfully!');
        } catch (err) {
            console.error('Error uploading picture:', err); // Debug log
            setError('Failed to upload picture. Please try again later.');
            alert('Failed to upload picture. Please try again later.');
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

    // Handle image deletion
    const handleDeleteImage = () => {
        setPicture(null); // Clear the picture
    };

    const handleUpdateHobbiesClick = () => {
        navigate('/hobbies'); // Redirect to /hobbies
    };

    const handleUpdateSpecialtiesClick = () => {
        navigate('/specialities'); // Redirect to /specialities
    };

    const handleUpdateSocialNetworksClick = () => {
        navigate('/social-networks'); // Redirect to /social-networks
    };

    const handleEditProfileClick = () => {
        navigate('/edit'); // Redirect to /edit
    };

    return (
        <div className="profile-container">
            <h1>Profile</h1>
            <div className="picture-container">
                {picture ? (
                    <>
                        <img src={picture} alt="Profile Picture" className="profile-picture" />
                        <button className="delete-button" onClick={handleDeleteImage}>x</button>
                    </>
                ) : (
                    <label htmlFor="picture-upload" className="picture-placeholder">
                        +
                        <input
                            id="picture-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </label>
                )}
            </div>
            <div className="upload-section">
                <button onClick={handleUploadPicture} className="upload-button" disabled={loading}>
                    {loading ? 'Uploading...' : 'Save Picture'}
                </button>
            </div>
            <div className="buttons-section">
                <button className="update-hobbies-button" onClick={handleUpdateHobbiesClick}>
                    Update Hobbies
                </button>
                <button className="update-specialties-button" onClick={handleUpdateSpecialtiesClick}>
                    Update Specialties
                </button>
                <button className="update-social-networks-button" onClick={handleUpdateSocialNetworksClick}>
                    Update Social Networks
                </button>
                <button className="edit-profile-button" onClick={handleEditProfileClick}>
                    Edit Profile
                </button>
            </div>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Profile;