import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import './Chat.css';

import axios from 'axios';

import {
    jwtDecode
} from 'jwt-decode';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    Client
} from '@stomp/stompjs';

import SockJS from 'sockjs-client';

import EmojiPicker, {
    EmojiClickData
} from 'emoji-picker-react';


import ArrowBackRoundedIcon
    from '@mui/icons-material/ArrowBackRounded';

import SearchRoundedIcon
    from '@mui/icons-material/SearchRounded';

import SentimentSatisfiedAltRoundedIcon
    from '@mui/icons-material/SentimentSatisfiedAltRounded';

import SendRoundedIcon
    from '@mui/icons-material/SendRounded';

import DoneRoundedIcon
    from '@mui/icons-material/DoneRounded';

import DoneAllRoundedIcon
    from '@mui/icons-material/DoneAllRounded';

import ChatBubbleOutlineRoundedIcon
    from '@mui/icons-material/ChatBubbleOutlineRounded';

import CircleRoundedIcon
    from '@mui/icons-material/CircleRounded';


/* =========================================================
   TYPES
   ========================================================= */

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
    senderDisplayName: string;
    senderImage?: string;
    receiver: string;
    receiverDisplayName: string;
    receiverImage?: string;
    content: string;
    timestamp: number[] | string;
    isRead: boolean;
}


interface TypingNotificationDto {
    sender: string;
    receiver: string;
    typing: boolean;
}


interface NotificationDto {
    type: string;
    sender: string;
    receiver: string;
}


/* =========================================================
   API
   ========================================================= */

const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


/* =========================================================
   COMPONENT
   ========================================================= */

