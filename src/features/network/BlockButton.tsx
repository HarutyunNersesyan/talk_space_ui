import React, { useState } from 'react';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { featureError } from '../../api/features';
import { useNetwork } from './NetworkContext';

const BlockButton: React.FC<{ userName: string }> = ({ userName }) => {
    const { blocks, block, unblock, currentUserName } = useNetwork();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const blocked = blocks.some(b => b.blocked === userName);
    if (userName === currentUserName) return null;
    const run = async () => {
        setBusy(true); setError('');
        try { if (blocked) await unblock(userName); else await block(userName); }
        catch (e) { setError(featureError(e, 'Unable to update your blocked list.')); }
        finally { setBusy(false); }
    };
    return <div className="nf-block-control"><button type="button" className="nf-button secondary" disabled={busy} onClick={() => void run()}
        title={blocked ? 'Allow profiles to appear in discovery again. A new connection request is required to chat.' : 'Hide your profiles from each other and end this connection.'}>
        <BlockRoundedIcon />{busy ? 'Updating…' : blocked ? 'Unblock' : 'Block'}
    </button>{error && <p className="nf-error" role="alert">{error}</p>}</div>;
};
export default BlockButton;
