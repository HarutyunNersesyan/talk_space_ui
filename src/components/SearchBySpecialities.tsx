import React, {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    useLocation,
    useNavigate
} from 'react-router-dom';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';

import defaultProfileImage from '../assets/default-profile-image.jpg';

import './SearchBySpecialities.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface SearchUser {
    firstName: string;
    lastName: string;
    userName: string;
    age: number;
    gender: string;
    zodiac: string;
    about: string;
    hobbies: string[];
    specialities: string[];
    socialNetworks: string[];
}


interface LocationState {
    initialProfile?: SearchUser;
}


const SearchBySpecialities: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const token =
        localStorage.getItem('token');


    const [
        userProfile,
        setUserProfile
    ] = useState<SearchUser | null>(null);


    const [
        currentUserName,
        setCurrentUserName
    ] = useState<string | null>(null);


    const [
        profileImage,
        setProfileImage
    ] = useState<string | null>(null);


    const [
        hasLiked,
        setHasLiked
    ] = useState<boolean>(false);


    const [
        isLiking,
        setIsLiking
    ] = useState<boolean>(false);


    const [
        isSearching,
        setIsSearching
    ] = useState<boolean>(true);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    /* =====================================================
       NORMALIZE PROFILE
       ===================================================== */

    const normalizeProfile = (
        data: any
    ): SearchUser => ({
        ...data,

        hobbies:
            Array.isArray(data?.hobbies)
                ? data.hobbies
                : [],

        specialities:
            Array.isArray(data?.specialities)
                ? data.specialities
                : [],

        socialNetworks:
            Array.isArray(data?.socialNetworks)
                ? data.socialNetworks
                : []
    });


    /* =====================================================
       SEARCH BY SPECIALITIES
       ===================================================== */

    const handleSearchBySpecialities =
        useCallback(
            async (
                username?: string
            ) => {
                const name =
                    username ||
                    currentUserName;


                if (!name) {
                    return;
                }


                setIsSearching(true);
                setError(null);


                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/searchBySpecialities/${name}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (response.data) {
                        setUserProfile(
                            normalizeProfile(
                                response.data
                            )
                        );

                        setHasLiked(false);

                    } else {
                        setUserProfile(null);

                        setError(
                            'No matching profiles found. Try again later.'
                        );
                    }

                } catch (err: any) {

                    console.error(
                        'Search by specialities error:',
                        err
                    );


                    setUserProfile(null);


                    if (
                        axios.isAxiosError(err)
                    ) {
                        if (
                            err.response?.status ===
                            404
                        ) {
                            setError(
                                'No matching profiles found. Try again later.'
                            );
                        } else {
                            setError(
                                typeof err.response?.data ===
                                'string'
                                    ? err.response.data
                                    : err.response?.data?.message ||
                                    'Failed to search for people with similar specialities.'
                            );
                        }

                    } else {
                        setError(
                            'An unexpected error occurred.'
                        );
                    }

                } finally {
                    setIsSearching(false);
                }
            },
            [
                currentUserName,
                token
            ]
        );


    /* =====================================================
       CURRENT USER
       ===================================================== */

    useEffect(() => {
        const initialize =
            async () => {
                if (!token) {
                    setError(
                        'User not authenticated.'
                    );

                    setIsSearching(false);

                    return;
                }


                try {
                    const decoded =
                        jwtDecode<{
                            sub: string;
                        }>(token);


                    const email =
                        decoded.sub;


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/get/userName/${email}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const username =
                        response.data;


                    setCurrentUserName(
                        username
                    );


                    const state =
                        location.state as
                            LocationState | null;


                    if (
                        state?.initialProfile
                    ) {
                        setUserProfile(
                            normalizeProfile(
                                state.initialProfile
                            )
                        );

                        setIsSearching(false);

                    } else {
                        await handleSearchBySpecialities(
                            username
                        );
                    }

                } catch (err) {

                    console.error(
                        'Failed to initialize speciality search:',
                        err
                    );


                    setError(
                        'Failed to authenticate user.'
                    );

                    setIsSearching(false);
                }
            };


        initialize();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /* =====================================================
       PROFILE IMAGE
       ===================================================== */

    useEffect(() => {
        let imageUrl:
            string | null = null;


        const fetchImage =
            async () => {
                if (
                    !userProfile ||
                    !token
                ) {
                    return;
                }


                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/image/${userProfile.userName}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                },

                                responseType:
                                    'blob'
                            }
                        );


                    if (
                        response.data?.size >
                        0
                    ) {
                        imageUrl =
                            URL.createObjectURL(
                                response.data
                            );


                        setProfileImage(
                            imageUrl
                        );

                    } else {
                        setProfileImage(null);
                    }

                } catch (err) {

                    console.log(
                        'No profile image:',
                        err
                    );


                    setProfileImage(null);
                }
            };


        fetchImage();


        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(
                    imageUrl
                );
            }
        };

    }, [
        userProfile,
        token
    ]);


    /* =====================================================
       CHECK LIKE
       ===================================================== */

    useEffect(() => {
        const checkIfLiked =
            async () => {
                if (
                    !userProfile ||
                    !currentUserName ||
                    !token
                ) {
                    return;
                }


                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/like/get`,
                            {
                                params: {
                                    liker:
                                    currentUserName,

                                    liked:
                                    userProfile.userName
                                },

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setHasLiked(
                        Boolean(
                            response.data
                        )
                    );

                } catch (err) {

                    console.error(
                        'Error checking like status:',
                        err
                    );


                    setHasLiked(false);
                }
            };


        checkIfLiked();

    }, [
        userProfile,
        currentUserName,
        token
    ]);


    /* =====================================================
       LIKE
       ===================================================== */

    const handleLike =
        async () => {
            if (
                !currentUserName ||
                !userProfile ||
                isLiking ||
                hasLiked
            ) {
                return;
            }


            setIsLiking(true);
            setError(null);


            try {
                await axios.post(
                    `${API_BASE_URL}/public/user/like`,
                    null,
                    {
                        params: {
                            liker:
                            currentUserName,

                            liked:
                            userProfile.userName
                        },

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setHasLiked(true);

            } catch (err: any) {

                console.error(
                    'Like error:',
                    err
                );


                if (
                    axios.isAxiosError(err) &&
                    err.response?.status ===
                    409
                ) {
                    setHasLiked(true);

                } else {
                    setError(
                        'Failed to send like.'
                    );
                }

            } finally {
                setIsLiking(false);
            }
        };


    /* =====================================================
       SOCIAL ICONS
       ===================================================== */

    const getSocialIcon = (
        url: string
    ) => {
        const value =
            url.toLowerCase();


        if (
            value.includes(
                'facebook.com'
            )
        ) {
            return <FacebookRoundedIcon />;
        }


        if (
            value.includes(
                'instagram.com'
            )
        ) {
            return <InstagramIcon />;
        }


        if (
            value.includes(
                'linkedin.com'
            )
        ) {
            return <LinkedInIcon />;
        }


        if (
            value.includes(
                'youtube.com'
            )
        ) {
            return <YouTubeIcon />;
        }


        return <LanguageRoundedIcon />;
    };


    const formatText = (
        value?: string
    ) => {
        if (!value) {
            return '';
        }


        return (
            value.charAt(0).toUpperCase() +
            value
                .slice(1)
                .toLowerCase()
        );
    };


    /* =====================================================
       LOADING
       ===================================================== */

    if (
        isSearching &&
        !userProfile
    ) {
        return (
            <div className="speciality-discover-page">

                <div className="speciality-loading">

                    <div className="speciality-loading-icon">
                        <WorkRoundedIcon />
                    </div>


                    <h2>
                        Finding a professional match
                    </h2>


                    <p>
                        Looking for people with
                        similar specialities...
                    </p>


                    <div className="speciality-loading-bar">
                        <span />
                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="speciality-discover-page">

            {/* HEADER */}

            <section className="speciality-header">

                <div>

                    <button
                        type="button"
                        className="speciality-back"
                        onClick={() =>
                            navigate('/choose')
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to discover
                    </button>


                    <span className="speciality-label">
                        <WorkRoundedIcon />

                        SPECIALITY MATCH
                    </span>


                    <h1>
                        Find people in your field
                    </h1>


                    <p>
                        Discover TalkSpace members
                        whose professional interests
                        and specialities are similar
                        to yours.
                    </p>

                </div>


                <button
                    type="button"
                    className="speciality-next"
                    onClick={() =>
                        handleSearchBySpecialities()
                    }
                    disabled={
                        isSearching ||
                        !currentUserName
                    }
                >

                    {isSearching ? (
                        <span className="speciality-spinner" />
                    ) : (
                        <RefreshRoundedIcon />
                    )}


                    {isSearching
                        ? 'Searching...'
                        : 'Find another'}

                </button>

            </section>


            {!userProfile ? (

                /* EMPTY */

                <section className="speciality-empty">

                    <div className="speciality-empty-icon">
                        <WorkRoundedIcon />
                    </div>


                    <h2>
                        No professional match yet
                    </h2>


                    <p>
                        We couldn't find another
                        profile with matching
                        specialities right now.
                    </p>


                    {error && (
                        <div className="speciality-error">

                            <ErrorOutlineRoundedIcon />

                            {error}

                        </div>
                    )}


                    <button
                        type="button"
                        onClick={() =>
                            handleSearchBySpecialities()
                        }
                        disabled={
                            isSearching ||
                            !currentUserName
                        }
                    >
                        <RefreshRoundedIcon />

                        Try again
                    </button>

                </section>

            ) : (

                <>
                    {/* PROFILE */}

                    <section className="speciality-match-card">

                        {/* IMAGE */}

                        <div className="speciality-image-column">

                            <div className="speciality-image-wrapper">

                                <img
                                    src={
                                        profileImage ||
                                        defaultProfileImage
                                    }
                                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                    className="speciality-profile-image"
                                    onError={event => {
                                        event.currentTarget.src =
                                            defaultProfileImage;
                                    }}
                                />


                                <div className="speciality-image-overlay" />


                                <span className="speciality-match-badge">
                                    <WorkRoundedIcon />

                                    Professional match
                                </span>


                                <div className="speciality-mobile-name">

                                    <h2>
                                        {userProfile.firstName}
                                        {' '}
                                        {userProfile.lastName}
                                    </h2>


                                    <span>
                                        @{userProfile.userName}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* INFORMATION */}

                        <div className="speciality-info">

                            <div className="speciality-name">

                                <div>

                                    <span className="speciality-eyebrow">
                                        DISCOVERED PROFILE
                                    </span>


                                    <h2>
                                        {userProfile.firstName}
                                        {' '}
                                        {userProfile.lastName}
                                    </h2>


                                    <p>
                                        @{userProfile.userName}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        `speciality-like ${
                                            hasLiked
                                                ? 'liked'
                                                : ''
                                        }`
                                    }
                                    onClick={
                                        handleLike
                                    }
                                    disabled={
                                        isLiking ||
                                        hasLiked
                                    }
                                >

                                    {isLiking ? (
                                        <span className="speciality-like-spinner" />
                                    ) : hasLiked ? (
                                        <FavoriteRoundedIcon />
                                    ) : (
                                        <FavoriteBorderRoundedIcon />
                                    )}

                                </button>

                            </div>


                            {/* META */}

                            <div className="speciality-meta">

                                <span>
                                    <CakeOutlinedIcon />

                                    {userProfile.age
                                        ? `${userProfile.age} years`
                                        : 'Age not specified'}
                                </span>


                                <span>
                                    <PersonRoundedIcon />

                                    {formatText(
                                            userProfile.gender
                                        ) ||
                                        'Not specified'}
                                </span>


                                {userProfile.zodiac && (
                                    <span>
                                        <AutoAwesomeRoundedIcon />

                                        {formatText(
                                            userProfile.zodiac
                                        )}
                                    </span>
                                )}

                            </div>


                            {/* ABOUT */}

                            <div className="speciality-section">

                                <span className="speciality-section-label">
                                    ABOUT
                                </span>


                                <p className="speciality-about">
                                    {userProfile.about ||
                                        'This user has not added information about themselves yet.'}
                                </p>

                            </div>


                            {/* SPECIALITIES */}

                            <div className="speciality-section">

                                <div className="speciality-section-heading">

                                    <span className="speciality-section-label">
                                        SPECIALITIES
                                    </span>


                                    <WorkRoundedIcon />

                                </div>


                                {userProfile.specialities.length >
                                0 ? (
                                    <div className="speciality-tags">

                                        {userProfile.specialities.map(
                                            (
                                                speciality,
                                                index
                                            ) => (
                                                <span
                                                    key={`${speciality}-${index}`}
                                                    className="speciality-tag primary"
                                                >
                                                    {speciality}
                                                </span>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="speciality-empty-text">
                                        No specialities listed
                                    </p>
                                )}

                            </div>


                            {/* HOBBIES */}

                            <div className="speciality-section">

                                <div className="speciality-section-heading">

                                    <span className="speciality-section-label">
                                        HOBBIES
                                    </span>


                                    <InterestsRoundedIcon />

                                </div>


                                {userProfile.hobbies.length >
                                0 ? (
                                    <div className="speciality-tags">

                                        {userProfile.hobbies.map(
                                            (
                                                hobby,
                                                index
                                            ) => (
                                                <span
                                                    key={`${hobby}-${index}`}
                                                    className="speciality-tag"
                                                >
                                                    {hobby}
                                                </span>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="speciality-empty-text">
                                        No hobbies listed
                                    </p>
                                )}

                            </div>


                            {/* SOCIAL */}

                            <div className="speciality-section social">

                                <span className="speciality-section-label">
                                    SOCIAL NETWORKS
                                </span>


                                {userProfile.socialNetworks.length >
                                0 ? (
                                    <div className="speciality-socials">

                                        {userProfile.socialNetworks.map(
                                            (
                                                url,
                                                index
                                            ) => (
                                                <a
                                                    key={`${url}-${index}`}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {getSocialIcon(
                                                        url
                                                    )}
                                                </a>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="speciality-empty-text">
                                        No social networks listed
                                    </p>
                                )}

                            </div>


                            {/* ACTIONS */}

                            <div className="speciality-actions">

                                <button
                                    type="button"
                                    className={
                                        `speciality-like-large ${
                                            hasLiked
                                                ? 'liked'
                                                : ''
                                        }`
                                    }
                                    onClick={
                                        handleLike
                                    }
                                    disabled={
                                        isLiking ||
                                        hasLiked
                                    }
                                >

                                    {isLiking ? (
                                        <span className="speciality-like-spinner" />
                                    ) : hasLiked ? (
                                        <FavoriteRoundedIcon />
                                    ) : (
                                        <FavoriteBorderRoundedIcon />
                                    )}


                                    {hasLiked
                                        ? 'Liked'
                                        : 'Like profile'}

                                </button>


                                <button
                                    type="button"
                                    className="speciality-next-large"
                                    onClick={() =>
                                        handleSearchBySpecialities()
                                    }
                                    disabled={
                                        isSearching
                                    }
                                >

                                    {isSearching ? (
                                        <span className="speciality-spinner" />
                                    ) : (
                                        <RefreshRoundedIcon />
                                    )}


                                    Find another

                                </button>

                            </div>

                        </div>

                    </section>


                    {error && (
                        <div className="speciality-inline-error">

                            <ErrorOutlineRoundedIcon />

                            {error}

                        </div>
                    )}


                    {/* TIP */}

                    <section className="speciality-tip">

                        <div>
                            <GroupsRoundedIcon />
                        </div>


                        <p>
                            <strong>
                                Connect through professional interests
                            </strong>

                            TalkSpace uses the
                            specialities added to your
                            profile to discover people
                            working or interested in
                            similar fields.
                        </p>

                    </section>

                </>

            )}

        </div>
    );
};

export default SearchBySpecialities;