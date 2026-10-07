import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import './Users.css';

import {
    useNavigate
} from 'react-router-dom';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';


const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


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


type SortField =
    'firstName' |
    'lastName' |
    'userName' |
    'createdDate' |
    'status';


type SortDirection =
    'asc' |
    'desc';


const Users: React.FC = () => {
    const navigate =
        useNavigate();


    const token =
        localStorage.getItem('token');


    const [
        users,
        setUsers
    ] = useState<User[]>([]);


    const [
        loading,
        setLoading
    ] = useState<boolean>(true);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    const [
        searchTerm,
        setSearchTerm
    ] = useState<string>('');


    const [
        sortField,
        setSortField
    ] = useState<SortField>(
        'createdDate'
    );


    const [
        sortDirection,
        setSortDirection
    ] = useState<SortDirection>(
        'desc'
    );


    const [
        expandedMessages,
        setExpandedMessages
    ] = useState<Record<number, boolean>>({});


    /* =====================================================
       FETCH USERS
       ===================================================== */

    const fetchUsers =
        async () => {
            if (!token) {
                navigate('/login');
                return;
            }


            try {
                setLoading(true);
                setError(null);


                const response =
                    await fetch(
                        `${API_URL}/api/private/admin/getAll`,
                        {
                            method: 'GET',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                Authorization:
                                    `Bearer ${token}`
                            },

                            credentials:
                                'include'
                        }
                    );


                if (!response.ok) {
                    if (
                        response.status ===
                        401
                    ) {
                        navigate('/login');

                        throw new Error(
                            'Your session has expired.'
                        );
                    }


                    if (
                        response.status ===
                        403
                    ) {
                        throw new Error(
                            'You do not have permission to view users.'
                        );
                    }


                    if (
                        response.status ===
                        404
                    ) {
                        throw new Error(
                            'Users endpoint was not found.'
                        );
                    }


                    throw new Error(
                        `Failed to load users (${response.status}).`
                    );
                }


                const contentType =
                    response.headers.get(
                        'content-type'
                    );


                if (
                    !contentType?.includes(
                        'application/json'
                    )
                ) {
                    throw new Error(
                        'Invalid server response.'
                    );
                }


                const data =
                    await response.json();


                setUsers(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    'Error fetching users:',
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load users.'
                );

            } finally {
                setLoading(false);
            }
        };


    useEffect(() => {
        fetchUsers();

    }, []);


    /* =====================================================
       DATE
       ===================================================== */

    const formatDate = (
        dateArray?: number[] | null
    ): string => {
        if (
            !dateArray ||
            dateArray.length < 3
        ) {
            return 'N/A';
        }


        const [
            year,
            month,
            day
        ] = dateArray;


        return new Date(
            year,
            month - 1,
            day
        ).toLocaleDateString(
            [],
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };


    const dateValue = (
        dateArray?: number[] | null
    ): number => {
        if (
            !dateArray ||
            dateArray.length < 3
        ) {
            return 0;
        }


        return new Date(
            dateArray[0],
            dateArray[1] - 1,
            dateArray[2]
        ).getTime();
    };


    /* =====================================================
       SORT
       ===================================================== */

    const handleSort = (
        field: SortField
    ) => {
        if (
            sortField === field
        ) {
            setSortDirection(
                previous =>
                    previous === 'asc'
                        ? 'desc'
                        : 'asc'
            );

            return;
        }


        setSortField(field);
        setSortDirection('asc');
    };


    /* =====================================================
       FILTER + SORT
       ===================================================== */

    const sortedUsers =
        useMemo(
            () => {
                const query =
                    searchTerm
                        .trim()
                        .toLowerCase();


                const filtered =
                    users.filter(
                        user => {
                            if (!query) {
                                return true;
                            }


                            return (
                                user.firstName
                                    ?.toLowerCase()
                                    .includes(query) ||

                                user.lastName
                                    ?.toLowerCase()
                                    .includes(query) ||

                                user.userName
                                    ?.toLowerCase()
                                    .includes(query) ||

                                user.email
                                    ?.toLowerCase()
                                    .includes(query)
                            );
                        }
                    );


                return [
                    ...filtered
                ].sort(
                    (
                        a,
                        b
                    ) => {
                        let comparison = 0;


                        if (
                            sortField ===
                            'createdDate'
                        ) {
                            comparison =
                                dateValue(
                                    a.createdDate
                                ) -
                                dateValue(
                                    b.createdDate
                                );

                        } else {
                            comparison =
                                String(
                                    a[sortField] ??
                                    ''
                                ).localeCompare(
                                    String(
                                        b[sortField] ??
                                        ''
                                    )
                                );
                        }


                        return sortDirection ===
                        'asc'
                            ? comparison
                            : -comparison;
                    }
                );
            },
            [
                users,
                searchTerm,
                sortField,
                sortDirection
            ]
        );


    /* =====================================================
       STATISTICS
       ===================================================== */

    const verifiedUsers =
        users.filter(
            user =>
                user.verifyMail
        ).length;


    const blockedUsers =
        users.filter(
            user =>
                user.status
                    ?.toUpperCase() ===
                'BLOCKED'
        ).length;


    const activeUsers =
        users.filter(
            user =>
                user.status
                    ?.toUpperCase() ===
                'ACTIVE'
        ).length;


    /* =====================================================
       BLOCK MESSAGE
       ===================================================== */

    const toggleMessageExpansion = (
        userId: number
    ) => {
        setExpandedMessages(
            previous => ({
                ...previous,

                [userId]:
                    !previous[userId]
            })
        );
    };


    /* =====================================================
       STATUS
       ===================================================== */

    const getStatusClass = (
        status?: string
    ) => {
        const value =
            status
                ?.toLowerCase() ||
            'unknown';


        if (
            value === 'active'
        ) {
            return 'active';
        }


        if (
            value === 'blocked'
        ) {
            return 'blocked';
        }


        if (
            value === 'inactive'
        ) {
            return 'inactive';
        }


        return 'unknown';
    };


    const formatValue = (
        value?: string
    ) => {
        if (!value) {
            return 'N/A';
        }


        return (
            value.charAt(0).toUpperCase() +
            value
                .slice(1)
                .toLowerCase()
        );
    };


    /* =====================================================
       SORT BUTTON
       ===================================================== */

    const sortButton = (
        field: SortField,
        label: string
    ) => (
        <button
            type="button"
            className={
                `admin-users-sort ${
                    sortField === field
                        ? 'active'
                        : ''
                }`
            }
            onClick={() =>
                handleSort(field)
            }
        >
            {label}

            {sortField === field && (
                <span>
                    {sortDirection ===
                    'asc'
                        ? '↑'
                        : '↓'}
                </span>
            )}
        </button>
    );


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="admin-users-page">

            {/* HEADER */}

            <header className="admin-users-header">

                <div>

                    <span className="admin-users-eyebrow">
                        <PeopleAltRoundedIcon />

                        ADMIN PANEL
                    </span>


                    <h1>
                        Users
                    </h1>


                    <p>
                        View registered TalkSpace
                        members, account status,
                        verification and blocked
                        account information.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-users-refresh"
                    onClick={
                        fetchUsers
                    }
                    disabled={
                        loading
                    }
                >
                    <RefreshRoundedIcon
                        className={
                            loading
                                ? 'spinning'
                                : ''
                        }
                    />

                    Refresh
                </button>

            </header>


            {/* STATS */}

            <section className="admin-users-stats">

                <article className="admin-users-stat">

                    <div className="admin-users-stat-icon purple">
                        <PeopleAltRoundedIcon />
                    </div>

                    <div>
                        <span>
                            TOTAL USERS
                        </span>

                        <strong>
                            {users.length}
                        </strong>

                        <p>
                            Registered accounts
                        </p>
                    </div>

                </article>


                <article className="admin-users-stat">

                    <div className="admin-users-stat-icon green">
                        <PersonRoundedIcon />
                    </div>

                    <div>
                        <span>
                            ACTIVE
                        </span>

                        <strong>
                            {activeUsers}
                        </strong>

                        <p>
                            Active accounts
                        </p>
                    </div>

                </article>


                <article className="admin-users-stat">

                    <div className="admin-users-stat-icon blue">
                        <VerifiedRoundedIcon />
                    </div>

                    <div>
                        <span>
                            VERIFIED
                        </span>

                        <strong>
                            {verifiedUsers}
                        </strong>

                        <p>
                            Verified emails
                        </p>
                    </div>

                </article>


                <article className="admin-users-stat">

                    <div className="admin-users-stat-icon red">
                        <BlockRoundedIcon />
                    </div>

                    <div>
                        <span>
                            BLOCKED
                        </span>

                        <strong>
                            {blockedUsers}
                        </strong>

                        <p>
                            Restricted accounts
                        </p>
                    </div>

                </article>

            </section>


            {/* USERS CARD */}

            <section className="admin-users-card">

                {/* TOOLBAR */}

                <div className="admin-users-toolbar">

                    <div>

                        <h2>
                            All users
                        </h2>

                        <p>
                            {sortedUsers.length}
                            {' '}
                            {sortedUsers.length ===
                            1
                                ? 'user'
                                : 'users'}
                        </p>

                    </div>


                    <div className="admin-users-toolbar-actions">

                        <div className="admin-users-search">

                            <SearchRoundedIcon />

                            <input
                                type="text"
                                value={
                                    searchTerm
                                }
                                onChange={
                                    event =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                }
                                placeholder="Search name, username or email..."
                            />

                        </div>


                        <div className="admin-users-mobile-sort">

                            <SortRoundedIcon />

                            <select
                                value={`${sortField}-${sortDirection}`}
                                onChange={
                                    event => {
                                        const [
                                            field,
                                            direction
                                        ] =
                                            event.target.value.split(
                                                '-'
                                            );


                                        setSortField(
                                            field as SortField
                                        );


                                        setSortDirection(
                                            direction as SortDirection
                                        );
                                    }
                                }
                            >
                                <option value="createdDate-desc">
                                    Newest users
                                </option>

                                <option value="createdDate-asc">
                                    Oldest users
                                </option>

                                <option value="firstName-asc">
                                    First name A–Z
                                </option>

                                <option value="firstName-desc">
                                    First name Z–A
                                </option>

                                <option value="userName-asc">
                                    Username A–Z
                                </option>

                                <option value="userName-desc">
                                    Username Z–A
                                </option>

                                <option value="status-asc">
                                    Status A–Z
                                </option>
                            </select>

                        </div>

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="admin-users-state">

                        <div className="admin-users-loading-icon">
                            <PeopleAltRoundedIcon />
                        </div>

                        <h3>
                            Loading users
                        </h3>

                        <p>
                            Getting registered
                            TalkSpace members...
                        </p>

                        <div className="admin-users-loading-bar">
                            <span />
                        </div>

                    </div>

                ) : error ? (

                    /* ERROR */

                    <div className="admin-users-state">

                        <div className="admin-users-state-icon error">
                            <ErrorOutlineRoundedIcon />
                        </div>

                        <h3>
                            Couldn't load users
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                fetchUsers
                            }
                        >
                            <RefreshRoundedIcon />

                            Try again
                        </button>

                    </div>

                ) : sortedUsers.length ===
                0 ? (

                    /* EMPTY */

                    <div className="admin-users-state">

                        <div className="admin-users-state-icon">
                            <InboxRoundedIcon />
                        </div>

                        <h3>
                            {searchTerm
                                ? 'No matching users'
                                : 'No users found'}
                        </h3>

                        <p>
                            {searchTerm
                                ? 'Try searching with another name, username or email.'
                                : 'Registered TalkSpace users will appear here.'}
                        </p>

                    </div>

                ) : (

                    <>
                        {/* DESKTOP TABLE */}

                        <div className="admin-users-table-wrapper">

                            <table className="admin-users-table">

                                <thead>
                                <tr>
                                    <th>
                                        {sortButton(
                                            'firstName',
                                            'User'
                                        )}
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Details
                                    </th>

                                    <th>
                                        {sortButton(
                                            'createdDate',
                                            'Joined'
                                        )}
                                    </th>

                                    <th>
                                        Verified
                                    </th>

                                    <th>
                                        {sortButton(
                                            'status',
                                            'Status'
                                        )}
                                    </th>

                                    <th>
                                        Block information
                                    </th>
                                </tr>
                                </thead>


                                <tbody>

                                {sortedUsers.map(
                                    user => {
                                        const message =
                                            user.blockedMessage ||
                                            'No block message';


                                        const isLong =
                                            message.length >
                                            90;


                                        const expanded =
                                            Boolean(
                                                expandedMessages[
                                                    user.userId
                                                    ]
                                            );


                                        return (
                                            <tr
                                                key={
                                                    user.userId
                                                }
                                            >

                                                {/* USER */}

                                                <td>

                                                    <div className="admin-users-user">

                                                        <div className="admin-users-avatar">
                                                            {user.firstName
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                user.userName
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                '?'}
                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {user.firstName}
                                                                {' '}
                                                                {user.lastName}
                                                            </strong>

                                                            <span>
                                                                    @{user.userName}
                                                                </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CONTACT */}

                                                <td>

                                                    <div className="admin-users-email">

                                                        <EmailRoundedIcon />

                                                        <span>
                                                                {user.email}
                                                            </span>

                                                    </div>

                                                </td>


                                                {/* DETAILS */}

                                                <td>

                                                    <div className="admin-users-details">

                                                            <span>
                                                                {formatValue(
                                                                    user.gender
                                                                )}
                                                            </span>

                                                        <i />

                                                        <span>
                                                                {formatValue(
                                                                    user.zodiacSign
                                                                )}
                                                            </span>

                                                        <small>
                                                            {formatDate(
                                                                user.birthDate
                                                            )}
                                                        </small>

                                                    </div>

                                                </td>


                                                {/* CREATED */}

                                                <td>

                                                    <div className="admin-users-date">

                                                        <CalendarMonthRoundedIcon />

                                                        {formatDate(
                                                            user.createdDate
                                                        )}

                                                    </div>

                                                </td>


                                                {/* VERIFIED */}

                                                <td>

                                                        <span
                                                            className={
                                                                `admin-users-verified ${
                                                                    user.verifyMail
                                                                        ? 'yes'
                                                                        : 'no'
                                                                }`
                                                            }
                                                        >

                                                            {user.verifyMail ? (
                                                                <VerifiedRoundedIcon />
                                                            ) : (
                                                                <ErrorOutlineRoundedIcon />
                                                            )}

                                                            {user.verifyMail
                                                                ? 'Verified'
                                                                : 'Unverified'}

                                                        </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                        <span
                                                            className={
                                                                `admin-users-status ${getStatusClass(
                                                                    user.status
                                                                )}`
                                                            }
                                                        >
                                                            <i />

                                                            {formatValue(
                                                                user.status
                                                            )}
                                                        </span>

                                                </td>


                                                {/* BLOCK */}

                                                <td>

                                                    {user.status
                                                        ?.toUpperCase() ===
                                                    'BLOCKED' ? (

                                                        <div className="admin-users-block">

                                                            <p>
                                                                {expanded ||
                                                                !isLong
                                                                    ? message
                                                                    : `${message.substring(
                                                                        0,
                                                                        90
                                                                    )}...`}
                                                            </p>


                                                            {isLong && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleMessageExpansion(
                                                                            user.userId
                                                                        )
                                                                    }
                                                                >
                                                                    {expanded
                                                                        ? 'Show less'
                                                                        : 'Show more'}
                                                                </button>
                                                            )}


                                                            <span>
                                                                    Until:
                                                                {' '}
                                                                {formatDate(
                                                                    user.untilBlockedDate
                                                                )}
                                                                </span>

                                                        </div>

                                                    ) : (
                                                        <span className="admin-users-not-blocked">
                                                                —
                                                            </span>
                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                                </tbody>

                            </table>

                        </div>


                        {/* MOBILE */}

                        <div className="admin-users-mobile-list">

                            {sortedUsers.map(
                                user => {
                                    const message =
                                        user.blockedMessage ||
                                        'No block message';


                                    const expanded =
                                        Boolean(
                                            expandedMessages[
                                                user.userId
                                                ]
                                        );


                                    const isLong =
                                        message.length >
                                        120;


                                    return (
                                        <article
                                            key={
                                                user.userId
                                            }
                                            className="admin-users-mobile-card"
                                        >

                                            <div className="admin-users-mobile-header">

                                                <div className="admin-users-user">

                                                    <div className="admin-users-avatar">
                                                        {user.firstName
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                            '?'}
                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {user.firstName}
                                                            {' '}
                                                            {user.lastName}
                                                        </strong>

                                                        <span>
                                                            @{user.userName}
                                                        </span>

                                                    </div>

                                                </div>


                                                <span
                                                    className={
                                                        `admin-users-status ${getStatusClass(
                                                            user.status
                                                        )}`
                                                    }
                                                >
                                                    <i />

                                                    {formatValue(
                                                        user.status
                                                    )}
                                                </span>

                                            </div>


                                            <div className="admin-users-mobile-info">

                                                <div>
                                                    <span>
                                                        EMAIL
                                                    </span>

                                                    <strong>
                                                        {user.email}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        GENDER
                                                    </span>

                                                    <strong>
                                                        {formatValue(
                                                            user.gender
                                                        )}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        ZODIAC
                                                    </span>

                                                    <strong>
                                                        {formatValue(
                                                            user.zodiacSign
                                                        )}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        JOINED
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            user.createdDate
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="admin-users-mobile-verification">

                                                <span
                                                    className={
                                                        `admin-users-verified ${
                                                            user.verifyMail
                                                                ? 'yes'
                                                                : 'no'
                                                        }`
                                                    }
                                                >
                                                    {user.verifyMail ? (
                                                        <VerifiedRoundedIcon />
                                                    ) : (
                                                        <ErrorOutlineRoundedIcon />
                                                    )}

                                                    {user.verifyMail
                                                        ? 'Email verified'
                                                        : 'Email not verified'}
                                                </span>

                                            </div>


                                            {user.status
                                                    ?.toUpperCase() ===
                                                'BLOCKED' && (

                                                    <div className="admin-users-mobile-block">

                                                    <span>
                                                        BLOCK REASON
                                                    </span>

                                                        <p>
                                                            {expanded ||
                                                            !isLong
                                                                ? message
                                                                : `${message.substring(
                                                                    0,
                                                                    120
                                                                )}...`}
                                                        </p>


                                                        {isLong && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleMessageExpansion(
                                                                        user.userId
                                                                    )
                                                                }
                                                            >
                                                                {expanded
                                                                    ? 'Show less'
                                                                    : 'Show more'}
                                                            </button>
                                                        )}


                                                        <small>
                                                            Blocked until
                                                            {' '}
                                                            {formatDate(
                                                                user.untilBlockedDate
                                                            )}
                                                        </small>

                                                    </div>
                                                )}

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    </>
                )}

            </section>

        </div>
    );
};

export default Users;