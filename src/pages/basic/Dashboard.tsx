import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import sendIcon from './send.svg';
import backIcon from './back.svg';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const backgroundStyle = {
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard.jpg)`,
    };
    const [mounted, setMounted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, []);

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= 200) {
            setFeedback(input);
            setCharCount(input.length);
        }
    };

    const handleSubmitFeedback = () => {
        // Here you would typically send the feedback to your backend
        console.log('Feedback submitted:', feedback);
        setShowFeedback(false);
        setFeedback('');
        setCharCount(0);
        alert('Thank you for your feedback!');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-background" style={backgroundStyle}></div>
            <div className="dashboard-overlay"></div>
            <div className="dashboard-content">
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
                            <h3>Your suggestions are very important to us.</h3>
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

export default Dashboard;