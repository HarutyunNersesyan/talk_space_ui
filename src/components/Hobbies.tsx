import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

/* =========================
   COMMON ICONS
   ========================= */

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

/* =========================
   CATEGORY ICONS
   48 DIFFERENT ICONS
   ========================= */

import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';

import HikingRoundedIcon from '@mui/icons-material/HikingRounded';
import PoolRoundedIcon from '@mui/icons-material/PoolRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import ForestRoundedIcon from '@mui/icons-material/ForestRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';

import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import NightlifeRoundedIcon from '@mui/icons-material/NightlifeRounded';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';

import TelescopeRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import ParaglidingRoundedIcon from '@mui/icons-material/ParaglidingRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';

import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded';
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded';
import SportsMartialArtsRoundedIcon from '@mui/icons-material/SportsMartialArtsRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import SkateboardingRoundedIcon from '@mui/icons-material/SkateboardingRounded';

import KayakingRoundedIcon from '@mui/icons-material/KayakingRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TextureRoundedIcon from '@mui/icons-material/TextureRounded';
import LocalDrinkRoundedIcon from '@mui/icons-material/LocalDrinkRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';

import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';
import ParkRoundedIcon from '@mui/icons-material/ParkRounded';
import RadioRoundedIcon from '@mui/icons-material/RadioRounded';

import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import './Hobbies.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface Hobby {
    id: number;
    name: string;
    parentId: number | null;
    children?: Hobby[];
}


interface HobbyRequest {
    id: number;
    name: string;
}


interface HobbyDto {
    userName: string;
    hobbies: HobbyRequest[];
}


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const MAX_HOBBIES = 5;


/* =========================================================
   CATEGORY ICONS

   Every parent hobby category has its own icon.
   ========================================================= */

