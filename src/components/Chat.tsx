import React, { useEffect, useState, useRef } from 'react';
import './Chat.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

interface UserChatDto {
    partnerUsername: string;
    partnerName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    partnerImage: string;
}

interface ChatMessageDto {
    id: number;
    sender: string;
    senderName: string;
    senderImage?: string;
    receiver: string;
    receiverName: string;
    receiverImage?: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

const Chat: React.FC = () => {
    // State management
    const [chats, setChats] = useState<UserChatDto[]>([]);
    const [activeChat, setActiveChat] = useState<ChatMessageDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [newMessage, setNewMessage] = useState<string>('');
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();
    const { partnerUsername } = useParams();
    const token = localStorage.getItem('token');

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!token) throw new Error('No token found');

                const decodedToken = jwtDecode<{ sub: string }>(token);
                const email = decodedToken.sub;

                const response = await axios.get(
                    `http://localhost:8080/api/public/user/get/userName/${email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserName(response.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user information');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                if (!userName) return;

                const response = await axios.get(
                    `http://localhost:8080/api/public/chat/conversations/${userName}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setChats(response.data);

                if (partnerUsername) {
                    setSelectedPartner(partnerUsername);
                    loadChatHistory(partnerUsername);
                }
            } catch (err) {
                console.error('Error fetching conversations:', err);
                setError('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [userName, token, partnerUsername]);

    // Load chat history
    const loadChatHistory = async (partner: string) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/public/chat/history/${userName}/${partner}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActiveChat(response.data);

            await markMessagesAsRead(partner);
            scrollToBottom();
        } catch (err) {
            console.error('Error loading chat history:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    // Mark messages as read
    const markMessagesAsRead = async (partner: string) => {
        try {
            await axios.post(
                `http://localhost:8080/api/public/chat/read/${partner}/${userName}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setChats(prev => prev.map(chat =>
                chat.partnerUsername === partner
                    ? { ...chat, unreadCount: 0 }
                    : chat
            ));
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedPartner || !userName) return;

        try {
            const tempId = Date.now();
            const tempMessage: ChatMessageDto = {
                id: tempId,
                sender: userName,
                senderName: userName,
                receiver: selectedPartner,
                receiverName: selectedPartner,
                content: newMessage,
                timestamp: new Date().toISOString(),
                isRead: false
            };

            // Optimistic update
            setActiveChat(prev => [...prev, tempMessage]);
            updateLastMessage(newMessage);
            setNewMessage('');
            scrollToBottom();
            inputRef.current?.focus();

            // Send to server
            const response = await axios.post(
                'http://localhost:8080/api/public/chat/message',
                {
                    sender: userName,
                    receiver: selectedPartner,
                    content: newMessage,
                    isRead: false
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Replace temporary message with server response
            setActiveChat(prev =>
                prev.map(msg => msg.id === tempId ? response.data : msg)
            );
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
            setActiveChat(prev => prev.filter(msg => msg.id !== Date.now()));
        }
    };

    // Update last message in sidebar
    const updateLastMessage = (message: string) => {
        setChats(prev => prev.map(chat =>
            chat.partnerUsername === selectedPartner
                ? {
                    ...chat,
                    lastMessage: message,
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0
                }
                : chat
        ));
    };

    // Handle input key events
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        setIsTyping(!!e.target.value);
    };

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Format message time
    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Select chat
    const selectChat = (partner: string) => {
        setSelectedPartner(partner);
        loadChatHistory(partner);
        navigate(`/chat/${partner}`);
    };

    return (
        <div className="chat-app">
            {/* Sidebar with conversations */}
            <div className="conversation-list">
                <div className="conversation-header">
                    <h2>Messages</h2>
                </div>
                <div className="conversation-items">
                    {loading && chats.length === 0 ? (
                        <div className="loading">Loading conversations...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : chats.length === 0 ? (
                        <div className="empty">No conversations yet</div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.partnerUsername}
                                className={`conversation-item ${selectedPartner === chat.partnerUsername ? 'active' : ''}`}
                                onClick={() => selectChat(chat.partnerUsername)}
                            >
                                <div className="avatar">
                                    {chat.partnerImage ? (
                                        <img src={`http://localhost:8080${chat.partnerImage}`} alt={chat.partnerName} />
                                    ) : (
                                        <div className="default-avatar">
                                            {chat.partnerName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {chat.unreadCount > 0 && (
                                        <span className="unread-count">{chat.unreadCount}</span>
                                    )}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <h3>{chat.partnerName}</h3>
                                        <span className="time">
                                            {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="last-message">
                                        {chat.lastMessage.length > 30
                                            ? `${chat.lastMessage.substring(0, 30)}...`
                                            : chat.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main chat area */}
            <div className="chat-area">
                {selectedPartner ? (
                    <>
                        <div className="chat-header">
                            <div className="partner-info">
                                <div className="avatar">
                                    {chats.find(c => c.partnerUsername === selectedPartner)?.partnerImage ? (
                                        <img
                                            src={`http://localhost:8080${chats.find(c => c.partnerUsername === selectedPartner)?.partnerImage}`}
                                            alt={chats.find(c => c.partnerUsername === selectedPartner)?.partnerName}
                                        />
                                    ) : (
                                        <div className="default-avatar">
                                            {chats.find(c => c.partnerUsername === selectedPartner)?.partnerName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3>{chats.find(c => c.partnerUsername === selectedPartner)?.partnerName}</h3>
                            </div>
                        </div>

                        <div className="messages">
                            {loading && activeChat.length === 0 ? (
                                <div className="loading">Loading messages...</div>
                            ) : error ? (
                                <div className="error">{error}</div>
                            ) : activeChat.length === 0 ? (
                                <div className="empty">No messages yet</div>
                            ) : (
                                activeChat.map(message => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender === userName ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">
                                            <p>{message.content}</p>
                                            <span className="message-time">
                                                {formatTime(message.timestamp)}
                                                {message.sender === userName && (
                                                    <span className="status">
                                                        {message.isRead ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* SMS-style message editor */}
                        <div className="message-editor">
                            <div className="editor-tools">
                                <button className="tool-button">
                                    <FiPaperclip />
                                </button>
                                <button className="tool-button">
                                    <FiSmile />
                                </button>
                            </div>
                            <textarea
                                ref={inputRef}
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                rows={1}
                                className="message-input"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!isTyping}
                                className={`send-button ${isTyping ? 'active' : ''}`}
                            >
                                <FiSend />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="placeholder">
                            <h3>Select a conversation</h3>
                            <p>Choose a chat from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;