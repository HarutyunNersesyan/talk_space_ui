import React, {useEffect, useState, useRef, useCallback} from 'react';
import './Chat.css';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import {useNavigate, useParams} from 'react-router-dom';
import {FiSend, FiPaperclip, FiSmile, FiChevronLeft} from 'react-icons/fi';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {IoMdSend} from 'react-icons/io';
import {BsCheck2All, BsCheck2} from 'react-icons/bs';
import EmojiPicker, {EmojiClickData} from 'emoji-picker-react';

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
    timestamp: string;
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

const emojis = [

    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
    "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
    "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
    "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓",
    "🫣", "🤗", "🫡", "🤔", "🫢", "🤭", "🤫", "🤥", "😶", "😶‍🌫️",
    "😐", "😑", "😬", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲",
    "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢",
    "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹",
    "👺", "🤡", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻",
    "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "💋", "💌",
    "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔",
    "❤️‍🔥", "❤️‍🩹", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤",
    "🤍", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬",
    "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "👋", "🤚", "🖐️", "✋", "🖖",
    "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
    "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜",
    "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪",
    "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁",
    "🦷", "🦴", "👀", "👁️", "👅", "👄", "👶", "🧒", "👦", "👧",
    "🧑", "👱", "👨", "🧔", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩", "👩‍🦰",
    "👩‍🦱", "👩‍🦳", "👩‍🦲", "🧓", "👴", "👵", "🙍", "🙎", "🙅", "🙆",
    "💁", "🙋", "🧏", "🙇", "🤦", "🤷", "👮", "🕵️", "💂", "🥷",
    "👷", "🤴", "👸", "👳", "👲", "🧕", "🤵", "👰", "🤰", "🤱",
    "👼", "🎅", "🤶", "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝",
    "🧞", "🧟", "💆", "💇", "🚶", "🧍", "🧎", "🏃", "💃", "🕺",
    "🕴️", "👯", "🧖", "🧗", "🤺", "🏇", "⛷️", "🏂", "🏌️", "🏄",
    "🚣", "🏊", "⛹️", "🏋️", "🚴", "🚵", "🤸", "🤼", "🤽", "🤾",
    "🤹", "🧘", "🛀", "🛌", "👭", "👫", "👬", "💏", "💑", "👪",
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
        "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
        "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
        "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞",
        "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢",
        "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡",
        "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓",
        "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘",
        "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐",
        "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🐓", "🦃",
        "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦫",
        "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🌵", "🎄", "🌲", "🌳",
        "🌴", "🪵", "🌱", "🌿", "☘️", "🍀", "🎍", "🪴", "🎋", "🍃",
        "🍂", "🍁", "🍄", "🐚", "🪨", "🌾", "💐", "🌷", "🌹", "🥀",
        "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕",
        "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍",
        "🌏", "🪐", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥",
        "🌪️", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️",
        "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "💧", "💦", "☔",
        "☂️", "🌊", "🌫️",
        "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
        "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
        "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅",
        "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
        "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔",
        "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗",
        "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟",
        "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡",
        "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬",
        "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "🫖",
        "☕", "🍵", "🧃", "🥤", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃",
        "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽️", "🥣", "🥡",
        "🥢", "🧂", "🫙",
        "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
        "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
        "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
        "⛸️", "🥌", "🎯", "🪂", "🎱", "🎮", "🕹️", "🎰", "🎲", "🧩",
        "♟️", "🀄", "🎴", "🎭", "🖼️", "🎨", "🧵", "🪡", "🧶", "🪢",
        "👓", "🕶️", "🥽", "🥼", "🦺", "👔", "👕", "👖", "🧣", "🧤",
        "🧥", "🧦", "👗", "👘", "🥻", "🩱", "🩲", "🩳", "👙", "👚",
        "👛", "👜", "👝", "🛍️", "🎒", "🩴", "👞", "👟", "🥾", "🥿",
        "👠", "👡", "🩰", "👢", "👑", "👒", "🎩", "🎓", "🧢", "🪖",
        "💄", "💍", "💼", "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
        "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵",
        "🏍️", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟",
        "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
        "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸",
        "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝",
        "🚧", "⛽", "🚏", "🚦", "🚥", "🗺️", "🗿", "🗽", "🗼", "🏰",
        "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️",
        "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️",
        "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨",
        "🏪", "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🛕", "🕍", "⛩️",
        "🕋", "⛲", "⛺", "🌁", "🌃", "🏙️", "🌄", "🌅", "🌆", "🌇",
        "🌉", "♨️", "🎠", "🎡", "🎢", "💈", "🎪", "🚂", "🚃", "🚄",
        "🚅", "🚆", "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌",
        "🚍", "🚎", "🚐", "🚑", "🚒", "🚓", "🚔", "🚕", "🚖", "🚗",
        "🚘", "🚙", "🚚", "🚛", "🚜", "🚲", "🛴", "🛵", "🏍️", "🛺",
        "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋",
        "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉",
        "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶",
        "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝", "🚧", "⛽",
        "🚏", "🚦", "🚥", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️",
        "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️",
        "🏔️", "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️", "🏚️", "🏗️",
        "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫",
        "🏩", "💒", "🏛️", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲",
        "⛺", "🌁", "🌃", "🏙️", "🌄", "🌅", "🌆", "🌇", "🌉", "♨️",
        "🎠", "🎡", "🎢", "💈", "🎪", "🚂", "🚃", "🚄", "🚅", "🚆",
        "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌", "🚍", "🚎",
        "🚐", "🚑", "🚒", "🚓", "🚔", "🚕", "🚖", "🚗", "🚘", "🚙",
        "🚚", "🚛", "🚜", "🚲", "🛴", "🛵", "🏍️", "🛺", "🚨", "🚔",
        "🏳️", "🏴", "🏴‍☠️", "🏁", "🚩", "🎌",  "🏳️‍⚧️",
        "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬",
        "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧",
        "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷",
        "🇮🇴", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇨🇻", "🇰🇭", "🇨🇲", "🇨🇦",
        "🇮🇨", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇽", "🇨🇨", "🇨🇴", "🇰🇲", "🇨🇬",
        "🇨🇩", "🇨🇰", "🇨🇷", "🇨🇮", "🇭🇷", "🇨🇺", "🇨🇼", "🇨🇾", "🇨🇿", "🇩🇰",
        "🇩🇯", "🇩🇲", "🇩🇴", "🇪🇨", "🇪🇬", "🇸🇻", "🇬🇶", "🇪🇷", "🇪🇪", "🇪🇹",
        "🇪🇺", "🇫🇰", "🇫🇴", "🇫🇯", "🇫🇮", "🇫🇷", "🇬🇫", "🇵🇫", "🇹🇫", "🇬🇦",
        "🇬🇲", "🇬🇪", "🇩🇪", "🇬🇭", "🇬🇮", "🇬🇷", "🇬🇱", "🇬🇩", "🇬🇵", "🇬🇺",
        "🇬🇹", "🇬🇬", "🇬🇳", "🇬🇼", "🇬🇾", "🇭🇹", "🇭🇳", "🇭🇰", "🇭🇺", "🇮🇸",
        "🇮🇳", "🇮🇩", "🇮🇷", "🇮🇶", "🇮🇪", "🇮🇲", "🇮🇱", "🇮🇹", "🇯🇲", "🇯🇵",
        "🇯🇪", "🇯🇴", "🇰🇿", "🇰🇪", "🇰🇮", "🇽🇰", "🇰🇼", "🇰🇬", "🇱🇦", "🇱🇻",
        "🇱🇧", "🇱🇸", "🇱🇷", "🇱🇾", "🇱🇮", "🇱🇹", "🇱🇺", "🇲🇴", "🇲🇰", "🇲🇬",
        "🇲🇼", "🇲🇾", "🇲🇻", "🇲🇱", "🇲🇹", "🇲🇭", "🇲🇶", "🇲🇷", "🇲🇺", "🇾🇹",
        "🇲🇽", "🇫🇲", "🇲🇩", "🇲🇨", "🇲🇳", "🇲🇪", "🇲🇸", "🇲🇦", "🇲🇿", "🇲🇲",
        "🇳🇦", "🇳🇷", "🇳🇵", "🇳🇱", "🇳🇨", "🇳🇿", "🇳🇮", "🇳🇪", "🇳🇬", "🇳🇺",
        "🇳🇫", "🇰🇵", "🇲🇵", "🇳🇴", "🇴🇲", "🇵🇰", "🇵🇼", "🇵🇸", "🇵🇦", "🇵🇬",
        "🇵🇾", "🇵🇪", "🇵🇭", "🇵🇳", "🇵🇱", "🇵🇹", "🇵🇷", "🇶🇦", "🇷🇪", "🇷🇴",
        "🇷🇺", "🇷🇼", "🇼🇸", "🇸🇲", "🇸🇦", "🇸🇳", "🇷🇸", "🇸🇨", "🇸🇱", "🇸🇬",
        "🇸🇽", "🇸🇰", "🇸🇮", "🇸🇸", "🇿🇦", "🇰🇷", "🇪🇸", "🇱🇰", "🇧🇱", "🇸🇭",
        "🇰🇳", "🇱🇨", "🇵🇲", "🇻🇨", "🇸🇩", "🇸🇷", "🇸🇿", "🇸🇪", "🇨🇭", "🇸🇾",
        "🇹🇼", "🇹🇯", "🇹🇿", "🇹🇭", "🇹🇱", "🇹🇬", "🇹🇰", "🇹🇴", "🇹🇹", "🇹🇳",
        "🇹🇷", "🇹🇲", "🇹🇨", "🇹🇻", "🇻🇮", "🇺🇬", "🇺🇦", "🇦🇪", "🇬🇧", "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "🇺🇸", "🇺🇾", "🇺🇿", "🇻🇺", "🇻🇦", "🇻🇪",
        "🇻🇳", "🇼🇫", "🇪🇭", "🇾🇪", "🇿🇲", "🇿🇼"

]
;

