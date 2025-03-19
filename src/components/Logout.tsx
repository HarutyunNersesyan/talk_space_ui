import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LogoutForm: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No token found. Please log in.');
                return;
            }

            const response = await axios.get('http://localhost:8080/account/profile/logout', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                localStorage.removeItem('token'); // Clear the token from local storage
                navigate('/login'); // Redirect to the login page
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default LogoutForm;