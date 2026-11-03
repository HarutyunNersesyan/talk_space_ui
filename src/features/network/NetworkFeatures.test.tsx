import React from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Connection, featureApi, featureError, networkApi } from '../../api/features';
import { NetworkProvider } from './NetworkContext';
import ConnectionsPage from './ConnectionsPage';
import NotificationsPage from './NotificationsPage';
import PeopleSearchPage from './PeopleSearchPage';
import ConnectionButton from './ConnectionButton';
import BlockedPage from './BlockedPage';
import Chat from '../../components/Chat';
import { Route, Routes } from 'react-router-dom';

const mockSockets: any[] = [];
jest.mock('@stomp/stompjs', () => ({ Client: jest.fn() }));
jest.mock('sockjs-client', () => jest.fn());
const me = 'harut';
const token = `e30.${btoa(JSON.stringify({ sub: 'harut@example.com', roles: ['USER'], exp: Date.now() / 1000 + 3600 }))}.test`;
const auth: AuthContextType = { isAuthenticated: true, userName: me, userRole: 'USER',
    checkAuth: jest.fn(), setUser: jest.fn(), redirectToSignUp: jest.fn(), redirectToForgotPassword: jest.fn(), logout: jest.fn() };
const connection = (id: number, sender: string, receiver: string, status: Connection['status']): Connection => ({ id, sender, receiver, status, createdAt: '2026-10-15T10:00:00Z', updatedAt: '2026-10-15T10:00:00Z' });
const pageOf = (content: any[], number = 0, totalPages = 1) => ({ content, number, totalPages, last: number + 1 >= totalPages, totalElements: content.length });
function mount(children: React.ReactNode, route = '/') {
    return render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={auth}><NetworkProvider>{children}</NetworkProvider></AuthContext.Provider></MemoryRouter>);
}
beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: require('crypto').webcrypto });
    jest.restoreAllMocks(); mockSockets.length = 0;
    (Client as jest.Mock).mockImplementation(config => {
        const client = { config, connected: true, activate: jest.fn(), deactivate: jest.fn().mockResolvedValue(undefined),
            subscribe: jest.fn(), publish: jest.fn() };
        mockSockets.push(client); return client;
    });
    localStorage.clear(); localStorage.setItem('token', token); localStorage.setItem('userName', 'stale-name');
    jest.spyOn(axios, 'get').mockResolvedValue({ data: new Blob([]) });
    jest.spyOn(networkApi, 'blocks').mockResolvedValue(pageOf([]));
    jest.spyOn(networkApi, 'profile').mockResolvedValue({ userName: 'anna', firstName: 'Anna', lastName: 'Smith', age: 24, about: 'Music and Java', hobbies: ['Music'], specialities: ['Java'], socialNetworks: [] });
    jest.spyOn(featureApi, 'get').mockResolvedValue({ data: me });
    jest.spyOn(networkApi, 'connections').mockResolvedValue(pageOf([]));
    jest.spyOn(networkApi, 'pending').mockResolvedValue(0);
    jest.spyOn(networkApi, 'unread').mockResolvedValue(0);
    jest.spyOn(networkApi, 'presence').mockResolvedValue(false);
});

test('loads all connection pages and uses the authenticated username for incoming requests', async () => {
    const incoming = connection(1, 'anna', me, 'PENDING');
    jest.mocked(networkApi.connections).mockImplementation(async p => p === 0 ? pageOf([connection(2, me, 'bob', 'ACCEPTED')], 0, 2) : pageOf([incoming], 1, 2));
    jest.spyOn(networkApi, 'action').mockResolvedValue({ ...incoming, status: 'ACCEPTED' });
    mount(<ConnectionsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Incoming requests' }));
    await screen.findByRole('heading', { name: 'anna' });
    expect(networkApi.connections).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Accept', exact: true }));
    await waitFor(() => expect(networkApi.action).toHaveBeenCalledWith(1, 'accept'));
    fireEvent.click(screen.getByRole('button', { name: 'Connections', exact: true }));
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'Message' })).toHaveLength(2));
});

