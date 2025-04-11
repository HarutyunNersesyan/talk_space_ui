import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const backgroundStyle = {
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard.jpg)`,
    };
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-background" style={backgroundStyle}></div>
            <div className="dashboard-overlay"></div>
            <div className="dashboard-content">
                {/* Header Text - Centered with exact spacing */}
                <h1 className="dashboard-title">
                    <span className={`title-m ${mounted ? 'animate-m' : ''}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;M
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

                <button className={`dashboard-cta-button ${mounted ? 'animate-button' : ''}`}>
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
        </div>
    );
};

export default Dashboard;