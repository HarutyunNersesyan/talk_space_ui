import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    const fetchUnreadMessages = async (username: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const chatsResponse = await axios.get(
                `http://localhost:8080/api/public/chat/conversations/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const totalUnread = chatsResponse.data.reduce(
                (sum: number, chat: UserChatDto) => sum + chat.unreadCount, 0
            );
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    const email = decoded.sub;

                    const userResponse = await axios.get(
                        `http://localhost:8080/api/public/user/get/userName/${email}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserName(userResponse.data);

                    if (!location.pathname.includes('/chat/')) {
                        await fetchUnreadMessages(userResponse.data);
                    }
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

        const handleChatOpened = () => {
            setUnreadCount(0);
        };

        window.addEventListener('chatOpened', handleChatOpened);

        if (!location.pathname.includes('/chat/')) {
            const interval = setInterval(() => {
                if (userName) {
                    fetchUnreadMessages(userName);
                }
            }, 10000);
            return () => {
                clearInterval(interval);
                window.removeEventListener('chatOpened', handleChatOpened);
            };
        }

        return () => {
            window.removeEventListener('chatOpened', handleChatOpened);
        };
    }, [location.pathname, userName]);

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

                    const showBadge = item.to === '/chat' &&
                        unreadCount > 0 &&
                        !location.pathname.includes('/chat/');

                    return (
                        <Link
                            key={item.to}
                            to={to}
                            className={`navbar-item ${item.to === '/chat' ? 'chat' : ''} ${showBadge ? 'has-unread' : ''}`}
                        >
                            {item.icon ? (
                                <>
                                    <span className="navbar-icon">{item.icon}</span>
                                    {showBadge && (
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