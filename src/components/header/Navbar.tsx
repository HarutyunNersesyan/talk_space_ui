import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutForm from '../Logout';
import navItems from './Navitems';
import adminNavItems from './AdminNavitems';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface DecodedToken {
    sub: string;
    roles?: string[];
}

interface UserChatDto {
    partnerUsername: string;
    unreadCount: number;
}

const Navbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchUnreadMessages = async (username: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(
                `http://localhost:8080/api/public/chat/conversations/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const totalUnread = response.data.reduce(
                (sum: number, chat: UserChatDto) => sum + chat.unreadCount, 0
            );
            setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        navigate(path);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    const email = decoded.sub;

                    if (decoded.roles?.includes('ADMIN')) {
                        setIsAdmin(true);
                    }

                    const response = await axios.get(
                        `http://localhost:8080/api/public/user/get/userName/${email}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserName(response.data);

                    if (!location.pathname.includes('/chat')) {
                        await fetchUnreadMessages(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();

        const interval = setInterval(() => {
            if (userName && !location.pathname.includes('/chat')) {
                fetchUnreadMessages(userName);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [location.pathname, userName]);

    if (loading) {
        return <div className="navbar-loading">Loading...</div>;
    }

    const itemsToRender = isAdmin ? adminNavItems : navItems;

    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">
                Talk Space
            </Link>
            <div className="navbar-items-container">
                {itemsToRender.map((item) => {
                    // Handle chat route with username
                    const path = item.to === '/chat' && userName
                        ? `/chat/${userName}`
                        : item.to;

                    const showBadge = item.to === '/chat' &&
                        unreadCount > 0 &&
                        !location.pathname.includes('/chat');

                    return (
                        <a
                            key={item.to}
                            href={path}
                            onClick={(e) => handleNavigation(e, path)}
                            className={`navbar-item ${item.to === '/chat' ? 'chat' : ''} ${showBadge ? 'has-unread' : ''}`}
                        >
                            {item.icon && (
                                <>
                                    <span className="navbar-icon">{item.icon}</span>
                                    {showBadge && (
                                        <span className="chat-badge">{unreadCount}</span>
                                    )}
                                </>
                            )}
                            {item.label}
                        </a>
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