const Chat: React.FC = () => {
    const [chats, setChats] = useState<UserChatDto[]>([]);
    const [activeChat, setActiveChat] = useState<ChatMessageDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [newMessage, setNewMessage] = useState<string>('');
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [partnerTyping, setPartnerTyping] = useState<boolean>(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [showMobileConversationList, setShowMobileConversationList] = useState(true);
    const [partnerImages, setPartnerImages] = useState<Record<string, string>>({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const {partnerUsername} = useParams();
    const token = localStorage.getItem('token');

    const parseTimestamp = (timestamp: string): Date => {
        if (!timestamp) return new Date();

        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) return date;

            if (/^\d+$/.test(timestamp)) {
                const epochDate = new Date(parseInt(timestamp));
                if (!isNaN(epochDate.getTime())) return epochDate;
            }

            return new Date();
        } catch {
            return new Date();
        }
    };

    const formatTime = (timestamp: string): string => {
        const date = parseTimestamp(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp: string): string => {
        const date = parseTimestamp(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleIncomingMessage = (receivedMessage: ChatMessageDto) => {
        if (selectedPartner &&
            (receivedMessage.sender === selectedPartner ||
                receivedMessage.receiver === selectedPartner)) {
            setActiveChat(prev => [...prev, receivedMessage]);
            scrollToBottom();
        }

        setChats(prev => prev.map(chat =>
            chat.partnerUsername === receivedMessage.sender ||
            chat.partnerUsername === receivedMessage.receiver
                ? {
                    ...chat,
                    lastMessage: receivedMessage.content,
                    lastMessageTime: receivedMessage.timestamp,
                    unreadCount: receivedMessage.sender === userName ||
                    chat.partnerUsername !== selectedPartner
                        ? chat.unreadCount + 1
                        : 0
                }
                : chat
        ));
    };

    const setupWebSocket = useCallback(() => {
        if (!token || !userName) return;

        const socketFactory = () => new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: socketFactory,
            connectHeaders: {Authorization: `Bearer ${token}`},
            debug: (str) => console.log('STOMP: ', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('WebSocket Connected');
            setStompClient(client);

            client.subscribe(`/user/queue/messages`, (message) => {
                const receivedMessage: ChatMessageDto = JSON.parse(message.body);
                handleIncomingMessage(receivedMessage);
            });

            client.subscribe(`/user/queue/typing`, (message) => {
                const typingUpdate: TypingNotificationDto = JSON.parse(message.body);
                if (typingUpdate.sender === selectedPartner) {
                    setPartnerTyping(typingUpdate.typing);
                    setTimeout(() => setPartnerTyping(false), 2000);
                }
            });

            client.subscribe(`/user/queue/notifications`, (message) => {
                const notification: NotificationDto = JSON.parse(message.body);
                if (notification.type === 'reload' && notification.receiver === userName) {
                    if (!window.location.pathname.includes(`/chat/${notification.sender}`)) {
                        navigate(`/chat/${notification.sender}`);
                        window.location.reload();
                    }
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            setError('Connection error. Please refresh the page.');
        };

        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [token, userName, navigate, selectedPartner]);

    useEffect(() => {
        const cleanup = setupWebSocket();
        return cleanup;
    }, [setupWebSocket]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!token) throw new Error('No token found');
                const decodedToken = jwtDecode<{ sub: string }>(token);
                const response = await axios.get(
                    `http://localhost:8080/api/public/user/get/userName/${decodedToken.sub}`,
                    {headers: {Authorization: `Bearer ${token}`}}
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

    const fetchPartnerImage = async (username: string) => {
        try {
            if (partnerImages[username]) return;

            const response = await axios.get(
                `http://localhost:8080/api/public/user/image/${username}`,
                {
                    headers: {Authorization: `Bearer ${token}`},
                    responseType: 'blob'
                }
            );
            const imageUrl = URL.createObjectURL(response.data);
            setPartnerImages(prev => ({...prev, [username]: imageUrl}));
        } catch (err) {
            console.error('Error fetching partner image:', err);
            setPartnerImages(prev => ({...prev, [username]: ''}));
        }
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                if (!userName) return;
                const response = await axios.get(
                    `http://localhost:8080/api/public/chat/conversations/${userName}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                );
                setChats(response.data);

                response.data.forEach((chat: UserChatDto) => {
                    fetchPartnerImage(chat.partnerUsername);
                });

                if (partnerUsername) {
                    setSelectedPartner(partnerUsername);
                    loadChatHistory(partnerUsername);
                    setShowMobileConversationList(false);
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

    const loadChatHistory = async (partner: string) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/public/chat/history/${userName}/${partner}`,
                {headers: {Authorization: `Bearer ${token}`}}
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

    const markMessagesAsRead = async (partner: string) => {
        try {
            await axios.post(
                `http://localhost:8080/api/public/chat/read/${partner}/${userName}`,
                null,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            setChats(prev => prev.map(chat =>
                chat.partnerUsername === partner
                    ? {...chat, unreadCount: 0}
                    : chat
            ));
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedPartner || !userName || !stompClient) return;

        const tempId = Date.now();
        const tempMessage: ChatMessageDto = {
            id: tempId,
            sender: userName,
            senderDisplayName: userName,
            receiver: selectedPartner,
            receiverDisplayName: selectedPartner,
            content: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        setActiveChat(prev => [...prev, tempMessage]);
        setNewMessage('');
        scrollToBottom();
        setShowEmojiPicker(false);

        try {
            await stompClient.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({
                    sender: userName,
                    receiver: selectedPartner,
                    content: newMessage
                }),
                headers: {Authorization: `Bearer ${token}`}
            });
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
            setActiveChat(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);
        setIsTyping(!!value);

        if (stompClient && selectedPartner) {
            stompClient.publish({
                destination: '/app/typing',
                body: JSON.stringify({
                    sender: userName,
                    receiver: selectedPartner,
                    typing: !!value
                }),
                headers: {Authorization: `Bearer ${token}`}
            });
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        }, 100);
    };

    const selectChat = (partner: string) => {
        setSelectedPartner(partner);
        loadChatHistory(partner);
        navigate(`/chat/${partner}`);
        setShowMobileConversationList(false);
        setShowEmojiPicker(false);
    };

    const toggleConversationList = () => {
        setShowMobileConversationList(!showMobileConversationList);
        setShowEmojiPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (loading && !activeChat.length) {
        return <div className="chat-loading">Loading chats...</div>;
    }

    if (error) {
        return <div className="chat-error">{error}</div>;
    }

    return (
        <div className="chat-app">
            <div className={`conversation-list ${showMobileConversationList ? 'mobile-show' : 'mobile-hide'}`}>
                <div className="conversation-header">
                    <h2>Messages</h2>
                    <div className="connection-status-container">
                        {stompClient?.connected ? (
                            <span className="connection-status connected">Online</span>
                        ) : (
                            <span className="connection-status disconnected">Offline</span>
                        )}
                    </div>
                </div>
                <div className="conversation-items">
                    {chats.length === 0 ? (
                        <div className="no-chats">No conversations yet</div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.partnerUsername}
                                className={`conversation-item ${selectedPartner === chat.partnerUsername ? 'active' : ''}`}
                                onClick={() => selectChat(chat.partnerUsername)}
                            >
                                <div className="avatar">
                                    {partnerImages[chat.partnerUsername] ? (
                                        <img
                                            src={partnerImages[chat.partnerUsername]}
                                            alt={chat.partnerName}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
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
                                            {formatTime(chat.lastMessageTime)}
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

            <div className={`chat-area ${!showMobileConversationList ? 'mobile-show' : 'mobile-hide'}`}>
                {selectedPartner ? (
                    <>
                        <div className="chat-header">
                            <button className="mobile-back-button" onClick={toggleConversationList}>
                                <FiChevronLeft size={24}/>
                            </button>
                            <div className="partner-info">
                                <div className="avatar">
                                    {partnerImages[selectedPartner] ? (
                                        <img
                                            src={partnerImages[selectedPartner]}
                                            alt={chats.find(c => c.partnerUsername === selectedPartner)?.partnerName}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="default-avatar">
                                            {chats.find(c => c.partnerUsername === selectedPartner)?.partnerName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="partner-details">
                                    <h3>{chats.find(c => c.partnerUsername === selectedPartner)?.partnerName}</h3>
                                    {partnerTyping ? (
                                        <span className="typing-indicator">typing...</span>
                                    ) : (
                                        <span className="status-indicator">
                                            {stompClient?.connected ? 'online' : 'offline'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="messages">
                            {activeChat.length === 0 ? (
                                <div className="empty">No messages yet</div>
                            ) : (
                                activeChat.map((message, index) => {
                                    const showDate = index === 0 ||
                                        formatDate(activeChat[index - 1]?.timestamp) !== formatDate(message.timestamp);

                                    return (
                                        <React.Fragment key={message.id}>
                                            {showDate && (
                                                <div className="message-date">
                                                    {formatDate(message.timestamp)}
                                                </div>
                                            )}
                                            <div
                                                className={`message ${message.sender === userName ? 'sent' : 'received'}`}>
                                                <div className="message-content">
                                                    <p>{message.content}</p>
                                                    <span className="message-time">
                                                        {formatTime(message.timestamp)}
                                                        {message.sender === userName && (
                                                            <span className="status">
                                                                {message.isRead ? (
                                                                    <BsCheck2All color="#4fc3f7"/>
                                                                ) : (
                                                                    <BsCheck2 color="#90a4ae"/>
                                                                )}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        <div className="message-editor">
                            <div className="editor-tools">
                                <button className="tool-button">
                                    <FiPaperclip/>
                                </button>
                                <button className="tool-button" onClick={toggleEmojiPicker}>
                                    <FiSmile/>
                                </button>
                            </div>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container" ref={emojiPickerRef}>
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        width={300}
                                        height={350}
                                        searchDisabled
                                        skinTonesDisabled
                                        previewConfig={{showPreview: false}}
                                        lazyLoadEmojis
                                    />
                                </div>
                            )}
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
                                disabled={!newMessage.trim() || !stompClient?.connected}
                                className={`send-button ${newMessage.trim() ? 'active' : ''}`}
                            >
                                <IoMdSend size={20}/>
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