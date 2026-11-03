import { featureApi } from '../../api/features';
import { ChatMessageDto, UserChatDto } from './chatModel';

/** Chat transport contract; the shared client attaches the authenticated token. */
export const chatApi = {
    conversations: (userName: string) => featureApi.get<UserChatDto[]>(`/chat/conversations/${encodeURIComponent(userName)}`),
    history: (userName: string, partner: string) => featureApi.get<ChatMessageDto[]>(`/chat/history/${encodeURIComponent(userName)}/${encodeURIComponent(partner)}`),
    markRead: (partner: string, userName: string) => featureApi.post(`/chat/read/${encodeURIComponent(partner)}/${encodeURIComponent(userName)}`),
    edit: (id: number, content: string) => featureApi.patch<ChatMessageDto>(`/chat/messages/${id}`, { content }),
    delete: (id: number, everyone: boolean) => featureApi.delete(`/chat/messages/${id}`, { params: { everyone } }),
    send: (receiver: string, content: string, clientMessageId: string) =>
        featureApi.post<ChatMessageDto>('/chat/messages', { receiver, content, clientMessageId })
};
