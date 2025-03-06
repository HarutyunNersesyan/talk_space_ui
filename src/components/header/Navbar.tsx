import React from 'react';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import useStoreData from '../../hooks/useStoreData';
import './Navbar.css';

interface NavItem {
    to: string;
    icon?: React.ReactNode;
    label?: string;
}

const Navbar: React.FC = () => {
    const { storeName, email, loading } = useStoreData();

    if (loading) {
        return <nav className="navbar">Loading...</nav>; // Show a loading state
    }

    const navItems: NavItem[] = [
        { to: '/settings', icon: <SettingsIcon /> },
        { to: '/store', label: storeName || 'Store' },
        { to: '/account', label: email ? `Hi, ${email}` : 'Account' },
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
        </nav>
    );
};

export default Navbar;
