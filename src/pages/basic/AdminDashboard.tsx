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
import checkIcon from '../../assets/search/check.svg';
import backIcon from '../../assets/search/back.svg';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [showChatForm, setShowChatForm] = useState(false);
    const [senderUsername, setSenderUsername] = useState('');
    const [receiverUsername, setReceiverUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleViewChats = () => {
        setShowChatForm(true);
        setErrorMessage('');
    };

    const handleBlockUser = () => {
        console.log('Block User clicked');
    };

    const handleUpdateSpecialities = () => {
        console.log('Update Specialities clicked');
    };

    const handleUpdateHobbies = () => {
        console.log('Update Hobbies clicked');
    };

    const handleCheckChats = async () => {
        if (!senderUsername.trim()) {
            setErrorMessage('Please enter sender username');
            return;
        }
        if (!receiverUsername.trim()) {
            setErrorMessage('Please enter receiver username');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/private/admin/history/${senderUsername}/${receiverUsername}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.length === 0) {
                setErrorMessage('No chat history found between these users');
            } else {
                navigate('/view', { state: { chatHistory: response.data } });
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setErrorMessage('Error fetching chat history. Please try again.');
        }
    };

    const handleCancelChatForm = () => {
        setShowChatForm(false);
        setSenderUsername('');
        setReceiverUsername('');
        setErrorMessage('');
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

                {showChatForm && (
                    <div className="chat-form-container">
                        <div className="chat-form">
                            <h3>View Chats Between Users</h3>
                            <div className="form-group">
                                <label htmlFor="senderUsername">Sender Username:</label>
                                <input
                                    type="text"
                                    id="senderUsername"
                                    value={senderUsername}
                                    onChange={(e) => setSenderUsername(e.target.value)}
                                    placeholder="Enter sender username"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="receiverUsername">Receiver Username:</label>
                                <input
                                    type="text"
                                    id="receiverUsername"
                                    value={receiverUsername}
                                    onChange={(e) => setReceiverUsername(e.target.value)}
                                    placeholder="Enter receiver username"
                                />
                            </div>
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <div className="form-buttons">
                                <button className="icon-button" onClick={handleCancelChatForm}>
                                    <img src={backIcon} alt="Cancel" className="button-icon" />
                                </button>
                                <button className="icon-button" onClick={handleCheckChats}>
                                    <img src={checkIcon} alt="Check" className="button-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;