import axios from 'axios';

export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');
export const featureApi = axios.create({ baseURL: `${API_URL}/api/public`, timeout: 15000 });
featureApi.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

featureApi.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) window.dispatchEvent(new Event('talkspace:session-expired'));
    return Promise.reject(error);
});

export interface Page<T> { content: T[]; number: number; totalPages: number; totalElements: number; last: boolean; }
export interface Connection {
    id: number; sender: string; receiver: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'REMOVED';
    createdAt: string; updatedAt: string; profile?: SearchProfile | null;
}
export interface Notification {
    id: number; recipient: string; actor: string; type: string;
    connectionId: number | null; createdAt: string; readAt: string | null;
}
export interface MatchEvaluation {
    algorithmVersion: string; mode: 'HOBBIES' | 'SPECIALITIES'; score: number;
    hobbyScore: number | null; specialityScore: number | null;
    hobbyWeight: number; specialityWeight: number; exactPrimaryMatch: boolean;
    commonHobbies: string[]; commonSpecialities: string[];
    relatedHobbyCategories: string[]; relatedSpecialityCategories: string[];
}
export interface SearchProfile {
    matching?: MatchEvaluation | null;
    userName: string; firstName: string; lastName: string; age: number | null;
    gender?: string; zodiac?: string; image?: string;
    about: string | null; hobbies: string[]; specialities: string[]; socialNetworks: string[];
}
export interface UserBlock { id: number; blocker: string; blocked: string; createdAt: string; }
export interface SearchResults { content: SearchProfile[]; page: number; size: number; indexedTotal: number; }
export type ConnectionAction = 'accept' | 'reject' | 'cancel' | 'remove';

export function featureError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
            const retry = error.response.headers?.['retry-after'];
            return retry ? `Too many requests. Please try again in ${retry} seconds.` : 'Too many requests. Please wait a minute and try again.';
        }
        if (error.response?.status === 503) return 'Search is currently unavailable. Please try again later.';
        if (error.response?.status === 409) return 'This connection has changed. Refresh the page to see its current status.';
        const data = error.response?.data;
        if (typeof data === 'string' && data.length < 300 && !data.includes('<')) return data;
        if (typeof data?.message === 'string') return data.message;
        if (!error.response) return 'Unable to reach TalkSpace. Check your connection and try again.';
    }
    return fallback;
}

export const networkApi = {
    skipMatch: (userName: string, mode: 'HOBBIES' | 'SPECIALITIES') =>
        featureApi.post('/matching/skip', { userName, mode }),
    blocks: (page = 0) => featureApi.get<Page<UserBlock>>('/blocks', { params: { page, size: 100 } }).then(r => r.data),
    block: (userName: string) => featureApi.post<UserBlock>('/blocks', { userName }).then(r => r.data),
    unblock: (userName: string) => featureApi.delete(`/blocks/${encodeURIComponent(userName)}`),
    profile: (userName: string, signal?: AbortSignal) => featureApi.get<SearchProfile>(`/profiles/${encodeURIComponent(userName)}`, { signal }).then(r => r.data),
    connections: (page = 0) => featureApi.get<Page<Connection>>('/connections', { params: { page, size: 100 } }).then(r => r.data),
    pending: () => featureApi.get<{ count: number }>('/connections/pending-count').then(r => r.data.count),
    request: (userName: string) => featureApi.post<Connection>('/connections', { userName }).then(r => r.data),
    action: (id: number, action: ConnectionAction) => featureApi.post<Connection>(`/connections/${id}/${action}`).then(r => r.data),
    notifications: (page: number) => featureApi.get<Page<Notification>>('/notifications', { params: { page, size: 20 } }).then(r => r.data),
    unread: () => featureApi.get<{ count: number }>('/notifications/unread-count').then(r => r.data.count),
    read: (id: number) => featureApi.post(`/notifications/${id}/read`),
    readAll: () => featureApi.post('/notifications/read-all'),
    search: (q: string, page: number, signal?: AbortSignal) => featureApi.get<SearchResults>('/search/users', { params: { q, page, size: 12 }, signal }).then(r => r.data),
    presence: (userName: string, signal?: AbortSignal) => featureApi.get<{ online: boolean }>(`/presence/${encodeURIComponent(userName)}`, { signal }).then(r => r.data.online)
};
