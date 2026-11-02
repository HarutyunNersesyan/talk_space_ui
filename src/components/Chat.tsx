import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Chat.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import { API_URL, featureApi, featureError } from '../api/features';
import { useNetwork } from '../features/network/NetworkContext';
import { usePresence } from '../features/network/PresenceBadge';
import BlockButton from '../features/network/BlockButton';

interface UserChatDto {
    partnerUsername: string; partnerName: string; lastMessage: string;
    lastMessageTime: string | null; unreadCount: number; partnerImage?: string;
}
interface ChatMessageDto {
    id: number; sender: string; receiver: string; content: string;
    timestamp: number[] | string; isRead: boolean; read?: boolean;
}
interface TypingNotificationDto { sender: string; receiver: string; typing: boolean; }
const normalise = (message: ChatMessageDto): ChatMessageDto => ({ ...message, isRead: message.read ?? message.isRead ?? false });
const mergeMessages = (current: ChatMessageDto[], incoming: ChatMessageDto[]) => {
    const messages = new Map(current.map(message => [message.id, message]));
    let changed = false;
    incoming.map(normalise).forEach(message => {
        const previous = messages.get(message.id);
        const next = { ...message, isRead: !!previous?.isRead || message.isRead };
        if (!previous || previous.isRead !== next.isRead || previous.content !== next.content ||
            previous.sender !== next.sender || previous.receiver !== next.receiver ||
            JSON.stringify(previous.timestamp) !== JSON.stringify(next.timestamp)) {
            messages.set(message.id, next); changed = true;
        }
    });
    // An unchanged poll must not trigger auto-scroll while the user reads history.
    return changed ? Array.from(messages.values()).sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime() || a.id - b.id) : current;
};
const createMessageId = (): string => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};
const parseTimestamp = (timestamp: number[] | string | null | undefined): Date => {
    if (Array.isArray(timestamp)) return new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3] || 0, timestamp[4] || 0, timestamp[5] || 0);
    const parsed = timestamp ? new Date(timestamp) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};
