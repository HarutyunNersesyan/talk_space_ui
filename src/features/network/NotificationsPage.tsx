import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { featureError, networkApi, Notification, Page } from '../../api/features';
import { useNetwork } from './NetworkContext';
const descriptions: Record<string, string> = {
    CONNECTION_REQUEST: 'sent you a connection request.', CONNECTION_ACCEPTED: 'accepted your connection request.',
    CONNECTION_REJECTED: 'declined your connection request.', CONNECTION_CANCELLED: 'cancelled a connection request.',
    CONNECTION_REMOVED: 'removed a connection.'
};
const NotificationsPage: React.FC = () => {
    const { revision, unread, connected, refreshCounts } = useNetwork();
    const [page, setPage] = useState(0);
    const [data, setData] = useState<Page<Notification> | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const load = useCallback(async () => {
        const result = await networkApi.notifications(page);
        setData(result);
    }, [page]);
    useEffect(() => {
        let active = true;
        setLoading(true); setError('');
        networkApi.notifications(page).then(result => { if (active) setData(result); })
            .catch(e => { if (active) setError(featureError(e)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [page, revision, reload]);
    const mark = async (id?: number) => {
        setBusy(true); setError('');
        try {
            if (id === undefined) await networkApi.readAll(); else await networkApi.read(id);
            await refreshCounts(); await load();
        } catch (e) { setError(featureError(e)); }
        finally { setBusy(false); }
    };
    return <div className="nf-page"><div className="nf-inner">
        <header className="nf-hero"><div><span className="nf-eyebrow"><NotificationsNoneRoundedIcon /> STAY IN THE LOOP</span><h1>Your notifications.</h1><p>Connection updates, all in one place.</p></div><button className="nf-button secondary" disabled={busy || !unread} onClick={() => void mark()}>Mark all as read</button></header>
        <div className="nf-toolbar"><span className="nf-muted">{unread} unread · {connected ? 'Live updates connected' : 'Updates refresh automatically'}</span><button className="nf-button secondary" disabled={loading} onClick={() => setReload(v => v + 1)}>Refresh</button></div>
        {error && <div className="nf-error" role="alert">{error}</div>}
        {loading ? <div className="nf-empty" role="status">Loading notifications…</div>
        : !data?.content.length && !error ? <div className="nf-empty"><NotificationsNoneRoundedIcon /><h2>You're all caught up</h2><p>New connection updates will appear here.</p></div>
        : <div className="nf-notifications">{data?.content.map(n => <article className={`nf-notification ${!n.readAt ? 'unread' : ''}`} key={n.id}>
            <div className="nf-avatar">{n.actor.charAt(0).toUpperCase()}</div><div className="nf-notification-text"><p><strong>{n.actor}</strong> {descriptions[n.type] || 'updated your connection.'}</p><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString()}</time><div className="nf-actions"><Link to={`/connections?connection=${n.connectionId || ''}`}>View connection</Link>{!n.readAt && <button className="nf-text-button" disabled={busy} onClick={() => void mark(n.id)}>Mark as read</button>}</div></div>{!n.readAt && <span className="nf-unread-dot" aria-label="Unread" />}
        </article>)}</div>}
        {(data?.totalPages || 0) > 1 && <nav className="nf-pagination" aria-label="Notification pages"><button className="nf-button secondary" disabled={!page || loading} onClick={() => setPage(v => v - 1)}>Previous</button><span>{page + 1} / {data?.totalPages}</span><button className="nf-button secondary" disabled={data?.last || loading} onClick={() => setPage(v => v + 1)}>Next</button></nav>}
    </div></div>;
};
export default NotificationsPage;
