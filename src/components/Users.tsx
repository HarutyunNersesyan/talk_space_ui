import React, { useState, useEffect } from 'react';
import './Users.css';

// Import icons
import femaleIcon from '../assets/gender/female-symbol.svg';
import maleIcon from '../assets/gender/male-symbol.svg';
import ariesIcon from '../assets/zodiac/aries.svg';
import taurusIcon from '../assets/zodiac/taurus.svg';
import geminiIcon from '../assets/zodiac/gemini.svg';
import cancerIcon from '../assets/zodiac/cancer.svg';
import leoIcon from '../assets/zodiac/leo.svg';
import virgoIcon from '../assets/zodiac/virgo.svg';
import libraIcon from '../assets/zodiac/libra.svg';
import scorpioIcon from '../assets/zodiac/scorpio.svg';
import sagittariusIcon from '../assets/zodiac/sagittarius.svg';
import capricornIcon from '../assets/zodiac/capricorn.svg';
import aquariusIcon from '../assets/zodiac/aquarius.svg';
import piscesIcon from '../assets/zodiac/horoscope-pisces-solid.svg';

interface User {
    userId: number;
    firstName: string;
    lastName: string;
    userName: string;
    birthDate: number[];
    gender: string;
    email: string;
    createdDate: number[];
    zodiacSign: string;
    verifyMail: boolean;
    status: string;
    blockedMessage: string | null;
    untilBlockedDate: number[];
}

type SortField = 'firstName' | 'lastName' | 'userName' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc';

const zodiacIcons: Record<string, string> = {
    'ARIES': ariesIcon,
    'TAURUS': taurusIcon,
    'GEMINI': geminiIcon,
    'CANCER': cancerIcon,
    'LEO': leoIcon,
    'VIRGO': virgoIcon,
    'LIBRA': libraIcon,
    'SCORPIO': scorpioIcon,
    'SAGITTARIUS': sagittariusIcon,
    'CAPRICORN': capricornIcon,
    'AQUARIUS': aquariusIcon,
    'PISCES': piscesIcon
};

