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
    iat: number;
    exp: number;
}

const Navbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleBrandClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // If no token, go to home page
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            const userRoles = decodedToken.roles || [];

            // Redirect based on role
            if (userRoles.includes('ADMIN')) {
                navigate('/admin');
            } else {
                // Default to home for regular users
                navigate('/home');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            navigate('/');
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
                        setLoading(false);
                        return; // Skip further processing for admin
                    }

                    const response = await axios.get(
                        `http://localhost:8080/api/public/user/get/userName/${email}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setUserName(response.data);
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
    }, [location.pathname, userName, isAdmin]);

    if (loading) {
        return <div className="navbar-loading">Loading...</div>;
    }

    const itemsToRender = isAdmin ? adminNavItems : navItems;

    return (
        <nav className="navbar">
            <a href="/" className="navbar-brand" onClick={handleBrandClick}>
                Talk Space
            </a>
            <div className="navbar-items-container">
                {itemsToRender.map((item) => {
                    // Handle chat route with username
                    const path = item.to === '/chat' && userName
                        ? `/chat/${userName}`
                        : item.to;

                    return (
                        <a
                            key={item.to}
                            href={path}
                            onClick={(e) => handleNavigation(e, path)}
                            className={`navbar-item ${item.to === '/chat' ? 'chat' : ''}`}
                        >
                            {item.icon && (
                                <span className="navbar-icon">{item.icon}</span>
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