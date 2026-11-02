import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { featureError, ConnectionAction } from '../../api/features';
import { useNetwork } from './NetworkContext';

const ConnectionButton: React.FC<{ userName: string }> = ({ userName }) => {
    const network = useNetwork();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const connection = network.connections.find(c => c.sender === userName || c.receiver === userName);
    const run = async (action?: ConnectionAction) => {
        setBusy(true); setError('');
        try {
            if (action && connection) { await network.action(connection.id, action); if (action === 'accept') navigate(`/chat/${encodeURIComponent(userName)}`); }
            else await network.request(userName);
        } catch (e) { setError(featureError(e)); }
        finally { setBusy(false); }
    };
    if (network.blocks.some(b => b.blocked === userName)) return <span className="nf-pill">Blocked</span>;
    return <div className="nf-connect-control">
        <div className="nf-actions">
            {network.error ? <button className="nf-button secondary" onClick={() => void network.refresh()}>Retry connection status</button>
            : network.loading && !connection ? <button className="nf-button secondary" disabled>Loading connection…</button>
            : connection?.status === 'ACCEPTED' ? <><span className="nf-pill">Connected</span><Link className="nf-button secondary" to={`/chat/${encodeURIComponent(userName)}`}>Message</Link></>
            : connection?.status === 'PENDING' ? connection.receiver === userName
                ? <button className="nf-button secondary" disabled={busy} onClick={() => void run('cancel')}>{busy ? 'Updating…' : 'Cancel request'}</button>
                : <><button className="nf-button" disabled={busy} onClick={() => void run('accept')}>Accept request</button><button className="nf-button secondary" disabled={busy} onClick={() => void run('reject')}>Decline</button></>
            : <button className="nf-button" disabled={busy} onClick={() => void run()}><PersonAddAlt1RoundedIcon />{busy ? 'Sending…' : 'Connect'}</button>}
        </div>
        {error && <p className="nf-error" role="alert">{error}</p>}
    </div>;
};
export default ConnectionButton;
