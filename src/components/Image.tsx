import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Image.css';

const Image: React.FC = () => {
    const [image, setImage] = useState<string | null>(null); // Store a single image URL
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store a single file

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    // Fetch userName from the token
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
            } catch (err) {
                console.error('Error fetching userName:', err); // Debug log
                alert('Failed to fetch userName. Please try again later.');
            }
        };

        fetchUserName();
    }, [token]);

    // Fetch user image from the backend
    useEffect(() => {
        const fetchImage = async () => {
            try {
                if (!userName) {
                    return;
                }

                console.log('Fetching image for user:', userName); // Debug log
                const response = await axios.get(`http://localhost:8080/api/public/user/image/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Image:', response.data); // Debug log

                // Assuming the backend returns the image path, prepend the base URL
                const baseUrl = 'http://localhost:8080'; // Replace with your backend base URL
                const imageUrl = `${baseUrl}${response.data}`;

                setImage(imageUrl); // Set the image URL in state
                setLoading(false);
            } catch (err) {
                console.error('Error fetching image:', err); // Debug log
                setError('Failed to fetch image. Please try again later.');
                setLoading(false);
            }
        };

        if (userName) {
            fetchImage();
        }
    }, [userName, token]);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]); // Store the selected file
        }
    };

    // Handle image upload
    const handleUpload = async () => {
        try {
            if (!userName || !selectedFile) {
                alert('Please select an image to upload.');
                return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile); // Append the single file
            formData.append('userName', userName);

            // Send the image data to the backend
            const response = await axios.post('http://localhost:8080/api/public/user/image/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data); // Debug log
            alert('Image uploaded successfully!');

            // Refresh the image after upload
            setSelectedFile(null);
            window.location.reload(); // Reload the page to fetch the updated image
        } catch (err) {
            console.error('Error uploading image:', err); // Debug log
            alert('Failed to upload image. Please try again later.');
        }
    };

    // Handle image deletion
    const handleDeleteImage = async () => {
        try {
            if (!userName) {
                alert('User not found.');
                return;
            }

            // Send a request to delete the user's image
            await axios.delete(`http://localhost:8080/api/public/user/image/delete/${userName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('Image deleted successfully!');
            setImage(null); // Clear the image from the state
        } catch (err) {
            console.error('Error deleting image:', err); // Debug log
            alert('Failed to delete image. Please try again later.');
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

    return (
        <div className="image-container">
            <h1>User Image</h1>

            {/* Image Upload Section */}
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

            {/* Display Image */}
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