const getHobbyCategoryIcon = (
    categoryName: string
) => {

    const category =
        categoryName
            .trim()
            .toUpperCase();


    switch (category) {

        /* 01 */
        case 'WRITING_AND_LITER':
            return <MenuBookRoundedIcon />;

        /* 02 */
        case 'VISUAL_ARTS':
            return <PaletteRoundedIcon />;

        /* 03 */
        case 'CRAFTS':
            return <HandymanRoundedIcon />;

        /* 04 */
        case 'MUSIC':
            return <MusicNoteRoundedIcon />;

        /* 05 */
        case 'PERFORMING_ARTS':
            return <TheaterComedyRoundedIcon />;

        /* 06 */
        case 'ADVENTURE_SPORTS':
            return <HikingRoundedIcon />;

        /* 07 */
        case 'WATER_SPORTS':
            return <PoolRoundedIcon />;

        /* 08 */
        case 'WINTER_SPORTS':
            return <AcUnitRoundedIcon />;

        /* 09 */
        case 'LAND_SPORTS':
            return <SportsSoccerRoundedIcon />;

        /* 10 */
        case 'TARGET_SPORTS':
            return <TrackChangesRoundedIcon />;

        /* 11 */
        case 'GAMES_AND_COLLECTING':
            return <SportsEsportsRoundedIcon />;

        /* 12 */
        case 'NATURE_HOBBIES':
            return <ForestRoundedIcon />;

        /* 13 */
        case 'MISCELLANEOUS':
            return <CategoryRoundedIcon />;

        /* 14 */
        case 'TECH_HOBBIES':
            return <ComputerRoundedIcon />;

        /* 15 */
        case 'DIY_PROJECTS':
            return <ConstructionRoundedIcon />;

        /* 16 */
        case 'PHYSICAL_ACTIVITIES':
            return <FitnessCenterRoundedIcon />;

        /* 17 */
        case 'SCIENCE_ACTIVITIES':
            return <ScienceRoundedIcon />;

        /* 18 */
        case 'LANGUAGE_HOBBIES':
            return <TranslateRoundedIcon />;

        /* 19 */
        case 'AERIAL_ARTS':
            return <AirRoundedIcon />;

        /* 20 */
        case 'MINDFULNESS':
            return <SelfImprovementRoundedIcon />;

        /* 21 */
        case 'TRANSPORTATION':
            return <DirectionsCarRoundedIcon />;

        /* 22 */
        case 'FASHION':
            return <CheckroomRoundedIcon />;

        /* 23 */
        case 'HOME_ECONOMICS':
            return <HomeRoundedIcon />;

        /* 24 */
        case 'SOCIAL_DANCES':
            return <NightlifeRoundedIcon />;

        /* 25 */
        case 'HISTORY_REENACTMENT':
            return <HistoryEduRoundedIcon />;

        /* 26 */
        case 'ASTRONOMY_OBSERVATION':
            return <TelescopeRoundedIcon />;

        /* 27 */
        case 'PUZZLES':
            return <ExtensionRoundedIcon />;

        /* 28 */
        case 'EXTREME_SPORTS':
            return <ParaglidingRoundedIcon />;

        /* 29 */
        case 'COOKING_TECHNIQUES':
            return <RestaurantRoundedIcon />;

        /* 30 */
        case 'ANIMAL_CARE':
            return <PetsRoundedIcon />;

        /* 31 */
        case 'URBAN_EXPLORATION':
            return <LocationCityRoundedIcon />;

        /* 32 */
        case 'GREEN_TECH':
            return <EnergySavingsLeafRoundedIcon />;

        /* 33 */
        case 'MARTIAL_ARTS':
            return <SportsMartialArtsRoundedIcon />;

        /* 34 */
        case 'COLLECTIBLES':
            return <CollectionsBookmarkRoundedIcon />;

        /* 35 */
        case 'BOARD_SPORTS':
            return <SkateboardingRoundedIcon />;

        /* 36 */
        case 'WATER_ACTIVITIES':
            return <KayakingRoundedIcon />;

        /* 37 */
        case 'MIND_SPORTS':
            return <PsychologyRoundedIcon />;

        /* 38 */
        case 'FIBER_ARTS':
            return <TextureRoundedIcon />;

        /* 39 */
        case 'HOME_BREWING':
            return <LocalDrinkRoundedIcon />;

        /* 40 */
        case 'GEOCACHING':
            return <ExploreRoundedIcon />;

        /* 41 */
        case 'COSPLAY':
            return <FaceRetouchingNaturalRoundedIcon />;

        /* 42 */
        case 'VINTAGE_CARS':
            return <DirectionsCarFilledRoundedIcon />;

        /* 43 */
        case 'AQUARIUMS':
            return <WaterRoundedIcon />;

        /* 44 */
        case 'BONSAI':
            return <ParkRoundedIcon />;

        /* 45 */
        case 'AMATEUR_RADIO':
            return <RadioRoundedIcon />;

        /* 46 */
        case 'LOCK_PICKING':
            return <LockRoundedIcon />;

        /* 47 */
        case 'ESCAPOLOGY':
            return <MeetingRoomRoundedIcon />;

        /* 48 */
        case 'STARGAZING':
            return <StarRoundedIcon />;

        default:
            return <InterestsRoundedIcon />;
    }
};


