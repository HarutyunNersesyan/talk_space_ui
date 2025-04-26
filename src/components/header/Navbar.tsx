import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutForm from '../Logout';
import navItems from './Navitems';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface DecodedToken {
    sub: string;
}

interface UserChatDto {
    partnerUsername: string;
    unreadCount: number;
}

const Navbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Decode the token to get the email
                    const decoded = jwtDecode<DecodedToken>(token);
                    const email = decoded.sub;

                    // Fetch the username
                    const userResponse = await axios.get(
                        `http://localhost:8080/api/public/user/get/userName/${email}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserName(userResponse.data);

                    // Fetch unread messages count
                    const chatsResponse = await axios.get(
                        `http://localhost:8080/api/public/chat/conversations/${userResponse.data}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    const totalUnread = chatsResponse.data.reduce(
                        (sum: number, chat: UserChatDto) => sum + chat.unreadCount, 0
                    );
                    setUnreadCount(totalUnread);
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();

        // Set up polling for new messages
        const interval = setInterval(fetchUserData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="navbar-loading">Loading...</div>;
    }

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">
                Talk Space
            </Link>
            <div className="navbar-items-container">
                {navItems.map((item) => {
                    const to = item.to === '/chat' && userName
                        ? `/chat/${userName}`
                        : item.to;

                    return (
                        <Link key={item.to} to={to} className={`navbar-item ${item.to === '/chat' ? 'chat' : ''}`}>
                            {item.icon ? (
                                <>
                                    <span className="navbar-icon">{item.icon}</span>
                                    {item.to === '/chat' && unreadCount > 0 && (
                                        <span className="chat-badge">{unreadCount}</span>
                                    )}
                                </>
                            ) : (
                                item.label
                            )}
                        </Link>
                    );
                })}
                <div className="navbar-item">
                    <LogoutForm />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;