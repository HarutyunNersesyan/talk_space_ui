import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import './Feedbacks.css';

import {
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';


const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


interface Review {
    id: number;
    message: string;
    senderUserName: string;
    rating: number | null;
    reviewDate: number[];
}


type SortField =
    'senderUserName' |
    'reviewDate' |
    'rating';


type SortDirection =
    'asc' |
    'desc';


const Feedbacks: React.FC = () => {
    const navigate =
        useNavigate();


    const token =
        localStorage.getItem('token');


    const [
        reviews,
        setReviews
    ] = useState<Review[]>([]);


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
        'reviewDate'
    );


    const [
        sortDirection,
        setSortDirection
    ] = useState<SortDirection>(
        'desc'
    );


    /* =====================================================
       FETCH REVIEWS
       ===================================================== */

    const fetchReviews =
        async () => {
            if (!token) {
                navigate('/login');

                return;
            }


            try {
                setLoading(true);
                setError(null);


                const response =
                    await axios.get(
                        `${API_URL}/api/private/admin/review`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                setReviews(
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );

            } catch (err) {

                console.error(
                    'Error fetching feedback:',
                    err
                );


                setError(
                    'Failed to load feedback.'
                );

            } finally {
                setLoading(false);
            }
        };


    useEffect(() => {
        fetchReviews();

    }, [
        token
    ]);


    /* =====================================================
       DATE
       ===================================================== */

    const getDate = (
        dateArray: number[]
    ): Date | null => {
        if (
            !Array.isArray(
                dateArray
            ) ||
            dateArray.length < 3
        ) {
            return null;
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
        );
    };


    const formatDate = (
        dateArray: number[]
    ): string => {
        const date =
            getDate(
                dateArray
            );


        if (!date) {
            return 'Unknown date';
        }


        return date.toLocaleDateString(
            [],
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
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


        setSortField(
            field
        );


        setSortDirection(
            'asc'
        );
    };


    /* =====================================================
       FILTER + SORT
       ===================================================== */

    const filteredReviews =
        useMemo(
            () => {
                const query =
                    searchTerm
                        .trim()
                        .toLowerCase();


                const filtered =
                    reviews.filter(
                        review => {
                            if (!query) {
                                return true;
                            }


                            return (
                                review.senderUserName
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    ) ||

                                review.message
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    )
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
                        if (
                            sortField ===
                            'senderUserName'
                        ) {
                            const comparison =
                                a.senderUserName
                                    .localeCompare(
                                        b.senderUserName
                                    );


                            return sortDirection ===
                            'asc'
                                ? comparison
                                : -comparison;
                        }


                        if (
                            sortField ===
                            'rating'
                        ) {
                            const ratingA =
                                a.rating ?? 0;


                            const ratingB =
                                b.rating ?? 0;


                            return sortDirection ===
                            'asc'
                                ? ratingA -
                                ratingB
                                : ratingB -
                                ratingA;
                        }


                        const dateA =
                            getDate(
                                a.reviewDate
                            )?.getTime() ?? 0;


                        const dateB =
                            getDate(
                                b.reviewDate
                            )?.getTime() ?? 0;


                        return sortDirection ===
                        'asc'
                            ? dateA -
                            dateB
                            : dateB -
                            dateA;
                    }
                );
            },
            [
                reviews,
                searchTerm,
                sortField,
                sortDirection
            ]
        );


    /* =====================================================
       STATISTICS
       ===================================================== */

    const ratedReviews =
        reviews.filter(
            review =>
                review.rating !==
                null
        );


    const averageRating =
        ratedReviews.length >
        0
            ? ratedReviews.reduce(
                (
                    sum,
                    review
                ) =>
                    sum +
                    (
                        review.rating ??
                        0
                    ),
                0
            ) /
            ratedReviews.length
            : 0;


    const uniqueUsers =
        new Set(
            reviews.map(
                review =>
                    review.senderUserName
            )
        ).size;


    const positiveReviews =
        reviews.filter(
            review =>
                (
                    review.rating ??
                    0
                ) >= 4
        ).length;


    const positivePercentage =
        reviews.length > 0
            ? Math.round(
                (
                    positiveReviews /
                    reviews.length
                ) * 100
            )
            : 0;


    /* =====================================================
       RATING
       ===================================================== */

    const renderRating = (
        rating: number | null
    ) => {
        if (
            rating === null
        ) {
            return (
                <span className="admin-feedback-no-rating">
                    No rating
                </span>
            );
        }


        return (
            <div className="admin-feedback-rating">

                <div className="admin-feedback-stars">

                    {Array.from({
                        length: 5
                    }).map(
                        (
                            _,
                            index
                        ) => (
                            <StarRoundedIcon
                                key={
                                    index
                                }
                                className={
                                    index <
                                    rating
                                        ? 'filled'
                                        : ''
                                }
                            />
                        )
                    )}

                </div>


                <span>
                    {rating}.0
                </span>

            </div>
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
                `admin-feedback-sort ${
                    sortField ===
                    field
                        ? 'active'
                        : ''
                }`
            }
            onClick={() =>
                handleSort(
                    field
                )
            }
        >

            {label}


            {sortField ===
                field && (
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
        <div className="admin-feedback-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <header className="admin-feedback-header">

                <div>

                    <span className="admin-feedback-eyebrow">
                        <ReviewsRoundedIcon />

                        ADMIN PANEL
                    </span>


                    <h1>
                        User feedback
                    </h1>


                    <p>
                        Review what TalkSpace
                        members think about the
                        platform and monitor overall
                        satisfaction.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-feedback-refresh"
                    onClick={
                        fetchReviews
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


            {/* =============================================
                STATS
               ============================================= */}

            <section className="admin-feedback-stats">

                <article className="admin-feedback-stat">

                    <div className="admin-feedback-stat-icon purple">
                        <ReviewsRoundedIcon />
                    </div>


                    <div>
                        <span>
                            TOTAL FEEDBACK
                        </span>

                        <strong>
                            {reviews.length}
                        </strong>

                        <p>
                            Submitted reviews
                        </p>
                    </div>

                </article>


                <article className="admin-feedback-stat">

                    <div className="admin-feedback-stat-icon yellow">
                        <StarRoundedIcon />
                    </div>


                    <div>
                        <span>
                            AVG. RATING
                        </span>

                        <strong>
                            {averageRating.toFixed(
                                1
                            )}
                        </strong>

                        <p>
                            Out of 5 stars
                        </p>
                    </div>

                </article>


                <article className="admin-feedback-stat">

                    <div className="admin-feedback-stat-icon blue">
                        <PeopleAltRoundedIcon />
                    </div>


                    <div>
                        <span>
                            REVIEWERS
                        </span>

                        <strong>
                            {uniqueUsers}
                        </strong>

                        <p>
                            Unique users
                        </p>
                    </div>

                </article>


                <article className="admin-feedback-stat">

                    <div className="admin-feedback-stat-icon green">
                        <TrendingUpRoundedIcon />
                    </div>


                    <div>
                        <span>
                            POSITIVE
                        </span>

                        <strong>
                            {positivePercentage}%
                        </strong>

                        <p>
                            4–5 star ratings
                        </p>
                    </div>

                </article>

            </section>


            {/* =============================================
                MAIN CARD
               ============================================= */}

            <section className="admin-feedback-card">

                {/* TOOLBAR */}

                <div className="admin-feedback-toolbar">

                    <div>

                        <h2>
                            All feedback
                        </h2>


                        <p>
                            {filteredReviews.length}
                            {' '}
                            {filteredReviews.length ===
                            1
                                ? 'review'
                                : 'reviews'}
                        </p>

                    </div>


                    <div className="admin-feedback-toolbar-actions">

                        <div className="admin-feedback-search">

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
                                placeholder="Search feedback..."
                            />

                        </div>


                        <div className="admin-feedback-sort-mobile">

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

                                <option value="reviewDate-desc">
                                    Newest first
                                </option>

                                <option value="reviewDate-asc">
                                    Oldest first
                                </option>

                                <option value="rating-desc">
                                    Highest rating
                                </option>

                                <option value="rating-asc">
                                    Lowest rating
                                </option>

                                <option value="senderUserName-asc">
                                    User A–Z
                                </option>

                                <option value="senderUserName-desc">
                                    User Z–A
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="admin-feedback-state">

                        <div className="admin-feedback-loading-icon">
                            <ReviewsRoundedIcon />
                        </div>


                        <h3>
                            Loading feedback
                        </h3>


                        <p>
                            Getting the latest
                            reviews from TalkSpace...
                        </p>


                        <div className="admin-feedback-loading-bar">
                            <span />
                        </div>

                    </div>

                ) : error ? (

                    /* ERROR */

                    <div className="admin-feedback-state">

                        <div className="admin-feedback-state-icon error">
                            <ErrorOutlineRoundedIcon />
                        </div>


                        <h3>
                            Couldn't load feedback
                        </h3>


                        <p>
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={
                                fetchReviews
                            }
                        >
                            <RefreshRoundedIcon />

                            Try again
                        </button>

                    </div>

                ) : filteredReviews.length ===
                0 ? (

                    /* EMPTY */

                    <div className="admin-feedback-state">

                        <div className="admin-feedback-state-icon">
                            <InboxRoundedIcon />
                        </div>


                        <h3>
                            {searchTerm
                                ? 'No matching feedback'
                                : 'No feedback yet'}
                        </h3>


                        <p>
                            {searchTerm
                                ? 'Try another username or keyword.'
                                : 'User reviews will appear here when they are submitted.'}
                        </p>

                    </div>

                ) : (

                    <>
                        {/* DESKTOP TABLE */}

                        <div className="admin-feedback-table-wrapper">

                            <table className="admin-feedback-table">

                                <thead>
                                <tr>

                                    <th>
                                        {sortButton(
                                            'senderUserName',
                                            'User'
                                        )}
                                    </th>


                                    <th>
                                        Feedback
                                    </th>


                                    <th>
                                        {sortButton(
                                            'rating',
                                            'Rating'
                                        )}
                                    </th>


                                    <th>
                                        {sortButton(
                                            'reviewDate',
                                            'Date'
                                        )}
                                    </th>

                                </tr>
                                </thead>


                                <tbody>

                                {filteredReviews.map(
                                    review => (
                                        <tr
                                            key={
                                                review.id
                                            }
                                        >

                                            <td>

                                                <div className="admin-feedback-user">

                                                    <div className="admin-feedback-avatar">
                                                        {review.senderUserName
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase() ||
                                                            '?'}
                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {review.senderUserName}
                                                        </strong>


                                                        <span>
                                                                Reviewer
                                                            </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <p className="admin-feedback-message">
                                                    {review.message ||
                                                        'No message provided.'}
                                                </p>

                                            </td>


                                            <td>
                                                {renderRating(
                                                    review.rating
                                                )}
                                            </td>


                                            <td>

                                                <div className="admin-feedback-date">

                                                    <CalendarMonthRoundedIcon />

                                                    {formatDate(
                                                        review.reviewDate
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                                </tbody>

                            </table>

                        </div>


                        {/* MOBILE CARDS */}

                        <div className="admin-feedback-mobile-list">

                            {filteredReviews.map(
                                review => (
                                    <article
                                        key={
                                            review.id
                                        }
                                        className="admin-feedback-mobile-card"
                                    >

                                        <div className="admin-feedback-mobile-user">

                                            <div className="admin-feedback-avatar">
                                                {review.senderUserName
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase() ||
                                                    '?'}
                                            </div>


                                            <div>

                                                <strong>
                                                    {review.senderUserName}
                                                </strong>


                                                <span>
                                                    {formatDate(
                                                        review.reviewDate
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <p>
                                            {review.message ||
                                                'No message provided.'}
                                        </p>


                                        <div className="admin-feedback-mobile-footer">

                                            {renderRating(
                                                review.rating
                                            )}

                                        </div>

                                    </article>
                                )
                            )}

                        </div>

                    </>
                )}

            </section>

        </div>
    );
};

export default Feedbacks;