const formatTime = (value: number[] | string | null | undefined) => parseTimestamp(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const formatDate = (value: number[] | string | null | undefined) => {
    const date = parseTimestamp(value);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    return date.toDateString() === today.toDateString() ? 'Today' : date.toDateString() === yesterday.toDateString() ? 'Yesterday' : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
const Chat: React.FC = () => {
    const network = useNetwork();
    const userName = network.currentUserName;
    const { userName: partnerUsername } = useParams<{ userName: string }>();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [chats, setChats] = useState<UserChatDto[]>([]);
    const [activeChat, setActiveChat] = useState<ChatMessageDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [showMobileConversationList, setShowMobileConversationList] = useState(!partnerUsername);
    const [partnerImages, setPartnerImages] = useState<Record<string, string>>({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [conversationSearch, setConversationSearch] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const imageCache = useRef<Record<string, string>>({});
    const imageRequests = useRef(new Set<string>());
    const imageController = useRef<AbortController | null>(null);
    const historyRequest = useRef(0);
    const chatRequest = useRef(0);
    const typingTimer = useRef<ReturnType<typeof setTimeout>>();
    const sendingRef = useRef(false);
    const pendingSend = useRef<{ id: string; partner: string; content: string } | null>(null);
    const mounted = useRef(true);
    const permitted = useCallback((name: string) => !network.blocks.some(b => b.blocked === name) && network.connections.some(c => c.status === 'ACCEPTED' && (c.sender === name || c.receiver === name)), [network.blocks, network.connections]);
    const visibleChats = chats.filter(c => permitted(c.partnerUsername));
    const selectedPartner = partnerUsername && partnerUsername !== userName && permitted(partnerUsername) && visibleChats.some(c => c.partnerUsername === partnerUsername) ? partnerUsername : null;
    const selectedRef = useRef(selectedPartner); selectedRef.current = selectedPartner;
    const partnerOnline = usePresence(selectedPartner);
    const scrollToBottom = useCallback((): void => {
        // A browser/polyfill may return a value; it must never become an effect cleanup.
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    }, []);

    const refreshChats = useCallback(async () => {
        if (!userName || !token) return;
        const request = ++chatRequest.current;
        try {
            const result = await featureApi.get<UserChatDto[]>(`/chat/conversations/${encodeURIComponent(userName)}`);
            if (mounted.current && request === chatRequest.current) { setChats(result.data || []); setError(null); }
        } catch (e) {
            if (mounted.current && request === chatRequest.current) setError(featureError(e, 'Unable to load conversations.'));
        } finally { if (mounted.current && request === chatRequest.current) setLoading(false); }
    }, [userName, token]);
    const markRead = useCallback(async (partner: string) => {
        if (!userName) return;
        try {
            await featureApi.post(`/chat/read/${encodeURIComponent(partner)}/${encodeURIComponent(userName)}`);
            if (mounted.current) setChats(old => old.map(c => c.partnerUsername === partner ? { ...c, unreadCount: 0 } : c));
        } catch (e) { if (mounted.current) setError(featureError(e, 'Unable to update read status.')); }
    }, [userName]);
    const loadHistory = useCallback(async (partner: string) => {
        const request = ++historyRequest.current;
        setLoading(true);
        try {
            const result = await featureApi.get<ChatMessageDto[]>(`/chat/history/${encodeURIComponent(userName)}/${encodeURIComponent(partner)}`);
            if (mounted.current && request === historyRequest.current && selectedRef.current === partner) {
                setActiveChat(old => mergeMessages(old, result.data || []));
                setError(null); void markRead(partner);
            }
        } catch (e) {
            if (mounted.current && request === historyRequest.current) {
                setActiveChat([]); setError(featureError(e, 'Accept a connection before chatting.')); void refreshChats();
            }
        } finally { if (mounted.current && request === historyRequest.current) setLoading(false); }
    }, [userName, markRead, refreshChats]);
    useEffect(() => {
        mounted.current = true;
        imageController.current = new AbortController();
        const requests = imageRequests.current;
        return () => {
            mounted.current = false; historyRequest.current += 1; chatRequest.current += 1;
            imageController.current?.abort();
            Object.values(imageCache.current).forEach(url => { if (url) URL.revokeObjectURL(url); });
            imageCache.current = {}; requests.clear();
            if (typingTimer.current) clearTimeout(typingTimer.current);
        };
    }, []);
    useEffect(() => { void refreshChats(); }, [refreshChats, network.revision]);
    useEffect(() => {
        if (network.error && !userName) { setError(network.error); setLoading(false); }
    }, [network.error, userName]);
    useLayoutEffect(() => {
        setActiveChat([]); setPartnerTyping(false); setShowEmojiPicker(false); setNewMessage('');
        if (selectedPartner) { setShowMobileConversationList(false); void loadHistory(selectedPartner); }
        else { historyRequest.current += 1; setShowMobileConversationList(true); }
    }, [selectedPartner, loadHistory]);
    useEffect(() => {
        for (const chat of chats) {
            const name = chat.partnerUsername;
            if (!permitted(name) || name in imageCache.current || imageRequests.current.has(name)) continue;
            imageRequests.current.add(name);
            featureApi.get(`/user/image/${encodeURIComponent(name)}`, { responseType: 'blob', signal: imageController.current?.signal }).then(result => {
                if (mounted.current) {
                    const url = result.data.size ? URL.createObjectURL(result.data) : '';
                    imageCache.current[name] = url;
                    setPartnerImages(old => ({ ...old, [name]: url }));
                }
            }).catch(() => { if (mounted.current) imageCache.current[name] = ''; }).finally(() => imageRequests.current.delete(name));
        }
    }, [chats, permitted]);
    useEffect(() => {
        scrollToBottom();
    }, [activeChat, scrollToBottom]);
    const callbacks = useRef({
        message: (_message: ChatMessageDto) => {}, typing: (_message: TypingNotificationDto) => {},
        receipt: (_reader: string) => {}, error: (_message: string) => {}, refresh: () => {}
    });
    callbacks.current = {
        message: data => {
            const message = normalise(data);
            const other = message.sender === userName ? message.receiver : message.sender;
            if (!permitted(other)) return;
            if (other === selectedRef.current) {
                setActiveChat(old => mergeMessages(old, [message]));
                if (message.sender !== userName) void markRead(other);
            }
            void refreshChats();
        },
        typing: message => {
            if (message.sender !== selectedRef.current || !permitted(message.sender)) return;
            setPartnerTyping(message.typing);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setPartnerTyping(false), 2000);
        },
        receipt: reader => { if (reader === selectedRef.current) setActiveChat(old => old.map(m => m.sender === userName ? { ...m, isRead: true } : m)); },
        error: message => { setError(message); void refreshChats(); },
        refresh: () => { void refreshChats(); if (selectedRef.current) void loadHistory(selectedRef.current); }
    };
    useEffect(() => {
        if (!token || !userName) return;
        let active = true;
        const client = new Client({ webSocketFactory: () => new SockJS(`${API_URL}/ws-secure`), connectHeaders: { Authorization: `Bearer ${token}` }, reconnectDelay: 5000, heartbeatIncoming: 0, heartbeatOutgoing: 10000 });
        client.onConnect = () => {
            if (!active) return;
            setStompClient(client);
            client.subscribe('/user/queue/messages', event => callbacks.current.message(JSON.parse(event.body)));
            client.subscribe('/user/queue/typing', event => callbacks.current.typing(JSON.parse(event.body)));
            client.subscribe('/user/queue/receipts', event => callbacks.current.receipt(JSON.parse(event.body).reader));
            client.subscribe('/user/queue/errors', event => callbacks.current.error(JSON.parse(event.body).message || 'Message was not delivered.'));
            client.subscribe('/user/queue/connection-notifications', () => { void refreshChats(); });
            callbacks.current.refresh();
        };
        client.onWebSocketClose = () => { if (active) setStompClient(null); };
        client.onStompError = () => { if (active) setError('Connection unavailable. Reconnecting…'); };
        client.activate();
        return () => { active = false; void client.deactivate(); };
    }, [token, userName, refreshChats]);
    // REST confirms the database save even if a WebSocket echo is lost. Reuse the
    // same id after an uncertain failure so a retry cannot create a duplicate.
    const sendMessage = async () => {
        const content = newMessage.trim();
        if (!content || content.length > 4000 || !selectedPartner || !permitted(selectedPartner) || sendingRef.current) return;
        const partner = selectedPartner;
        try {
            const previous = pendingSend.current;
            const attempt = previous && previous.partner === partner && previous.content === content
                ? previous : { id: createMessageId(), partner, content };
            pendingSend.current = attempt;
            sendingRef.current = true; setSending(true); setError(null);
            const response = await featureApi.post<ChatMessageDto>('/chat/messages', {
                receiver: partner, content, clientMessageId: attempt.id
            });
            if (pendingSend.current === attempt) pendingSend.current = null;
            if (mounted.current) {
                if (selectedRef.current === partner) {
                    setActiveChat(old => mergeMessages(old, [response.data]));
                    setNewMessage(old => old.trim() === content ? '' : old);
                    setShowEmojiPicker(false);
                }
                void refreshChats();
            }
        } catch (e) {
            if (mounted.current && selectedRef.current === partner)
                setError(featureError(e, 'Message status is uncertain. Retry the same message to check safely.'));
        } finally {
            sendingRef.current = false;
            if (mounted.current) setSending(false);
        }
    };
    // Push is preferred; polling recovers messages if a socket notification is missed.
    useEffect(() => {
        if (!userName || !selectedPartner || !token) return;
        const partner = selectedPartner;
        let active = true, inFlight = false;
        const sync = async () => {
            if (inFlight || document.visibilityState !== 'visible') return;
            inFlight = true;
            try {
                const result = await featureApi.get<ChatMessageDto[]>(`/chat/history/${encodeURIComponent(userName)}/${encodeURIComponent(partner)}`);
                if (!active || selectedRef.current !== partner) return;
                const messages = (result.data || []).map(normalise);
                setActiveChat(old => mergeMessages(old, messages));
                if (messages.some(message => message.sender === partner && !message.isRead)) void markRead(partner);
            } catch (e) {
                // A revoked connection or a block must immediately close the conversation.
                if (active && axios.isAxiosError(e) && (e.response?.status === 403 || e.response?.status === 404)) {
                    setActiveChat([]); setError(featureError(e)); void refreshChats();
                }
            } finally { inFlight = false; }
        };
        const timer = setInterval(() => void sync(), 3000);
        return () => { active = false; clearInterval(timer); };
    }, [userName, selectedPartner, token, markRead, refreshChats]);
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(event.target.value);
        if (selectedPartner && permitted(selectedPartner) && stompClient?.connected) stompClient.publish({ destination: '/app/typing', body: JSON.stringify({ receiver: selectedPartner, typing: Boolean(event.target.value.trim()) }) });
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } };
    const selectChat = (name: string) => { if (permitted(name)) { setShowMobileConversationList(false); navigate(`/chat/${encodeURIComponent(name)}`); } };
    const toggleConversationList = () => { setShowMobileConversationList(v => !v); setShowEmojiPicker(false); };
    const toggleEmojiPicker = () => setShowEmojiPicker(v => !v);
    const handleEmojiClick = (data: EmojiClickData) => { setNewMessage(v => (v + data.emoji).slice(0, 4000)); inputRef.current?.focus(); };
    useEffect(() => {
        const outside = (event: MouseEvent) => { if (!emojiPickerRef.current?.contains(event.target as Node)) setShowEmojiPicker(false); };
        document.addEventListener('mousedown', outside); return () => document.removeEventListener('mousedown', outside);
    }, []);
    const filteredChats = visibleChats.filter(c => `${c.partnerName} ${c.partnerUsername}`.toLowerCase().includes(conversationSearch.trim().toLowerCase()));
    const selectedChat = visibleChats.find(c => c.partnerUsername === selectedPartner);
    const selectedPartnerName = selectedChat?.partnerName || selectedPartner || 'Conversation';

    if (
        loading &&
        chats.length === 0 &&
        activeChat.length === 0
    ) {
        return (
            <div className="chat-page-state">

                <div className="chat-state-spinner"/>

                <span>
                    Loading your messages...
                </span>

            </div>
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    if (
        error &&
        chats.length === 0
    ) {
        return (
            <div className="chat-page-state error">

                <ChatBubbleOutlineRoundedIcon/>

                <strong>
                    Messages unavailable
                </strong>

                <span>
                    {error}
                </span>

            </div>
        );
    }


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="chat-page">

            <div className="chat-shell">

                {/* =========================================
                    CONVERSATION SIDEBAR
                    ========================================= */}

                <aside
                    className={
                        `chat-conversations ${
                            showMobileConversationList
                                ? 'mobile-show'
                                : 'mobile-hide'
                        }`
                    }
                >

                    {/* HEADER */}

                    <div className="chat-conversations-header">

                        <div>

                            <span className="chat-eyebrow">
                                TALKSPACE
                            </span>

                            <h1>
                                Messages
                            </h1>

                        </div>


                        <div
                            className={
                                `chat-connection ${
                                    stompClient?.connected
                                        ? 'online'
                                        : 'offline'
                                }`
                            }
                        >

                            <CircleRoundedIcon/>

                            {stompClient?.connected
                                ? 'Online'
                                : 'Offline'
                            }

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="chat-search">

                        <SearchRoundedIcon/>

                        <input
                            type="text"
                            value={
                                conversationSearch
                            }
                            onChange={
                                event =>
                                    setConversationSearch(
                                        event.target.value
                                    )
                            }
                            placeholder="Search conversations..."
                        />

                    </div>


                    {/* LIST */}

                    <div className="chat-conversation-list">

                        {filteredChats.length ===
                        0 ? (

                            <div className="chat-empty-conversations">

                                <ChatBubbleOutlineRoundedIcon/>

                                <strong>
                                    {conversationSearch
                                        ? 'No conversations found'
                                        : 'No conversations yet'
                                    }
                                </strong>

                                <span>
                                    {conversationSearch
                                        ? 'Try another name or username.'
                                        : 'Accept a connection request to start chatting.'
                                    }
                                </span>

                            </div>

                        ) : (

                            filteredChats.map(
                                chat => (

                                    <button
                                        type="button"
                                        key={
                                            chat.partnerUsername
                                        }
                                        className={
                                            `chat-conversation-item ${
                                                selectedPartner ===
                                                chat.partnerUsername
                                                    ? 'active'
                                                    : ''
                                            }`
                                        }
                                        onClick={
                                            () =>
                                                selectChat(
                                                    chat.partnerUsername
                                                )
                                        }
                                    >

                                        {/* AVATAR */}

                                        <div className="chat-avatar">

                                            {partnerImages[
                                                chat.partnerUsername
                                                ] ? (

                                                <img
                                                    src={
                                                        partnerImages[
                                                            chat.partnerUsername
                                                            ]
                                                    }
                                                    alt={
                                                        chat.partnerName
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {(
                                                        chat.partnerName ||
                                                        chat.partnerUsername
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()
                                                    }
                                                </span>

                                            )}


                                            {chat.unreadCount >
                                                0 && (

                                                    <span className="chat-unread-badge">
                                                    {
                                                        chat.unreadCount >
                                                        99
                                                            ? '99+'
                                                            : chat.unreadCount
                                                    }
                                                </span>

                                                )}

                                        </div>


                                        {/* INFO */}

                                        <div className="chat-conversation-info">

                                            <div className="chat-conversation-top">

                                                <strong>
                                                    {
                                                        chat.partnerName ||
                                                        chat.partnerUsername
                                                    }
                                                </strong>


                                                {chat.lastMessageTime && (

                                                    <time>
                                                        {
                                                            formatTime(
                                                                chat.lastMessageTime
                                                            )
                                                        }
                                                    </time>

                                                )}

                                            </div>


                                            <div className="chat-conversation-bottom">

                                                <span>
                                                    {
                                                        chat.lastMessage
                                                            ? chat.lastMessage.length >
                                                            42

                                                                ? `${chat.lastMessage.substring(
                                                                    0,
                                                                    42
                                                                )}...`

                                                                : chat.lastMessage

                                                            : 'Start a conversation'
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </button>

                                )
                            )

                        )}

                    </div>

                </aside>


                {/* =========================================
                    CHAT AREA
                    ========================================= */}

                <main
                    className={
                        `chat-main ${
                            !showMobileConversationList
                                ? 'mobile-show'
                                : 'mobile-hide'
                        }`
                    }
                >

                    {selectedPartner ? (

                        <>

                            {/* CHAT HEADER */}

                            <header className="chat-main-header">

                                <button
                                    type="button"
                                    className="chat-mobile-back"
                                    onClick={
                                        toggleConversationList
                                    }
                                    aria-label="Back to conversations"
                                >
                                    <ArrowBackRoundedIcon/>
                                </button>


                                <div className="chat-partner-avatar">

                                    {partnerImages[
                                        selectedPartner
                                        ] ? (

                                        <img
                                            src={
                                                partnerImages[
                                                    selectedPartner
                                                    ]
                                            }
                                            alt={
                                                selectedPartnerName
                                            }
                                        />

                                    ) : (

                                        <span>
                                            {
                                                selectedPartnerName
                                                    .charAt(0)
                                                    .toUpperCase()
                                            }
                                        </span>

                                    )}

                                </div>


                                <div className="chat-partner-info">

                                    <strong>
                                        {
                                            selectedPartnerName
                                        }
                                    </strong>


                                    {partnerTyping ? (

                                        <span className="chat-typing">
                                            typing...
                                        </span>

                                    ) : (

                                        <span
                                            className={
                                                partnerOnline === true
                                                    ? 'chat-partner-status online'
                                                    : 'chat-partner-status'
                                            }
                                        >

                                            <CircleRoundedIcon/>

                                            {
                                                partnerOnline === true
                                                    ? 'Online'
                                                    : partnerOnline === false ? 'Offline' : 'Status unavailable'
                                            }

                                        </span>

                                    )}

                                </div>
                                <BlockButton userName={selectedPartner} />

                            </header>


                            {/* ERROR */}

                            {error && (

                                <div className="chat-inline-error">
                                    {error}
                                </div>

                            )}


                            {/* MESSAGES */}

                            <section className="chat-messages">

                                {loading &&
                                activeChat.length ===
                                0 ? (

                                    <div className="chat-messages-loading">

                                        <div className="chat-state-spinner"/>

                                        Loading messages...

                                    </div>

                                ) : activeChat.length ===
                                0 ? (

                                    <div className="chat-empty-messages">

                                        <div className="chat-empty-icon">
                                            <ChatBubbleOutlineRoundedIcon/>
                                        </div>

                                        <strong>
                                            Start the conversation
                                        </strong>

                                        <span>
                                            Send a message to{' '}
                                            {
                                                selectedPartnerName
                                            }.
                                        </span>

                                    </div>

                                ) : (

                                    activeChat.map(
                                        (
                                            message,
                                            index
                                        ) => {

                                            const previousMessage =
                                                activeChat[
                                                index - 1
                                                    ];


                                            const showDate =
                                                index === 0 ||

                                                formatDate(
                                                    previousMessage
                                                        ?.timestamp
                                                ) !==
                                                formatDate(
                                                    message.timestamp
                                                );


                                            const isMine =
                                                message.sender ===
                                                userName;


                                            return (
                                                <React.Fragment
                                                    key={
                                                        `${message.id}-${index}`
                                                    }
                                                >

                                                    {showDate && (

                                                        <div className="chat-date-separator">

                                                            <span>
                                                                {
                                                                    formatDate(
                                                                        message.timestamp
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    )}


                                                    <div
                                                        className={
                                                            `chat-message-row ${
                                                                isMine
                                                                    ? 'sent'
                                                                    : 'received'
                                                            }`
                                                        }
                                                    >

                                                        <div className="chat-message-bubble">

                                                            <p>
                                                                {
                                                                    message.content
                                                                }
                                                            </p>


                                                            <div className="chat-message-meta">

                                                                <time>
                                                                    {
                                                                        formatTime(
                                                                            message.timestamp
                                                                        )
                                                                    }
                                                                </time>


                                                                {isMine && (

                                                                    <span className="chat-message-read">

                                                                        {
                                                                            message.isRead
                                                                                ? (
                                                                                    <DoneAllRoundedIcon/>
                                                                                )
                                                                                : (
                                                                                    <DoneRoundedIcon/>
                                                                                )
                                                                        }

                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </React.Fragment>
                                            );
                                        }
                                    )

                                )}


                                <div
                                    ref={
                                        messagesEndRef
                                    }
                                />

                            </section>


                            {/* MESSAGE COMPOSER */}

                            <footer className="chat-composer">

                                <div
                                    className="chat-emoji-wrapper"
                                    ref={
                                        emojiPickerRef
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            `chat-tool-button ${
                                                showEmojiPicker
                                                    ? 'active'
                                                    : ''
                                            }`
                                        }
                                        onClick={
                                            toggleEmojiPicker
                                        }
                                        aria-label="Emoji"
                                    >
                                        <SentimentSatisfiedAltRoundedIcon/>
                                    </button>


                                    {showEmojiPicker && (

                                        <div className="chat-emoji-picker">

                                            <EmojiPicker
                                                onEmojiClick={
                                                    handleEmojiClick
                                                }
                                                width={
                                                    300
                                                }
                                                height={
                                                    350
                                                }
                                                searchDisabled
                                                skinTonesDisabled
                                                previewConfig={{
                                                    showPreview:
                                                        false
                                                }}
                                                lazyLoadEmojis
                                            />

                                        </div>

                                    )}

                                </div>


                                <textarea
                                    ref={
                                        inputRef
                                    }
                                    value={
                                        newMessage
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="Write a message..."
                                    maxLength={4000}
                                    disabled={!selectedPartner}
                                    rows={1}
                                    className="chat-message-input"
                                />


                                <button
                                    type="button"
                                    className={
                                        `chat-send-button ${
                                            newMessage.trim() &&
                                            !sending
                                                ? 'active'
                                                : ''
                                        }`
                                    }
                                    onClick={
                                        sendMessage
                                    }
                                    disabled={
                                        !newMessage.trim() ||
                                        sending || !selectedPartner || !permitted(selectedPartner)
                                    }
                                    aria-label="Send message"
                                >
                                    <SendRoundedIcon/>
                                </button>

                            </footer>

                        </>

                    ) : (

                        /* =================================
                           NO CHAT SELECTED
                           ================================= */

                        <div className="chat-no-selection">

                            <div className="chat-no-selection-icon">
                                <ChatBubbleOutlineRoundedIcon/>
                            </div>


                            <span>
                                YOUR MESSAGES
                            </span>


                            <h2>
                                Select a conversation
                            </h2>


                            <p>
                                Chat becomes available after a connection request is accepted. Choose a connected person from your list.
                            </p>

                        </div>

                    )}

                </main>

            </div>

        </div>
    );
};

export default Chat;
