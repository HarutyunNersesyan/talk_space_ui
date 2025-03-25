import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './Chat.css';

interface User {
    userName: string;
    firstName: string;
    lastName: string;
    image?: string;
}

interface ChatMessage {
    id: number;
    sender: string;
    senderName: string;
    receiver: string;
    receiverName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    senderImage?: string;
    receiverImage?: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { userName } = useParams<{ userName: string }>();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && userName) {
            const decoded = jwtDecode<{ sub: string, userName: string }>(token);
            fetchCurrentUser(decoded.userName);
            fetchOtherUser(userName);
            setupWebSocket(decoded.userName);
        }

        return () => {
            stompClient?.deactivate();
        };
    }, [userName]);

    useEffect(() => {
        if (currentUser?.userName && userName) {
            fetchMessages(currentUser.userName, userName);
            fetchUnreadCount(userName, currentUser.userName);
        }
    }, [currentUser, userName]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchCurrentUser = async (userName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/public/user/username/${userName}`);
            const user = await response.json();
            setCurrentUser(user);
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    };

    const fetchOtherUser = async (userName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/public/user/username/${userName}`);
            const user = await response.json();
            setOtherUser(user);
        } catch (error) {
            console.error("Failed to fetch other user:", error);
        }
    };

    const fetchMessages = async (user1: string, user2: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/public/chat/history/${user1}/${user2}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const fetchUnreadCount = async (sender: string, receiver: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/public/chat/unread/${sender}/${receiver}`);
            const count = await response.json();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    const markAsRead = async (sender: string, receiver: string) => {
        try {
            await fetch(`http://localhost:8080/api/public/chat/read/${sender}/${receiver}`, {
                method: 'POST'
            });
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const setupWebSocket = (currentUsername: string) => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/user/${currentUsername}/queue/messages`, (message) => {
                    const newMsg: ChatMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMsg]);

                    if (newMsg.sender === userName) {
                        markAsRead(newMsg.sender, currentUsername);
                    }
                });
            }
        });

        client.activate();
        setStompClient(client);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !currentUser || !otherUser || !stompClient) return;

        const message = {
            sender: currentUser.userName,
            receiver: otherUser.userName,
            content: newMessage
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message)
        });

        setNewMessage('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                {otherUser && (
                    <>
                        <img
                            src={otherUser.image || '/default-profile.png'}
                            alt={otherUser.userName}
                            className="profile-image"
                        />
                        <div className="user-info">
                            <h3>{otherUser.firstName} {otherUser.lastName}</h3>
                            <p>@{otherUser.userName}</p>
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === currentUser?.userName ? 'sent' : 'received'}`}
                    >
                        {message.sender !== currentUser?.userName && (
                            <img
                                src={message.senderImage || '/default-profile.png'}
                                alt={message.senderName}
                                className="message-avatar"
                            />
                        )}
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {message.sender === currentUser?.userName && (
                                    <span className="read-status">
                                        {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>
                    <i className="send-icon">➤</i>
                </button>
            </div>
        </div>
    );
};

export default Chat;