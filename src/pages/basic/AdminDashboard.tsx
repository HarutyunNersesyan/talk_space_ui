import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import sendIcon from './send.svg';
import backIcon from './back.svg';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const backgroundStyle = {
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard.jpg)`,
    };
    const [mounted, setMounted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'info' | 'error'} | null>(null);
    const token = localStorage.getItem('token');

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

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= 200) {
            setFeedback(input);
            setCharCount(input.length);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedback.trim()) {
            setNotification({message: 'Please enter your feedback', type: 'error'});
            return;
        }

        if (!userName) {
            setNotification({message: 'Please log in to submit feedback', type: 'error'});
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/public/user/review/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${token}`,
                },
                body: new URLSearchParams({
                    userName: userName,
                    message: feedback
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            await response.json();

            setShowFeedback(false);
            setFeedback('');
            setCharCount(0);
            setNotification({message: 'Thank you for your feedback', type: 'info'});
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setNotification({message: 'Failed to submit feedback. Please try again later.', type: 'error'});
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-background" style={backgroundStyle}></div>
            <div className="dashboard-overlay"></div>
            <div className="dashboard-content">
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                <h1 className="dashboard-title">
                    <span className={`title-m ${mounted ? 'animate-m' : ''}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;M
                    </span>
                    <span className={`title-connect ${mounted ? 'animate-connect' : ''}`}>
                        C&nbsp;o&nbsp;n&nbsp;n&nbsp;e&nbsp;c&nbsp;t
                    </span>
                    <span className={`title-e ${mounted ? 'animate-e' : ''}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e
                    </span>

                    <span className={`title-talk ${mounted ? 'animate-talk' : ''}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;T&nbsp;a&nbsp;l&nbsp;k
                    </span>
                </h1>

                <p className={`dashboard-subtitle ${mounted ? 'animate-subtitle' : ''}`}>
                    Find new connections and start meaningful conversations on TalkSpace.
                </p>

                <button
                    className={`dashboard-cta-button ${mounted ? 'animate-button' : ''}`}
                    onClick={() => navigate('/choose')}
                >
                    Let's Start
                </button>

                <div className={`dashboard-divider ${mounted ? 'animate-divider' : ''}`}></div>

                <div className={`dashboard-about-section ${mounted ? 'animate-about' : ''}`}>
                    <h2 className="dashboard-about-title">About The Platform</h2>
                    <p className="dashboard-about-text">
                        TalkSpace is a dating platform designed to create a comfortable and engaging atmosphere for
                        meaningful connections. Whether you're looking for friendship, romance, or deep conversations,
                        TalkSpace helps you find like-minded people and start meaningful relationships.
                    </p>
                </div>
            </div>

            {/* Feedback Widget */}
            <div className="feedback-widget">
                {showFeedback && (
                    <div className="feedback-form">
                        <div className="feedback-header">
                            <h3>Your feedback is very important to us.</h3>
                        </div>
                        <textarea
                            className="feedback-textarea"
                            placeholder="Write your feedback here (max 200 characters)..."
                            value={feedback}
                            onChange={handleFeedbackChange}
                            maxLength={200}
                        />
                        <div className="feedback-footer">
                            <span className="char-count">{charCount}/200</span>
                            <div className="feedback-buttons">
                                <button className="cancel-button" onClick={() => setShowFeedback(false)}>
                                    <img src={backIcon} alt="Cancel" />
                                </button>
                                <button className="send-button" onClick={handleSubmitFeedback}>
                                    <img src={sendIcon} alt="Send" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <button className="feedback-button" onClick={() => setShowFeedback(!showFeedback)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;