const Hobbies: React.FC = () => {

    const navigate =
        useNavigate();


    const token =
        localStorage.getItem('token');


    const [hobbies, setHobbies] =
        useState<Hobby[]>([]);


    const [loading, setLoading] =
        useState<boolean>(true);


    const [saving, setSaving] =
        useState<boolean>(false);


    const [error, setError] =
        useState<string | null>(null);


    const [
        expandedHobbyId,
        setExpandedHobbyId
    ] = useState<number | null>(null);


    const [
        selectedHobbies,
        setSelectedHobbies
    ] = useState<HobbyRequest[]>([]);


    const [
        initialSelectedHobbies,
        setInitialSelectedHobbies
    ] = useState<HobbyRequest[]>([]);


    const [userName, setUserName] =
        useState<string | null>(null);


    const [
        notification,
        setNotification
    ] =
        useState<NotificationState | null>(
            null
        );


    const [
        searchTerm,
        setSearchTerm
    ] =
        useState<string>('');


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
       FETCH ALL HOBBIES
       ===================================================== */

    useEffect(() => {

        const fetchHobbies =
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
                            `${API_BASE_URL}/public/user/hobby`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const allHobbies:
                        Hobby[] =
                        response.data;


                    const hobbiesWithChildren =
                        allHobbies.map(
                            hobby => ({
                                ...hobby,

                                children:
                                    allHobbies.filter(
                                        child =>
                                            child.parentId ===
                                            hobby.id
                                    )
                            })
                        );


                    const parentHobbies =
                        hobbiesWithChildren.filter(
                            hobby =>
                                hobby.parentId ===
                                null
                        );


                    setHobbies(
                        parentHobbies
                    );

                } catch (err) {

                    console.error(
                        'Error fetching hobbies:',
                        err
                    );


                    setError(
                        'Failed to fetch hobbies. Please try again later.'
                    );

                } finally {

                    setLoading(false);
                }
            };


        fetchHobbies();

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
       FETCH USER SELECTED HOBBIES
       ===================================================== */

    useEffect(() => {

        const fetchSelectedHobbies =
            async () => {

                try {

                    if (!userName) {
                        return;
                    }


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/get/hobbies/${userName}`,
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
                            HobbyRequest[] =
                            response.data.map(
                                (
                                    hobby:
                                        Hobby
                                ) => ({
                                    id:
                                    hobby.id,

                                    name:
                                    hobby.name
                                })
                            );


                        setSelectedHobbies(
                            selected
                        );


                        setInitialSelectedHobbies(
                            selected
                        );
                    }

                } catch (err) {

                    console.error(
                        'Error fetching selected hobbies:',
                        err
                    );


                    if (
                        axios.isAxiosError(
                            err
                        )
                    ) {

                        showNotification(
                            `Failed to fetch selected hobbies: ${
                                err.response?.data?.message ||
                                err.message
                            }`,
                            'error'
                        );
                    }
                }
            };


        fetchSelectedHobbies();

    }, [userName, token]);


    /* =====================================================
       FILTER
       ===================================================== */

    const filteredHobbies =
        useMemo(
            () => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (!search) {
                    return hobbies;
                }


                return hobbies
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
                            hobby
                        ): hobby is Hobby =>
                            hobby !== null
                    );
            },
            [
                hobbies,
                searchTerm
            ]
        );


    /* =====================================================
       SELECTION
       ===================================================== */

    const handleHobbyClick = (
        hobbyId: number
    ) => {

        setExpandedHobbyId(
            previous =>
                previous === hobbyId
                    ? null
                    : hobbyId
        );
    };


    const isSelected = (
        hobbyId: number
    ) => {

        return selectedHobbies.some(
            selected =>
                selected.id === hobbyId
        );
    };


    const handleSelectHobby = (
        hobby: Hobby
    ) => {

        const selectedHobby = {
            id: hobby.id,
            name: hobby.name
        };


        if (
            isSelected(
                hobby.id
            )
        ) {

            setSelectedHobbies(
                previous =>
                    previous.filter(
                        selected =>
                            selected.id !==
                            hobby.id
                    )
            );

            return;
        }


        if (
            selectedHobbies.length >=
            MAX_HOBBIES
        ) {

            showNotification(
                `You can select up to ${MAX_HOBBIES} hobbies.`,
                'error'
            );

            return;
        }


        setSelectedHobbies(
            previous => [
                ...previous,
                selectedHobby
            ]
        );
    };


    const handleDeleteHobby = (
        hobbyId: number
    ) => {

        setSelectedHobbies(
            previous =>
                previous.filter(
                    hobby =>
                        hobby.id !==
                        hobbyId
                )
        );
    };


    const handleCancelSelections =
        () => {

            setSelectedHobbies([]);
        };


    const handleResetChanges =
        () => {

            setSelectedHobbies(
                [...initialSelectedHobbies]
            );
        };


    /* =====================================================
       CHANGED?
       ===================================================== */

    const hasChanges =
        useMemo(
            () => {

                const current =
                    selectedHobbies
                        .map(
                            hobby =>
                                hobby.id
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );


                const initial =
                    initialSelectedHobbies
                        .map(
                            hobby =>
                                hobby.id
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
                selectedHobbies,
                initialSelectedHobbies
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


                const hobbyDto:
                    HobbyDto = {

                    userName,

                    hobbies:
                    selectedHobbies
                };


                await axios.put(
                    `${API_BASE_URL}/public/user/update/hobby`,
                    hobbyDto,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                showNotification(
                    'Hobbies saved successfully!',
                    'success'
                );


                setInitialSelectedHobbies(
                    [...selectedHobbies]
                );

            } catch (err) {

                console.error(
                    'Error saving hobbies:',
                    err
                );


                if (
                    axios.isAxiosError(
                        err
                    )
                ) {

                    showNotification(
                        `Failed to save hobbies: ${
                            err.response?.data?.message ||
                            err.message
                        }`,
                        'error'
                    );

                } else {

                    showNotification(
                        'Failed to save hobbies.',
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
            <div className="hobbies-page-loading">

                <div className="hobbies-loading-title" />

                <div className="hobbies-loading-selected" />

                <div className="hobbies-loading-grid">

                    {[1, 2, 3, 4, 5, 6].map(
                        item => (

                            <div
                                key={item}
                                className="hobbies-loading-card"
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
            <div className="hobbies-state-page">

                <div className="hobbies-state-icon error">
                    <ErrorRoundedIcon />
                </div>


                <h2>
                    Unable to load hobbies
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
        <div className="hobbies-page">


            {/* ================= HEADER ================= */}

            <section className="hobbies-page-header">

                <div>

                    <button
                        type="button"
                        className="hobbies-back-link"
                        onClick={() =>
                            navigate(
                                '/profile'
                            )
                        }
                    >

                        <ArrowBackRoundedIcon />

                        Back to profile

                    </button>


                    <span className="hobbies-page-label">

                        <InterestsRoundedIcon />

                        YOUR INTERESTS

                    </span>


                    <h1>
                        Choose your hobbies
                    </h1>


                    <p>
                        Select the activities and topics
                        you enjoy. You can choose up to
                        {` ${MAX_HOBBIES} hobbies`}.
                    </p>

                </div>


                <button
                    type="button"
                    className="hobbies-header-save"
                    onClick={
                        handleSave
                    }
                    disabled={
                        saving ||
                        !hasChanges
                    }
                >

                    {saving ? (

                        <span className="hobbies-spinner light" />

                    ) : (

                        <SaveRoundedIcon />

                    )}


                    {saving
                        ? 'Saving...'
                        : 'Save hobbies'}

                </button>

            </section>


            {/* ================= SELECTED ================= */}

            <section className="hobbies-selected-card">

                <div className="hobbies-selected-heading">

                    <div className="hobbies-section-title">

                        <div className="hobbies-section-icon">

                            <InterestsRoundedIcon />

                        </div>


                        <div>

                            <span>
                                SELECTED
                            </span>

                            <h2>
                                Your hobbies
                            </h2>

                        </div>

                    </div>


                    <div className="hobbies-selected-count">

                        <strong>
                            {selectedHobbies.length}
                        </strong>

                        <span>
                            / {MAX_HOBBIES}
                        </span>

                    </div>

                </div>


                <div className="hobbies-progress-track">

                    <div
                        className="hobbies-progress-value"
                        style={{
                            width:
                                `${
                                    (
                                        selectedHobbies.length /
                                        MAX_HOBBIES
                                    ) * 100
                                }%`
                        }}
                    />

                </div>


                {selectedHobbies.length > 0 ? (

                    <div className="hobbies-selected-list">

                        {selectedHobbies.map(
                            hobby => (

                                <div
                                    key={
                                        hobby.id
                                    }
                                    className="hobbies-selected-item"
                                >

                                    <CheckRoundedIcon />


                                    <span>
                                        {hobby.name}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteHobby(
                                                hobby.id
                                            )
                                        }
                                        aria-label={
                                            `Remove ${hobby.name}`
                                        }
                                    >

                                        <CloseRoundedIcon />

                                    </button>

                                </div>
                            )
                        )}

                    </div>

                ) : (

                    <div className="hobbies-empty-selected">

                        <InterestsRoundedIcon />


                        <div>

                            <strong>
                                No hobbies selected
                            </strong>

                            <span>
                                Choose your interests
                                from the categories below.
                            </span>

                        </div>

                    </div>
                )}


                <div className="hobbies-selection-actions">

                    {selectedHobbies.length >
                        0 && (

                            <button
                                type="button"
                                className="hobbies-clear-button"
                                onClick={
                                    handleCancelSelections
                                }
                            >

                                <DeleteSweepRoundedIcon />

                                Clear all

                            </button>
                        )}


                    {hasChanges && (

                        <button
                            type="button"
                            className="hobbies-reset-button"
                            onClick={
                                handleResetChanges
                            }
                        >

                            Reset changes

                        </button>
                    )}

                </div>

            </section>


            {/* ================= BROWSE ================= */}

            <section className="hobbies-browser-card">

                <div className="hobbies-browser-header">

                    <div>

                        <span>
                            DISCOVER
                        </span>

                        <h2>
                            Browse hobbies
                        </h2>

                        <p>
                            Open a category and select
                            the hobbies that describe
                            your interests.
                        </p>

                    </div>


                    <div className="hobbies-search">

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
                            placeholder="Search hobbies..."
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


                {filteredHobbies.length > 0 ? (

                    <div className="hobbies-category-grid">

                        {filteredHobbies.map(
                            hobby => {

                                const expanded =
                                    expandedHobbyId ===
                                    hobby.id ||
                                    searchTerm
                                        .trim()
                                        .length >
                                    0;


                                return (

                                    <article
                                        key={
                                            hobby.id
                                        }
                                        className={
                                            `hobbies-category-card ${
                                                expanded
                                                    ? 'expanded'
                                                    : ''
                                            }`
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="hobbies-category-header"
                                            onClick={() =>
                                                handleHobbyClick(
                                                    hobby.id
                                                )
                                            }
                                        >

                                            <div className="hobbies-category-main">

                                                <div className="hobbies-category-icon">

                                                    {getHobbyCategoryIcon(
                                                        hobby.name
                                                    )}

                                                </div>


                                                <div>

                                                    <strong>
                                                        {hobby.name}
                                                    </strong>

                                                    <span>

                                                        {
                                                            hobby
                                                                .children
                                                                ?.length ||
                                                            0
                                                        } options

                                                    </span>

                                                </div>

                                            </div>


                                            <ExpandMoreRoundedIcon
                                                className="hobbies-expand-icon"
                                            />

                                        </button>


                                        {expanded &&
                                            hobby.children &&
                                            hobby.children.length >
                                            0 && (

                                                <div className="hobbies-sub-list">

                                                    {hobby.children.map(
                                                        child => {

                                                            const selected =
                                                                isSelected(
                                                                    child.id
                                                                );


                                                            const disabled =
                                                                selectedHobbies.length >=
                                                                MAX_HOBBIES &&
                                                                !selected;


                                                            return (

                                                                <button
                                                                    type="button"
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    className={
                                                                        `hobbies-sub-item ${
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
                                                                        handleSelectHobby(
                                                                            child
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                >

                                                                    <span className="hobbies-sub-check">

                                                                        {selected && (

                                                                            <CheckRoundedIcon />

                                                                        )}

                                                                    </span>


                                                                    <span>
                                                                        {child.name}
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

                    <div className="hobbies-no-results">

                        <SearchRoundedIcon />

                        <strong>
                            No hobbies found
                        </strong>

                        <span>
                            Try another search term.
                        </span>

                    </div>
                )}

            </section>


            {/* ================= TIP ================= */}

            <section className="hobbies-tip">

                <div>
                    <AutoAwesomeRoundedIcon />
                </div>


                <p>

                    <strong>
                        Why hobbies matter
                    </strong>

                    Your interests help TalkSpace
                    represent your profile more
                    accurately and make it easier
                    to discover people with similar
                    interests.

                </p>

            </section>


            {/* ================= MOBILE SAVE ================= */}

            <div className="hobbies-mobile-actions">

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

                        <span className="hobbies-spinner light" />

                    ) : (

                        <SaveRoundedIcon />

                    )}

                    Save

                </button>

            </div>


            {/* ================= NOTIFICATION ================= */}

            {notification && (

                <div
                    className={
                        `hobbies-notification ${notification.type}`
                    }
                >

                    <div className="hobbies-notification-icon">

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
                            {notification.message}
                        </span>

                    </div>

                </div>
            )}

        </div>
    );
};


export default Hobbies;