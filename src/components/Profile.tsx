import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import {
    jwtDecode
} from 'jwt-decode';


import EditRoundedIcon
    from '@mui/icons-material/EditRounded';

import InterestsRoundedIcon
    from '@mui/icons-material/InterestsRounded';

import WorkspacesRoundedIcon
    from '@mui/icons-material/WorkspacesRounded';

import PublicRoundedIcon
    from '@mui/icons-material/PublicRounded';

import PhotoCameraRoundedIcon
    from '@mui/icons-material/PhotoCameraRounded';

import LockRoundedIcon
    from '@mui/icons-material/LockRounded';

import DeleteOutlineRoundedIcon
    from '@mui/icons-material/DeleteOutlineRounded';

import LocationOnRoundedIcon
    from '@mui/icons-material/LocationOnRounded';

import ArrowForwardRoundedIcon
    from '@mui/icons-material/ArrowForwardRounded';

import CloseRoundedIcon
    from '@mui/icons-material/CloseRounded';

import SaveRoundedIcon
    from '@mui/icons-material/SaveRounded';

import PersonRoundedIcon
    from '@mui/icons-material/PersonRounded';


import LocationPicker
    from './LocationPicker';

import './Profile.css';


/* =========================================================
   API
   ========================================================= */

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


/* =========================================================
   TYPES
   ========================================================= */

interface DecodedToken {
    sub: string;
}


interface SearchUser {

    firstName: string;

    lastName: string;

    userName: string;

    email: string;

    age: number;

    gender: string;

    zodiac: string;

    about: string;

    hobbies: string[];

    specialities: string[];

    socialNetworks?: string[];
}


interface UserLocation {

    country: string;

    region: string;

    city: string;

    village: string;

    formattedAddress: string;

    latitude?: number;

    longitude?: number;
}


/* =========================================================
   COMPONENT
   ========================================================= */