test.each(['cancel', 'reject', 'remove'] as const)('performs the %s transition with the existing connection id', async action => {
    const c = connection(9, action === 'reject' ? 'anna' : me, action === 'reject' ? me : 'anna', action === 'remove' ? 'ACCEPTED' : 'PENDING');
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([c]));
    jest.spyOn(networkApi, 'action').mockResolvedValue({ ...c, status: action === 'cancel' ? 'CANCELLED' : action === 'reject' ? 'REJECTED' : 'REMOVED' });
    mount(<ConnectionsPage />);
    if (action !== 'remove') fireEvent.click(screen.getByRole('button', { name: action === 'reject' ? 'Incoming requests' : 'Sent requests' }));
    const button = await screen.findByRole('button', { name: action === 'cancel' ? 'Cancel request' : action === 'reject' ? 'Decline' : 'Remove', exact: true });
    fireEvent.click(button);
    await waitFor(() => expect(networkApi.action).toHaveBeenCalledWith(9, action));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'anna' })).not.toBeInTheDocument());
});

test('sends a request once and shows the resulting pending state', async () => {
    jest.spyOn(networkApi, 'request').mockResolvedValue(connection(3, me, 'anna', 'PENDING'));
    mount(<ConnectionButton userName="anna" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Connect', exact: true }));
    await screen.findByRole('button', { name: 'Cancel request' });
    expect(networkApi.request).toHaveBeenCalledTimes(1);
    expect(networkApi.request).toHaveBeenCalledWith('anna');
});

test('shows rate-limit feedback without a false successful request state', async () => {
    jest.spyOn(networkApi, 'request').mockRejectedValue({ isAxiosError: true, response: { status: 429, headers: { 'retry-after': '30' } } });
    mount(<ConnectionButton userName="anna" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Connect', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent('30 seconds');
    expect(screen.queryByRole('button', { name: 'Cancel request' })).not.toBeInTheDocument();
});

test('opens the accepted connection from a notification deep link', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(4, 'anna', me, 'ACCEPTED')]));
    mount(<ConnectionsPage />, '/connections?connection=4');
    expect(await screen.findByRole('link', { name: 'Message' })).toHaveAttribute('href', '/chat/anna');
});

test('marks one notification and the complete inbox as read', async () => {
    const notification = { id: 5, actor: 'anna', recipient: me, type: 'CONNECTION_REQUEST', connectionId: 7, createdAt: '2026-10-15T10:00:00Z', readAt: null };
    jest.mocked(networkApi.unread).mockResolvedValue(2);
    jest.spyOn(networkApi, 'notifications').mockResolvedValue(pageOf([notification]));
    jest.spyOn(networkApi, 'read').mockResolvedValue({} as any);
    jest.spyOn(networkApi, 'readAll').mockResolvedValue({} as any);
    mount(<NotificationsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Mark as read', exact: true }));
    await waitFor(() => expect(networkApi.read).toHaveBeenCalledWith(5));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mark all as read' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    await waitFor(() => expect(networkApi.readAll).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'View connection' })).toHaveAttribute('href', '/connections?connection=7');
});

test('searches submitted text, renders matching profiles and paginates by indexedTotal', async () => {
    jest.spyOn(networkApi, 'search').mockResolvedValue({ content: [{ userName: 'anna', firstName: 'Anna', lastName: 'Smith', about: 'Music and Java', age: 24, hobbies: ['Music'], specialities: ['Java'], socialNetworks: [] }], page: 0, size: 12, indexedTotal: 25 });
    mount(<PeopleSearchPage />, '/people');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Music' } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form')!);
    expect(await screen.findByRole('heading', { name: 'Anna Smith' })).toBeInTheDocument();
    expect(networkApi.search).toHaveBeenLastCalledWith('Music', 0, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(networkApi.search).toHaveBeenLastCalledWith('Music', 1, expect.any(AbortSignal)));
});

test('keeps disabled Elasticsearch search readable and retryable', async () => {
    jest.spyOn(networkApi, 'search').mockRejectedValue({ isAxiosError: true, response: { status: 503 } });
    mount(<PeopleSearchPage />, '/people?q=Java');
    expect(await screen.findByRole('alert')).toHaveTextContent('Search is currently unavailable');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
});

test('authenticates the secure socket, refreshes on notifications and cleans up on logout/unmount', async () => {
    const view = mount(<ConnectionButton userName="anna" />);
    await screen.findByRole('button', { name: 'Connect', exact: true });
    const client = mockSockets[mockSockets.length - 1];
    expect(client.config.connectHeaders.Authorization).toBe(`Bearer ${token}`);
    await act(async () => { client.config.onConnect(); });
    expect(client.subscribe).toHaveBeenCalledWith('/user/queue/connection-notifications', expect.any(Function));
    expect(client.publish).toHaveBeenCalledWith({ destination: '/app/presence.heartbeat', body: '{}' });
    const before = jest.mocked(networkApi.unread).mock.calls.length;
    await act(async () => { client.subscribe.mock.calls[0][1]({ body: '{}' }); });
    await waitFor(() => expect(jest.mocked(networkApi.unread).mock.calls.length).toBeGreaterThan(before));
    view.unmount();
    expect(client.deactivate).toHaveBeenCalled();
});

test('rate-limit errors still provide a readable fallback when CORS hides Retry-After', () => {
    expect(featureError({ isAxiosError: true, response: { status: 429, headers: {} } })).toContain('wait a minute');
});

test('offers accept and decline for an incoming request on a matching profile', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(12, 'anna', me, 'PENDING')]));
    jest.spyOn(networkApi, 'action').mockResolvedValue(connection(12, 'anna', me, 'ACCEPTED'));
    mount(<ConnectionButton userName="anna" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Accept request' }));
    await waitFor(() => expect(networkApi.action).toHaveBeenCalledWith(12, 'accept'));
    await screen.findByText('Connected', { exact: true });
    expect(screen.getByRole('link', { name: 'Message' })).toHaveAttribute('href', '/chat/anna');
});

test('shows offline based on the partner presence endpoint even with our socket connected', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(13, 'anna', me, 'ACCEPTED')]));
    jest.mocked(networkApi.presence).mockResolvedValue(false);
    mount(<ConnectionsPage />);
    await screen.findByText('Offline', { exact: true });
    await act(async () => { mockSockets[mockSockets.length - 1].config.onConnect(); });
    expect(screen.getByText('Offline', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('Online', { exact: true })).not.toBeInTheDocument();
});

test('incoming cards include the full public profile before acceptance', async () => {
    const c = { ...connection(20, 'anna', me, 'PENDING'), profile: { userName: 'anna', firstName: 'Anna', lastName: 'Smith', age: 25, gender: 'FEMALE', zodiac: 'LIBRA', about: 'I build Java applications', hobbies: ['Music', 'Hiking'], specialities: ['Java', 'Spring'], socialNetworks: ['https://github.com/anna'] } };
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([c]));
    mount(<ConnectionsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Incoming requests' }));
    await screen.findByRole('heading', { name: 'Anna Smith' });
    expect(screen.getByText('I build Java applications')).toBeInTheDocument();
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Spring')).toBeInTheDocument();
    expect(screen.getByText('25 years')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'github.com' })).toHaveAttribute('href', 'https://github.com/anna');
    expect(screen.getByRole('button', { name: 'Accept', exact: true })).toBeInTheDocument();
});

test('blocking immediately removes a connection and offers unblock in the blacklist', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(21, me, 'anna', 'ACCEPTED')]));
    jest.spyOn(networkApi, 'block').mockResolvedValue({ id: 1, blocker: me, blocked: 'anna', createdAt: '2026-10-15T10:00:00Z' });
    mount(<><ConnectionsPage /><BlockedPage /></>);
    fireEvent.click(await screen.findByRole('button', { name: 'Block', exact: true }));
    await waitFor(() => expect(networkApi.block).toHaveBeenCalledWith('anna'));
    await screen.findByRole('button', { name: 'Unblock', exact: true });
    expect(screen.queryByRole('link', { name: 'Message', exact: true })).not.toBeInTheDocument();
});

test('unblocking uses the target username and requires fresh connection consent', async () => {
    jest.mocked(networkApi.blocks).mockResolvedValue(pageOf([{ id: 2, blocker: me, blocked: 'anna', createdAt: '2026-10-15T10:00:00Z' }]));
    jest.spyOn(networkApi, 'unblock').mockImplementation(async () => {
        jest.mocked(networkApi.blocks).mockResolvedValue(pageOf([])); return {} as any;
    });
    mount(<><BlockedPage /><ConnectionButton userName="anna" /></>);
    fireEvent.click(await screen.findByRole('button', { name: 'Unblock', exact: true }));
    await waitFor(() => expect(networkApi.unblock).toHaveBeenCalledWith('anna'));
    await screen.findByRole('button', { name: 'Connect', exact: true });
    expect(screen.queryByRole('link', { name: 'Message', exact: true })).not.toBeInTheDocument();
});

test('a profile hidden by the other user disappears after a live network event', async () => {
    jest.spyOn(networkApi, 'search').mockResolvedValue({ content: [{ userName: 'anna', firstName: 'Anna', lastName: 'Smith', about: 'Hi', age: 24, hobbies: [], specialities: [], socialNetworks: [] }], page: 0, size: 12, indexedTotal: 1 });
    mount(<PeopleSearchPage />, '/people?q=anna');
    await screen.findByRole('heading', { name: 'Anna Smith' });
    const client = mockSockets[mockSockets.length - 1];
    await act(async () => { client.config.onConnect(); });
    jest.mocked(networkApi.profile).mockRejectedValue({ isAxiosError: true, response: { status: 404 } });
    await act(async () => { client.subscribe.mock.calls[0][1]({ body: '{"type":"NETWORK_CHANGED"}' }); });
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Anna Smith' })).not.toBeInTheDocument());
});

test('a direct chat URL cannot open an unaccepted connection', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(23, me, 'anna', 'PENDING')]));
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => ({ data: String(path).includes('/conversations/') ? [] : me }));
    mount(<Routes><Route path="/chat/:userName" element={<Chat />} /></Routes>, '/chat/anna');
    await screen.findByRole('heading', { name: 'Select a conversation' });
    expect(screen.queryByPlaceholderText('Write a message...')).not.toBeInTheDocument();
    expect(jest.mocked(featureApi.get).mock.calls.some(([path]) => String(path).includes('/history/'))).toBe(false);
});

test('two messages are confirmed without a socket echo; a later socket copy is deduplicated', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(24, me, 'anna', 'ACCEPTED')]));
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => ({ data: String(path).includes('/conversations/') ? [{ partnerUsername: 'anna', partnerName: 'Anna Smith', lastMessage: '', lastMessageTime: null, unreadCount: 0 }]
        : String(path).includes('/history/') ? [] : String(path).includes('/image/') ? new Blob([]) : me }));
    let id = 99;
    jest.spyOn(featureApi, 'post').mockImplementation(async (path: any, body: any) => ({ data: String(path) === '/chat/messages'
        ? { id: ++id, sender: me, receiver: body.receiver, content: body.content, timestamp: '2026-10-15T10:00:00', read: false } : {} }));
    mount(<Routes><Route path="/chat/:userName" element={<Chat />} /></Routes>, '/chat/anna');
    await screen.findByPlaceholderText('Write a message...');
    const client = mockSockets.find(c => !c.config.onConnect);
    await act(async () => { client.onConnect(); });
    fireEvent.change(screen.getByPlaceholderText('Write a message...'), { target: { value: 'Hello Anna' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(jest.mocked(featureApi.post).mock.calls.some(([path]) => path === '/chat/messages')).toBe(true));
    await screen.findByText('Hello Anna', { exact: true });
    const sent = jest.mocked(featureApi.post).mock.calls.find(([path]) => path === '/chat/messages')![1] as any;
    expect(sent).toEqual({ receiver: 'anna', content: 'Hello Anna', clientMessageId: expect.any(String) });
    fireEvent.change(screen.getByPlaceholderText('Write a message...'), { target: { value: 'Second message' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send message' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await screen.findByText('Second message', { exact: true });
    const messages = client.subscribe.mock.calls.find(([path]: any[]) => path === '/user/queue/messages')[1];
    const payload = { body: JSON.stringify({ id: 100, sender: me, receiver: 'anna', content: 'Hello Anna', timestamp: '2026-10-15T10:00:00', read: false }) };
    await act(async () => { messages(payload); });
    expect(screen.getAllByText('Hello Anna', { exact: true })).toHaveLength(1);
    expect(client.publish.mock.calls.some(([value]: any[]) => value.destination === '/topic/public')).toBe(false);
});

test('retries an uncertain message with the same id and does not require a connected socket', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(24, me, 'anna', 'ACCEPTED')]));
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => ({ data: String(path).includes('/conversations/') ? [{ partnerUsername: 'anna', partnerName: 'Anna Smith', lastMessage: '', lastMessageTime: null, unreadCount: 0 }]
        : String(path).includes('/history/') ? [] : String(path).includes('/image/') ? new Blob([]) : me }));
    const posts: any[] = [];
    jest.spyOn(featureApi, 'post').mockImplementation(async (path: any, body: any) => {
        if (path !== '/chat/messages') return {} as any;
        posts.push(body);
        if (posts.length === 1) throw new Error('network lost after server commit');
        return { data: { id: 5, sender: me, receiver: 'anna', content: body.content, timestamp: '2026-10-15T10:00:00', read: false } } as any;
    });
    mount(<Routes><Route path="/chat/:userName" element={<Chat />} /></Routes>, '/chat/anna');
    await screen.findByPlaceholderText('Write a message...');
    fireEvent.change(screen.getByPlaceholderText('Write a message...'), { target: { value: 'Retry safely' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(posts).toHaveLength(1));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send message' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(posts).toHaveLength(2));
    await screen.findByText('Retry safely', { exact: true });
    expect(posts).toHaveLength(2); expect(posts[1].clientMessageId).toBe(posts[0].clientMessageId);
});

test('recovers a missed message when returning to the tab', async () => {
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(24, me, 'anna', 'ACCEPTED')]));
    let historyCalls = 0;
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => {
        if (String(path).includes('/conversations/')) return { data: [{ partnerUsername: 'anna', partnerName: 'Anna Smith', lastMessage: '', lastMessageTime: null, unreadCount: 0 }] };
        if (String(path).includes('/history/')) return { data: ++historyCalls > 1 ? [{ id: 112, sender: 'anna', receiver: me, content: 'Recovered message', timestamp: '2026-10-15T10:00:00', read: false }] : [] };
        if (String(path).includes('/image/')) return { data: new Blob([]) };
        return { data: me };
    });
    jest.spyOn(featureApi, 'post').mockResolvedValue({} as any);
    mount(<Routes><Route path="/chat/:userName" element={<Chat />} /></Routes>, '/chat/anna');
    await screen.findByPlaceholderText('Write a message...');
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await screen.findByText('Recovered message', { exact: true }, { timeout: 5000 });
    expect(screen.getAllByText('Recovered message', { exact: true })).toHaveLength(1);
});

