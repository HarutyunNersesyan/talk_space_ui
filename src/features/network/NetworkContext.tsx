import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext';
import { API_URL, featureApi, UserBlock, Connection, ConnectionAction, featureError, networkApi } from '../../api/features';
import './NetworkFeatures.css';

interface NetworkState {
    blocks: UserBlock[]; block: (name: string) => Promise<void>; unblock: (name: string) => Promise<void>;
    currentUserName: string; connections: Connection[]; loading: boolean; error: string; pending: number; unread: number;
    connected: boolean; revision: number; refresh: () => Promise<void>;
    refreshCounts: () => Promise<void>;
    request: (name: string) => Promise<void>; action: (id: number, action: ConnectionAction) => Promise<void>;
}
const NetworkContext = createContext<NetworkState | null>(null);
export function useNetwork() {
    const value = useContext(NetworkContext);
    if (!value) throw new Error('NetworkProvider is missing');
    return value;
}
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);
    const logout = auth?.logout;
    useEffect(() => {
        const expire = () => logout?.();
        window.addEventListener('talkspace:session-expired', expire);
        return () => window.removeEventListener('talkspace:session-expired', expire);
    }, [logout]);
    const token = auth?.isAuthenticated && auth.userRole === 'USER' ? localStorage.getItem('token') : null;
    const [blocks, setBlocks] = useState<UserBlock[]>([]);
    const [currentUserName, setCurrentUserName] = useState('');
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(0);
    const [unread, setUnread] = useState(0);
    const [connected, setConnected] = useState(false);
    const [revision, setRevision] = useState(0);
    const mutationRevision = useRef(0);
    const session = useRef(token);
    session.current = token;
    const inFlight = useRef<{ token: string; promise: Promise<void> } | null>(null);
    const refreshCounts = useCallback(async () => {
        if (!token) return;
        const result = await Promise.allSettled([networkApi.pending(), networkApi.unread()]);
        if (session.current !== token) return;
        if (result[0].status === 'fulfilled') setPending(result[0].value);
        if (result[1].status === 'fulfilled') setUnread(result[1].value);
    }, [token]);
    const refresh = useCallback((): Promise<void> => {
        if (!token) return Promise.resolve();
        if (inFlight.current?.token === token) return inFlight.current.promise;
        const promise = (async () => {
            setLoading(true);
            const startedAtRevision = mutationRevision.current;
            try {
                const email = jwtDecode<{ sub: string }>(token).sub;
                const identity = await featureApi.get<string>(`/user/get/userName/${encodeURIComponent(email)}`);
                if (session.current !== token) return;
                setCurrentUserName(identity.data);
                const allBlocks: UserBlock[] = [];
                let blockPage = 0;
                while (session.current === token) {
                    const data = await networkApi.blocks(blockPage++);
                    allBlocks.push(...data.content);
                    if (data.last || blockPage >= data.totalPages) break;
                }
                if (session.current === token && startedAtRevision === mutationRevision.current) setBlocks(allBlocks);
                const all: Connection[] = [];
                let page = 0;
                while (session.current === token) {
                    const data = await networkApi.connections(page++);
                    all.push(...data.content);
                    if (data.last || page >= data.totalPages) break;
                }
                if (session.current === token && startedAtRevision === mutationRevision.current) { setConnections(all); setError(''); }
            } catch (e) {
                if (session.current === token) setError(featureError(e, 'Unable to load connections.'));
            } finally {
                if (session.current === token) setLoading(false);
                if (inFlight.current?.token === token) inFlight.current = null;
            }
        })();
        inFlight.current = { token, promise };
        return promise;
    }, [token]);
    const update = useCallback((connection: Connection) => {
        if (session.current !== token) return;
        mutationRevision.current += 1;
        setConnections(old => [connection, ...old.filter(c => c.id !== connection.id)]);
        void refreshCounts();
    }, [refreshCounts, token]);
    const request = useCallback(async (name: string) => {
        try { update(await networkApi.request(name)); }
        catch (e) { void refresh(); throw e; }
    }, [update, refresh]);
    const action = useCallback(async (id: number, name: ConnectionAction) => {
        try { update(await networkApi.action(id, name)); }
        catch (e) { void refresh(); throw e; }
    }, [update, refresh]);
    const block = useCallback(async (name: string) => {
        const result = await networkApi.block(name);
        if (session.current !== token) return;
        mutationRevision.current += 1;
        setBlocks(old => [result, ...old.filter(b => b.blocked !== name)]);
        setConnections(old => old.filter(c => c.sender !== name && c.receiver !== name));
        setRevision(v => v + 1); void refreshCounts();
    }, [token, refreshCounts]);
    const unblock = useCallback(async (name: string) => {
        await networkApi.unblock(name);
        if (session.current !== token) return;
        mutationRevision.current += 1;
        setBlocks(old => old.filter(b => b.blocked !== name));
        setRevision(v => v + 1); void refresh();
    }, [token, refresh]);
    useEffect(() => {
        setBlocks([]);
        setCurrentUserName(''); setConnections([]); setPending(0); setUnread(0); setError(''); setConnected(false);
        if (!token) { setLoading(false); return; }
        void refresh(); void refreshCounts();
        let heartbeat: ReturnType<typeof setInterval> | undefined;
        const stopHeartbeat = () => { if (heartbeat) clearInterval(heartbeat); };
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws-secure`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            // The backend uses the application heartbeat to renew the presence lease.
            heartbeatIncoming: 0, heartbeatOutgoing: 10000,
            onConnect: () => {
                if (session.current !== token) return;
                setConnected(true); void refresh(); void refreshCounts(); setRevision(v => v + 1);
                client.subscribe('/user/queue/connection-notifications', () => {
                    void refresh(); void refreshCounts(); setRevision(v => v + 1);
                });
                const touch = () => { if (client.connected) client.publish({ destination: '/app/presence.heartbeat', body: '{}' }); };
                stopHeartbeat(); touch(); heartbeat = setInterval(touch, 25000);
            },
            onWebSocketClose: () => { stopHeartbeat(); if (session.current === token) setConnected(false); },
            onStompError: () => { if (session.current === token) setConnected(false); }
        });
        client.activate();
        const sync = () => {
            if (document.visibilityState === 'visible') {
                void refresh(); void refreshCounts(); setRevision(v => v + 1);
            }
        };
        const poll = setInterval(sync, 60000);
        document.addEventListener('visibilitychange', sync);
        window.addEventListener('focus', sync);
        return () => {
            stopHeartbeat(); clearInterval(poll);
            document.removeEventListener('visibilitychange', sync); window.removeEventListener('focus', sync);
            void client.deactivate();
        };
    }, [token, refresh, refreshCounts]);
    return <NetworkContext.Provider value={{ blocks, block, unblock, currentUserName, connections, loading, error, pending, unread, connected, revision, refresh, refreshCounts, request, action }}>{children}</NetworkContext.Provider>;
};