const Profile: React.FC = () => {

    const navigate =
        useNavigate();


    const fileInputRef =
        useRef<HTMLInputElement>(null);


    const [
        userName,
        setUserName
    ] = useState<string>('');


    const [
        userInfo,
        setUserInfo
    ] = useState<SearchUser | null>(null);


    const [
        picture,
        setPicture
    ] = useState<string | null>(null);


    const [
        selectedFile,
        setSelectedFile
    ] = useState<File | null>(null);


    const [
        isImageModalOpen,
        setIsImageModalOpen
    ] = useState<boolean>(false);


    const [
        isUploading,
        setIsUploading
    ] = useState<boolean>(false);


    const [
        isDeletingImage,
        setIsDeletingImage
    ] = useState<boolean>(false);


    const [
        userLocation,
        setUserLocation
    ] = useState<UserLocation | null>(null);


    const [
        isSavingLocation,
        setIsSavingLocation
    ] = useState<boolean>(false);


    const [
        loading,
        setLoading
    ] = useState<boolean>(true);


    const [
        error,
        setError
    ] = useState<string>('');


    const token =
        localStorage.getItem('token');


    /* =====================================================
       LOAD PROFILE
       ===================================================== */

    useEffect(() => {

        const loadProfile =
            async () => {

                if (!token) {

                    setLoading(false);

                    return;
                }


                try {

                    setLoading(true);

                    setError('');


                    const decoded =
                        jwtDecode<DecodedToken>(
                            token
                        );


                    const email =
                        decoded.sub;


                    const nameResponse =
                        await axios.get<string>(
                            `${API_URL}/api/public/user/get/userName/${email}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const currentUserName =
                        nameResponse.data;


                    setUserName(
                        currentUserName
                    );


                    const profileResponse =
                        await axios.get<SearchUser>(
                            `${API_URL}/api/public/user/profile/${email}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setUserInfo(
                        profileResponse.data
                    );


                } catch (err) {

                    console.error(
                        'Failed to load profile:',
                        err
                    );


                    setError(
                        'Unable to load your profile.'
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadProfile();

    }, [token]);


    /* =====================================================
       LOAD PROFILE IMAGE
       ===================================================== */

    useEffect(() => {

        if (!userName || !token) {
            return;
        }


        let objectUrl: string | null = null;


        const loadImage =
            async () => {

                try {

                    const response =
                        await axios.get(
                            `${API_URL}/api/public/user/image/${userName}`,
                            {
                                responseType: 'blob',

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    objectUrl =
                        URL.createObjectURL(
                            response.data
                        );


                    setPicture(
                        objectUrl
                    );

                } catch {

                    setPicture(null);
                }
            };


        loadImage();


        return () => {

            if (objectUrl) {
                URL.revokeObjectURL(
                    objectUrl
                );
            }
        };

    }, [userName, token]);


    /* =====================================================
       LOAD LOCATION
       ===================================================== */

    useEffect(() => {

        if (!userName || !token) {
            return;
        }


        const loadLocation =
            async () => {

                try {

                    const response =
                        await axios.get<UserLocation>(
                            `${API_URL}/api/public/location/${userName}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setUserLocation(
                        response.data
                    );

                } catch {

                    setUserLocation(null);
                }
            };


        loadLocation();

    }, [userName, token]);


    /* =====================================================
       PROFILE IMAGE
       ===================================================== */

    const openFilePicker = () => {

        fileInputRef.current?.click();
    };


    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        setSelectedFile(file);


        const previewUrl =
            URL.createObjectURL(file);


        setPicture(
            previewUrl
        );


        setIsImageModalOpen(true);
    };


    const handleSavePicture =
        async () => {

            if (
                !selectedFile ||
                !userName ||
                !token
            ) {
                return;
            }


            try {

                setIsUploading(true);

                setError('');


                const formData =
                    new FormData();


                formData.append(
                    'file',
                    selectedFile
                );


                formData.append(
                    'userName',
                    userName
                );


                await axios.post(
                    `${API_URL}/api/public/user/image/upload`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setSelectedFile(null);

                setIsImageModalOpen(false);

                window.location.reload();


            } catch (err) {

                console.error(
                    'Image upload failed:',
                    err
                );


                setError(
                    'Unable to update your profile picture.'
                );

            } finally {

                setIsUploading(false);
            }
        };


    const handleDeletePicture =
        async () => {

            if (!userName || !token) {
                return;
            }


            try {

                setIsDeletingImage(true);

                setError('');


                await axios.delete(
                    `${API_URL}/api/public/user/image/delete/${userName}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setPicture(null);

                setSelectedFile(null);

                setIsImageModalOpen(false);


            } catch (err) {

                console.error(
                    'Image delete failed:',
                    err
                );


                setError(
                    'Unable to delete your profile picture.'
                );

            } finally {

                setIsDeletingImage(false);
            }
        };


    /* =====================================================
       LOCATION
       ===================================================== */

    const handleLocationSelect =
        async (
            location: {
                country: string;
                region: string;
                city: string;
                village: string;
                placeId: string;
                formattedAddress: string;
                lat: number;
                lng: number;
            }
        ) => {

            if (!userName || !token) {
                return;
            }


            try {

                setIsSavingLocation(true);

                setError('');


                await axios.post(
                    `${API_URL}/api/public/location/update/${userName}`,
                    {
                        country:
                        location.country,

                        region:
                        location.region,

                        city:
                        location.city,

                        village:
                        location.village,

                        placeId:
                        location.placeId,

                        formattedAddress:
                        location.formattedAddress,

                        latitude:
                        location.lat,

                        longitude:
                        location.lng
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setUserLocation({
                    country:
                    location.country,

                    region:
                    location.region,

                    city:
                    location.city,

                    village:
                    location.village,

                    formattedAddress:
                    location.formattedAddress,

                    latitude:
                    location.lat,

                    longitude:
                    location.lng
                });


            } catch (err) {

                console.error(
                    'Location update failed:',
                    err
                );


                setError(
                    'Unable to update your location.'
                );


                throw err;

            } finally {

                setIsSavingLocation(false);
            }
        };


    /* =====================================================
       FORMAT LOCATION
       ===================================================== */

    const getLocationText = () => {

        if (!userLocation) {
            return 'Location not added';
        }


        const parts = [

            userLocation.country,

            userLocation.region,

            userLocation.city,

            userLocation.village

        ].filter(Boolean);


        return parts.length > 0
            ? parts.join(', ')
            : 'Location not added';
    };


    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {

        return (

            <div className="profile-loading">

                <div className="profile-loader" />

                <p>
                    Loading your profile...
                </p>

            </div>
        );
    }


    /* =====================================================
       UI
       ===================================================== */

    return (

        <div className="profile-page">

            <div className="profile-page-inner">


                {/* =========================================
                    HEADER
                    ========================================= */}

                <section className="profile-header-card">

                    <div className="profile-header-main">

                        <div className="profile-avatar-wrapper">

                            <button
                                type="button"
                                className="profile-avatar"
                                onClick={() => {
                                    if (picture) {
                                        setIsImageModalOpen(
                                            true
                                        );
                                    }
                                }}
                            >

                                {picture ? (

                                    <img
                                        src={picture}
                                        alt="Profile"
                                    />

                                ) : (

                                    <PersonRoundedIcon />

                                )}

                            </button>


                            <button
                                type="button"
                                className="profile-camera-button"
                                onClick={openFilePicker}
                                aria-label="Change profile picture"
                            >

                                <PhotoCameraRoundedIcon />

                            </button>


                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleFileChange
                                }
                                hidden
                            />

                        </div>


                        <div className="profile-header-info">

                            <span className="profile-label">
                                MY PROFILE
                            </span>


                            <h1>

                                {userInfo?.firstName || ''}
                                {' '}
                                {userInfo?.lastName || ''}

                            </h1>


                            <p className="profile-username">

                                @{userName}

                            </p>


                            <div className="profile-location">

                                <LocationOnRoundedIcon />

                                <span>
                                    {getLocationText()}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* EDIT PROFILE */}

                    <button
                        type="button"
                        className="profile-main-edit-button"
                        onClick={() =>
                            navigate('/edit')
                        }
                    >

                        <EditRoundedIcon />

                        <span>
                            Edit Profile
                        </span>

                    </button>

                </section>


                {/* =========================================
                    ERROR
                    ========================================= */}

                {error && (

                    <div className="profile-error">

                        {error}

                    </div>

                )}


                {/* =========================================
                    PROFILE CONTENT
                    ========================================= */}

                <div className="profile-layout">


                    {/* LEFT */}

                    <div className="profile-main-column">


                        {/* ABOUT */}

                        <section className="profile-card">

                            <div className="profile-card-heading">

                                <div>

                                    <span>
                                        ABOUT
                                    </span>

                                    <h2>
                                        About me
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="profile-small-edit"
                                    onClick={() =>
                                        navigate('/edit')
                                    }
                                >

                                    <EditRoundedIcon />

                                    Edit

                                </button>

                            </div>


                            <p className="profile-about-text">

                                {userInfo?.about ||
                                    'Tell people a little about yourself.'}

                            </p>

                        </section>


                        {/* DETAILS */}

                        <section className="profile-card">

                            <div className="profile-card-heading">

                                <div>

                                    <span>
                                        DETAILS
                                    </span>

                                    <h2>
                                        Personal information
                                    </h2>

                                </div>

                            </div>


                            <div className="profile-details-grid">

                                <div className="profile-detail-item">

                                    <span>
                                        Age
                                    </span>

                                    <strong>
                                        {userInfo?.age || '—'}
                                    </strong>

                                </div>


                                <div className="profile-detail-item">

                                    <span>
                                        Gender
                                    </span>

                                    <strong>
                                        {userInfo?.gender || '—'}
                                    </strong>

                                </div>


                                <div className="profile-detail-item">

                                    <span>
                                        Zodiac
                                    </span>

                                    <strong>
                                        {userInfo?.zodiac || '—'}
                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* HOBBIES */}

                        <section className="profile-card">

                            <div className="profile-card-heading">

                                <div>

                                    <span>
                                        INTERESTS
                                    </span>

                                    <h2>
                                        Hobbies
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="profile-small-edit"
                                    onClick={() =>
                                        navigate('/hobbies')
                                    }
                                >

                                    <EditRoundedIcon />

                                    Edit

                                </button>

                            </div>


                            <div className="profile-tags">

                                {userInfo?.hobbies &&
                                userInfo.hobbies.length > 0 ? (

                                    userInfo.hobbies.map(
                                        hobby => (

                                            <span
                                                key={hobby}
                                                className="profile-tag"
                                            >
                                                {hobby}
                                            </span>

                                        )
                                    )

                                ) : (

                                    <p className="profile-empty-text">

                                        You haven't added
                                        any hobbies yet.

                                    </p>

                                )}

                            </div>

                        </section>


                        {/* SPECIALITIES */}

                        <section className="profile-card">

                            <div className="profile-card-heading">

                                <div>

                                    <span>
                                        PROFESSIONAL
                                    </span>

                                    <h2>
                                        Specialities
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="profile-small-edit"
                                    onClick={() =>
                                        navigate('/specialities')
                                    }
                                >

                                    <EditRoundedIcon />

                                    Edit

                                </button>

                            </div>


                            <div className="profile-tags">

                                {userInfo?.specialities &&
                                userInfo.specialities.length > 0 ? (

                                    userInfo.specialities.map(
                                        speciality => (

                                            <span
                                                key={speciality}
                                                className="profile-tag speciality"
                                            >
                                                {speciality}
                                            </span>

                                        )
                                    )

                                ) : (

                                    <p className="profile-empty-text">

                                        You haven't added
                                        any specialities yet.

                                    </p>

                                )}

                            </div>

                        </section>


                        {/* SOCIAL */}

                        <section className="profile-card">

                            <div className="profile-card-heading">

                                <div>

                                    <span>
                                        CONTACT
                                    </span>

                                    <h2>
                                        Social Networks
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    className="profile-small-edit"
                                    onClick={() =>
                                        navigate(
                                            '/social-networks'
                                        )
                                    }
                                >

                                    <EditRoundedIcon />

                                    Edit

                                </button>

                            </div>


                            {userInfo?.socialNetworks &&
                            userInfo.socialNetworks.length > 0 ? (

                                <div className="profile-social-list">

                                    {userInfo.socialNetworks.map(
                                        (
                                            social,
                                            index
                                        ) => (

                                            <a
                                                key={`${social}-${index}`}
                                                href={social}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="profile-social-link"
                                            >

                                                <PublicRoundedIcon />

                                                <span>
                                                    {social}
                                                </span>

                                            </a>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p className="profile-empty-text">

                                    You haven't added any
                                    social networks yet.

                                </p>

                            )}

                        </section>


                        {/* LOCATION */}

                        {userName && (

                            <section className="profile-card">

                                <div className="profile-card-heading">

                                    <div>

                                        <span>
                                            LOCATION
                                        </span>

                                        <h2>
                                            Your location
                                        </h2>

                                    </div>

                                </div>


                                <LocationPicker
                                    userName={userName}
                                    initialLocation={
                                        userLocation
                                            ? {
                                                country:
                                                userLocation.country,

                                                region:
                                                userLocation.region,

                                                city:
                                                userLocation.city,

                                                village:
                                                userLocation.village,

                                                formattedAddress:
                                                userLocation.formattedAddress,

                                                lat:
                                                userLocation.latitude,

                                                lng:
                                                userLocation.longitude
                                            }
                                            : undefined
                                    }
                                    onLocationSelect={
                                        handleLocationSelect
                                    }
                                />


                                {isSavingLocation && (

                                    <p className="profile-saving-text">
                                        Saving location...
                                    </p>

                                )}

                            </section>

                        )}

                    </div>


                    {/* =====================================
                        RIGHT — PROFILE SETTINGS
                        ===================================== */}

                    <aside className="profile-side-column">

                        <section className="profile-actions-card">

                            <div className="profile-actions-heading">

                                <span>
                                    PROFILE SETTINGS
                                </span>

                                <h2>
                                    Manage profile
                                </h2>

                                <p>
                                    Complete your profile
                                    to get better matches.
                                </p>

                            </div>


                            {/* EDIT PROFILE */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={() =>
                                    navigate('/edit')
                                }
                            >

                                <span className="profile-action-icon">

                                    <EditRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Edit Profile
                                    </strong>

                                    <small>
                                        Update your personal information
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>


                            {/* HOBBIES */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={() =>
                                    navigate('/hobbies')
                                }
                            >

                                <span className="profile-action-icon">

                                    <InterestsRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Hobbies
                                    </strong>

                                    <small>
                                        Add or change your interests
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>


                            {/* SPECIALITIES */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={() =>
                                    navigate('/specialities')
                                }
                            >

                                <span className="profile-action-icon">

                                    <WorkspacesRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Specialities
                                    </strong>

                                    <small>
                                        Manage your professional skills
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>


                            {/* SOCIAL NETWORKS */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={() =>
                                    navigate(
                                        '/social-networks'
                                    )
                                }
                            >

                                <span className="profile-action-icon">

                                    <PublicRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Social Networks
                                    </strong>

                                    <small>
                                        Add your social profiles
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>


                            {/* PROFILE IMAGE */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={openFilePicker}
                            >

                                <span className="profile-action-icon">

                                    <PhotoCameraRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Profile Picture
                                    </strong>

                                    <small>
                                        Change your profile photo
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>


                            {/* PASSWORD */}

                            <button
                                type="button"
                                className="profile-action-button"
                                onClick={() =>
                                    navigate(
                                        '/changePassword'
                                    )
                                }
                            >

                                <span className="profile-action-icon">

                                    <LockRoundedIcon />

                                </span>


                                <span className="profile-action-text">

                                    <strong>
                                        Change Password
                                    </strong>

                                    <small>
                                        Update your account password
                                    </small>

                                </span>


                                <ArrowForwardRoundedIcon />

                            </button>

                        </section>


                        {/* DANGER ZONE */}

                        <section className="profile-danger-card">

                            <span>
                                ACCOUNT
                            </span>

                            <h3>
                                Danger zone
                            </h3>

                            <p>
                                Permanently remove your
                                TalkSpace account.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/delete')
                                }
                            >

                                <DeleteOutlineRoundedIcon />

                                Delete Account

                            </button>

                        </section>

                    </aside>

                </div>

            </div>


            {/* =================================================
                IMAGE MODAL
                ================================================= */}

            {isImageModalOpen && picture && (

                <div
                    className="profile-image-modal"
                    onClick={() =>
                        setIsImageModalOpen(false)
                    }
                >

                    <div
                        className="profile-image-modal-content"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="profile-modal-close"
                            onClick={() =>
                                setIsImageModalOpen(false)
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <img
                            src={picture}
                            alt="Profile preview"
                        />


                        <div className="profile-modal-actions">

                            {selectedFile && (

                                <button
                                    type="button"
                                    className="profile-modal-save"
                                    onClick={
                                        handleSavePicture
                                    }
                                    disabled={
                                        isUploading
                                    }
                                >

                                    <SaveRoundedIcon />

                                    {isUploading
                                        ? 'Saving...'
                                        : 'Save Photo'
                                    }

                                </button>

                            )}


                            <button
                                type="button"
                                className="profile-modal-delete"
                                onClick={
                                    handleDeletePicture
                                }
                                disabled={
                                    isDeletingImage
                                }
                            >

                                <DeleteOutlineRoundedIcon />

                                {isDeletingImage
                                    ? 'Deleting...'
                                    : 'Delete Photo'
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Profile;