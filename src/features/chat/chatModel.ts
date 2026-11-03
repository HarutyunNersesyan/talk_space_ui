export interface UserChatDto {
    partnerUsername: string; partnerName: string; lastMessage: string;
    lastMessageTime: string | null; unreadCount: number; partnerImage?: string;
}
export interface ChatMessageDto {
    id: number; sender: string; receiver: string; content: string;
    timestamp: number[] | string; isRead: boolean; read?: boolean; edited?: boolean;
}
export interface TypingNotificationDto { sender: string; receiver: string; typing: boolean; }
export const normalise = (message: ChatMessageDto): ChatMessageDto => ({ ...message, isRead: message.read ?? message.isRead ?? false });
export const mergeMessages = (current: ChatMessageDto[], incoming: ChatMessageDto[]) => {
    const messages = new Map(current.map(message => [message.id, message]));
    let changed = false;
    incoming.map(normalise).forEach(message => {
        const previous = messages.get(message.id);
        const next = { ...message, isRead: !!previous?.isRead || message.isRead };
        if (!previous || previous.isRead !== next.isRead || previous.content !== next.content ||
            previous.edited !== next.edited || previous.sender !== next.sender || previous.receiver !== next.receiver ||
            JSON.stringify(previous.timestamp) !== JSON.stringify(next.timestamp)) {
            messages.set(message.id, next); changed = true;
        }
    });
    // An unchanged poll must not trigger auto-scroll while the user reads history.
    return changed ? Array.from(messages.values()).sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime() || a.id - b.id) : current;
};
export const createMessageId = (): string => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};
export const parseTimestamp = (timestamp: number[] | string | null | undefined): Date => {
    if (Array.isArray(timestamp)) return new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3] || 0, timestamp[4] || 0, timestamp[5] || 0);
    const parsed = timestamp ? new Date(timestamp) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};
export const formatTime = (value: number[] | string | null | undefined) => parseTimestamp(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
export const formatDate = (value: number[] | string | null | undefined) => {
    const date = parseTimestamp(value);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    return date.toDateString() === today.toDateString() ? 'Today' : date.toDateString() === yesterday.toDateString() ? 'Yesterday' : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