const genderIcons: Record<string, string> = {
    'FEMALE': femaleIcon,
    'MALE': maleIcon,
    'F': femaleIcon,
    'M': maleIcon,
    'WOMAN': femaleIcon,
    'MAN': maleIcon
};

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('firstName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/private/admin/getAll', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('API endpoint not found (404)');
                    } else if (response.status === 403) {
                        throw new Error('Access forbidden (403) - Check your permissions');
                    } else if (response.status === 401) {
                        throw new Error('Unauthorized (401) - Please login');
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response is not JSON');
                }

                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
                setLoading(false);
            } catch (err) {
                let errorMessage = 'Failed to fetch user data';
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === 'string') {
                    errorMessage = err;
                }
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const formatDate = (dateArray: number[] | null) => {
        if (!dateArray || dateArray.length !== 3) return 'N/A';
        return `${dateArray[0]}-${dateArray[1].toString().padStart(2, '0')}-${dateArray[2].toString().padStart(2, '0')}`;
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const toggleMessageExpansion = (userId: number) => {
        setExpandedMessages(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let compareValue = 0;

        if (sortField === 'createdDate') {
            const dateA = a.createdDate ? `${a.createdDate[0]}${a.createdDate[1].toString().padStart(2, '0')}${a.createdDate[2].toString().padStart(2, '0')}` : '';
            const dateB = b.createdDate ? `${b.createdDate[0]}${b.createdDate[1].toString().padStart(2, '0')}${b.createdDate[2].toString().padStart(2, '0')}` : '';
            compareValue = dateA.localeCompare(dateB);
        } else {
            compareValue = String(a[sortField]).localeCompare(String(b[sortField]));
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getZodiacIcon = (zodiacSign: string | undefined): string | undefined => {
        if (!zodiacSign) return undefined;
        const upperCaseSign = zodiacSign.toUpperCase();
        return zodiacIcons[upperCaseSign];
    };

    const getGenderIcon = (gender: string | undefined): string | undefined => {
        if (!gender) return undefined;
        const upperCaseGender = gender.toUpperCase();
        return genderIcons[upperCaseGender];
    };

    if (loading) {
        return (
            <div className="users-container">
                <div className="loading-message">Loading user data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="users-container">
                <div className="error-message">
                    <h2>Error Loading Data</h2>
                    <p>{error}</p>
                    <div className="error-details">
                        <p>Possible solutions:</p>
                        <ul>
                            <li>Check if the backend service is running</li>
                            <li>Verify your authentication status</li>
                            <li>Ensure you have proper permissions</li>
                            <li>Check the API endpoint URL</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="search-container">
                <div className="search-box">
                    <label htmlFor="user-search">Where</label>
                    <input
                        id="user-search"
                        type="text"
                        placeholder="Find user by name, username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="users-section">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th className="name-column" onClick={() => handleSort('firstName')}>
                            First name {renderSortIcon('firstName')}
                        </th>
                        <th className="name-column" onClick={() => handleSort('lastName')}>
                            Last name {renderSortIcon('lastName')}
                        </th>
                        <th className="username-column" onClick={() => handleSort('userName')}>
                            Username {renderSortIcon('userName')}
                        </th>
                        <th className="date-column">Birth Date</th>
                        <th className="gender-column">Gender</th>
                        <th className="email-column">Email</th>
                        <th className="date-column" onClick={() => handleSort('createdDate')}>
                            Created Date {renderSortIcon('createdDate')}
                        </th>
                        <th className="zodiac-column">Zodiac</th>
                        <th className="status-column">Verified</th>
                        <th className="status-column" onClick={() => handleSort('status')}>
                            Status {renderSortIcon('status')}
                        </th>
                        <th className="message-column">Blocked message</th>
                        <th className="date-column">Blocked until</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedUsers.map((user) => {
                        const genderIcon = getGenderIcon(user.gender);
                        const zodiacIcon = getZodiacIcon(user.zodiacSign);
                        const isExpanded = expandedMessages[user.userId] || false;
                        const message = user.blockedMessage || 'N/A';
                        const isLongMessage = message.length > 100;

                        return (
                            <tr key={user.userId}>
                                <td className="name-column">{user.firstName}</td>
                                <td className="name-column">{user.lastName}</td>
                                <td className="username-column">{user.userName}</td>
                                <td className="date-column">{formatDate(user.birthDate)}</td>
                                <td className="gender-column">
                                    <div className="gender-cell">
                                        {genderIcon ? (
                                            <img
                                                src={genderIcon}
                                                alt={user.gender}
                                                className="gender-icon"
                                                title={user.gender}
                                            />
                                        ) : (
                                            <span className="gender-text">{user.gender || 'N/A'}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="email-column">{user.email}</td>
                                <td className="date-column">{formatDate(user.createdDate)}</td>
                                <td className="zodiac-column">
                                    {zodiacIcon ? (
                                        <img
                                            src={zodiacIcon}
                                            alt={user.zodiacSign}
                                            className="icon-img"
                                            title={user.zodiacSign}
                                        />
                                    ) : (
                                        <span>{user.zodiacSign || 'N/A'}</span>
                                    )}
                                </td>
                                <td className="status-column verified-column">
                                    {user.verifyMail ? 'Yes' : 'No'}
                                </td>
                                <td className="status-column">
                                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="message-column">
                                    <div
                                        className={`message-content ${isExpanded ? 'expanded' : ''} ${isLongMessage ? 'long-message' : ''}`}
                                        onClick={() => isLongMessage && toggleMessageExpansion(user.userId)}
                                        title={isLongMessage && !isExpanded ? message : undefined}
                                    >
                                        {isExpanded || !isLongMessage ? message : `${message.substring(0, 100)}...`}
                                        {isLongMessage && (
                                            <span className="expand-indicator">
                                                {isExpanded ? ' (Show less)' : ' (Show more)'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="date-column">
                                    {formatDate(user.untilBlockedDate)}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="no-users-message">
                        {searchTerm.trim() ? 'No users match your search' : 'No user data available'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;