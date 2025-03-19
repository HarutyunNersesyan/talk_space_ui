import React from 'react';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import useStoreData from '../../hooks/useStoreData';
import LogoutForm from '../Logout'; // Import the LogoutForm component
import './Navbar.css';

interface NavItem {
    to: string;
    icon?: React.ReactNode;
    label?: string;
}

const Navbar: React.FC = () => {
    const { storeName, email, loading } = useStoreData();

    if (loading) {
        return <nav className="navbar">Loading...</nav>;
    }

    const navItems: NavItem[] = [
        { to: '/profile', icon: <SettingsIcon />, label: 'Profile' },
        // Removed the "Hobbies" navigation item
    ];

    return (
        <nav className="navbar">
            {navItems.map((item: NavItem) => (
                <Link key={item.to} to={item.to} className="navbar-item">
                    {item.icon ? (
                        <span className="navbar-icon">{item.icon}</span>
                    ) : (
                        item.label
                    )}
                </Link>
            ))}
            {/* Add the LogoutForm component */}
            <div className="navbar-item">
                <LogoutForm />
            </div>
        </nav>
    );
};

export default Navbar;