import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

/* CATEGORY ICONS */

import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import PlumbingRoundedIcon from '@mui/icons-material/PlumbingRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import ChairRoundedIcon from '@mui/icons-material/ChairRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import AdsClickRoundedIcon from '@mui/icons-material/AdsClickRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import CoffeeRoundedIcon from '@mui/icons-material/CoffeeRounded';
import BakeryDiningRoundedIcon from '@mui/icons-material/BakeryDiningRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';

import './Specialities.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface Speciality {
    id: number;
    name: string;
    parentId: number | null;
    children?: Speciality[];
}


interface SpecialityRequest {
    id: number;
    name: string;
}


interface SpecialityDto {
    userName: string;
    specialities: SpecialityRequest[];
}


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const MAX_SPECIALITIES = 5;


/* =========================================================
   CATEGORY ICON
   ========================================================= */

const getSpecialityIcon = (
    specialityName: string
) => {
    const name =
        specialityName
            .trim()
            .toLowerCase();

    switch (name) {

        case 'software engineer':
            return <ComputerRoundedIcon />;

        case 'doctor':
            return <LocalHospitalRoundedIcon />;

        case 'teacher':
            return <SchoolRoundedIcon />;

        case 'nurse':
            return <MedicalServicesRoundedIcon />;

        case 'artist':
            return <PaletteRoundedIcon />;

        case 'writer':
            return <EditNoteRoundedIcon />;

        case 'photographer':
            return <PhotoCameraRoundedIcon />;

        case 'musician':
            return <MusicNoteRoundedIcon />;

        case 'chef':
            return <RestaurantRoundedIcon />;

        case 'architect':
            return <ArchitectureRoundedIcon />;

        case 'lawyer':
            return <GavelRoundedIcon />;

        case 'engineer':
            return <EngineeringRoundedIcon />;

        case 'scientist':
            return <ScienceRoundedIcon />;

        case 'sales manager':
            return <TrendingUpRoundedIcon />;

        case 'accountant':
            return <CalculateRoundedIcon />;

        case 'electrician':
            return <ElectricBoltRoundedIcon />;

        case 'plumber':
            return <PlumbingRoundedIcon />;

        case 'civil engineer':
            return <ConstructionRoundedIcon />;

        case 'web developer':
            return <WebRoundedIcon />;

        case 'graphic designer':
            return <BrushRoundedIcon />;

        case 'marketing manager':
            return <CampaignRoundedIcon />;

        case 'hr specialist':
            return <GroupsRoundedIcon />;

        case 'project manager':
            return <AssignmentRoundedIcon />;

        case 'dentist':
            return <MedicalServicesRoundedIcon />;

        case 'psychologist':
            return <PsychologyRoundedIcon />;

        case 'veterinarian':
            return <PetsRoundedIcon />;

        case 'social worker':
            return <VolunteerActivismRoundedIcon />;

        case 'data analyst':
            return <AnalyticsRoundedIcon />;

        case 'entrepreneur':
            return <RocketLaunchRoundedIcon />;

        case 'real estate agent':
            return <HomeWorkRoundedIcon />;

        case 'mechanic':
            return <BuildRoundedIcon />;

        case 'flight attendant':
            return <FlightRoundedIcon />;

        case 'tour guide':
            return <TravelExploreRoundedIcon />;

        case 'journalist':
            return <NewspaperRoundedIcon />;

        case 'event planner':
            return <CelebrationRoundedIcon />;

        case 'construction worker':
            return <ConstructionRoundedIcon />;

        case 'librarian':
            return <LocalLibraryRoundedIcon />;

        case 'fashion designer':
            return <CheckroomRoundedIcon />;

        case 'interior designer':
            return <ChairRoundedIcon />;

        case 'public relations specialist':
            return <RecordVoiceOverRoundedIcon />;

        case 'customer service representative':
            return <SupportAgentRoundedIcon />;

        case 'digital marketer':
            return <AdsClickRoundedIcon />;

        case 'seo specialist':
            return <ManageSearchRoundedIcon />;

        case 'business consultant':
            return <BusinessCenterRoundedIcon />;

        case 'content creator':
            return <VideoCameraFrontRoundedIcon />;

        case 'translator':
            return <TranslateRoundedIcon />;

        case 'fitness trainer':
            return <FitnessCenterRoundedIcon />;

        case 'hairdresser':
            return <ContentCutRoundedIcon />;

        case 'barista':
            return <CoffeeRoundedIcon />;

        case 'baker':
            return <BakeryDiningRoundedIcon />;

        case 'security guard':
            return <SecurityRoundedIcon />;

        case 'pharmacist':
            return <MedicationRoundedIcon />;

        default:
            return <WorkOutlineRoundedIcon />;
    }
};


