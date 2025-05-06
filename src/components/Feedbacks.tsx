import React, { useEffect, useState } from 'react';
import './Feedbacks.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Review {
    id: number;
    message: string;
    senderUserName: string;
    reviewDate: number[];
}

type SortField = 'senderUserName' | 'reviewDate';
type SortDirection = 'asc' | 'desc';

const Feedbacks: React.FC = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('reviewDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!token) {
                    navigate('/login');
                    return;
                }

                const reviewsResponse = await axios.get(
                    'http://localhost:8080/api/private/admin/review/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setReviews(reviewsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch reviews');
                setLoading(false);
            }
        };

        fetchData();
    }, [token, navigate]);

    const formatDate = (dateArray: number[]) => {
        if (dateArray.length !== 3) return 'Invalid date';
        const [year, month, day] = dateArray;
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortField === 'senderUserName') {
            return sortDirection === 'asc'
                ? a.senderUserName.localeCompare(b.senderUserName)
                : b.senderUserName.localeCompare(a.senderUserName);
        } else {
            const dateA = new Date(a.reviewDate[0], a.reviewDate[1] - 1, a.reviewDate[2]);
            const dateB = new Date(b.reviewDate[0], b.reviewDate[1] - 1, b.reviewDate[2]);
            return sortDirection === 'asc'
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }
    });

    const getSortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const formatMessage = (message: string) => {
        if (!message) return '';
        const chunkSize = 160;
        const regex = new RegExp(`(.{1,${chunkSize}}(\\s|$)|\\S+?(\\s|$))`, 'g');
        return message.match(regex)?.join('\n') || message;
    };

    return (
        <div className="feedbacks-container">
            <div className="reviews-section">
                {loading ? (
                    <div className="loading-message">Loading feedback...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews-message">No feedback found</div>
                ) : (
                    <table className="reviews-table">
                        <thead>
                        <tr>
                            <th className="sender-column sortable-header" onClick={() => handleSort('senderUserName')}>
                                Sender {getSortIndicator('senderUserName')}
                            </th>
                            <th className="message-column">Message</th>
                            <th className="date-column sortable-header" onClick={() => handleSort('reviewDate')}>
                                Date {getSortIndicator('reviewDate')}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedReviews.map((review) => (
                            <tr key={review.id}>
                                <td className="sender-column">{review.senderUserName}</td>
                                <td className="message-column">{formatMessage(review.message)}</td>
                                <td className="date-column">{formatDate(review.reviewDate)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Feedbacks;