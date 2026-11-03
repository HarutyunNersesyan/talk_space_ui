import MatchInsight from '../features/network/MatchInsight';
import { MatchEvaluation, networkApi } from '../api/features';
import BlockButton from '../features/network/BlockButton';
import { useProfileVisibility } from '../features/network/useProfileVisibility';
import ConnectionButton from '../features/network/ConnectionButton';
import PresenceBadge from '../features/network/PresenceBadge';
import { featureError } from '../api/features';
import React, {
    useCallback,
    useEffect,
    useState,
    useRef
} from 'react';

import {
    useLocation,
    useNavigate
} from 'react-router-dom';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';

import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';

import defaultProfileImage from '../assets/default-profile-image.jpg';

import './SearchByHobbies.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface SearchUser {
    matching?: MatchEvaluation | null;
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


const SearchByHobbies: React.FC = () => {
    const initialized = useRef(false);
    const searching = useRef(false);
    const shownProfile = useRef<string | null>(null);
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
        isSearching,
        setIsSearching
    ] = useState<boolean>(true);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    useProfileVisibility(userProfile?.userName, () => {
        setUserProfile(null);
        setError('This profile is unavailable. Find another person to connect with.');
    });

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
       SEARCH
       ===================================================== */

    const handleSearchByHobbies =
        useCallback(
            async (
                username?: string
            ) => {
                const name =
                    username ||
                    currentUserName;


                if (!name || searching.current) {
                    return;
                }


                searching.current = true;
                setIsSearching(true);
                setError(null);


                try {
                    // Only an explicit "Find another" is a skip; loading a page is not.
                    if (!username && shownProfile.current) {
                        await networkApi.skipMatch(shownProfile.current, 'HOBBIES');
                        shownProfile.current = null;
                    }
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/searchByHobbies/${name}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (response.data) {
                        shownProfile.current = response.data.userName;
                        setUserProfile(
                            normalizeProfile(
                                response.data
                            )
                        );



                    } else {
                        setUserProfile(null);

                        setError(
                            'No available matches right now. Skipped profiles and recent requests have a temporary cooldown. Try again later or update your interests.'
                        );
                    }

                } catch (err: any) {

                    console.error(
                        'Search by hobbies error:',
                        err
                    );


                    setUserProfile(null);


                    if (
                        axios.isAxiosError(err)
                    ) {
                        if (err.response?.status === 429) {
                            setError(featureError(err));
                        } else if (
                            err.response?.status ===
                            404
                        ) {
                            setError(
                                'No available matches right now. Skipped profiles and recent requests have a temporary cooldown. Try again later or update your interests.'
                            );
                        } else {
                            setError(
                                typeof err.response?.data ===
                                'string'
                                    ? err.response.data
                                    : err.response?.data
                                        ?.message ||
                                    'Failed to search for people with similar hobbies.'
                            );
                        }

                    } else {
                        setError(
                            'An unexpected error occurred.'
                        );
                    }

                } finally {
                    searching.current = false;
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
        // A match GET records an impression, so StrictMode must not request it twice.
        if (initialized.current) return;
        initialized.current = true;
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
                        shownProfile.current = state.initialProfile.userName;
                        setUserProfile(
                            normalizeProfile(
                                state.initialProfile
                            )
                        );

                        setIsSearching(false);
                        // Consume the handoff so reloading cannot resurrect a skipped card.
                        navigate(location.pathname, { replace: true, state: null });

                    } else {
                        await handleSearchByHobbies(
                            username
                        );
                    }

                } catch (err) {

                    console.error(
                        'Failed to initialize hobby search:',
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
        let active = true;
        let imageUrl: string | null = null;
        const controller = new AbortController();
        setProfileImage(null);
        if (userProfile && token) {
            axios.get(`${API_BASE_URL}/public/user/image/${encodeURIComponent(userProfile.userName)}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
                signal: controller.signal
            }).then(response => {
                if (active && response.data?.size > 0) {
                    imageUrl = URL.createObjectURL(response.data);
                    setProfileImage(imageUrl);
                }
            }).catch(() => {
                if (active) setProfileImage(null);
            });
        }
        return () => {
            active = false;
            controller.abort();
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [userProfile, token]);


    /* =====================================================
       SOCIAL NETWORK
       ===================================================== */

    const getSocialIcon = (
        url: string
    ) => {
        const normalized =
            url.toLowerCase();


        if (
            normalized.includes(
                'facebook.com'
            )
        ) {
            return <FacebookRoundedIcon />;
        }


        if (
            normalized.includes(
                'instagram.com'
            )
        ) {
            return <InstagramIcon />;
        }


        if (
            normalized.includes(
                'linkedin.com'
            )
        ) {
            return <LinkedInIcon />;
        }


        if (
            normalized.includes(
                'youtube.com'
            )
        ) {
            return <YouTubeIcon />;
        }


        return <LanguageRoundedIcon />;
    };


    const getSocialLabel = (
        url: string
    ) => {
        const normalized =
            url.toLowerCase();


        if (
            normalized.includes(
                'facebook.com'
            )
        ) {
            return 'Facebook';
        }


        if (
            normalized.includes(
                'instagram.com'
            )
        ) {
            return 'Instagram';
        }


        if (
            normalized.includes(
                'linkedin.com'
            )
        ) {
            return 'LinkedIn';
        }


        if (
            normalized.includes(
                'youtube.com'
            )
        ) {
            return 'YouTube';
        }


        if (
            normalized.includes(
                'twitter.com'
            ) ||
            normalized.includes(
                'x.com'
            )
        ) {
            return 'X / Twitter';
        }


        return 'Social profile';
    };


    /* =====================================================
       FORMAT
       ===================================================== */

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
            <div className="hobby-discover-page">

                <div className="hobby-discover-loading">

                    <div className="hobby-discover-loading-icon">
                        <InterestsRoundedIcon />
                    </div>


                    <h2>
                        Finding someone for you
                    </h2>


                    <p>
                        Looking for people who share
                        similar hobbies...
                    </p>


                    <div className="hobby-discover-loading-bar">
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
        <div className="hobby-discover-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="hobby-discover-header">

                <div>

                    <button
                        type="button"
                        className="hobby-discover-back"
                        onClick={() =>
                            navigate('/choose')
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to discover
                    </button>


                    <span className="hobby-discover-label">
                        <InterestsRoundedIcon />

                        HOBBY MATCH
                    </span>


                    <h1>
                        Meet someone like you
                    </h1>


                    <p>
                        TalkSpace finds people whose
                        interests and hobbies are similar
                        to yours.
                    </p>

                </div>


                <button
                    type="button"
                    className="hobby-discover-next"
                    onClick={() =>
                        handleSearchByHobbies()
                    }
                    disabled={
                        isSearching ||
                        !currentUserName
                    }
                >

                    {isSearching ? (
                        <span className="hobby-discover-spinner" />
                    ) : (
                        <RefreshRoundedIcon />
                    )}


                    {isSearching
                        ? 'Searching...'
                        : 'Find another'}

                </button>

            </section>


            {/* =============================================
                ERROR / EMPTY
               ============================================= */}

            {!userProfile ? (

                <section className="hobby-discover-empty">

                    <div className="hobby-discover-empty-icon">
                        <InterestsRoundedIcon />
                    </div>


                    <h2>
                        No match found yet
                    </h2>


                    <p>
                        We couldn't find another profile
                        with matching hobbies right now.
                        You can try searching again.
                    </p>


                    {error && (
                        <div className="hobby-discover-error">

                            <ErrorOutlineRoundedIcon />

                            {error}

                        </div>
                    )}


                    <button
                        type="button"
                        onClick={() =>
                            handleSearchByHobbies()
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
                    {/* =====================================
                        PROFILE
                       ===================================== */}

                    <section className="hobby-match-card">

                        {/* IMAGE */}

                        <div className="hobby-match-image-column">

                            <div className="hobby-match-image-wrapper">

                                <img
                                    src={
                                        profileImage ||
                                        defaultProfileImage
                                    }
                                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                    className="hobby-match-image"
                                    onError={event => {
                                        event.currentTarget.src =
                                            defaultProfileImage;
                                    }}
                                />


                                <div className="hobby-match-image-overlay" />


                                <span className="hobby-match-badge">
                                    <AutoAwesomeRoundedIcon />

                                    Hobby match
                                </span>


                                <div className="hobby-match-mobile-name">

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


                        {/* INFO */}

                        <div className="hobby-match-info">

                            <div className="hobby-match-name">

                                <div>

                                    <span className="hobby-match-eyebrow">
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


                                

                            </div>


                            <PresenceBadge key={userProfile.userName} userName={userProfile.userName} />
                            <MatchInsight matching={userProfile.matching} />


                            {/* META */}

                            <div className="hobby-match-meta">

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

                            <div className="hobby-match-section">

                                <span className="hobby-match-section-label">
                                    ABOUT
                                </span>


                                <p className="hobby-match-about">
                                    {userProfile.about ||
                                        'This user has not added information about themselves yet.'}
                                </p>

                            </div>


                            {/* HOBBIES */}

                            <div className="hobby-match-section">

                                <div className="hobby-match-section-heading">

                                    <span className="hobby-match-section-label">
                                        HOBBIES
                                    </span>


                                    <InterestsRoundedIcon />

                                </div>


                                {userProfile.hobbies.length >
                                0 ? (
                                    <div className="hobby-match-tags">

                                        {userProfile.hobbies.map(
                                            (
                                                hobby,
                                                index
                                            ) => (
                                                <span
                                                    key={`${hobby}-${index}`}
                                                    className="hobby-match-tag primary"
                                                >
                                                    {hobby}
                                                </span>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="hobby-match-empty-text">
                                        No hobbies listed
                                    </p>
                                )}

                            </div>


                            {/* SPECIALITIES */}

                            <div className="hobby-match-section">

                                <div className="hobby-match-section-heading">

                                    <span className="hobby-match-section-label">
                                        SPECIALITIES
                                    </span>


                                    <WorkOutlineRoundedIcon />

                                </div>


                                {userProfile.specialities.length >
                                0 ? (
                                    <div className="hobby-match-tags">

                                        {userProfile.specialities.map(
                                            (
                                                speciality,
                                                index
                                            ) => (
                                                <span
                                                    key={`${speciality}-${index}`}
                                                    className="hobby-match-tag"
                                                >
                                                    {speciality}
                                                </span>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="hobby-match-empty-text">
                                        No specialities listed
                                    </p>
                                )}

                            </div>


                            {/* SOCIAL */}

                            <div className="hobby-match-section social">

                                <span className="hobby-match-section-label">
                                    SOCIAL NETWORKS
                                </span>


                                {userProfile.socialNetworks.length >
                                0 ? (
                                    <div className="hobby-match-socials">

                                        {userProfile.socialNetworks.map(
                                            (
                                                url,
                                                index
                                            ) => (
                                                <a
                                                    key={`${url}-${index}`}
                                                    href={
                                                        url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={
                                                        getSocialLabel(
                                                            url
                                                        )
                                                    }
                                                >
                                                    {getSocialIcon(
                                                        url
                                                    )}
                                                </a>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="hobby-match-empty-text">
                                        No social networks listed
                                    </p>
                                )}

                            </div>


                            {/* ACTIONS */}

                            <div className="hobby-match-actions">
                                <ConnectionButton key={userProfile.userName} userName={userProfile.userName} />
                                <BlockButton userName={userProfile.userName} />

                                


                                <button
                                    type="button"
                                    className="hobby-match-next-large"
                                    onClick={() =>
                                        handleSearchByHobbies()
                                    }
                                    disabled={
                                        isSearching
                                    }
                                >

                                    {isSearching ? (
                                        <span className="hobby-discover-spinner" />
                                    ) : (
                                        <RefreshRoundedIcon />
                                    )}


                                    Find another

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        ERROR
                       ===================================== */}

                    {error && (
                        <div className="hobby-discover-inline-error">

                            <ErrorOutlineRoundedIcon />

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* =====================================
                        TIP
                       ===================================== */}

                    <section className="hobby-discover-tip">

                        <div>
                            <PublicRoundedIcon />
                        </div>


                        <p>
                            <strong>
                                Discover through shared interests
                            </strong>

                            Matches are based on the
                            hobbies connected to your
                            TalkSpace profile. Add more
                            hobbies to improve your
                            discovery experience.
                        </p>

                    </section>
                </>

            )}

        </div>
    );
};

export default SearchByHobbies;