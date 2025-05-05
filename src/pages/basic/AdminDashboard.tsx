import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);

        const fetchUserName = async () => {
            try {
                if (!token) {
                    return;
                }

                const decodedToken = jwtDecode<{ sub: string }>(token);
                const email = decodedToken.sub;

                const response = await axios.get(`http://localhost:8080/api/public/user/get/userName/${email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserName(response.data);
            } catch (err) {
                console.error('Error fetching userName:', err);
            }
        };

        fetchUserName();

        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, [token]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <h1 className="dashboard-title">
                    Admin Dashboard
                </h1>

                <div className="admin-stats-container">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p>1,234</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Today</h3>
                        <p>567</p>
                    </div>
                    <div className="stat-card">
                        <h3>New Matches</h3>
                        <p>89</p>
                    </div>
                </div>

                <div className="admin-actions">
                    <button className="admin-button" onClick={() => navigate('/admin/users')}>
                        Manage Users
                    </button>
                    <button className="admin-button" onClick={() => navigate('/admin/reports')}>
                        View Reports
                    </button>
                    <button className="admin-button" onClick={() => navigate('/admin/analytics')}>
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;