const Specialities: React.FC = () => {

    const navigate = useNavigate();

    const token =
        localStorage.getItem('token');


    const [specialities, setSpecialities] =
        useState<Speciality[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [saving, setSaving] =
        useState<boolean>(false);

    const [error, setError] =
        useState<string | null>(null);

    const [
        expandedSpecialityId,
        setExpandedSpecialityId
    ] = useState<number | null>(null);

    const [
        selectedSpecialities,
        setSelectedSpecialities
    ] = useState<SpecialityRequest[]>([]);

    const [
        initialSelectedSpecialities,
        setInitialSelectedSpecialities
    ] = useState<SpecialityRequest[]>([]);

    const [userName, setUserName] =
        useState<string | null>(null);

    const [searchTerm, setSearchTerm] =
        useState<string>('');

    const [
        notification,
        setNotification
    ] =
        useState<NotificationState | null>(
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

        window.setTimeout(
            () => {
                setNotification(null);
            },
            3000
        );
    };


    /* =====================================================
       FETCH ALL SPECIALITIES
       ===================================================== */

    useEffect(() => {

        const fetchSpecialities =
            async () => {

                try {

                    if (!token) {

                        showNotification(
                            'User not logged in.',
                            'error'
                        );

                        setLoading(false);

                        return;
                    }


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/speciality`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const allSpecialities:
                        Speciality[] =
                        response.data;


                    const specialitiesWithChildren =
                        allSpecialities.map(
                            speciality => ({
                                ...speciality,

                                children:
                                    allSpecialities.filter(
                                        child =>
                                            child.parentId ===
                                            speciality.id
                                    )
                            })
                        );


                    const parentSpecialities =
                        specialitiesWithChildren.filter(
                            speciality =>
                                speciality.parentId ===
                                null
                        );


                    setSpecialities(
                        parentSpecialities
                    );

                } catch (err) {

                    console.error(
                        'Error fetching specialities:',
                        err
                    );


                    setError(
                        'Failed to fetch specialities. Please try again later.'
                    );

                } finally {

                    setLoading(false);
                }
            };


        fetchSpecialities();

    }, [token]);


    /* =====================================================
       FETCH USERNAME
       ===================================================== */

    useEffect(() => {

        const fetchUserName =
            async () => {

                try {

                    if (!token) {
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


                    showNotification(
                        'Failed to fetch user name. Please try again later.',
                        'error'
                    );
                }
            };


        fetchUserName();

    }, [token]);


    /* =====================================================
       FETCH SELECTED
       ===================================================== */

    useEffect(() => {

        const fetchSelectedSpecialities =
            async () => {

                try {

                    if (!userName) {
                        return;
                    }


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/get/specialities/${userName}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (
                        response.data &&
                        Array.isArray(
                            response.data
                        )
                    ) {

                        const selected:
                            SpecialityRequest[] =
                            response.data.map(
                                (
                                    speciality:
                                        Speciality
                                ) => ({
                                    id:
                                    speciality.id,

                                    name:
                                    speciality.name
                                })
                            );


                        setSelectedSpecialities(
                            selected
                        );


                        setInitialSelectedSpecialities(
                            selected
                        );
                    }

                } catch (err) {

                    console.error(
                        'Error fetching selected specialities:',
                        err
                    );


                    if (
                        axios.isAxiosError(
                            err
                        )
                    ) {

                        showNotification(
                            `Failed to fetch selected specialities: ${
                                err.response?.data?.message ||
                                err.message
                            }`,
                            'error'
                        );
                    }
                }
            };


        fetchSelectedSpecialities();

    }, [userName, token]);


    /* =====================================================
       SEARCH
       ===================================================== */

    const filteredSpecialities =
        useMemo(
            () => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (!search) {
                    return specialities;
                }


                return specialities
                    .map(parent => {

                        const parentMatches =
                            parent.name
                                .toLowerCase()
                                .includes(
                                    search
                                );


                        const matchingChildren =
                            parent.children?.filter(
                                child =>
                                    child.name
                                        .toLowerCase()
                                        .includes(
                                            search
                                        )
                            ) || [];


                        if (parentMatches) {
                            return parent;
                        }


                        if (
                            matchingChildren.length >
                            0
                        ) {

                            return {
                                ...parent,

                                children:
                                matchingChildren
                            };
                        }


                        return null;
                    })
                    .filter(
                        (
                            speciality
                        ): speciality is Speciality =>
                            speciality !== null
                    );
            },
            [
                specialities,
                searchTerm
            ]
        );


    /* =====================================================
       EXPAND
       ===================================================== */

    const handleSpecialityClick = (
        specialityId: number
    ) => {

        setExpandedSpecialityId(
            previous =>
                previous === specialityId
                    ? null
                    : specialityId
        );
    };


    /* =====================================================
       SELECT
       ===================================================== */

    const isSelected = (
        specialityId: number
    ) => {

        return selectedSpecialities.some(
            selected =>
                selected.id ===
                specialityId
        );
    };


    const handleSelectSpeciality = (
        speciality: Speciality
    ) => {

        const selectedSpeciality = {
            id: speciality.id,
            name: speciality.name
        };


        if (
            isSelected(
                speciality.id
            )
        ) {

            setSelectedSpecialities(
                previous =>
                    previous.filter(
                        selected =>
                            selected.id !==
                            speciality.id
                    )
            );

            return;
        }


        if (
            selectedSpecialities.length >=
            MAX_SPECIALITIES
        ) {

            showNotification(
                `You can select up to ${MAX_SPECIALITIES} specialities.`,
                'error'
            );

            return;
        }


        setSelectedSpecialities(
            previous => [
                ...previous,
                selectedSpeciality
            ]
        );
    };


    const handleDeleteSpeciality = (
        specialityId: number
    ) => {

        setSelectedSpecialities(
            previous =>
                previous.filter(
                    speciality =>
                        speciality.id !==
                        specialityId
                )
        );
    };


    const handleClearSelections =
        () => {

            setSelectedSpecialities([]);
        };


    const handleResetChanges =
        () => {

            setSelectedSpecialities(
                [
                    ...initialSelectedSpecialities
                ]
            );
        };


    /* =====================================================
       CHANGES
       ===================================================== */

    const hasChanges =
        useMemo(
            () => {

                const current =
                    selectedSpecialities
                        .map(
                            item =>
                                item.id
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );


                const initial =
                    initialSelectedSpecialities
                        .map(
                            item =>
                                item.id
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );


                return (
                    JSON.stringify(
                        current
                    ) !==
                    JSON.stringify(
                        initial
                    )
                );
            },
            [
                selectedSpecialities,
                initialSelectedSpecialities
            ]
        );


    /* =====================================================
       SAVE
       ===================================================== */

    const handleSave =
        async () => {

            try {

                if (!userName) {

                    showNotification(
                        'User name not found. Please try again later.',
                        'error'
                    );

                    return;
                }


                setSaving(true);


                const specialityDto:
                    SpecialityDto = {

                    userName,

                    specialities:
                    selectedSpecialities
                };


                await axios.put(
                    `${API_BASE_URL}/public/user/update/speciality`,
                    specialityDto,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setInitialSelectedSpecialities(
                    [
                        ...selectedSpecialities
                    ]
                );


                showNotification(
                    'Specialities saved successfully!',
                    'success'
                );

            } catch (err) {

                console.error(
                    'Error saving specialities:',
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {

                    showNotification(
                        `Failed to save specialities: ${
                            err.response?.data?.message ||
                            err.message
                        }`,
                        'error'
                    );

                } else {

                    showNotification(
                        'Failed to save specialities.',
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
            <div className="specialities-page-loading">

                <div className="specialities-loading-title" />

                <div className="specialities-loading-selected" />

                <div className="specialities-loading-grid">

                    {[1, 2, 3, 4, 5, 6].map(
                        item => (

                            <div
                                key={item}
                                className="specialities-loading-card"
                            />
                        )
                    )}

                </div>

            </div>
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    if (error) {

        return (
            <div className="specialities-state-page">

                <div className="specialities-state-icon">

                    <ErrorRoundedIcon />

                </div>


                <h2>
                    Unable to load specialities
                </h2>


                <p>
                    {error}
                </p>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/profile'
                        )
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
        <div className="specialities-page">


            {/* HEADER */}

            <section className="specialities-page-header">

                <div>

                    <button
                        type="button"
                        className="specialities-back-link"
                        onClick={() =>
                            navigate(
                                '/profile'
                            )
                        }
                    >

                        <ArrowBackRoundedIcon />

                        Back to profile

                    </button>


                    <span className="specialities-page-label">

                        <WorkOutlineRoundedIcon />

                        PROFESSIONAL PROFILE

                    </span>


                    <h1>
                        Choose your specialities
                    </h1>


                    <p>
                        Add the professional fields
                        that best describe your skills,
                        education or areas of expertise.
                        You can select up to{' '}
                        {MAX_SPECIALITIES}.
                    </p>

                </div>


                <button
                    type="button"
                    className="specialities-header-save"
                    onClick={
                        handleSave
                    }
                    disabled={
                        saving ||
                        !hasChanges
                    }
                >

                    {saving ? (

                        <span className="specialities-spinner light" />

                    ) : (

                        <SaveRoundedIcon />

                    )}


                    {saving
                        ? 'Saving...'
                        : 'Save specialities'}

                </button>

            </section>


            {/* SELECTED */}

            <section className="specialities-selected-card">

                <div className="specialities-selected-heading">

                    <div className="specialities-section-title">

                        <div className="specialities-section-icon">

                            <WorkOutlineRoundedIcon />

                        </div>


                        <div>

                            <span>
                                SELECTED
                            </span>

                            <h2>
                                Your specialities
                            </h2>

                        </div>

                    </div>


                    <div className="specialities-selected-count">

                        <strong>
                            {
                                selectedSpecialities.length
                            }
                        </strong>

                        <span>
                            / {MAX_SPECIALITIES}
                        </span>

                    </div>

                </div>


                <div className="specialities-progress-track">

                    <div
                        className="specialities-progress-value"
                        style={{
                            width:
                                `${
                                    (
                                        selectedSpecialities.length /
                                        MAX_SPECIALITIES
                                    ) * 100
                                }%`
                        }}
                    />

                </div>


                {selectedSpecialities.length >
                0 ? (

                    <div className="specialities-selected-list">

                        {selectedSpecialities.map(
                            speciality => (

                                <div
                                    key={
                                        speciality.id
                                    }
                                    className="specialities-selected-item"
                                >

                                    <CheckRoundedIcon />


                                    <span>
                                        {
                                            speciality.name
                                        }
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteSpeciality(
                                                speciality.id
                                            )
                                        }
                                        aria-label={
                                            `Remove ${speciality.name}`
                                        }
                                    >

                                        <CloseRoundedIcon />

                                    </button>

                                </div>
                            )
                        )}

                    </div>

                ) : (

                    <div className="specialities-empty-selected">

                        <WorkOutlineRoundedIcon />


                        <div>

                            <strong>
                                No specialities selected
                            </strong>

                            <span>
                                Choose your professional
                                areas from the categories
                                below.
                            </span>

                        </div>

                    </div>
                )}


                <div className="specialities-selection-actions">

                    {selectedSpecialities.length >
                        0 && (

                            <button
                                type="button"
                                className="specialities-clear-button"
                                onClick={
                                    handleClearSelections
                                }
                            >

                                <DeleteSweepRoundedIcon />

                                Clear all

                            </button>
                        )}


                    {hasChanges && (

                        <button
                            type="button"
                            className="specialities-reset-button"
                            onClick={
                                handleResetChanges
                            }
                        >

                            Reset changes

                        </button>
                    )}

                </div>

            </section>


            {/* BROWSER */}

            <section className="specialities-browser-card">

                <div className="specialities-browser-header">

                    <div>

                        <span>
                            EXPLORE
                        </span>


                        <h2>
                            Browse specialities
                        </h2>


                        <p>
                            Open a category to find
                            professional fields that
                            match your experience and
                            interests.
                        </p>

                    </div>


                    <div className="specialities-search">

                        <SearchRoundedIcon />


                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={event =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search specialities..."
                        />


                        {searchTerm && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm('')
                                }
                                aria-label="Clear search"
                            >

                                <CloseRoundedIcon />

                            </button>
                        )}

                    </div>

                </div>


                {filteredSpecialities.length >
                0 ? (

                    <div className="specialities-category-grid">

                        {filteredSpecialities.map(
                            speciality => {

                                const expanded =
                                    expandedSpecialityId ===
                                    speciality.id ||
                                    searchTerm
                                        .trim()
                                        .length >
                                    0;


                                return (

                                    <article
                                        key={
                                            speciality.id
                                        }
                                        className={
                                            `specialities-category-card ${
                                                expanded
                                                    ? 'expanded'
                                                    : ''
                                            }`
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="specialities-category-header"
                                            onClick={() =>
                                                handleSpecialityClick(
                                                    speciality.id
                                                )
                                            }
                                        >

                                            <div className="specialities-category-main">

                                                <div className="specialities-category-icon">

                                                    {getSpecialityIcon(
                                                        speciality.name
                                                    )}

                                                </div>


                                                <div>

                                                    <strong>
                                                        {
                                                            speciality.name
                                                        }
                                                    </strong>


                                                    <span>

                                                        {
                                                            speciality
                                                                .children
                                                                ?.length ||
                                                            0
                                                        } options

                                                    </span>

                                                </div>

                                            </div>


                                            <ExpandMoreRoundedIcon
                                                className="specialities-expand-icon"
                                            />

                                        </button>


                                        {expanded &&
                                            speciality.children &&
                                            speciality.children.length >
                                            0 && (

                                                <div className="specialities-sub-list">

                                                    {speciality.children.map(
                                                        child => {

                                                            const selected =
                                                                isSelected(
                                                                    child.id
                                                                );


                                                            const disabled =
                                                                selectedSpecialities.length >=
                                                                MAX_SPECIALITIES &&
                                                                !selected;


                                                            return (

                                                                <button
                                                                    type="button"
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    className={
                                                                        `specialities-sub-item ${
                                                                            selected
                                                                                ? 'selected'
                                                                                : ''
                                                                        } ${
                                                                            disabled
                                                                                ? 'disabled'
                                                                                : ''
                                                                        }`
                                                                    }
                                                                    onClick={() =>
                                                                        handleSelectSpeciality(
                                                                            child
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                >

                                                                    <span className="specialities-sub-check">

                                                                        {selected && (

                                                                            <CheckRoundedIcon />

                                                                        )}

                                                                    </span>


                                                                    <span>
                                                                        {
                                                                            child.name
                                                                        }
                                                                    </span>

                                                                </button>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            )}

                                    </article>
                                );
                            }
                        )}

                    </div>

                ) : (

                    <div className="specialities-no-results">

                        <SearchRoundedIcon />

                        <strong>
                            No specialities found
                        </strong>

                        <span>
                            Try another search term.
                        </span>

                    </div>
                )}

            </section>


            {/* TIP */}

            <section className="specialities-tip">

                <div>
                    <AutoAwesomeRoundedIcon />
                </div>


                <p>

                    <strong>
                        Build a stronger professional profile
                    </strong>

                    Adding your areas of expertise
                    helps other TalkSpace users
                    understand your professional
                    background and discover people
                    with similar skills.

                </p>

            </section>


            {/* MOBILE ACTIONS */}

            <div className="specialities-mobile-actions">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/profile'
                        )
                    }
                >

                    Cancel

                </button>


                <button
                    type="button"
                    onClick={
                        handleSave
                    }
                    disabled={
                        saving ||
                        !hasChanges
                    }
                >

                    {saving ? (

                        <span className="specialities-spinner light" />

                    ) : (

                        <SaveRoundedIcon />

                    )}

                    Save

                </button>

            </div>


            {/* NOTIFICATION */}

            {notification && (

                <div
                    className={
                        `specialities-notification ${notification.type}`
                    }
                >

                    <div className="specialities-notification-icon">

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
                                ? 'Saved'
                                : 'Something went wrong'}

                        </strong>


                        <span>
                            {
                                notification.message
                            }
                        </span>

                    </div>

                </div>
            )}

        </div>
    );
};


export default Specialities;