import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/features';
export function usePresence(userName?: string | null) {
    const [state, setState] = useState<{ userName?: string | null; online: boolean | null }>({ online: null });
    useEffect(() => {
        const setOnline = (online: boolean | null) => setState({ userName, online });
        setOnline(null);
        if (!userName) return;
        let active = true;
        let busy = false;
        const controller = new AbortController();
        const load = async () => {
            if (busy || document.visibilityState === 'hidden') return;
            busy = true;
            try {
                const value = await networkApi.presence(userName, controller.signal);
                if (active) setOnline(value);
            } catch { if (active) setOnline(null); }
            finally { busy = false; }
        };
        void load();
        const interval = setInterval(load, 30000);
        document.addEventListener('visibilitychange', load);
        return () => { active = false; controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', load); };
    }, [userName]);
    return state.userName === userName ? state.online : null;
}
const PresenceBadge: React.FC<{ userName: string }> = ({ userName }) => {
    const online = usePresence(userName);
    return <span className={`nf-presence ${online === true ? 'online' : ''}`}><i />{online === null ? 'Status unavailable' : online ? 'Online' : 'Offline'}</span>;
};
export default PresenceBadge;
