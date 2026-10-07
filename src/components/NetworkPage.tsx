import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import InterestsRoundedIcon
    from '@mui/icons-material/InterestsRounded';

import WorkspacesRoundedIcon
    from '@mui/icons-material/WorkspacesRounded';

import ArrowForwardRoundedIcon
    from '@mui/icons-material/ArrowForwardRounded';

import AutoAwesomeRoundedIcon
    from '@mui/icons-material/AutoAwesomeRounded';

import './NetworkPage.css';


/* =========================================================
   API
   ========================================================= */

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


/* =========================================================
   TOKEN TYPE
   ========================================================= */

interface DecodedToken {
    sub: string;
}


/* =========================================================
   COMPONENT
   ========================================================= */

const NetworkPage: React.FC = () => {

    const navigate =
        useNavigate();


    const [
        isSearchingHobbies,
        setIsSearchingHobbies
    ] = useState<boolean>(false);


    const [
        isSearchingSpecialties,
        setIsSearchingSpecialties
    ] = useState<boolean>(false);


    const [
        hobbiesError,
        setHobbiesError
    ] = useState<string>('');


    const [
        specialtiesError,
        setSpecialtiesError
    ] = useState<string>('');


    /* =====================================================
       GET CURRENT USERNAME
       ===================================================== */

    const getCurrentUserName =
        async (): Promise<string | null> => {

            const token =
                localStorage.getItem('token');


            if (!token) {
                return null;
            }


            try {

                const decodedToken =
                    jwtDecode<DecodedToken>(
                        token
                    );


                const response =
                    await axios.get<string>(
                        `${API_URL}/api/public/user/get/userName/${decodedToken.sub}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                return response.data;

            } catch (error) {

                console.error(
                    'Failed to fetch username:',
                    error
                );


                return null;
            }
        };


    /* =====================================================
       SEARCH BY HOBBIES
       ===================================================== */

    const handleHobbiesSearch =
        async () => {

            if (isSearchingHobbies) {
                return;
            }


            setIsSearchingHobbies(true);

            setHobbiesError('');


            try {

                const currentUserName =
                    await getCurrentUserName();


                if (!currentUserName) {

                    setHobbiesError(
                        'Unable to identify your account. Please log in again.'
                    );

                    return;
                }


                const token =
                    localStorage.getItem('token');


                const response =
                    await axios.get(
                        `${API_URL}/api/public/user/searchByHobbies/${currentUserName}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (response.data) {

                    navigate(
                        '/SearchByHobbies',
                        {
                            state: {
                                initialProfile:
                                response.data
                            }
                        }
                    );

                } else {

                    setHobbiesError(
                        'No matching profiles were found based on your hobbies.'
                    );
                }

            } catch (error) {

                if (axios.isAxiosError(error)) {

                    if (
                        error.response?.status === 404
                    ) {

                        setHobbiesError(
                            'No matching profiles were found based on your hobbies.'
                        );

                    } else if (
                        error.response?.status === 400
                    ) {

                        setHobbiesError(
                            'Add at least one hobby to your profile before searching.'
                        );

                    } else {

                        setHobbiesError(
                            'We could not search by hobbies right now. Please try again.'
                        );
                    }

                } else {

                    setHobbiesError(
                        'Something went wrong. Please try again.'
                    );
                }

            } finally {

                setIsSearchingHobbies(false);
            }
        };


    /* =====================================================
       SEARCH BY SPECIALITIES
       ===================================================== */

    const handleSpecialtiesSearch =
        async () => {

            if (isSearchingSpecialties) {
                return;
            }


            setIsSearchingSpecialties(true);

            setSpecialtiesError('');


            try {

                const currentUserName =
                    await getCurrentUserName();


                if (!currentUserName) {

                    setSpecialtiesError(
                        'Unable to identify your account. Please log in again.'
                    );

                    return;
                }


                const token =
                    localStorage.getItem('token');


                const response =
                    await axios.get(
                        `${API_URL}/api/public/user/searchBySpecialities/${currentUserName}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (response.data) {

                    navigate(
                        '/searchBySpecialities',
                        {
                            state: {
                                initialProfile:
                                response.data
                            }
                        }
                    );

                } else {

                    setSpecialtiesError(
                        'No matching profiles were found based on your specialties.'
                    );
                }

            } catch (error) {

                if (axios.isAxiosError(error)) {

                    if (
                        error.response?.status === 404
                    ) {

                        setSpecialtiesError(
                            'No matching profiles were found based on your specialties.'
                        );

                    } else if (
                        error.response?.status === 400
                    ) {

                        setSpecialtiesError(
                            'Add at least one specialty to your profile before searching.'
                        );

                    } else {

                        setSpecialtiesError(
                            'We could not search by specialties right now. Please try again.'
                        );
                    }

                } else {

                    setSpecialtiesError(
                        'Something went wrong. Please try again.'
                    );
                }

            } finally {

                setIsSearchingSpecialties(false);
            }
        };


    /* =====================================================
       UI
       ===================================================== */

    return (

        <div className="network-page">

            <div className="network-page-inner">

                {/* HERO */}

                <section className="network-hero">

                    <div className="network-hero-badge">

                        <AutoAwesomeRoundedIcon />

                        <span>
                            Discover people
                        </span>

                    </div>


                    <h1>
                        Find people who
                        <span> match your world.</span>
                    </h1>


                    <p>
                        Discover meaningful connections
                        based on the things you enjoy
                        and the skills that define you.
                    </p>

                </section>


                {/* OPTIONS */}

                <section className="network-options-grid">


                    {/* HOBBIES */}

                    <article className="network-option-card">

                        <div className="network-card-icon hobbies">

                            <InterestsRoundedIcon />

                        </div>


                        <div className="network-card-content">

                            <span className="network-card-label">
                                PERSONAL
                            </span>


                            <h2>
                                Connect by hobbies
                            </h2>


                            <p>
                                Meet people who enjoy the
                                same activities, interests
                                and passions as you.
                            </p>

                        </div>


                        {hobbiesError && (

                            <div className="network-error">

                                {hobbiesError}

                            </div>

                        )}


                        <button
                            type="button"
                            className="network-search-button"
                            onClick={handleHobbiesSearch}
                            disabled={isSearchingHobbies}
                        >

                            <span>

                                {isSearchingHobbies
                                    ? 'Finding matches...'
                                    : 'Find hobby matches'}

                            </span>


                            {!isSearchingHobbies && (

                                <ArrowForwardRoundedIcon />

                            )}

                        </button>

                    </article>


                    {/* SPECIALITIES */}

                    <article className="network-option-card">

                        <div className="network-card-icon specialties">

                            <WorkspacesRoundedIcon />

                        </div>


                        <div className="network-card-content">

                            <span className="network-card-label">
                                PROFESSIONAL
                            </span>


                            <h2>
                                Connect by specialties
                            </h2>


                            <p>
                                Discover professionals with
                                similar skills, expertise
                                and career interests.
                            </p>

                        </div>


                        {specialtiesError && (

                            <div className="network-error">

                                {specialtiesError}

                            </div>

                        )}


                        <button
                            type="button"
                            className="network-search-button"
                            onClick={handleSpecialtiesSearch}
                            disabled={isSearchingSpecialties}
                        >

                            <span>

                                {isSearchingSpecialties
                                    ? 'Finding matches...'
                                    : 'Find professional matches'}

                            </span>


                            {!isSearchingSpecialties && (

                                <ArrowForwardRoundedIcon />

                            )}

                        </button>

                    </article>

                </section>


                {/* BOTTOM INFO */}

                <section className="network-bottom-note">

                    <AutoAwesomeRoundedIcon />

                    <p>
                        Your matches are based on the
                        hobbies and specialties you have
                        added to your TalkSpace profile.
                    </p>

                </section>

            </div>

        </div>
    );
};


export default NetworkPage;