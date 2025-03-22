import React from 'react';
import { Link } from 'react-router-dom';
import LogoutForm from '../Logout'; // Import the LogoutForm component
import navItems from './Navitems'; // Import the updated navItems
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            {navItems.map((item) => (
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