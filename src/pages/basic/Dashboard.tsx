import React, {
    useEffect,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import axios from 'axios';

import {
    jwtDecode
} from 'jwt-decode';

import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

import './Dashboard.css';

interface DecodedToken {
    sub: string;
}

interface FormMessage {
    text: string;
    type: 'success' | 'error';
}

const apiUrl =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const [userName, setUserName] =
        useState<string | null>(null);

    const [showFeedback, setShowFeedback] =
        useState<boolean>(false);

    const [feedback, setFeedback] =
        useState<string>('');

    const [rating, setRating] =
        useState<number>(0);

    const [hoverRating, setHoverRating] =
        useState<number>(0);

    const [isSubmittingFeedback, setIsSubmittingFeedback] =
        useState<boolean>(false);

    const [formMessage, setFormMessage] =
        useState<FormMessage | null>(null);

    const token =
        localStorage.getItem('token');


    /* =====================================================
       LOAD USER
       ===================================================== */

    useEffect(() => {
        const fetchUserName = async () => {
            if (!token) {
                return;
            }

            try {
                const decodedToken =
                    jwtDecode<DecodedToken>(
                        token
                    );

                const email =
                    decodedToken.sub;

                const response =
                    await axios.get(
                        `${apiUrl}/api/public/user/get/userName/${email}`,
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

            } catch (error) {

                console.error(
                    'Error fetching username:',
                    error
                );

            }
        };

        fetchUserName();

    }, [token]);


    /* =====================================================
       FEEDBACK
       ===================================================== */

    const handleFeedbackChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const value =
            event.target.value;

        if (value.length <= 200) {
            setFeedback(value);
        }
    };


    const handleRatingClick = (
        selectedRating: number
    ) => {
        setRating(
            selectedRating === rating
                ? 0
                : selectedRating
        );
    };


    const handleSubmitFeedback = async () => {
        if (!feedback.trim()) {
            setFormMessage({
                text:
                    'Please enter your feedback.',
                type: 'error'
            });

            return;
        }

        if (!userName) {
            setFormMessage({
                text:
                    'Please log in to submit feedback.',
                type: 'error'
            });

            return;
        }

        setIsSubmittingFeedback(true);
        setFormMessage(null);

        try {
            const response =
                await fetch(
                    `${apiUrl}/api/public/user/review/add`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            userName,
                            message: feedback,
                            rating
                        })
                    }
                );

            if (!response.ok) {
                let errorData: any = {};

                try {
                    errorData =
                        await response.json();
                } catch {
                    errorData = {};
                }

                if (
                    response.status === 425
                ) {
                    setFormMessage({
                        text:
                            errorData.message ||
                            'You can leave your next review in 2 days.',
                        type: 'error'
                    });

                    return;
                }

                throw new Error(
                    errorData.message ||
                    'Failed to submit feedback.'
                );
            }

            setFormMessage({
                text:
                    'Thank you for your feedback!',
                type: 'success'
            });

            setTimeout(() => {
                closeFeedback();
            }, 1500);

        } catch (error) {

            console.error(
                'Error submitting feedback:',
                error
            );

            setFormMessage({
                text:
                    error instanceof Error
                        ? error.message
                        : 'Failed to submit feedback. Please try again later.',
                type: 'error'
            });

        } finally {

            setIsSubmittingFeedback(false);

        }
    };


    const closeFeedback = () => {
        setShowFeedback(false);

        setFeedback('');

        setRating(0);

        setHoverRating(0);

        setFormMessage(null);
    };


    const displayRating =
        hoverRating || rating;


    return (
        <div className="home-dashboard">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="home-welcome">

                <div>

                    <span className="home-eyebrow">
                        <AutoAwesomeRoundedIcon />

                        Welcome back
                    </span>

                    <h1>
                        {userName
                            ? `Hi, ${userName}`
                            : 'Welcome to TalkSpace'}
                        <span>.</span>
                    </h1>

                    <p>
                        Discover new people, explore shared
                        interests and start conversations
                        that matter.
                    </p>

                </div>


                <button
                    type="button"
                    className="home-primary-action"
                    onClick={() =>
                        navigate('/choose')
                    }
                >
                    <ExploreRoundedIcon />

                    <span>
                        Discover people
                    </span>

                    <ArrowForwardRoundedIcon />
                </button>

            </section>


            {/* =============================================
                HERO
               ============================================= */}

            <section className="home-hero">

                <div className="home-hero-decoration hero-decoration-one" />
                <div className="home-hero-decoration hero-decoration-two" />


                <div className="home-hero-content">

                    <span className="home-hero-label">
                        TALKSPACE
                    </span>

                    <h2>
                        Find people who
                        <span> match your world.</span>
                    </h2>

                    <p>
                        Connect through shared hobbies,
                        specialities and meaningful
                        conversations.
                    </p>


                    <div className="home-hero-buttons">

                        <button
                            type="button"
                            className="home-hero-primary"
                            onClick={() =>
                                navigate('/choose')
                            }
                        >
                            Start discovering

                            <ArrowForwardRoundedIcon />
                        </button>


                        <button
                            type="button"
                            className="home-hero-secondary"
                            onClick={() => {
                                if (userName) {
                                    navigate(
                                        `/chat/${userName}`
                                    );
                                }
                            }}
                            disabled={!userName}
                        >
                            <ChatBubbleRoundedIcon />

                            Messages
                        </button>

                    </div>

                </div>


                <div className="home-hero-visual">

                    <div className="hero-people-card hero-person-one">

                        <div className="hero-avatar">
                            A
                        </div>

                        <div>
                            <strong>
                                Alex
                            </strong>

                            <span>
                                Photography
                            </span>
                        </div>

                    </div>


                    <div className="hero-people-card hero-person-two">

                        <div className="hero-avatar hero-avatar-two">
                            M
                        </div>

                        <div>
                            <strong>
                                Maria
                            </strong>

                            <span>
                                Technology
                            </span>
                        </div>

                    </div>


                    <div className="hero-connection-line">
                        <FavoriteRoundedIcon />
                    </div>


                    <div className="hero-floating-message">
                        <ForumRoundedIcon />

                        <span>
                            Start a conversation
                        </span>
                    </div>

                </div>

            </section>


            {/* =============================================
                QUICK ACTIONS
               ============================================= */}

            <section className="home-section">

                <div className="home-section-heading">

                    <div>
                        <span>
                            QUICK ACCESS
                        </span>

                        <h2>
                            What would you like to do?
                        </h2>
                    </div>

                </div>


                <div className="home-action-grid">

                    <button
                        type="button"
                        className="home-action-card"
                        onClick={() =>
                            navigate('/choose')
                        }
                    >

                        <div className="action-icon purple">
                            <ExploreRoundedIcon />
                        </div>

                        <div className="action-content">

                            <h3>
                                Discover
                            </h3>

                            <p>
                                Find new people based on
                                interests and specialities.
                            </p>

                        </div>

                        <ArrowForwardRoundedIcon
                            className="action-arrow"
                        />

                    </button>


                    <button
                        type="button"
                        className="home-action-card"
                        onClick={() =>
                            navigate(
                                '/SearchByHobbies'
                            )
                        }
                    >

                        <div className="action-icon blue">
                            <FavoriteRoundedIcon />
                        </div>

                        <div className="action-content">

                            <h3>
                                Find by hobbies
                            </h3>

                            <p>
                                Meet people who enjoy the
                                same things you do.
                            </p>

                        </div>

                        <ArrowForwardRoundedIcon
                            className="action-arrow"
                        />

                    </button>


                    <button
                        type="button"
                        className="home-action-card"
                        onClick={() =>
                            navigate(
                                '/searchBySpecialities'
                            )
                        }
                    >

                        <div className="action-icon orange">
                            <PeopleAltRoundedIcon />
                        </div>

                        <div className="action-content">

                            <h3>
                                Find by speciality
                            </h3>

                            <p>
                                Discover people with similar
                                professional interests.
                            </p>

                        </div>

                        <ArrowForwardRoundedIcon
                            className="action-arrow"
                        />

                    </button>

                </div>

            </section>


            {/* =============================================
                ABOUT
               ============================================= */}

            <section className="home-about">

                <div className="home-about-icon">
                    <AutoAwesomeRoundedIcon />
                </div>

                <div className="home-about-content">

                    <span>
                        ABOUT TALKSPACE
                    </span>

                    <h2>
                        More than just messages.
                    </h2>

                    <p>
                        TalkSpace is designed to create a
                        comfortable environment for discovering
                        new people and building meaningful
                        connections. Whether you're looking
                        for friendship, shared interests or
                        simply a good conversation, TalkSpace
                        helps bring the right people together.
                    </p>

                </div>


                <button
                    type="button"
                    className="home-about-button"
                    onClick={() =>
                        navigate('/choose')
                    }
                >
                    Explore TalkSpace

                    <ArrowForwardRoundedIcon />
                </button>

            </section>


            {/* =============================================
                FEEDBACK BUTTON
               ============================================= */}

            <div className="home-feedback-widget">

                {showFeedback && (
                    <div className="home-feedback-panel">

                        <div className="feedback-panel-header">

                            <div>

                                <span>
                                    YOUR FEEDBACK
                                </span>

                                <h3>
                                    Help us improve TalkSpace
                                </h3>

                            </div>


                            <button
                                type="button"
                                className="feedback-close"
                                onClick={closeFeedback}
                                aria-label="Close feedback"
                            >
                                <CloseRoundedIcon />
                            </button>

                        </div>


                        {/* Rating */}

                        <div className="home-rating">

                            <div className="home-stars">

                                {[1, 2, 3, 4, 5].map(
                                    (star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className={
                                                displayRating >=
                                                star
                                                    ? 'home-star active'
                                                    : 'home-star'
                                            }
                                            onClick={() =>
                                                handleRatingClick(
                                                    star
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setHoverRating(
                                                    star
                                                )
                                            }
                                            onMouseLeave={() =>
                                                setHoverRating(
                                                    0
                                                )
                                            }
                                            aria-label={`Rate ${star} stars`}
                                        >
                                            <StarRoundedIcon />
                                        </button>
                                    )
                                )}

                            </div>

                            <span className="home-rating-text">
                                {rating
                                    ? `${rating}/5`
                                    : 'Rate your experience'}
                            </span>

                        </div>


                        {/* Message */}

                        {formMessage && (
                            <div
                                className={`home-feedback-message ${formMessage.type}`}
                            >
                                {formMessage.text}
                            </div>
                        )}


                        {/* Textarea */}

                        <div className="home-feedback-textarea-wrapper">

                            <textarea
                                value={feedback}
                                onChange={
                                    handleFeedbackChange
                                }
                                maxLength={200}
                                placeholder="Tell us about your experience..."
                            />

                            <span>
                                {feedback.length}/200
                            </span>

                        </div>


                        {/* Submit */}

                        <button
                            type="button"
                            className="home-feedback-submit"
                            onClick={
                                handleSubmitFeedback
                            }
                            disabled={
                                isSubmittingFeedback ||
                                !feedback.trim()
                            }
                        >

                            {isSubmittingFeedback ? (
                                <>
                                    <span className="feedback-spinner" />

                                    Sending...
                                </>
                            ) : (
                                <>
                                    <SendRoundedIcon />

                                    Send feedback
                                </>
                            )}

                        </button>

                    </div>
                )}


                <button
                    type="button"
                    className={
                        showFeedback
                            ? 'home-feedback-button active'
                            : 'home-feedback-button'
                    }
                    onClick={() =>
                        setShowFeedback(
                            (previous) =>
                                !previous
                        )
                    }
                    aria-label="Feedback"
                >
                    {showFeedback ? (
                        <CloseRoundedIcon />
                    ) : (
                        <ChatBubbleRoundedIcon />
                    )}
                </button>

            </div>

        </div>
    );
};

export default Dashboard;