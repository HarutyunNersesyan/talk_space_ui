import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';

const Profile: React.FC = () => {
    const [picture, setPicture] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (!userName) return;

            try {
                const response = await axios.get(`http://localhost:8080/api/public/user/image/${userName}`, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const imageUrl = URL.createObjectURL(response.data);
                setPicture(imageUrl);
            } catch (err) {
                console.error('No profile picture found:', err);
            }
        };

        if (userName) {
            fetchProfilePicture();
        }
    }, [userName, token]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPicture = async () => {
        try {
            if (!picture || !userName) {
                alert('Please select a picture to upload.');
                return;
            }

            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', dataURLtoFile(picture, `profile_picture.png`));
            formData.append('userName', userName);

            await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Profile picture uploaded successfully!');
            window.location.reload();
        } catch (err) {
            console.error('Error uploading picture:', err);
            setError('Failed to upload picture. Please try again later.');
            alert('Failed to upload picture. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleDeleteImage = async () => {
        try {
            if (!userName) {
                alert('User not found.');
                return;
            }

            await axios.delete(`http://localhost:8080/api/public/user/image/delete/${userName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPicture(null);
            alert('Image deleted successfully!');
        } catch (err) {
            console.error('Error deleting image:', err);
            alert('Failed to delete image. Please try again later.');
        }
    };

    const handleUpdateHobbiesClick = () => navigate('/hobbies');
    const handleUpdateSpecialtiesClick = () => navigate('/specialities');
    const handleUpdateSocialNetworksClick = () => navigate('/social-networks');
    const handleEditProfileClick = () => navigate('/edit');

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