import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ViewChats.css';

interface ChatMessage {
    id: number;
    sender: string;
    receiver: string;
    content: string;
    timestamp: number[];
}

const ViewChats: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const chatHistory = location.state?.chatHistory || [];

    const formatTimestamp = (timestampArray: number[]) => {
        if (!timestampArray || timestampArray.length < 6) return '';

        const [year, month, day, hours, minutes] = timestampArray;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(year, month - 1, day, hours, minutes);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const getMessageAlignment = (sender: string) => {
        return sender.includes('David') ? 'left' : 'right';
    };

    return (
        <div className="chat-view">
            <div className="chat-container">
                {chatHistory.length > 0 ? (
                    <div className="message-list-container">
                        <div className="message-list">
                            {chatHistory.map((message: ChatMessage) => (
                                <div
                                    key={message.id}
                                    className={`message-bubble ${getMessageAlignment(message.sender)}`}
                                >
                                    <div className="message-meta">
                                        <span className="message-sender">{message.sender}</span>
                                    </div>
                                    <div className="message-text">{message.content}</div>
                                    <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p>No messages found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewChats;