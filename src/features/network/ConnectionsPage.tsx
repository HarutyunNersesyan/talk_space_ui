import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { ConnectionAction, featureError } from '../../api/features';
import { useNetwork } from './NetworkContext';
import PresenceBadge from './PresenceBadge';
import PublicProfileCard from './PublicProfileCard';
import BlockButton from './BlockButton';

type Tab = 'incoming' | 'sent' | 'accepted';
const ConnectionsPage: React.FC = () => {
    const network = useNetwork();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const selectedId = Number(params.get('connection'));
    const [tab, setTab] = useState<Tab>(params.has('connection') ? 'incoming' : 'accepted');
    const [page, setPage] = useState(0);
    const [busy, setBusy] = useState<number | null>(null);
    const [error, setError] = useState('');
    const me = network.currentUserName;
    const selected = network.connections.find(c => c.id === selectedId);
    const selectedStatus = selected?.status;
    const selectedSender = selected?.sender;
    useEffect(() => {
        if (!selectedStatus) return;
        setTab(selectedStatus === 'ACCEPTED' ? 'accepted' : selectedSender === me ? 'sent' : 'incoming');
        setPage(0);
    }, [selectedId, selectedStatus, selectedSender, me]);
    const matching = network.connections.filter(c => tab === 'accepted' ? c.status === 'ACCEPTED'
        : c.status === 'PENDING' && (tab === 'incoming' ? c.receiver === me : c.sender === me));
    const sorted = [...matching].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId));
    const safePage = Math.min(page, Math.max(0, Math.ceil(sorted.length / 12) - 1));
    const visible = sorted.slice(safePage * 12, safePage * 12 + 12);
    const run = async (id: number, action: ConnectionAction) => {
        setBusy(id); setError('');
        try {
            const c = network.connections.find(x => x.id === id);
            await network.action(id, action);
            if (action === 'accept' && c) navigate(`/chat/${encodeURIComponent(c.sender === me ? c.receiver : c.sender)}`);
        }
        catch (e) { setError(featureError(e)); }
        finally { setBusy(null); }
    };
    return <div className="nf-page"><div className="nf-inner">
        <header className="nf-hero"><div><span className="nf-eyebrow"><PeopleAltRoundedIcon /> YOUR NETWORK</span><h1>Meaningful connections.</h1><p>Manage your requests and keep in touch with people who share your world.</p></div><button className="nf-button secondary" disabled={network.loading} onClick={() => void network.refresh()}><RefreshRoundedIcon />Refresh</button></header>
        <div className="nf-tabs" aria-label="Connection filters">
            {([['accepted', 'Connections'], ['incoming', 'Incoming requests'], ['sent', 'Sent requests']] as [Tab, string][]).map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} aria-pressed={tab === key} onClick={() => { setTab(key); setPage(0); }}>{label}{key === 'incoming' && network.pending > 0 && <span className="nf-count">{network.pending}</span>}</button>)}
        </div>
        {(error || network.error) && <div className="nf-error" role="alert">{error || network.error}</div>}
        {selected && !matching.some(c => c.id === selectedId) && <div className="nf-note">This request is {selected.status.toLowerCase()}. Select the matching tab to see active requests or connections.</div>}
        {network.loading && !network.connections.length ? <div className="nf-empty" role="status">Loading your network…</div>
        : !visible.length && !network.error ? <div className="nf-empty"><PeopleAltRoundedIcon /><h2>{tab === 'incoming' ? 'No incoming requests' : tab === 'sent' ? 'No sent requests' : 'Start building your network'}</h2><p>{tab === 'accepted' ? 'Discover people and send your first connection request.' : 'Your requests will appear here.'}</p><Link className="nf-button" to="/choose">Discover people</Link></div>
        : <div className="nf-grid">{visible.map(c => {
            const other = c.sender === me ? c.receiver : c.sender;
            const actions = <>
                <p className="nf-muted">{c.status === 'ACCEPTED' ? 'Connected' : c.sender === me ? 'Request sent' : 'Wants to connect with you'} · {new Date(c.updatedAt).toLocaleDateString()}</p>
                <div className="nf-actions">
                    {c.status === 'ACCEPTED' ? <><Link className="nf-button" to={`/chat/${encodeURIComponent(other)}`}>Message</Link><button className="nf-button secondary" disabled={busy !== null} onClick={() => void run(c.id, 'remove')}>Remove</button></>
                    : c.receiver === me ? <><button className="nf-button" disabled={busy !== null || c.profile === null} onClick={() => void run(c.id, 'accept')}>{busy === c.id ? 'Updating…' : 'Accept'}</button><button className="nf-button secondary" disabled={busy !== null} onClick={() => void run(c.id, 'reject')}>Decline</button></>
                    : <button className="nf-button secondary" disabled={busy !== null} onClick={() => void run(c.id, 'cancel')}>{busy === c.id ? 'Updating…' : 'Cancel request'}</button>}
                    <BlockButton userName={other} />
                </div>
            </>;
            return c.profile ? <PublicProfileCard key={c.id} profile={c.profile} highlighted={c.id === selectedId}>{actions}</PublicProfileCard>
                : <article className="nf-card" key={c.id}><div className="nf-person"><div className="nf-avatar">{other.charAt(0).toUpperCase()}</div><div><h2>{other}</h2><PresenceBadge userName={other} /></div></div>{c.profile === null && <p className="nf-muted">Profile is unavailable.</p>}{actions}</article>;
        })}</div>}
        {sorted.length > 12 && <nav className="nf-pagination" aria-label="Connection pages"><button className="nf-button secondary" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Previous</button><span>{safePage + 1} / {Math.ceil(sorted.length / 12)}</span><button className="nf-button secondary" disabled={(safePage + 1) * 12 >= sorted.length} onClick={() => setPage(safePage + 1)}>Next</button></nav>}
    </div></div>;
};
export default ConnectionsPage;
