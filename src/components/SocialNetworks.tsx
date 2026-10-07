import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFacebook,
    faInstagram,
    faXTwitter,
    faLinkedin,
    faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import './SocialNetworks.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface SocialNetwork {
    platform: string;
    url: string;
}


interface SocialNetworksDto {
    userName: string;
    socialNetworks: SocialNetwork[];
}


interface PlatformData {
    platform: string;
    label: string;
    description: string;
    placeholder: string;
    icon: IconDefinition;
}


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const validPlatforms: PlatformData[] = [
    {
        platform: 'FACEBOOK',
        label: 'Facebook',
        description: 'Connect your Facebook profile',
        placeholder: 'https://facebook.com/username',
        icon: faFacebook
    },
    {
        platform: 'INSTAGRAM',
        label: 'Instagram',
        description: 'Share your Instagram profile',
        placeholder: 'https://instagram.com/username',
        icon: faInstagram
    },
    {
        platform: 'X',
        label: 'X',
        description: 'Connect your X profile',
        placeholder: 'https://x.com/username',
        icon: faXTwitter
    },
    {
        platform: 'LINKEDIN',
        label: 'LinkedIn',
        description: 'Add your professional profile',
        placeholder: 'https://linkedin.com/in/username',
        icon: faLinkedin
    },
    {
        platform: 'YOUTUBE',
        label: 'YouTube',
        description: 'Share your YouTube channel',
        placeholder: 'https://youtube.com/@channel',
        icon: faYoutube
    }
];