const Chat: React.FC = () => {

    const [
        chats,
        setChats
    ] = useState<UserChatDto[]>([]);


    const [
        activeChat,
        setActiveChat
    ] = useState<ChatMessageDto[]>([]);


    const [
        loading,
        setLoading
    ] = useState<boolean>(true);


    const [
        error,
        setError
    ] = useState<string | null>(null);


    const [
        userName,
        setUserName
    ] = useState<string>('');


    const [
        newMessage,
        setNewMessage
    ] = useState<string>('');


    const [
        selectedPartner,
        setSelectedPartner
    ] = useState<string | null>(null);


    const [
        partnerTyping,
        setPartnerTyping
    ] = useState<boolean>(false);


    const [
        stompClient,
        setStompClient
    ] = useState<Client | null>(null);


    const [
        showMobileConversationList,
        setShowMobileConversationList
    ] = useState<boolean>(true);


    const [
        partnerImages,
        setPartnerImages
    ] = useState<Record<string, string>>({});


    const [
        showEmojiPicker,
        setShowEmojiPicker
    ] = useState<boolean>(false);


    const [
        conversationSearch,
        setConversationSearch
    ] = useState<string>('');


    const messagesEndRef =
        useRef<HTMLDivElement>(null);


    const inputRef =
        useRef<HTMLTextAreaElement>(null);


    const emojiPickerRef =
        useRef<HTMLDivElement>(null);


    const navigate =
        useNavigate();


    /*
     * IMPORTANT:
     *
     * RoutesConfig.tsx:
     *
     * /chat/:userName
     *
     * URL parameter-ը userName է,
     * բայց Chat component-ի ներսում այն օգտագործում ենք
     * partnerUsername անունով։
     */
    const {
        userName: partnerUsername
    } = useParams<{
        userName: string;
    }>();


    const token =
        localStorage.getItem('token');


    /* =====================================================
       TIMESTAMP
       ===================================================== */

    const parseTimestamp =
        (
            timestamp:
                number[] |
                string
        ): Date => {

            if (!timestamp) {
                return new Date();
            }


            if (
                Array.isArray(timestamp) &&
                timestamp.length >= 6
            ) {
                return new Date(
                    timestamp[0],
                    timestamp[1] - 1,
                    timestamp[2],
                    timestamp[3],
                    timestamp[4],
                    timestamp[5]
                );
            }


            if (
                typeof timestamp ===
                'string'
            ) {
                try {
                    const date =
                        new Date(timestamp);


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {
                        return date;
                    }


                    if (
                        /^\d+$/.test(
                            timestamp
                        )
                    ) {
                        const epochDate =
                            new Date(
                                parseInt(
                                    timestamp,
                                    10
                                )
                            );


                        if (
                            !isNaN(
                                epochDate.getTime()
                            )
                        ) {
                            return epochDate;
                        }
                    }

                } catch {
                    return new Date();
                }
            }


            return new Date();
        };


    const formatTime =
        (
            timestamp:
                number[] |
                string
        ): string => {

            const date =
                parseTimestamp(
                    timestamp
                );


            return date.toLocaleTimeString(
                [],
                {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }
            );
        };


    const formatDate =
        (
            timestamp:
                number[] |
                string
        ): string => {

            const date =
                parseTimestamp(
                    timestamp
                );


            const today =
                new Date();


            const yesterday =
                new Date(today);


            yesterday.setDate(
                yesterday.getDate() - 1
            );


            if (
                date.toDateString() ===
                today.toDateString()
            ) {
                return 'Today';
            }


            if (
                date.toDateString() ===
                yesterday.toDateString()
            ) {
                return 'Yesterday';
            }


            return date.toLocaleDateString(
                [],
                {
                    month: 'short',
                    day: 'numeric'
                }
            );
        };


    /* =====================================================
       SCROLL
       ===================================================== */

    const scrollToBottom =
        useCallback(() => {

            setTimeout(() => {

                messagesEndRef
                    .current
                    ?.scrollIntoView({
                        behavior: 'smooth'
                    });

            }, 100);

        }, []);


    /* =====================================================
       PARTNER IMAGE
       ===================================================== */

    const fetchPartnerImage =
        useCallback(
            async (
                username: string
            ) => {

                if (
                    !username ||
                    !token
                ) {
                    return;
                }


                try {
                    const response =
                        await axios.get(
                            `${API_URL}/api/public/user/image/${username}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                },

                                responseType:
                                    'blob'
                            }
                        );


                    const imageUrl =
                        URL.createObjectURL(
                            response.data
                        );


                    setPartnerImages(
                        previous => {

                            if (
                                previous[
                                    username
                                    ]
                            ) {
                                URL.revokeObjectURL(
                                    imageUrl
                                );

                                return previous;
                            }


                            return {
                                ...previous,

                                [username]:
                                imageUrl
                            };
                        }
                    );

                } catch (error) {

                    console.error(
                        'Error fetching partner image:',
                        error
                    );


                    setPartnerImages(
                        previous => ({
                            ...previous,

                            [username]:
                                ''
                        })
                    );
                }
            },
            [token]
        );


    /* =====================================================
       MARK AS READ
       ===================================================== */

    const markMessagesAsRead =
        useCallback(
            async (
                partner: string
            ) => {

                if (
                    !userName ||
                    !token
                ) {
                    return;
                }


                try {
                    await axios.post(
                        `${API_URL}/api/public/chat/read/${partner}/${userName}`,
                        null,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                    setChats(
                        previous =>
                            previous.map(
                                chat =>
                                    chat.partnerUsername ===
                                    partner

                                        ? {
                                            ...chat,

                                            unreadCount:
                                                0
                                        }

                                        : chat
                            )
                    );

                } catch (error) {

                    console.error(
                        'Error marking messages as read:',
                        error
                    );
                }
            },
            [
                token,
                userName
            ]
        );


    /* =====================================================
       LOAD CHAT HISTORY
       ===================================================== */

    const loadChatHistory =
        useCallback(
            async (
                partner: string
            ) => {

                if (
                    !partner ||
                    !userName ||
                    !token
                ) {
                    return;
                }


                try {
                    setLoading(true);
                    setError(null);


                    const response =
                        await axios.get<ChatMessageDto[]>(
                            `${API_URL}/api/public/chat/history/${userName}/${partner}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setActiveChat(
                        response.data || []
                    );


                    await markMessagesAsRead(
                        partner
                    );


                    scrollToBottom();


                    window.dispatchEvent(
                        new CustomEvent(
                            'chatOpened'
                        )
                    );

                } catch (error) {

                    console.error(
                        'Error loading chat history:',
                        error
                    );


                    setError(
                        'Failed to load messages.'
                    );

                } finally {
                    setLoading(false);
                }
            },
            [
                markMessagesAsRead,
                scrollToBottom,
                token,
                userName
            ]
        );


    /* =====================================================
       INCOMING MESSAGE
       ===================================================== */

    const handleIncomingMessage =
        useCallback(
            (
                receivedMessage:
                    ChatMessageDto
            ) => {

                const belongsToActiveChat =
                    selectedPartner &&
                    (
                        receivedMessage.sender ===
                        selectedPartner ||

                        receivedMessage.receiver ===
                        selectedPartner
                    );


                if (
                    belongsToActiveChat
                ) {
                    setActiveChat(
                        previous => {

                            const exists =
                                previous.some(
                                    message =>
                                        message.id ===
                                        receivedMessage.id
                                );


                            if (exists) {
                                return previous;
                            }


                            return [
                                ...previous,
                                receivedMessage
                            ];
                        }
                    );


                    scrollToBottom();


                    if (
                        receivedMessage.sender ===
                        selectedPartner
                    ) {
                        markMessagesAsRead(
                            selectedPartner
                        );
                    }
                }


                setChats(
                    previous =>
                        previous.map(
                            chat => {

                                const belongsToConversation =
                                    chat.partnerUsername ===
                                    receivedMessage.sender ||

                                    chat.partnerUsername ===
                                    receivedMessage.receiver;


                                if (
                                    !belongsToConversation
                                ) {
                                    return chat;
                                }


                                return {
                                    ...chat,

                                    lastMessage:
                                    receivedMessage.content,

                                    lastMessageTime:
                                        parseTimestamp(
                                            receivedMessage.timestamp
                                        ).toISOString(),

                                    unreadCount:
                                        chat.partnerUsername ===
                                        selectedPartner

                                            ? 0

                                            : chat.unreadCount +
                                            (
                                                receivedMessage.sender !==
                                                userName
                                                    ? 1
                                                    : 0
                                            )
                                };
                            }
                        )
                );
            },
            [
                markMessagesAsRead,
                scrollToBottom,
                selectedPartner,
                userName
            ]
        );


    /* =====================================================
       WEBSOCKET
       ===================================================== */

    useEffect(() => {

        if (
            !token ||
            !userName
        ) {
            return;
        }


        const socketFactory =
            () =>
                new SockJS(
                    `${API_URL}/ws`
                );


        const client =
            new Client({

                webSocketFactory:
                socketFactory,

                connectHeaders: {
                    Authorization:
                        `Bearer ${token}`
                },

                reconnectDelay:
                    5000,

                heartbeatIncoming:
                    4000,

                heartbeatOutgoing:
                    4000
            });


        client.onConnect =
            () => {

                setStompClient(
                    client
                );


                /* PRIVATE MESSAGES */

                client.subscribe(
                    '/user/queue/messages',
                    message => {

                        const receivedMessage:
                            ChatMessageDto =
                            JSON.parse(
                                message.body
                            );


                        handleIncomingMessage(
                            receivedMessage
                        );
                    }
                );


                /* PUBLIC MESSAGES */

                client.subscribe(
                    '/topic/public',
                    message => {

                        const receivedMessage:
                            ChatMessageDto =
                            JSON.parse(
                                message.body
                            );


                        if (
                            receivedMessage.sender !==
                            userName
                        ) {
                            handleIncomingMessage(
                                receivedMessage
                            );
                        }
                    }
                );


                /* TYPING */

                client.subscribe(
                    '/user/queue/typing',
                    message => {

                        const typingUpdate:
                            TypingNotificationDto =
                            JSON.parse(
                                message.body
                            );


                        if (
                            typingUpdate.sender ===
                            selectedPartner
                        ) {
                            setPartnerTyping(
                                typingUpdate.typing
                            );


                            if (
                                typingUpdate.typing
                            ) {
                                window.setTimeout(
                                    () =>
                                        setPartnerTyping(
                                            false
                                        ),
                                    2000
                                );
                            }
                        }
                    }
                );


                /* NOTIFICATIONS */

                client.subscribe(
                    '/user/queue/notifications',
                    message => {

                        const notification:
                            NotificationDto =
                            JSON.parse(
                                message.body
                            );


                        if (
                            notification.type ===
                            'reload' &&

                            notification.receiver ===
                            userName
                        ) {
                            if (
                                !window.location.pathname.includes(
                                    `/chat/${notification.sender}`
                                )
                            ) {
                                navigate(
                                    `/chat/${notification.sender}`
                                );
                            }
                        }
                    }
                );
            };


        client.onStompError =
            frame => {

                console.error(
                    'WebSocket error:',
                    frame.headers[
                        'message'
                        ]
                );


                setError(
                    'Connection error. Please refresh the page.'
                );
            };


        client.onWebSocketClose =
            () => {
                setStompClient(
                    null
                );
            };


        client.activate();


        return () => {

            setStompClient(
                null
            );


            client.deactivate();

        };

    }, [
        token,
        userName,
        navigate,
        selectedPartner,
        handleIncomingMessage
    ]);


    /* =====================================================
       CURRENT USER
       ===================================================== */

    useEffect(() => {

        const fetchUserData =
            async () => {

                try {
                    if (!token) {
                        navigate(
                            '/login',
                            {
                                replace: true
                            }
                        );

                        return;
                    }


                    const decodedToken =
                        jwtDecode<{
                            sub: string;
                        }>(token);


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


                    setUserName(
                        response.data
                    );

                } catch (error) {

                    console.error(
                        'Error fetching user data:',
                        error
                    );


                    setError(
                        'Failed to load user information.'
                    );


                    setLoading(false);
                }
            };


        fetchUserData();

    }, [
        navigate,
        token
    ]);


    /* =====================================================
       CONVERSATIONS
       ===================================================== */

    useEffect(() => {

        const fetchConversations =
            async () => {

                if (
                    !userName ||
                    !token
                ) {
                    return;
                }


                try {
                    setError(null);


                    const response =
                        await axios.get<UserChatDto[]>(
                            `${API_URL}/api/public/chat/conversations/${userName}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const conversationData =
                        response.data || [];


                    setChats(
                        conversationData
                    );


                    conversationData.forEach(
                        chat => {

                            fetchPartnerImage(
                                chat.partnerUsername
                            );
                        }
                    );


                    /*
                     * Եթե URL-ը օրինակ
                     * /chat/anna է,
                     *
                     * partnerUsername = anna
                     */
                    if (
                        partnerUsername
                    ) {
                        setSelectedPartner(
                            partnerUsername
                        );


                        fetchPartnerImage(
                            partnerUsername
                        );


                        await loadChatHistory(
                            partnerUsername
                        );


                        setShowMobileConversationList(
                            false
                        );
                    }

                } catch (error) {

                    console.error(
                        'Error fetching conversations:',
                        error
                    );


                    setError(
                        'Failed to load conversations.'
                    );

                } finally {
                    setLoading(false);
                }
            };


        fetchConversations();

    }, [
        fetchPartnerImage,
        loadChatHistory,
        partnerUsername,
        token,
        userName
    ]);


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    const sendMessage =
        () => {

            const messageContent =
                newMessage.trim();


            if (
                !messageContent ||
                !selectedPartner ||
                !userName ||
                !stompClient ||
                !stompClient.connected
            ) {
                return;
            }


            const tempId =
                Date.now();


            const tempMessage:
                ChatMessageDto = {

                id:
                tempId,

                sender:
                userName,

                senderDisplayName:
                userName,

                receiver:
                selectedPartner,

                receiverDisplayName:
                selectedPartner,

                content:
                messageContent,

                timestamp:
                    new Date()
                        .toISOString(),

                isRead:
                    false
            };


            setActiveChat(
                previous => [
                    ...previous,
                    tempMessage
                ]
            );


            setChats(
                previous =>
                    previous.map(
                        chat =>
                            chat.partnerUsername ===
                            selectedPartner

                                ? {
                                    ...chat,

                                    lastMessage:
                                    messageContent,

                                    lastMessageTime:
                                        new Date()
                                            .toISOString()
                                }

                                : chat
                    )
            );


            setNewMessage('');
            setShowEmojiPicker(false);

            scrollToBottom();


            try {
                stompClient.publish({
                    destination:
                        '/app/chat.send',

                    body:
                        JSON.stringify({
                            sender:
                            userName,

                            receiver:
                            selectedPartner,

                            content:
                            messageContent
                        }),

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                });


                stompClient.publish({
                    destination:
                        '/topic/public',

                    body:
                        JSON.stringify(
                            tempMessage
                        ),

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                });

            } catch (error) {

                console.error(
                    'Error sending message:',
                    error
                );


                setError(
                    'Failed to send message.'
                );


                setActiveChat(
                    previous =>
                        previous.filter(
                            message =>
                                message.id !==
                                tempId
                        )
                );
            }
        };


    /* =====================================================
       MESSAGE INPUT
       ===================================================== */

    const handleKeyDown =
        (
            event:
                React.KeyboardEvent<HTMLTextAreaElement>
        ) => {

            if (
                event.key ===
                'Enter' &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage();
            }
        };


    const handleInputChange =
        (
            event:
                React.ChangeEvent<HTMLTextAreaElement>
        ) => {

            const value =
                event.target.value;


            setNewMessage(
                value
            );


            if (
                stompClient?.connected &&
                selectedPartner
            ) {
                stompClient.publish({
                    destination:
                        '/app/typing',

                    body:
                        JSON.stringify({
                            sender:
                            userName,

                            receiver:
                            selectedPartner,

                            typing:
                                Boolean(
                                    value.trim()
                                )
                        }),

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                });
            }
        };


    /* =====================================================
       SELECT CHAT
       ===================================================== */

    const selectChat =
        (
            partner: string
        ) => {

            setSelectedPartner(
                partner
            );


            setActiveChat([]);


            setPartnerTyping(
                false
            );


            setShowEmojiPicker(
                false
            );


            setShowMobileConversationList(
                false
            );


            /*
             * Route-ը փոխում ենք,
             * իսկ history-ն URL փոփոխությունից հետո
             * useEffect-ը կբեռնի։
             */
            navigate(
                `/chat/${partner}`
            );
        };


    /* =====================================================
       MOBILE
       ===================================================== */

    const toggleConversationList =
        () => {

            setShowMobileConversationList(
                previous =>
                    !previous
            );


            setShowEmojiPicker(
                false
            );
        };


    /* =====================================================
       EMOJI
       ===================================================== */

    const toggleEmojiPicker =
        () => {

            setShowEmojiPicker(
                previous =>
                    !previous
            );
        };


    const handleEmojiClick =
        (
            emojiData:
                EmojiClickData
        ) => {

            setNewMessage(
                previous =>
                    previous +
                    emojiData.emoji
            );


            inputRef
                .current
                ?.focus();
        };


    useEffect(() => {

        const handleClickOutside =
            (
                event:
                    MouseEvent
            ) => {

                if (
                    emojiPickerRef.current &&
                    !emojiPickerRef.current.contains(
                        event.target as Node
                    )
                ) {
                    setShowEmojiPicker(
                        false
                    );
                }
            };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);


    /* =====================================================
       IMAGE CLEANUP
       ===================================================== */

    useEffect(() => {

        return () => {

            Object.values(
                partnerImages
            ).forEach(
                imageUrl => {

                    if (
                        imageUrl.startsWith(
                            'blob:'
                        )
                    ) {
                        URL.revokeObjectURL(
                            imageUrl
                        );
                    }
                }
            );

        };

    }, [partnerImages]);


    /* =====================================================
       FILTER CONVERSATIONS
       ===================================================== */

    const filteredChats =
        chats.filter(
            chat => {

                const query =
                    conversationSearch
                        .trim()
                        .toLowerCase();


                if (!query) {
                    return true;
                }


                return (
                    chat.partnerName
                        ?.toLowerCase()
                        .includes(query) ||

                    chat.partnerUsername
                        ?.toLowerCase()
                        .includes(query)
                );
            }
        );


    /* =====================================================
       SELECTED USER
       ===================================================== */

    const selectedChat =
        chats.find(
            chat =>
                chat.partnerUsername ===
                selectedPartner
        );


    const selectedPartnerName =
        selectedChat?.partnerName ||
        selectedPartner ||
        'Conversation';


    /* =====================================================
       LOADING
       ===================================================== */

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
                                        : 'Your conversations will appear here.'
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
                                                stompClient?.connected
                                                    ? 'chat-partner-status online'
                                                    : 'chat-partner-status'
                                            }
                                        >

                                            <CircleRoundedIcon/>

                                            {
                                                stompClient?.connected
                                                    ? 'Online'
                                                    : 'Offline'
                                            }

                                        </span>

                                    )}

                                </div>

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
                                    rows={1}
                                    className="chat-message-input"
                                />


                                <button
                                    type="button"
                                    className={
                                        `chat-send-button ${
                                            newMessage.trim() &&
                                            stompClient?.connected
                                                ? 'active'
                                                : ''
                                        }`
                                    }
                                    onClick={
                                        sendMessage
                                    }
                                    disabled={
                                        !newMessage.trim() ||
                                        !stompClient?.connected
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
                                Choose someone from your
                                conversation list to start
                                messaging.
                            </p>

                        </div>

                    )}

                </main>

            </div>

        </div>
    );
};

export default Chat;
