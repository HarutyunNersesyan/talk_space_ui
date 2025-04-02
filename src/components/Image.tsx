import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Image.css';

const Image: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (!token) {
                    alert('User not logged in.');
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
                alert('Failed to fetch userName. Please try again later.');
            }
        };

        fetchUserName();
    }, [token]);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                if (!userName) return;

                const response = await axios.get(`http://localhost:8080/api/public/user/image/${userName}`, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const imageUrl = URL.createObjectURL(response.data);
                setImage(imageUrl);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching image:', err);
                setError('No image found or failed to load image.');
                setLoading(false);
            }
        };

        if (userName) {
            fetchImage();
        }
    }, [userName, token]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        try {
            if (!userName || !selectedFile) {
                alert('Please select an image to upload.');
                return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userName', userName);

            await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Image uploaded successfully!');
            window.location.reload();
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image. Please try again later.');
        }
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

            alert('Image deleted successfully!');
            setImage(null);
        } catch (err) {
            console.error('Error deleting image:', err);
            alert('Failed to delete image. Please try again later.');
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="image-container">
            <h1>User Image</h1>

            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload} className="upload-button">
                    Upload Image
                </button>
            </div>

            <div className="image-display">
                {image ? (
                    <div className="image-item">
                        <img src={image} alt="User image" className="image" />
                        <button onClick={handleDeleteImage} className="delete-button">
                            Delete Image
                        </button>
                    </div>
                ) : (
                    <p>No image uploaded.</p>
                )}
            </div>
        </div>
    );
};

export default Image;