const SocialNetworks: React.FC = () => {
    const navigate = useNavigate();

    const token =
        localStorage.getItem('token');


    const [
        socialNetworks,
        setSocialNetworks
    ] = useState<SocialNetwork[]>([]);

    const [
        loading,
        setLoading
    ] = useState<boolean>(true);

    const [
        saving,
        setSaving
    ] = useState<boolean>(false);

    const [
        error,
        setError
    ] = useState<string | null>(null);

    const [
        userName,
        setUserName
    ] = useState<string | null>(null);

    const [
        selectedPlatform,
        setSelectedPlatform
    ] = useState<string>('');

    const [
        newUrl,
        setNewUrl
    ] = useState<string>('');

    const [
        notification,
        setNotification
    ] = useState<NotificationState | null>(
        null
    );


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    const showNotification = (
        message: string,
        type: 'success' | 'error'
    ) => {
        setNotification({
            message,
            type
        });


        window.setTimeout(() => {
            setNotification(null);
        }, 4000);
    };


    /* =====================================================
       FETCH USERNAME
       ===================================================== */

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (!token) {
                    showNotification(
                        'User not logged in.',
                        'error'
                    );

                    setLoading(false);

                    return;
                }


                const decodedToken =
                    jwtDecode<{
                        sub: string;
                    }>(token);


                const email =
                    decodedToken.sub;


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


                setUserName(
                    response.data
                );

            } catch (err) {

                console.error(
                    'Error fetching userName:',
                    err
                );


                setLoading(false);


                showNotification(
                    'Failed to fetch user name. Please try again later.',
                    'error'
                );
            }
        };


        fetchUserName();

    }, [token]);


    /* =====================================================
       FETCH SOCIAL NETWORKS
       ===================================================== */

    useEffect(() => {
        const fetchSocialNetworks =
            async () => {
                try {
                    if (!userName) {
                        return;
                    }


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/socialNetworks/${userName}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setSocialNetworks(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );


                    setLoading(false);

                } catch (err) {

                    console.error(
                        'Error fetching social networks:',
                        err
                    );


                    setError(
                        'Failed to fetch social networks. Please try again later.'
                    );


                    setLoading(false);
                }
            };


        fetchSocialNetworks();

    }, [
        userName,
        token
    ]);


    /* =====================================================
       CURRENT PLATFORM
       ===================================================== */

    const selectedPlatformData =
        useMemo(() => {
            return validPlatforms.find(
                platform =>
                    platform.platform ===
                    selectedPlatform
            );
        }, [selectedPlatform]);


    const selectedExistingNetwork =
        useMemo(() => {
            return socialNetworks.find(
                network =>
                    network.platform ===
                    selectedPlatform
            );
        }, [
            socialNetworks,
            selectedPlatform
        ]);


    /* =====================================================
       SELECT PLATFORM
       ===================================================== */

    const handlePlatformClick = (
        platform: string
    ) => {
        const existingNetwork =
            socialNetworks.find(
                network =>
                    network.platform ===
                    platform
            );


        setSelectedPlatform(
            platform
        );


        setNewUrl(
            existingNetwork?.url || ''
        );
    };


    const handleClearSelection = () => {
        setSelectedPlatform('');
        setNewUrl('');
    };


    /* =====================================================
       VALIDATE URL
       ===================================================== */

    const isValidUrl = (
        value: string
    ): boolean => {
        try {
            const url =
                new URL(value);


            return (
                url.protocol === 'http:' ||
                url.protocol === 'https:'
            );

        } catch {

            return false;

        }
    };


    /* =====================================================
       SAVE / UPDATE
       ===================================================== */

    const handleUpdateSocialNetworks =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();


            if (
                !userName ||
                !selectedPlatform ||
                !newUrl.trim()
            ) {
                showNotification(
                    'Please select a platform and provide a valid URL.',
                    'error'
                );

                return;
            }


            if (
                !isValidUrl(
                    newUrl.trim()
                )
            ) {
                showNotification(
                    'Please enter a valid URL starting with http:// or https://.',
                    'error'
                );

                return;
            }


            try {
                setSaving(true);


                const existingNetworkIndex =
                    socialNetworks.findIndex(
                        network =>
                            network.platform ===
                            selectedPlatform
                    );


                let updatedSocialNetworks:
                    SocialNetwork[];


                if (
                    existingNetworkIndex !== -1
                ) {
                    updatedSocialNetworks =
                        socialNetworks.map(
                            (
                                network,
                                index
                            ) =>
                                index ===
                                existingNetworkIndex
                                    ? {
                                        ...network,
                                        url:
                                            newUrl.trim()
                                    }
                                    : network
                        );

                } else {

                    updatedSocialNetworks = [
                        ...socialNetworks,
                        {
                            platform:
                            selectedPlatform,

                            url:
                                newUrl.trim()
                        }
                    ];

                }


                const socialNetworksDto:
                    SocialNetworksDto = {
                    userName,

                    socialNetworks:
                        updatedSocialNetworks.map(
                            network => ({
                                platform:
                                network.platform,

                                url:
                                network.url
                            })
                        )
                };


                await axios.put(
                    `${API_BASE_URL}/public/user/update/socialNetworks`,
                    socialNetworksDto,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setSocialNetworks(
                    updatedSocialNetworks
                );


                setSelectedPlatform('');
                setNewUrl('');


                showNotification(
                    'Social networks updated successfully!',
                    'success'
                );

            } catch (err) {

                console.error(
                    'Error updating social networks:',
                    err
                );


                if (
                    axios.isAxiosError(err)
                ) {
                    showNotification(
                        err.response?.data?.message ||
                        'Unable to update social network.',
                        'error'
                    );
                } else {
                    showNotification(
                        'Unable to update social network.',
                        'error'
                    );
                }

            } finally {

                setSaving(false);

            }
        };


    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="social-page-loading">

                <div className="social-loading-heading" />

                <div className="social-loading-grid">

                    {[1, 2, 3, 4, 5].map(
                        item => (
                            <div
                                key={item}
                                className="social-loading-card"
                            />
                        )
                    )}

                </div>


                <div className="social-loading-form" />

            </div>
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    if (error) {
        return (
            <div className="social-state-page">

                <div className="social-state-icon">
                    <ErrorRoundedIcon />
                </div>


                <h2>
                    Unable to load social networks
                </h2>


                <p>
                    {error}
                </p>


                <button
                    type="button"
                    onClick={() =>
                        navigate('/profile')
                    }
                >
                    <ArrowBackRoundedIcon />

                    Back to profile
                </button>

            </div>
        );
    }


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="social-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="social-page-header">

                <div>

                    <button
                        type="button"
                        className="social-back-link"
                        onClick={() =>
                            navigate('/profile')
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to profile
                    </button>


                    <span className="social-page-label">
                        <PublicRoundedIcon />

                        SOCIAL PROFILES
                    </span>


                    <h1>
                        Social networks
                    </h1>


                    <p>
                        Connect your social profiles
                        and make it easier for people
                        on TalkSpace to find you on
                        other platforms.
                    </p>

                </div>


                <div className="social-connected-summary">

                    <strong>
                        {socialNetworks.length}
                    </strong>

                    <span>
                        connected
                    </span>

                </div>

            </section>


            {/* =============================================
                SOCIAL NETWORK GRID
               ============================================= */}

            <section className="social-platform-section">

                <div className="social-section-heading">

                    <div>

                        <span>
                            YOUR NETWORKS
                        </span>


                        <h2>
                            Connected accounts
                        </h2>


                        <p>
                            Select a platform to add
                            or update its profile URL.
                        </p>

                    </div>

                </div>


                <div className="social-platform-grid">

                    {validPlatforms.map(
                        platformData => {

                            const network =
                                socialNetworks.find(
                                    network =>
                                        network.platform ===
                                        platformData.platform
                                );


                            const selected =
                                selectedPlatform ===
                                platformData.platform;


                            return (
                                <article
                                    key={
                                        platformData.platform
                                    }
                                    className={
                                        `social-platform-card social-platform-${platformData.platform.toLowerCase()} ${
                                            selected
                                                ? 'selected'
                                                : ''
                                        }`
                                    }
                                >

                                    <button
                                        type="button"
                                        className="social-platform-select"
                                        onClick={() =>
                                            handlePlatformClick(
                                                platformData.platform
                                            )
                                        }
                                    >

                                        <div className="social-platform-top">

                                            <div className="social-platform-icon">

                                                <FontAwesomeIcon
                                                    icon={
                                                        platformData.icon
                                                    }
                                                />

                                            </div>


                                            <div className="social-platform-status">

                                                {network ? (
                                                    <>
                                                        <CheckCircleRoundedIcon />

                                                        Connected
                                                    </>
                                                ) : (
                                                    <>
                                                        <AddRoundedIcon />

                                                        Add
                                                    </>
                                                )}

                                            </div>

                                        </div>


                                        <div className="social-platform-info">

                                            <strong>
                                                {
                                                    platformData.label
                                                }
                                            </strong>


                                            <span>
                                                {
                                                    platformData.description
                                                }
                                            </span>

                                        </div>


                                        {network ? (

                                            <div className="social-platform-link">

                                                <LinkRoundedIcon />

                                                <span>
                                                    {network.url}
                                                </span>

                                            </div>

                                        ) : (

                                            <div className="social-platform-empty">

                                                No profile linked yet

                                            </div>

                                        )}


                                        <div className="social-platform-action">

                                            <EditRoundedIcon />

                                            {network
                                                ? 'Edit profile'
                                                : 'Add profile'}

                                        </div>

                                    </button>


                                    {network && (
                                        <a
                                            className="social-open-link"
                                            href={
                                                network.url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={
                                                `Open ${platformData.label}`
                                            }
                                        >
                                            <OpenInNewRoundedIcon />
                                        </a>
                                    )}

                                </article>
                            );
                        }
                    )}

                </div>

            </section>


            {/* =============================================
                EDIT FORM
               ============================================= */}

            <section className="social-editor-card">

                <div className="social-editor-heading">

                    <div className="social-editor-icon">
                        <LinkRoundedIcon />
                    </div>


                    <div>

                        <span>
                            PROFILE LINK
                        </span>


                        <h2>
                            {selectedPlatformData
                                ? `${selectedExistingNetwork
                                    ? 'Update'
                                    : 'Add'} ${selectedPlatformData.label}`
                                : 'Add a social profile'}
                        </h2>


                        <p>
                            {selectedPlatformData
                                ? `Enter the URL of your ${selectedPlatformData.label} profile.`
                                : 'Choose one of the platforms above to continue.'}
                        </p>

                    </div>

                </div>


                <form
                    className="social-editor-form"
                    onSubmit={
                        handleUpdateSocialNetworks
                    }
                >

                    <div className="social-form-row">

                        <div className="social-form-field">

                            <label>
                                Platform
                            </label>


                            <div
                                className={
                                    `social-selected-platform ${
                                        selectedPlatform
                                            ? 'active'
                                            : ''
                                    }`
                                }
                            >

                                {selectedPlatformData ? (
                                    <>

                                        <FontAwesomeIcon
                                            icon={
                                                selectedPlatformData.icon
                                            }
                                        />


                                        <span>
                                            {
                                                selectedPlatformData.label
                                            }
                                        </span>

                                    </>
                                ) : (
                                    <span>
                                        No platform selected
                                    </span>
                                )}

                            </div>

                        </div>


                        <div className="social-form-field social-url-field">

                            <label htmlFor="socialUrl">
                                Profile URL
                            </label>


                            <div className="social-url-input">

                                <LinkRoundedIcon />


                                <input
                                    id="socialUrl"
                                    type="url"
                                    value={
                                        newUrl
                                    }
                                    onChange={event =>
                                        setNewUrl(
                                            event.target.value
                                        )
                                    }
                                    placeholder={
                                        selectedPlatformData
                                            ?.placeholder ||
                                        'https://example.com/profile'
                                    }
                                    disabled={
                                        !selectedPlatform
                                    }
                                    autoComplete="url"
                                />


                                {newUrl && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setNewUrl('')
                                        }
                                        aria-label="Clear URL"
                                    >
                                        <CloseRoundedIcon />
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="social-editor-footer">

                        <button
                            type="button"
                            className="social-editor-cancel"
                            onClick={
                                selectedPlatform
                                    ? handleClearSelection
                                    : () =>
                                        navigate(
                                            '/profile'
                                        )
                            }
                            disabled={
                                saving
                            }
                        >
                            {selectedPlatform
                                ? 'Cancel edit'
                                : 'Back'}
                        </button>


                        <button
                            type="submit"
                            className="social-editor-save"
                            disabled={
                                saving ||
                                !selectedPlatform ||
                                !newUrl.trim()
                            }
                        >

                            {saving ? (
                                <span className="social-spinner" />
                            ) : (
                                <SaveRoundedIcon />
                            )}


                            {saving
                                ? 'Saving...'
                                : selectedExistingNetwork
                                    ? 'Update profile'
                                    : 'Add profile'}

                        </button>

                    </div>

                </form>

            </section>


            {/* =============================================
                INFO
               ============================================= */}

            <section className="social-tip">

                <div>
                    <AutoAwesomeRoundedIcon />
                </div>


                <p>
                    <strong>
                        Make your profile easier to discover
                    </strong>

                    Add only the social profiles you
                    want to share. Connected links are
                    displayed as part of your TalkSpace
                    social information.
                </p>

            </section>


            {/* =============================================
                NOTIFICATION
               ============================================= */}

            {notification && (
                <div
                    className={
                        `social-notification ${notification.type}`
                    }
                >

                    <div className="social-notification-icon">

                        {notification.type ===
                        'success' ? (
                            <CheckCircleRoundedIcon />
                        ) : (
                            <ErrorRoundedIcon />
                        )}

                    </div>


                    <div>

                        <strong>
                            {notification.type ===
                            'success'
                                ? 'Updated'
                                : 'Something went wrong'}
                        </strong>


                        <span>
                            {notification.message}
                        </span>

                    </div>

                </div>
            )}

        </div>
    );
};

export default SocialNetworks;