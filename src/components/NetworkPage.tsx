import React from 'react';
import './NetworkPage.css';
import { useNavigate } from 'react-router-dom';
import hobbiesIcon from '../assets/search/hobbies-icon.svg';
import specialtiesIcon from '../assets/search/specialties-icon.svg';

const NetworkPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="network-container">
            <div
                className="network-header"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard.jpg)`
                }}
            >
                <div className="header-content">
                    <h1>Network with Purpose</h1>
                    <p>
                        Connect with like-minded individuals based on your field or personal interests. <br />
                        Grow friendships, collaborations, or more.
                    </p>
                </div>
            </div>

            <div className="network-options">
                <div className="option" onClick={() => navigate('/hobbies')}>
                    <div className="icon-wrapper">
                        <img src={hobbiesIcon} alt="Hobbies" className="highlighted-icon" />
                    </div>
                    <p>Want to connect with people who share your interests?</p>
                    <button>Search by Hobbies</button>
                </div>

                <div className="divider"></div>

                <div className="option" onClick={() => navigate('/specialities')}>
                    <div className="icon-wrapper">
                        <img src={specialtiesIcon} alt="Specialties" className="highlighted-icon" />
                    </div>
                    <p>Want to connect with people who share your interests?</p>
                    <button>Search by Specialties</button>
                </div>
            </div>
        </div>
    );
};

export default NetworkPage;