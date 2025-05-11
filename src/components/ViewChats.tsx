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
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const getMessageAlignment = (sender: string) => {
        // Assuming the first sender in the chat history is "you"
        if (chatHistory.length > 0) {
            return sender === chatHistory[0].sender ? 'right' : 'left';
        }
        return 'left';
    };

    return (
        <div className="view-chats-container">
            <div className="view-chats-inner">
                {chatHistory.length > 0 ? (
                    <div className="view-chats-message-container">
                        <div className="view-chats-message-list">
                            {chatHistory.map((message: ChatMessage) => (
                                <div
                                    key={message.id}
                                    className={`view-chats-message-bubble ${getMessageAlignment(message.sender)}`}
                                >
                                    <div className="view-chats-message-meta">
                                        <span className="view-chats-message-sender">{message.sender}</span>
                                    </div>
                                    <div className="view-chats-message-text">{message.content}</div>
                                    <div className="view-chats-message-time">{formatTimestamp(message.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="view-chats-empty">
                        <div className="view-chats-empty-icon">💬</div>
                        <p>No messages found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewChats;