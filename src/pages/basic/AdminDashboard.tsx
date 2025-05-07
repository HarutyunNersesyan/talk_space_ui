import React, {useEffect, useState} from 'react';
import './AdminDashboard.css';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import chatImage from '../../assets/admin/chat.svg';
import blockImage from '../../assets/admin/block.svg';
import specialityImage from '../../assets/admin/speciality.svg';
import hobbyImage from '../../assets/admin/hobby.svg';
import backgroundImage from '../../assets/admin/admin.jpg';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    const handleViewChats = () => {
        // Implement navigation to view chats page
        console.log('View Chats clicked');
    };

    const handleBlockUser = () => {
        // Implement navigation to block user page
        console.log('Block User clicked');
    };

    const handleUpdateSpecialities = () => {
        // Implement navigation to update specialities page
        console.log('Update Specialities clicked');
    };

    const handleUpdateHobbies = () => {
        // Implement navigation to update hobbies page
        console.log('Update Hobbies clicked');
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        const fetchUserName = async () => {
            try {
                if (!token) {
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
            }
        };

        fetchUserName();

        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, [token]);

    return (
        <div className="dashboard-container">
            <div className="background-banner" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
            <div className="adminDashboard-content">
                <div className="admin-actions-grid">
                    <div className="action-card" onClick={handleViewChats}>
                        <img src={chatImage} alt="View Chats" className="action-image" />
                        <button className="action-button">View Chats</button>
                    </div>
                    <div className="action-card" onClick={handleBlockUser}>
                        <img src={blockImage} alt="Block User" className="action-image" />
                        <button className="action-button">Block User</button>
                    </div>
                    <div className="action-card" onClick={handleUpdateSpecialities}>
                        <img src={specialityImage} alt="Update Specialities" className="action-image" />
                        <button className="action-button">Update Specialities</button>
                    </div>
                    <div className="action-card" onClick={handleUpdateHobbies}>
                        <img src={hobbyImage} alt="Update Hobbies" className="action-image" />
                        <button className="action-button">Update Hobbies</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;