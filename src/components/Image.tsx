import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Image.css';

interface ImageData {
    fileName: string;
    fileType: string;
    data: string; // Base64-encoded image data
}

interface ImageDto {
    userName: string;
    images: ImageData[];
}

const Image: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

    // Fetch user images from the backend
    useEffect(() => {
        const fetchImages = async () => {
            try {
                if (!userName) {
                    return;
                }

                console.log('Fetching images for user:', userName); // Debug log
                const response = await axios.get(`http://localhost:8080/api/public/user/images/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Images:', response.data); // Debug log

                // Assuming the backend returns relative paths, prepend the base URL
                const baseUrl = 'http://localhost:8080'; // Replace with your backend base URL
                const fullImageUrls = response.data.map((imagePath: string) => `${baseUrl}${imagePath}`);

                setImages(fullImageUrls); // Set the full image URLs in state
                setLoading(false);
            } catch (err) {
                console.error('Error fetching images:', err); // Debug log
                setError('Failed to fetch images. Please try again later.');
                setLoading(false);
            }
        };

        if (userName) {
            fetchImages();
        }
    }, [userName, token]);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setSelectedFiles(files);
        }
    };

    // Handle image upload
    const handleUpload = async () => {
        try {
            if (!userName || selectedFiles.length === 0) {
                alert('Please select at least one image to upload.');
                return;
            }

            // Convert selected files to Base64 and prepare the ImageDto
            const imageDataList: ImageData[] = await Promise.all(
                selectedFiles.map(async (file) => {
                    const base64Data = await convertFileToBase64(file);
                    return {
                        fileName: file.name,
                        fileType: file.type,
                        data: base64Data,
                    };
                })
            );

            const imageDto: ImageDto = {
                userName: userName,
                images: imageDataList,
            };

            // Send the image data to the backend
            const response = await axios.post('http://localhost:8080/api/public/user/images/upload', imageDto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Upload response:', response.data); // Debug log
            alert('Images uploaded successfully!');

            // Refresh the images after upload
            setSelectedFiles([]);
            window.location.reload(); // Reload the page to fetch the updated images
        } catch (err) {
            console.error('Error uploading images:', err); // Debug log
            alert('Failed to upload images. Please try again later.');
        }
    };

    // Convert file to Base64
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
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
            <h1>User Images</h1>

            {/* Image Upload Section */}
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload} className="upload-button">
                    Upload Images
                </button>
            </div>

            {/* Display Images */}
            <div className="image-list">
                {images.map((image, index) => (
                    <div key={index} className="image-item">
                        <img src={image} alt={`User image ${index + 1}`} className="image" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Image;