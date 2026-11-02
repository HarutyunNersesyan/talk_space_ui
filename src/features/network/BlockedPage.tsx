import React, { useState } from 'react';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { Link } from 'react-router-dom';
import { useNetwork } from './NetworkContext';
import BlockButton from './BlockButton';

const BlockedPage: React.FC = () => {
    const { blocks, loading, error, refresh } = useNetwork();
    const [page, setPage] = useState(0);
    const safePage = Math.min(page, Math.max(0, Math.ceil(blocks.length / 12) - 1));
    return <div className="nf-page"><div className="nf-inner">
        <header className="nf-hero"><div><span className="nf-eyebrow"><BlockRoundedIcon /> YOUR PRIVACY</span><h1>Blocked people.</h1><p>Blocked people cannot find your profile or message you. Their profiles are hidden from your discovery too.</p></div><button className="nf-button secondary" disabled={loading} onClick={() => void refresh()}>Refresh</button></header>
        <div className="nf-note">Unblocking makes discovery possible again. Chat requires a new connection request and acceptance.</div>
        {error && <p className="nf-error" role="alert">{error}</p>}
        {loading && !blocks.length ? <div className="nf-empty" role="status">Loading blocked people…</div>
        : !blocks.length ? <div className="nf-empty"><BlockRoundedIcon /><h2>Your blocked list is empty</h2><p>You can block someone from their profile card or conversation.</p><Link className="nf-button" to="/choose">Discover people</Link></div>
        : <div className="nf-grid">{blocks.slice(safePage * 12, safePage * 12 + 12).map(b => <article className="nf-card" key={b.id}><div className="nf-person"><div className="nf-avatar">{b.blocked.charAt(0).toUpperCase()}</div><div><h2>{b.blocked}</h2><span className="nf-muted">Blocked {new Date(b.createdAt).toLocaleDateString()}</span></div></div><BlockButton userName={b.blocked} /></article>)}</div>}
        {blocks.length > 12 && <nav className="nf-pagination" aria-label="Blocked people pages"><button className="nf-button secondary" disabled={!safePage} onClick={() => setPage(safePage - 1)}>Previous</button><span>{safePage + 1} / {Math.ceil(blocks.length / 12)}</span><button className="nf-button secondary" disabled={(safePage + 1) * 12 >= blocks.length} onClick={() => setPage(safePage + 1)}>Next</button></nav>}
    </div></div>;
};
export default BlockedPage;