test.each(['promise', 'object'])('chat effect never treats a scrolling %s as cleanup', async kind => {
    const previous = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    const scroll = jest.fn(() => kind === 'promise' ? Promise.resolve() : { finished: true });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(25, me, 'anna', 'ACCEPTED')]));
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => ({ data:
        String(path).includes('/conversations/') ? [{ partnerUsername: 'anna', partnerName: 'Anna Smith', lastMessage: '', lastMessageTime: null, unreadCount: 0 }]
        : String(path).includes('/history/') ? [] : String(path).includes('/image/') ? new Blob([]) : me }));
    jest.spyOn(featureApi, 'post').mockResolvedValue({} as any);
    try {
        const view = mount(<React.StrictMode><Routes><Route path="/chat/:userName" element={<Chat />} /></Routes></React.StrictMode>, '/chat/anna');
        await screen.findByPlaceholderText('Write a message...');
        const client = mockSockets.find(c => !c.config.onConnect);
        await act(async () => { client.onConnect(); });
        const messages = client.subscribe.mock.calls.find(([path]: any[]) => path === '/user/queue/messages')[1];
        await act(async () => { messages({ body: JSON.stringify({ id: 101, sender: 'anna', receiver: me,
            content: 'Scroll regression message', timestamp: '2026-11-01T10:00:00', read: false }) }); });
        await screen.findByText('Scroll regression message', { exact: true });
        expect(scroll).toHaveBeenCalled();
        expect(() => view.unmount()).not.toThrow();
    } finally {
        if (previous) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', previous);
        else delete (HTMLElement.prototype as any).scrollIntoView;
    }
});

test('edits through the contextual menu and deletes without scrolling the conversation', async () => {
    const scroll = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
    jest.mocked(networkApi.connections).mockResolvedValue(pageOf([connection(30, me, 'anna', 'ACCEPTED')]));
    let message = { id: 300, sender: me, receiver: 'anna', content: 'Original text', timestamp: '2026-11-03T10:00:00', read: false, edited: false };
    jest.mocked(featureApi.get).mockImplementation(async (path: any) => ({ data:
        String(path).includes('/conversations/') ? [{ partnerUsername: 'anna', partnerName: 'Anna', lastMessage: '', lastMessageTime: null, unreadCount: 0 }]
        : String(path).includes('/history/') ? [message] : String(path).includes('/image/') ? new Blob([]) : me }));
    const patch = jest.spyOn(featureApi, 'patch').mockImplementation(async (_url, data: any) => {
        message = { ...message, content: data.content, edited: true }; return { data: message };
    });
    const remove = jest.spyOn(featureApi, 'delete').mockResolvedValue({} as any);
    mount(<Routes><Route path="/chat/:userName" element={<Chat />} /></Routes>, '/chat/anna');
    await screen.findByText('Original text');
    const count = scroll.mock.calls.length;
    expect(screen.queryByRole('button', { name: 'Edit', exact: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Message options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit message' }), { target: { value: 'Changed text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }));
    await screen.findByText('Changed text');
    expect(patch).toHaveBeenCalledWith('/chat/messages/300', { content: 'Changed text' });
    expect(await screen.findByText('edited')).toBeInTheDocument();
    expect(scroll).toHaveBeenCalledTimes(count);
    const client = mockSockets.find(c => !c.config.onConnect);
    await act(async () => { client.onConnect(); });
    message = { ...message, read: true };
    const receipt = client.subscribe.mock.calls.find(([path]: any[]) => path === '/user/queue/receipts')[1];
    await act(async () => { receipt({ body: JSON.stringify({ reader: 'anna' }) }); });
    expect(await screen.findByLabelText('Read')).toBeInTheDocument();
    expect(scroll).toHaveBeenCalledTimes(count);
    fireEvent.click(screen.getByRole('button', { name: 'Message options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete for everyone' }));
    await waitFor(() => expect(screen.queryByText('Changed text')).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('/chat/messages/300', { params: { everyone: true } });
    expect(scroll).toHaveBeenCalledTimes(count);
});
