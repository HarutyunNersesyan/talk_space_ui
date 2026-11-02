import { useEffect, useRef } from 'react';
import { networkApi } from '../../api/features';
import { useNetwork } from './NetworkContext';
import axios from 'axios';

export function useProfileVisibility(userName: string | undefined, onUnavailable: () => void, onAvailable?: () => void) {
    const { revision, blocks } = useNetwork();
    const callback = useRef(onUnavailable);
    callback.current = onUnavailable;
    const available = useRef(onAvailable); available.current = onAvailable;
    const blocked = !!userName && blocks.some(b => b.blocked === userName);
    useEffect(() => {
        if (!userName) return;
        if (blocked) { callback.current(); return; }
        const controller = new AbortController();
        networkApi.profile(userName, controller.signal).then(() => {
            if (!controller.signal.aborted) available.current?.();
        }).catch(e => {
            if (!controller.signal.aborted && axios.isAxiosError(e) && e.response?.status === 404) callback.current();
        });
        return () => controller.abort();
    }, [userName, revision, blocked]);
}
