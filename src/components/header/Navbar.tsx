import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutForm from '../Logout';
import navItems from './Navitems';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface DecodedToken {
    sub: string;
    // Add other token fields if needed
}

const Navbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Decode the token to get the email
                    const decoded = jwtDecode<DecodedToken>(token);
                    const email = decoded.sub;

                    // Fetch the username using the email
                    const response = await axios.get(
                        `http://localhost:8080/api/public/user/get/userName/${email}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    setUserName(response.data);
                } catch (error) {
                    console.error('Error fetching username:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserName();
    }, []);

    if (loading) {
        return <div className="navbar-loading">Loading...</div>;
    }

    return (
        <nav className="navbar">
            {navItems.map((item) => {
                // Special handling for chat route
                const to = item.to === '/chat' && userName
                    ? `/chat/${userName}`
                    : item.to;

                return (
                    <Link key={item.to} to={to} className="navbar-item">
                        {item.icon ? (
                            <span className="navbar-icon">{item.icon}</span>
                        ) : (
                            item.label
                        )}
                    </Link>
                );
            })}
            <div className="navbar-item">
                <LogoutForm />
            </div>
        </nav>
    );
};

export default Navbar;