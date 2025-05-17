import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboard.css';
import chatImage from '../../assets/admin/chat.svg';
import blockImage from '../../assets/admin/block.svg';
import userImage from '../../assets/admin/users.svg';
import feedBacksImage from '../../assets/admin/feedbacks.svg';
import backgroundImage from '../../assets/admin/admin.jpg';
import checkIcon from '../../assets/search/check.svg';
import backIcon from '../../assets/search/back.svg';

interface JwtPayload {
    sub: string;
}

interface ChatMessage {
    id: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [showChatForm, setShowChatForm] = useState<boolean>(false);
    const [showBlockForm, setShowBlockForm] = useState<boolean>(false);
    const [senderUsername, setSenderUsername] = useState<string>('');
    const [receiverUsername, setReceiverUsername] = useState<string>('');
    const [blockUsername, setBlockUsername] = useState<string>('');
    const [blockMessage, setBlockMessage] = useState<string>('');
    const [blockUntil, setBlockUntil] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const formattedDate = now.toISOString().split('T')[0];
        setBlockUntil(formattedDate);
    }, []);

    const handleRateLimitExceeded = () => {
        localStorage.removeItem('token');
        alert("Too many requests detected. You have been logged out for security reasons.");
        navigate('/login');
    };

    const handleViewChats = (): void => {
        setShowChatForm(true);
        setShowBlockForm(false);
        setErrorMessage('');
    };

    const handleBlockUser = (): void => {
        setShowBlockForm(true);
        setShowChatForm(false);
        setErrorMessage('');
    };

    const handleViewUsers = (): void => {
        navigate('/users');
    };

    const handleViewFeedbacks = (): void => {
        navigate('/feedbacks');
    };

    const handleCheckChats = async (): Promise<void> => {
        if (!senderUsername.trim()) {
            setErrorMessage('Please enter sender username');
            return;
        }
        if (!receiverUsername.trim()) {
            setErrorMessage('Please enter receiver username');
            return;
        }

        try {
            const response = await axios.get<ChatMessage[]>(
                `http://localhost:8080/api/private/admin/history/${senderUsername}/${receiverUsername}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 429) {
                handleRateLimitExceeded();
                return;
            }

            if (response.data.length === 0) {
                setErrorMessage('No chat history found between these users');
            } else {
                navigate('/view', { state: { chatHistory: response.data } });
            }
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 429) {
                handleRateLimitExceeded();
                return;
            }

            console.error('Error fetching chat history:', error);
            if (err.response) {
                setErrorMessage(err.response.data as string || 'Error fetching chat history');
            } else {
                setErrorMessage('Error fetching chat history. Please try again.');
            }
        }
    };

    const handleBlockSubmit = async (): Promise<void> => {
        if (!blockUsername.trim()) {
            setErrorMessage('Please enter username to block');
            return;
        }
        if (!blockMessage.trim()) {
            setErrorMessage('Please enter block reason');
            return;
        }
        if (!blockUntil) {
            setErrorMessage('Please select block until date');
            return;
        }

        try {
            const response = await axios.put(
                'http://localhost:8080/api/private/admin/block',
                {
                    userName: blockUsername,
                    blockMessage: blockMessage,
                    blockUntil: blockUntil
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 429) {
                handleRateLimitExceeded();
                return;
            }

            setErrorMessage(`User ${blockUsername} has been blocked successfully until ${new Date(blockUntil).toLocaleDateString()}. Reason: ${blockMessage}`);
            setBlockUsername('');
            setBlockMessage('');
            const now = new Date();
            now.setDate(now.getDate() + 1);
            setBlockUntil(now.toISOString().split('T')[0]);
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 429) {
                handleRateLimitExceeded();
                return;
            }

            console.error('Error blocking user:', error);
            if (err.response) {
                setErrorMessage(err.response.data as string || 'Error blocking user');
            } else {
                setErrorMessage('Error blocking user. Please try again.');
            }
        }
    };

    const handleCancelChatForm = (): void => {
        setShowChatForm(false);
        setSenderUsername('');
        setReceiverUsername('');
        setErrorMessage('');
    };

    const handleCancelBlockForm = (): void => {
        setShowBlockForm(false);
        setBlockUsername('');
        setBlockMessage('');
        setErrorMessage('');
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        const fetchUserName = async (): Promise<void> => {
            try {
                if (!token) {
                    return;
                }

                const decodedToken = jwtDecode<JwtPayload>(token);
                const email = decodedToken.sub;

                const response = await axios.get<string>(
                    `http://localhost:8080/api/public/user/get/userName/${email}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 429) {
                    handleRateLimitExceeded();
                    return;
                }

                setUserName(response.data);
            } catch (error) {
                const err = error as AxiosError;
                if (err.response?.status === 429) {
                    handleRateLimitExceeded();
                    return;
                }

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
        <div className={`admin-dashboard-container ${mounted ? 'mounted' : ''}`}>
            <div className="admin-background-banner" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
            <div className="admin-dashboard-content">
                <div className="admin-actions-grid">
                    <div className="admin-action-card" onClick={handleViewChats}>
                        <img src={chatImage} alt="View Chats" className="admin-action-image" />
                        <button className="admin-action-button">View Chats</button>
                    </div>
                    <div className="admin-action-card" onClick={handleBlockUser}>
                        <img src={blockImage} alt="Block User" className="admin-action-image" />
                        <button className="admin-action-button">Block User</button>
                    </div>
                    <div className="admin-action-card" onClick={handleViewUsers}>
                        <img src={userImage} alt="Users" className="admin-action-image" />
                        <button className="admin-action-button">Users</button>
                    </div>
                    <div className="admin-action-card" onClick={handleViewFeedbacks}>
                        <img src={feedBacksImage} alt="Feedbacks" className="admin-action-image" />
                        <button className="admin-action-button">Feedbacks</button>
                    </div>
                </div>

                {showChatForm && (
                    <div className="admin-form-container">
                        <div className="admin-form">
                            <h3>View Chats Between Users</h3>
                            <div className="admin-form-group">
                                <label htmlFor="senderUsername">Sender Username:</label>
                                <input
                                    type="text"
                                    id="senderUsername"
                                    value={senderUsername}
                                    onChange={(e) => setSenderUsername(e.target.value)}
                                    placeholder="Enter sender username"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="receiverUsername">Receiver Username:</label>
                                <input
                                    type="text"
                                    id="receiverUsername"
                                    value={receiverUsername}
                                    onChange={(e) => setReceiverUsername(e.target.value)}
                                    placeholder="Enter receiver username"
                                />
                            </div>
                            {errorMessage && <div className="admin-error-message">{errorMessage}</div>}
                            <div className="admin-form-buttons">
                                <button className="admin-icon-button" onClick={handleCancelChatForm}>
                                    <img src={backIcon} alt="Cancel" className="admin-button-icon" />
                                </button>
                                <button className="admin-icon-button" onClick={handleCheckChats}>
                                    <img src={checkIcon} alt="Check" className="admin-button-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBlockForm && (
                    <div className="admin-form-container">
                        <div className="admin-block-form">
                            <h3>Block User</h3>
                            <div className="admin-form-group compact">
                                <label htmlFor="blockUsername">Username:</label>
                                <input
                                    type="text"
                                    id="blockUsername"
                                    value={blockUsername}
                                    onChange={(e) => setBlockUsername(e.target.value)}
                                    placeholder="Enter username to block"
                                />
                            </div>
                            <div className="admin-form-group compact">
                                <label htmlFor="blockMessage">Block Reason:</label>
                                <textarea
                                    id="blockMessage"
                                    value={blockMessage}
                                    onChange={(e) => setBlockMessage(e.target.value)}
                                    placeholder="Enter block reason"
                                    rows={3}
                                />
                            </div>
                            <div className="admin-form-group compact">
                                <label htmlFor="blockUntil">Block until:</label>
                                <input
                                    type="date"
                                    id="blockUntil"
                                    value={blockUntil}
                                    onChange={(e) => setBlockUntil(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            {errorMessage && <div className="admin-error-message">{errorMessage}</div>}
                            <div className="admin-form-buttons">
                                <button className="admin-icon-button" onClick={handleCancelBlockForm}>
                                    <img src={backIcon} alt="Cancel" className="admin-button-icon" />
                                </button>
                                <button className="admin-icon-button" onClick={handleBlockSubmit}>
                                    <img src={checkIcon} alt="Submit" className="admin-button-icon" />
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